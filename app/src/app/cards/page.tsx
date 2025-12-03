"use client";

import { useState, useEffect } from "react";
import { useProgram, getCardPDA, BN } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";

interface Card {
  publicKey: string;
  mint: string;
  owner: string;
  power: number;
  rarity: number;
  multiplier: number;
  wins: number;
  losses: number;
}

export default function CardsPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);

  const [mintForm, setMintForm] = useState({
    power: 5,
    rarity: 2,
    multiplier: 1500,
  });

  useEffect(() => {
    if (!program || !publicKey) {
      setLoading(false);
      return;
    }

    async function fetchCards() {
      try {
        const allCards = await (program.account as any).card.all();
        const userCards = allCards
          .filter((card: any) => card.account.owner.toString() === publicKey!.toString())
          .map((card: any) => ({
            publicKey: card.publicKey.toString(),
            mint: card.account.mint.toString(),
            owner: card.account.owner.toString(),
            power: card.account.power,
            rarity: card.account.rarity,
            multiplier: card.account.multiplier.toNumber(),
            wins: card.account.wins.toNumber(),
            losses: card.account.losses.toNumber(),
          }));
        setCards(userCards);
      } catch (error) {
        console.error("Error fetching cards:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
    const interval = setInterval(fetchCards, 10000);
    return () => clearInterval(interval);
  }, [program, publicKey]);

  const handleMintCard = async () => {
    if (!program || !publicKey) return;

    setMinting(true);
    try {
      const mintKeypair = Keypair.generate();
      const [cardPda] = getCardPDA(mintKeypair.publicKey);
      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        publicKey
      );

      const tx = await program.methods
        .mintCard(mintForm.power, mintForm.rarity, new BN(mintForm.multiplier))
        .accounts({
          card: cardPda,
          mint: mintKeypair.publicKey,
          tokenAccount: tokenAccount,
          payer: publicKey,
          owner: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .transaction();

      // Get recent blockhash
      const { blockhash } = await program.provider.connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      // Sign with mint keypair first (using Buffer properly)
      tx.sign(mintKeypair);

      // Send transaction via wallet adapter
      const wallet = (window as any).solana;
      if (!wallet) throw new Error("Wallet not found");
      
      const { signature } = await wallet.signAndSendTransaction(tx);
      
      await program.provider.connection.confirmTransaction(signature);

      alert("Card minted successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to mint card");
    } finally {
      setMinting(false);
    }
  };

  const getRarityLabel = (rarity: number) => {
    const labels = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
    return labels[rarity] || "Unknown";
  };

  const getRarityColor = (rarity: number) => {
    const colors = [
      "from-gray-500 to-gray-600",
      "from-green-500 to-green-600",
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-yellow-500 to-orange-600",
    ];
    return colors[rarity] || "from-gray-500 to-gray-600";
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🃏</div>
          <h1 className="text-4xl font-bold gradient-text">My Cards</h1>
          <p className="text-gray-400 text-lg">Connect your wallet to view your cards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">My NFT Cards</h1>
          <p className="text-gray-400">Collect and battle with unique prediction cards</p>
        </div>
      </div>

      {/* Mint Card Section */}
      <div className="card mb-8 border border-purple-500/30">
        <h2 className="text-2xl font-bold mb-4">🎨 Mint New Card</h2>
        <p className="text-gray-400 mb-6">
          Create a unique NFT prediction card with custom traits
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Power (1-10)
            </label>
            <input
              type="number"
              value={mintForm.power}
              onChange={(e) =>
                setMintForm({ ...mintForm, power: Number(e.target.value) })
              }
              min={1}
              max={10}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rarity (0-4)
            </label>
            <select
              value={mintForm.rarity}
              onChange={(e) =>
                setMintForm({ ...mintForm, rarity: Number(e.target.value) })
              }
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              <option value={0}>Common</option>
              <option value={1}>Uncommon</option>
              <option value={2}>Rare</option>
              <option value={3}>Epic</option>
              <option value={4}>Legendary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Multiplier (1000 = 1x)
            </label>
            <input
              type="number"
              value={mintForm.multiplier}
              onChange={(e) =>
                setMintForm({ ...mintForm, multiplier: Number(e.target.value) })
              }
              min={1000}
              max={3000}
              step={100}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(mintForm.multiplier / 1000).toFixed(1)}x rewards
            </p>
          </div>
        </div>

        <button
          onClick={handleMintCard}
          disabled={minting}
          className="btn-primary w-full"
        >
          {minting ? "Minting..." : "Mint Card (Free on Devnet)"}
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading your cards...</p>
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🃏</div>
          <p className="text-gray-400 text-lg mb-4">You don't have any cards yet</p>
          <p className="text-sm text-gray-500">Mint your first card above!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const totalBattles = card.wins + card.losses;
            const winRate = totalBattles > 0 ? (card.wins / totalBattles) * 100 : 0;

            return (
              <div
                key={card.publicKey}
                className={`card border-2 border-transparent bg-gradient-to-br ${getRarityColor(
                  card.rarity
                )} p-[2px] hover:scale-105 transition-transform duration-200`}
              >
                <div className="bg-gray-900 rounded-lg p-6 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-4xl">🃏</div>
                    <span className="badge-animated text-xs">
                      {getRarityLabel(card.rarity)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Power</span>
                      <span className="font-bold text-red-400">
                        {"⚡".repeat(card.power)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-400">Multiplier</span>
                      <span className="font-bold text-yellow-400">
                        {(card.multiplier / 1000).toFixed(1)}x
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Record</span>
                        <span className="font-semibold">
                          {card.wins}W - {card.losses}L
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Win Rate</span>
                        <span
                          className={`font-semibold ${
                            winRate >= 50 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {winRate.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 truncate">
                      {card.mint}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
