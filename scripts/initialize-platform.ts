import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Prediction } from "../target/types/prediction";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

async function main() {
  // Configure the client to use devnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Prediction as Program<Prediction>;
  const authority = (provider.wallet as anchor.Wallet).payer;

  // Derive platform PDA
  const [platformPda, platformBump] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  console.log("Program ID:", program.programId.toString());
  console.log("Platform PDA:", platformPda.toString());
  console.log("Authority:", authority.publicKey.toString());

  try {
    // Check if platform is already initialized
    const platformAccount = await program.account.platform.fetch(platformPda);
    console.log("✅ Platform already initialized!");
    console.log("Treasury:", platformAccount.treasury.toString());
    console.log("Total Markets:", platformAccount.totalMarkets.toString());
    console.log("Total Volume:", platformAccount.totalVolume.toString());
  } catch (error) {
    // Platform not initialized, let's initialize it
    console.log("Initializing platform...");

    // Use authority's public key as treasury (you can change this later)
    const treasury = authority.publicKey;

    try {
      const tx = await program.methods
        .initializePlatform()
        .accounts({
          treasury: treasury,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("✅ Platform initialized!");
      console.log("Transaction signature:", tx);
      console.log("Treasury set to:", treasury.toString());

      // Fetch and display the initialized account
      const platformAccount = await program.account.platform.fetch(platformPda);
      console.log("\nPlatform Details:");
      console.log("- Authority:", platformAccount.authority.toString());
      console.log("- Treasury:", platformAccount.treasury.toString());
      console.log("- Total Markets:", platformAccount.totalMarkets.toString());
      console.log("- Total Volume:", platformAccount.totalVolume.toString());
    } catch (err) {
      console.error("Error initializing platform:", err);
      throw err;
    }
  }
}

main()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
