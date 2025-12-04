"use client";

import { useState, useEffect } from "react";
import { useProgram, getBetPDA } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";

interface Bet {
  marketAddress: string;
  marketQuestion: string;
  amount: number;
  prediction: boolean;
  claimed: boolean;
  marketResolved: boolean;
  marketOutcome: boolean | null;
}

export default function MyBetsPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program || !publicKey) return;

    async function fetchBets() {
      if (!program || !publicKey) {
        setLoading(false);
        return;
      }
      try {
        const markets = await (program.account as any).market.all();
        const userBets: Bet[] = [];

        for (const market of markets) {
          const [betPda] = getBetPDA(market.publicKey, publicKey);
          try {
            const betAccount = await (program.account as any).bet.fetch(betPda);
            userBets.push({
              marketAddress: market.publicKey.toString(),
              marketQuestion: (market.account as any).question,
              amount: betAccount.amount.toNumber(),
              prediction: betAccount.prediction,
              claimed: betAccount.claimed,
              marketResolved: (market.account as any).resolved,
              marketOutcome: (market.account as any).outcome,
            });
          } catch {
            // No bet on this market
          }
        }

        setBets(userBets);
      } catch (error) {
        console.error("Error fetching bets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBets();
  }, [program, publicKey]);

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold gradient-text">Connect Wallet</h1>
          <p className="text-gray-400">Connect your wallet to view your bets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold gradient-text mb-8">My Bets</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading your bets...</p>
        </div>
      ) : bets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">You haven't placed any bets yet</p>
          <Link href="/markets" className="btn-primary inline-block">
            Browse Markets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bets.map((bet, index) => {
            const isWinner = bet.marketResolved && bet.prediction === bet.marketOutcome;
            const isLoser = bet.marketResolved && bet.prediction !== bet.marketOutcome;
            const pending = !bet.marketResolved;

            return (
              <Link
                key={index}
                href={`/market/${bet.marketAddress}`}
                className="card hover:scale-[1.02] transition-transform duration-200 block"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold flex-1">{bet.marketQuestion}</h3>
                  {pending && (
                    <span className="badge-animated bg-blue-500/20 text-blue-400">Pending</span>
                  )}
                  {isWinner && !bet.claimed && (
                    <span className="badge-animated bg-green-500/20 text-green-400">
                      Won! Claim
                    </span>
                  )}
                  {isWinner && bet.claimed && (
                    <span className="badge-animated bg-green-500/20 text-green-400">
                      Won ✅
                    </span>
                  )}
                  {isLoser && (
                    <span className="badge-animated bg-red-500/20 text-red-400">Lost</span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Your Bet</div>
                    <div className="font-semibold">
                      {(bet.amount / LAMPORTS_PER_SOL).toFixed(2)} SOL
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Position</div>
                    <div
                      className={`font-bold ${
                        bet.prediction ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {bet.prediction ? "YES" : "NO"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400">Status</div>
                    <div className="font-semibold">
                      {pending
                        ? "Active"
                        : isWinner
                        ? bet.claimed
                          ? "Claimed"
                          : "Claimable"
                        : "Lost"}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
