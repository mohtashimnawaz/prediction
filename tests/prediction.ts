import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Prediction } from "../target/types/prediction";
import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert, expect } from "chai";

describe("prediction", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.prediction as Program<Prediction>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  let platformPda: PublicKey;
  let treasuryKeypair: Keypair;
  let marketPda: PublicKey;
  let vaultPda: PublicKey;
  let bettor1: Keypair;
  let bettor2: Keypair;
  let bettor3: Keypair;

  const question = "Will BTC reach $100k by EOY 2025?";
  const description = "A prediction market for Bitcoin price reaching $100,000 USD by December 31, 2025.";

  before(async () => {
    // Create treasury account
    treasuryKeypair = Keypair.generate();

    // Derive platform PDA
    [platformPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    // Initialize platform
    try {
      await program.methods
        .initializePlatform()
        .accounts({
          platform: platformPda,
          treasury: treasuryKeypair.publicKey,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      console.log("✅ Platform initialized");
    } catch (e) {
      // Platform may already be initialized
      console.log("Platform already initialized or error:", e.message);
    }

    // Create test bettors with some SOL
    bettor1 = Keypair.generate();
    bettor2 = Keypair.generate();
    bettor3 = Keypair.generate();

    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(bettor1.publicKey, 5 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(bettor2.publicKey, 5 * LAMPORTS_PER_SOL)
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(bettor3.publicKey, 5 * LAMPORTS_PER_SOL)
    );
  });

  it("Creates a prediction market", async () => {
    // Set end time to 2 seconds from now for testing
    const endTime = new BN(Math.floor(Date.now() / 1000) + 2);

    // Use the first 32 bytes (or less) of the question for the seed
    const questionSeed = question.slice(0, Math.min(question.length, 32));

    [marketPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("market"), authority.publicKey.toBuffer(), Buffer.from(questionSeed)],
      program.programId
    );

    await program.methods
      .createMarket(
        question,
        description,
        endTime,
        { crypto: {} }, // MarketCategory::Crypto
        { binary: {} }  // MarketType::Binary
      )
      .accounts({
        market: marketPda,
        platform: platformPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    assert.equal(market.question, question);
    assert.equal(market.description, description);
    assert.equal(market.authority.toBase58(), authority.publicKey.toBase58());
    assert.equal(market.resolved, false);
    assert.equal(market.totalYesAmount.toNumber(), 0);
    assert.equal(market.totalNoAmount.toNumber(), 0);

    console.log("✅ Market created:", market.question);
  });

  it("Places YES bets on the market", async () => {
    [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), marketPda.toBuffer()],
      program.programId
    );

    const [bet1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor1.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = new BN(1 * LAMPORTS_PER_SOL);

    await program.methods
      .placeBet(betAmount, true)
      .accounts({
        market: marketPda,
        platform: platformPda,
        bet: bet1Pda,
        vault: vaultPda,
        bettor: bettor1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor1])
      .rpc();

    const bet = await program.account.bet.fetch(bet1Pda);
    assert.equal(bet.amount.toNumber(), betAmount.toNumber());
    assert.equal(bet.prediction, true);
    assert.equal(bet.claimed, false);

    const market = await program.account.market.fetch(marketPda);
    assert.equal(market.totalYesAmount.toNumber(), betAmount.toNumber());

    console.log("✅ Bettor1 placed 1 SOL on YES");
  });

  it("Places NO bets on the market", async () => {
    const [bet2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor2.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = new BN(2 * LAMPORTS_PER_SOL);

    await program.methods
      .placeBet(betAmount, false)
      .accounts({
        market: marketPda,
        platform: platformPda,
        bet: bet2Pda,
        vault: vaultPda,
        bettor: bettor2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor2])
      .rpc();

    const bet = await program.account.bet.fetch(bet2Pda);
    assert.equal(bet.amount.toNumber(), betAmount.toNumber());
    assert.equal(bet.prediction, false);

    const market = await program.account.market.fetch(marketPda);
    assert.equal(market.totalNoAmount.toNumber(), betAmount.toNumber());

    console.log("✅ Bettor2 placed 2 SOL on NO");
  });

  it("Places additional YES bet", async () => {
    const [bet3Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor3.publicKey.toBuffer()],
      program.programId
    );

    const betAmount = new BN(1.5 * LAMPORTS_PER_SOL);

    await program.methods
      .placeBet(betAmount, true)
      .accounts({
        market: marketPda,
        platform: platformPda,
        bet: bet3Pda,
        vault: vaultPda,
        bettor: bettor3.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor3])
      .rpc();

    const market = await program.account.market.fetch(marketPda);
    assert.equal(market.totalYesAmount.toNumber(), 2.5 * LAMPORTS_PER_SOL);
    assert.equal(market.totalNoAmount.toNumber(), 2 * LAMPORTS_PER_SOL);

    console.log("✅ Bettor3 placed 1.5 SOL on YES");
    console.log(`   Total pool: ${(market.totalYesAmount.toNumber() + market.totalNoAmount.toNumber()) / LAMPORTS_PER_SOL} SOL`);
  });

  it("Fails to resolve market before end time", async () => {
    try {
      await program.methods
        .resolveMarket(true)
        .accounts({
          market: marketPda,
          authority: authority.publicKey,
        })
        .rpc();
      assert.fail("Should have thrown error");
    } catch (err) {
      expect(err.toString()).to.include("MarketNotEnded");
      console.log("✅ Correctly prevented early resolution");
    }
  });

  it("Waits for market end time and resolves market", async () => {
    // Wait for market to end (2+ seconds)
    console.log("   ⏳ Waiting for market end time...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    await program.methods
      .resolveMarket(true) // YES wins
      .accounts({
        market: marketPda,
        authority: authority.publicKey,
      })
      .rpc();

    const resolvedMarket = await program.account.market.fetch(marketPda);
    assert.equal(resolvedMarket.resolved, true);
    assert.equal(resolvedMarket.outcome, true);

    console.log("✅ Market resolved: YES wins!");
  });

  it("Winners claim their winnings", async () => {
    const [bet1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor1.publicKey.toBuffer()],
      program.programId
    );

    const bettor1BalanceBefore = await provider.connection.getBalance(bettor1.publicKey);

    await program.methods
      .claimWinnings()
      .accounts({
        market: marketPda,
        bet: bet1Pda,
        vault: vaultPda,
        bettor: bettor1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor1])
      .rpc();

    const bettor1BalanceAfter = await provider.connection.getBalance(bettor1.publicKey);
    const winnings = bettor1BalanceAfter - bettor1BalanceBefore;

    const bet = await program.account.bet.fetch(bet1Pda);
    assert.equal(bet.claimed, true);

    console.log(`✅ Bettor1 claimed ${winnings / LAMPORTS_PER_SOL} SOL`);

    // Bettor3 also wins
    const [bet3Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor3.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .claimWinnings()
      .accounts({
        market: marketPda,
        bet: bet3Pda,
        vault: vaultPda,
        bettor: bettor3.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor3])
      .rpc();

    console.log("✅ Bettor3 claimed winnings");
  });

  it("Losers cannot claim", async () => {
    const [bet2Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor2.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .claimWinnings()
        .accounts({
          market: marketPda,
          bet: bet2Pda,
          vault: vaultPda,
          bettor: bettor2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([bettor2])
        .rpc();
      assert.fail("Should have thrown error");
    } catch (err) {
      expect(err.toString()).to.include("LosingBet");
      console.log("✅ Correctly prevented loser from claiming");
    }
  });

  it("Prevents double claiming", async () => {
    const [bet1Pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("bet"), marketPda.toBuffer(), bettor1.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .claimWinnings()
        .accounts({
          market: marketPda,
          bet: bet1Pda,
          vault: vaultPda,
          bettor: bettor1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([bettor1])
        .rpc();
      assert.fail("Should have thrown error");
    } catch (err) {
      expect(err.toString()).to.include("AlreadyClaimed");
      console.log("✅ Correctly prevented double claiming");
    }
  });

  it("Registers a Card (mint_card)", async () => {
    // Create a dummy mint pubkey to represent the NFT mint
    const mintKeypair = Keypair.generate();

    const [cardPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("card"), mintKeypair.publicKey.toBuffer()],
      program.programId
    );

    const multiplier = new BN(1500);

    // Payer is the authority (provider wallet); owner is bettor1 and must sign
    await program.methods
      .mintCard(5, 2, multiplier)
      .accounts({
        card: cardPda,
        mint: mintKeypair.publicKey,
        payer: authority.publicKey,
        owner: bettor1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([bettor1])
      .rpc();

    const card = await program.account.card.fetch(cardPda);
    assert.equal(card.mint.toBase58(), mintKeypair.publicKey.toBase58());
    assert.equal(card.owner.toBase58(), bettor1.publicKey.toBase58());
    assert.equal(card.power, 5);
    assert.equal(card.rarity, 2);
    assert.equal(card.multiplier.toNumber(), 1500);
    assert.equal(card.wins.toNumber(), 0);

    console.log("✅ Card registered and metadata stored");
  });
});
