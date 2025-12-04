"use client";

import { useState, useEffect } from "react";
import { useProgram, getBetPDA, getVaultPDA } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import Link from "next/link";

interface WinningBet {
  marketAddress: string;
  marketQuestion: string;
  betAmount: number;
  prediction: boolean;
  claimed: boolean;
  totalPool: number;
  winningPool: number;
  losingPool: number;
  estimatedWinnings: number;
  platformFee: number;
  netPool: number;
  outcome: boolean;
}

const PLATFORM_FEE_BPS = 200; // 2%

export default function WinningsPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [winnings, setWinnings] = useState<WinningBet[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!program || !publicKey) {
      setLoading(false);
      return;
    }

    async function fetchWinnings() {
      if (!program || !publicKey) {
        setLoading(false);
        return;
      }

      try {
        const markets = await (program.account as any).market.all();
        const winningBets: WinningBet[] = [];

        for (const market of markets) {
          // Only check resolved markets
          if (!market.account.resolved) continue;

          const [betPda] = getBetPDA(market.publicKey, publicKey);
          
          try {
            const betAccount = await (program.account as any).bet.fetch(betPda);
            const outcome = market.account.outcome;
            
            // Only include winning bets
            if (betAccount.prediction === outcome) {
              const totalYesAmount = market.account.totalYesAmount.toNumber();
              const totalNoAmount = market.account.totalNoAmount.toNumber();
              const totalPool = totalYesAmount + totalNoAmount;
              const winningPool = outcome ? totalYesAmount : totalNoAmount;
              const losingPool = outcome ? totalNoAmount : totalYesAmount;

              // Calculate platform fee (2%)
              const platformFee = Math.floor((totalPool * PLATFORM_FEE_BPS) / 10000);
              const netPool = totalPool - platformFee;

              // Calculate estimated winnings
              let estimatedWinnings = 0;
              if (winningPool > 0) {
                estimatedWinnings = Math.floor(
                  (betAccount.amount.toNumber() * netPool) / winningPool
                );
              }

              winningBets.push({
                marketAddress: market.publicKey.toString(),
                marketQuestion: market.account.question,
                betAmount: betAccount.amount.toNumber(),
                prediction: betAccount.prediction,
                claimed: betAccount.claimed,
                totalPool,
                winningPool,
                losingPool,
                estimatedWinnings,
                platformFee,
                netPool,
                outcome,
              });
            }
          } catch {
            // No bet on this market
          }
        }

        setWinnings(winningBets);
      } catch (error) {
        console.error("Error fetching winnings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWinnings();
    const interval = setInterval(fetchWinnings, 10000);
    return () => clearInterval(interval);
  }, [program, publicKey]);

  const handleClaim = async (marketAddress: string) => {
    if (!program || !publicKey) return;

    setClaiming(marketAddress);
    try {
      const marketPubkey = new PublicKey(marketAddress);
      const [betPda] = getBetPDA(marketPubkey, publicKey);
      const [vaultPda] = getVaultPDA(marketPubkey);

      await program.methods
        .claimWinnings()
        .accounts({
          market: marketPubkey,
          bet: betPda,
          vault: vaultPda,
          bettor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      // Update the local state
      setWinnings((prev) =>
        prev.map((w) =>
          w.marketAddress === marketAddress ? { ...w, claimed: true } : w
        )
      );

      alert("Winnings claimed successfully! 🎉");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to claim winnings");
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimAll = async () => {
    const unclaimedWinnings = winnings.filter((w) => !w.claimed);
    if (unclaimedWinnings.length === 0) return;

    for (const winning of unclaimedWinnings) {
      await handleClaim(winning.marketAddress);
      // Small delay between claims
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <p className="text-xl text-gray-400 mb-4">Connect your wallet to view winnings</p>
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
          <p className="text-gray-400 animate-pulse">Loading your winnings...</p>
        </div>
      </div>
    );
  }

  const totalWinnings = winnings.reduce((sum, w) => sum + w.estimatedWinnings, 0);
  const totalClaimed = winnings
    .filter((w) => w.claimed)
    .reduce((sum, w) => sum + w.estimatedWinnings, 0);
  const totalUnclaimed = winnings
    .filter((w) => !w.claimed)
    .reduce((sum, w) => sum + w.estimatedWinnings, 0);
  const unclaimedCount = winnings.filter((w) => !w.claimed).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-display text-5xl font-black mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-transparent bg-clip-text">
          🏆 Your Winnings
        </h1>
        <p className="text-gray-400">Claim your rewards from winning predictions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="text-sm text-gray-400 mb-1">Total Winnings</div>
          <div className="text-2xl font-black text-green-400">
            {(totalWinnings / LAMPORTS_PER_SOL).toFixed(4)} SOL
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="text-sm text-gray-400 mb-1">Unclaimed</div>
          <div className="text-2xl font-black text-blue-400">
            {(totalUnclaimed / LAMPORTS_PER_SOL).toFixed(4)} SOL
          </div>
          {unclaimedCount > 0 && (
            <div className="text-xs text-blue-300 mt-1">{unclaimedCount} pending</div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="text-sm text-gray-400 mb-1">Already Claimed</div>
          <div className="text-2xl font-black text-purple-400">
            {(totalClaimed / LAMPORTS_PER_SOL).toFixed(4)} SOL
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <div className="text-sm text-gray-400 mb-1">Winning Bets</div>
          <div className="text-2xl font-black text-yellow-400">{winnings.length}</div>
        </div>
      </div>

      {/* Claim All Button */}
      {unclaimedCount > 0 && (
        <div className="mb-6">
          <button
            onClick={handleClaimAll}
            disabled={claiming !== null}
            className="btn-primary text-lg px-8 py-4 w-full md:w-auto"
          >
            {claiming ? "Claiming..." : `🎉 Claim All (${unclaimedCount} bets)`}
          </button>
        </div>
      )}

      {/* Winnings List */}
      {winnings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <p className="text-xl text-gray-400 mb-2">No winnings yet</p>
          <p className="text-gray-500 mb-6">
            Place winning predictions to earn rewards!
          </p>
          <Link href="/markets" className="btn-primary inline-block">
            Browse Markets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {winnings.map((winning, index) => {
            const profit = winning.estimatedWinnings - winning.betAmount;
            const roi = ((profit / winning.betAmount) * 100).toFixed(1);

            return (
              <div
                key={index}
                className={`card ${
                  winning.claimed
                    ? "bg-white/5 border-gray-500/30"
                    : "border-green-500/30 bg-gradient-to-br from-green-500/5 to-emerald-500/5"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/market/${winning.marketAddress}`}
                        className="text-lg font-semibold hover:text-green-400 transition-colors"
                      >
                        {winning.marketQuestion}
                      </Link>
                      {winning.claimed ? (
                        <span className="badge-animated bg-gray-500/20 text-gray-400">
                          ✓ Claimed
                        </span>
                      ) : (
                        <span className="badge-animated bg-green-500/20 text-green-400 animate-pulse">
                          💰 Claimable
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Your Bet</div>
                        <div className="font-bold text-white">
                          {(winning.betAmount / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400">Prediction</div>
                        <div
                          className={`font-bold ${
                            winning.prediction ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {winning.prediction ? "YES ✓" : "NO ✓"}
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400">Total Winnings</div>
                        <div className="font-bold text-green-400">
                          {(winning.estimatedWinnings / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400">Profit</div>
                        <div className="font-bold text-emerald-400">
                          +{(profit / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </div>
                      </div>

                      <div>
                        <div className="text-gray-400">ROI</div>
                        <div className="font-bold text-yellow-400">+{roi}%</div>
                      </div>
                    </div>

                    {/* Pool Breakdown */}
                    <div className="mt-3 p-3 bg-black/20 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Pool:</span>
                        <span className="text-white">
                          {(winning.totalPool / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Winning Side Pool:</span>
                        <span className="text-green-400">
                          {(winning.winningPool / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Losing Side Pool:</span>
                        <span className="text-red-400">
                          {(winning.losingPool / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Platform Fee (2%):</span>
                        <span className="text-purple-400">
                          -{(winning.platformFee / LAMPORTS_PER_SOL).toFixed(4)} SOL
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-1 mt-1">
                        <span className="text-gray-300 font-semibold">Your Share:</span>
                        <span className="text-white font-semibold">
                          {((winning.betAmount / winning.winningPool) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {!winning.claimed && (
                    <button
                      onClick={() => handleClaim(winning.marketAddress)}
                      disabled={claiming === winning.marketAddress}
                      className="btn-primary whitespace-nowrap md:w-auto"
                    >
                      {claiming === winning.marketAddress ? (
                        <>
                          <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Claiming...
                        </>
                      ) : (
                        "💰 Claim Now"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
