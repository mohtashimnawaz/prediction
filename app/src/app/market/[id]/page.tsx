"use client";

import { useState, useEffect } from "react";
import { useProgram, getMarketPDA, getBetPDA, getVaultPDA, getPlatformPDA, BN } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";

interface MarketData {
  question: string;
  description: string;
  endTime: number;
  createdAt: number;
  resolved: boolean;
  outcome: boolean | null;
  totalYesAmount: number;
  totalNoAmount: number;
  category: string;
  authority: string;
  creator: string;
}

export default function MarketPage({ params }: { params: { id: string } }) {
  const program = useProgram();
  const { publicKey } = useWallet();
  
  const [market, setMarket] = useState<MarketData | null>(null);
  const [userBet, setUserBet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState("");
  const [betSide, setBetSide] = useState<boolean>(true);
  const [placing, setPlacing] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const marketPubkey = new PublicKey(params.id);

  useEffect(() => {
    if (!program) return;

    async function fetchData() {
      try {
        const marketAccount = await program.account.market.fetch(marketPubkey);
        
        setMarket({
          question: marketAccount.question,
          description: marketAccount.description,
          endTime: marketAccount.endTime.toNumber(),
          createdAt: marketAccount.createdAt.toNumber(),
          resolved: marketAccount.resolved,
          outcome: marketAccount.outcome,
          totalYesAmount: marketAccount.totalYesAmount.toNumber(),
          totalNoAmount: marketAccount.totalNoAmount.toNumber(),
          category: Object.keys(marketAccount.category)[0],
          authority: marketAccount.authority.toString(),
          creator: marketAccount.creator.toString(),
        });

        if (publicKey) {
          const [betPda] = getBetPDA(marketPubkey, publicKey);
          try {
            const betAccount = await program.account.bet.fetch(betPda);
            setUserBet(betAccount);
          } catch {
            // No bet yet
          }
        }
      } catch (error) {
        console.error("Error fetching market:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [program, publicKey, marketPubkey]);

  const handlePlaceBet = async () => {
    if (!program || !publicKey || !betAmount) return;

    setPlacing(true);
    try {
      const amount = new BN(parseFloat(betAmount) * LAMPORTS_PER_SOL);
      const [betPda] = getBetPDA(marketPubkey, publicKey);
      const [vaultPda] = getVaultPDA(marketPubkey);
      const [platformPda] = getPlatformPDA();

      await program.methods
        .placeBet(amount, betSide)
        .accounts({
          market: marketPubkey,
          platform: platformPda,
          bet: betPda,
          vault: vaultPda,
          bettor: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setBetAmount("");
      alert("Bet placed successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to place bet");
    } finally {
      setPlacing(false);
    }
  };

  const handleClaimWinnings = async () => {
    if (!program || !publicKey) return;

    setClaiming(true);
    try {
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

      alert("Winnings claimed successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to claim winnings");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Market not found</p>
          <Link href="/markets" className="btn-primary inline-block mt-4">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const total = market.totalYesAmount + market.totalNoAmount;
  const yesPercentage = total > 0 ? (market.totalYesAmount / total) * 100 : 50;
  const isActive = !market.resolved && Date.now() < market.endTime * 1000;

  const canClaim =
    market.resolved &&
    userBet &&
    !userBet.claimed &&
    userBet.prediction === market.outcome;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/markets" className="text-gray-400 hover:text-white mb-4 inline-block">
        ← Back to Markets
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <span className="badge-animated bg-purple-500/20 text-purple-400 capitalize">
                {market.category}
              </span>
              {market.resolved ? (
                <span className="badge-animated bg-green-500/20 text-green-400">
                  Resolved: {market.outcome ? "YES" : "NO"}
                </span>
              ) : isActive ? (
                <span className="badge-animated bg-blue-500/20 text-blue-400">Active</span>
              ) : (
                <span className="badge-animated bg-gray-500/20 text-gray-400">Ended</span>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{market.question}</h1>
            <p className="text-gray-400 mb-6">{market.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="stat-card">
                <div className="text-sm text-gray-400">Total Pool</div>
                <div className="text-2xl font-bold">
                  {(total / LAMPORTS_PER_SOL).toFixed(2)} SOL
                </div>
              </div>
              <div className="stat-card">
                <div className="text-sm text-gray-400">Ends</div>
                <div className="text-xl font-bold">
                  {new Date(market.endTime * 1000).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-green-400">YES {yesPercentage.toFixed(1)}%</span>
                <span className="text-red-400">NO {(100 - yesPercentage).toFixed(1)}%</span>
              </div>
              <div className="progress-bar h-4">
                <div
                  className="progress-fill bg-gradient-to-r from-green-500 to-emerald-600"
                  style={{ width: `${yesPercentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">YES Pool:</span>
                  <span className="ml-2 font-semibold">
                    {(market.totalYesAmount / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">NO Pool:</span>
                  <span className="ml-2 font-semibold">
                    {(market.totalNoAmount / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </span>
                </div>
              </div>
            </div>
          </div>

          {userBet && (
            <div className="card border border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">Your Bet</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Position:</span>
                  <span
                    className={`font-bold ${
                      userBet.prediction ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {userBet.prediction ? "YES" : "NO"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold">
                    {(userBet.amount.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL
                  </span>
                </div>
                {userBet.claimed && (
                  <div className="text-green-400 text-sm">✅ Winnings claimed</div>
                )}
              </div>

              {canClaim && (
                <button
                  onClick={handleClaimWinnings}
                  disabled={claiming}
                  className="btn-primary w-full mt-4"
                >
                  {claiming ? "Claiming..." : "Claim Winnings"}
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          {isActive && publicKey && (
            <div className="card sticky top-20">
              <h3 className="text-lg font-semibold mb-4">Place Your Bet</h3>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setBetSide(true)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    betSide
                      ? "border-green-500 bg-green-500/20 text-green-400"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-1">✅</div>
                  <div className="font-bold">YES</div>
                </button>
                <button
                  onClick={() => setBetSide(false)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !betSide
                      ? "border-red-500 bg-red-500/20 text-red-400"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-2xl mb-1">❌</div>
                  <div className="font-bold">NO</div>
                </button>
              </div>

              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Amount in SOL"
                step="0.1"
                min="0.01"
                className="w-full px-4 py-3 mb-4 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />

              <button
                onClick={handlePlaceBet}
                disabled={placing || !betAmount}
                className="btn-primary w-full"
              >
                {placing ? "Placing Bet..." : `Bet ${betAmount || "0"} SOL on ${betSide ? "YES" : "NO"}`}
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Platform fee: 2% on winnings
              </p>
            </div>
          )}

          {!publicKey && (
            <div className="card text-center">
              <div className="text-4xl mb-3">🔒</div>
              <p className="text-gray-400">Connect wallet to place bets</p>
            </div>
          )}

          {!isActive && !market.resolved && (
            <div className="card text-center">
              <div className="text-4xl mb-3">⏰</div>
              <p className="text-gray-400">Market betting has ended</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
