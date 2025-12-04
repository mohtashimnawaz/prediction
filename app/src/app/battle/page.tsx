"use client";

import { useState, useEffect } from "react";
import { useProgram, getCardPDA, BN } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { ToastContainer, useToast } from "@/components/Toast";
import Link from "next/link";

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

export default function BattlePage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const { toasts, addToast, removeToast, updateToast } = useToast();
  
  const [myCards, setMyCards] = useState<Card[]>([]);
  const [opponentCards, setOpponentCards] = useState<Card[]>([]);
  const [selectedMyCard, setSelectedMyCard] = useState<string>("");
  const [selectedOpponentCard, setSelectedOpponentCard] = useState<string>("");
  const [battling, setBattling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!program || !publicKey) {
      setLoading(false);
      return;
    }

    async function fetchCards() {
      if (!program || !publicKey) {
        setLoading(false);
        return;
      }
      
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

        const otherCards = allCards
          .filter((card: any) => card.account.owner.toString() !== publicKey!.toString())
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

        setMyCards(userCards);
        setOpponentCards(otherCards);
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

  const handleBattle = async () => {
    if (!program || !publicKey || !selectedMyCard || !selectedOpponentCard) return;

    setShowConfirm(false);
    setBattling(true);
    const toastId = addToast("Initiating battle...", "loading");

    try {
      if (!program || !publicKey) {
        updateToast(toastId, "Program not initialized", "error");
        setBattling(false);
        return;
      }

      const myCardPubkey = new PublicKey(selectedMyCard);
      const opponentCardPubkey = new PublicKey(selectedOpponentCard);

      const myCardAccount = await (program.account as any).card.fetch(myCardPubkey);
      const opponentCardAccount = await (program.account as any).card.fetch(opponentCardPubkey);

      updateToast(toastId, "Sign the transaction to battle...", "loading");

      await program.methods
        .battle()
        .accounts({
          card1: myCardPubkey,
          card2: opponentCardPubkey,
          player1: publicKey,
          player2: opponentCardAccount.owner,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      removeToast(toastId);
      addToast("Battle complete! Check the results.", "success");
      
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      console.error(error);
      removeToast(toastId);
      addToast(error.message || "Battle failed", "error");
    } finally {
      setBattling(false);
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

  const CardDisplay = ({ card, selected, onSelect }: { card: Card; selected: boolean; onSelect: () => void }) => {
    const totalBattles = card.wins + card.losses;
    const winRate = totalBattles > 0 ? (card.wins / totalBattles) * 100 : 0;

    return (
      <div
        onClick={onSelect}
        className={`cursor-pointer transition-all duration-200 ${
          selected ? "scale-105 ring-4 ring-primary-500 shadow-glow-xl" : "hover:scale-102 hover:shadow-glow"
        }`}
      >
        <div className={`bg-gradient-to-br ${getRarityColor(card.rarity)} p-[2px] rounded-xl`}>
          <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">NFT</span>
                </div>
              <span className="text-xs px-2 py-1 bg-white/10 rounded-lg font-bold">
                {getRarityLabel(card.rarity)}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Power</span>
                <span className="font-bold text-red-400 text-base">
                  {"⚡".repeat(card.power)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Record</span>
                <span className="font-semibold">
                  {card.wins}W - {card.losses}L
                </span>
              </div>

              <div className="flex justify-between">
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

            {selected && (
              <div className="mt-3 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-center text-xs font-bold text-purple-300">
                ✓ Selected
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center shadow-glow mb-4">
            <span className="text-2xl font-bold text-white">PVP</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text">Card Battle</h1>
          <p className="text-gray-400 text-lg mb-6">Connect your wallet to enter the battle</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 font-medium animate-pulse">Loading battle arena...</p>
        </div>
      </div>
    );
  }

  const mySelectedCard = myCards.find((c) => c.publicKey === selectedMyCard);
  const oppSelectedCard = opponentCards.find((c) => c.publicKey === selectedOpponentCard);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold gradient-text mb-3 flex items-center justify-center gap-3">
          <span>⚔️</span>
          Battle Arena
          <span>⚔️</span>
        </h1>
        <p className="text-gray-400 text-lg">Challenge opponents and prove your dominance</p>
      </div>

      {/* Battle Instructions */}
      <div className="card mb-8 bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-orange-500/30">
        <div className="flex items-start gap-4">
          <span className="text-4xl">🎮</span>
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-3 text-orange-400">How to Battle</h2>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">1.</span>
                <span>Select one of your cards from the left panel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">2.</span>
                <span>Choose an opponent's card from the right panel</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">3.</span>
                <span>Click "Start Battle" to compete on-chain</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 font-bold">4.</span>
                <span>Higher power wins! Stats update automatically</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* My Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>🛡️</span> Your Cards
            </h2>
            <span className="badge bg-purple-500/20 text-purple-400">{myCards.length}</span>
          </div>
          {myCards.length === 0 ? (
            <div className="card text-center py-12 border-2 border-dashed border-purple-500/30">
              <div className="text-5xl mb-3">🃏</div>
              <p className="text-gray-400 mb-3">No cards yet</p>
              <Link href="/cards" className="text-purple-400 hover:text-purple-300 text-sm font-medium hover:underline">
                Mint your first card →
              </Link>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {myCards.map((card) => (
                <CardDisplay
                  key={card.publicKey}
                  card={card}
                  selected={selectedMyCard === card.publicKey}
                  onSelect={() => setSelectedMyCard(card.publicKey)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Battle Center */}
        <div className="flex flex-col items-center justify-center">
          <div className="card text-center w-full bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
            <div className="text-7xl mb-4 animate-float">⚔️</div>
            <h3 className="text-3xl font-bold gradient-text mb-6">VS</h3>
            
            {selectedMyCard && selectedOpponentCard ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Your Power</div>
                    <div className="text-xl font-bold text-blue-400">
                      {"⚡".repeat(mySelectedCard?.power || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Opponent Power</div>
                    <div className="text-xl font-bold text-red-400">
                      {"⚡".repeat(oppSelectedCard?.power || 0)}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={battling}
                  className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {battling ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Battling...
                    </>
                  ) : (
                    <>
                      <span>⚔️</span>
                      Start Battle
                      <span>⚔️</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-gray-400 py-6">
                {!selectedMyCard && !selectedOpponentCard && (
                  <div>
                    <div className="text-4xl mb-2">👈 👉</div>
                    <p>Select cards to battle</p>
                  </div>
                )}
                {selectedMyCard && !selectedOpponentCard && (
                  <div>
                    <div className="text-4xl mb-2">👉</div>
                    <p>Choose an opponent</p>
                  </div>
                )}
                {!selectedMyCard && selectedOpponentCard && (
                  <div>
                    <div className="text-4xl mb-2">👈</div>
                    <p>Choose your card</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Battle Stats */}
          <div className="mt-6 card w-full bg-white/5">
            <h3 className="font-bold mb-3 text-sm flex items-center gap-2">
              <span>🏆</span>
              Battle Rules
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex justify-between">
                <span>Winner:</span>
                <span className="text-white font-semibold">Highest Power</span>
              </div>
              <div className="flex justify-between">
                <span>Reward:</span>
                <span className="text-green-400 font-semibold">+1 Win</span>
              </div>
              <div className="flex justify-between">
                <span>Penalty:</span>
                <span className="text-red-400 font-semibold">+1 Loss</span>
              </div>
              <div className="flex justify-between">
                <span>Cost:</span>
                <span className="text-yellow-400 font-semibold">Transaction Fee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Opponent Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <span>⚔️</span> Opponents
            </h2>
            <span className="badge bg-red-500/20 text-red-400">{opponentCards.length}</span>
          </div>
          {opponentCards.length === 0 ? (
            <div className="card text-center py-12 border-2 border-dashed border-red-500/30">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-400 text-sm mb-2">No opponent cards available</p>
              <p className="text-xs text-gray-500">
                Wait for other players to mint cards
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {opponentCards.map((card) => (
                <CardDisplay
                  key={card.publicKey}
                  card={card}
                  selected={selectedOpponentCard === card.publicKey}
                  onSelect={() => setSelectedOpponentCard(card.publicKey)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && mySelectedCard && oppSelectedCard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="glass-strong rounded-2xl p-6 max-w-md w-full border-2 border-red-500/30" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 gradient-text flex items-center gap-2">
              <span>⚔️</span>
              Confirm Battle
            </h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Your Card</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{getRarityLabel(mySelectedCard.rarity)}</span>
                  <span className="text-lg">{"⚡".repeat(mySelectedCard.power)}</span>
                </div>
              </div>
              <div className="text-center text-2xl">VS</div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">Opponent Card</div>
                <div className="flex justify-between items-center">
                  <span className="font-bold">{getRarityLabel(oppSelectedCard.rarity)}</span>
                  <span className="text-lg">{"⚡".repeat(oppSelectedCard.power)}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBattle}
                disabled={battling}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {battling ? "Battling..." : "⚔️ Battle!"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}
