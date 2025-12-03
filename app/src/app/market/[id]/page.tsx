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
  oracleSource: "manual" | "pythPrice";
  priceFeed?: string;
  targetPrice?: number;
  strikePrice?: number;
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
  const [resolving, setResolving] = useState(false);

  const marketPubkey = new PublicKey(params.id);

  useEffect(() => {
    if (!program) return;

    async function fetchData() {
      try {
        const marketAccount = await program.account.market.fetch(marketPubkey);
        const oracleSource = marketAccount.oracleSource.manual ? "manual" : "pythPrice";
        
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
          oracleSource,
          priceFeed: marketAccount.priceFeed?.toString(),
          targetPrice: marketAccount.targetPrice?.toNumber(),
          strikePrice: marketAccount.strikePrice?.toNumber(),
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

  const handleResolveOracle = async () => {
    if (!program || !publicKey || !market?.priceFeed) return;

    setResolving(true);
    try {
      const priceFeedPubkey = new PublicKey(market.priceFeed);

      await program.methods
        .resolveMarketWithOracle()
        .accounts({
          market: marketPubkey,
          priceFeed: priceFeedPubkey,
          authority: publicKey,
        })
        .rpc();

      alert("Market resolved successfully!");
      window.location.reload();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to resolve market");
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400 animate-pulse">Loading market details...</p>
        </div>
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

            {market.oracleSource === "pythPrice" && (
              <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🔮</span>
                  <span className="font-semibold text-blue-400">Oracle-Powered Market</span>
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Resolution:</span>
                    <span className="font-medium">Pyth Price Feed</span>
                  </div>
                  {market.targetPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Price:</span>
                      <span className="font-medium">${(market.targetPrice / 1e8).toFixed(2)}</span>
                    </div>
                  )}
                  {market.strikePrice && market.resolved && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strike Price:</span>
                      <span className="font-medium text-green-400">${(market.strikePrice / 1e8).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    This market will be automatically resolved by Pyth oracle when it ends.
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="stat-card bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                <div className="text-3xl mb-2">💰</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Pool</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {(total / LAMPORTS_PER_SOL).toFixed(2)} SOL
                </div>
              </div>
              <div className="stat-card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="text-3xl mb-2">⏰</div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Ends</div>
                <div className="text-xl font-bold text-blue-400">
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

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setBetSide(true)}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 group ${
                    betSide
                      ? "border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-green-400 shadow-glow-green scale-105"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-green-500/30"
                  }`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✅</div>
                  <div className="font-bold text-lg">YES</div>
                </button>
                <button
                  onClick={() => setBetSide(false)}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 group ${
                    !betSide
                      ? "border-red-500 bg-gradient-to-br from-red-500/20 to-rose-500/20 text-red-400 shadow-glow scale-105"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-red-500/30"
                  }`}
                >
                  <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">❌</div>
                  <div className="font-bold text-lg">NO</div>
                </button>
              </div>

              <div className="relative mb-4">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">SOL</div>
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.1"
                  min="0.01"
                  className="input-primary pl-16 text-lg font-bold"
                />
              </div>

              <button
                onClick={handlePlaceBet}
                disabled={placing || !betAmount}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10">
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Placing Bet...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      🎯 Bet {betAmount || "0"} SOL on {betSide ? "YES" : "NO"}
                    </span>
                  )}
                </span>
              </button>

              <p className="text-xs text-gray-500 mt-3 text-center">
                Platform fee: 2% on winnings
              </p>
            </div>
          )}

          {!isActive && !market.resolved && market.oracleSource === "pythPrice" && publicKey && (
            <div className="card sticky top-20">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔮</span>
                <h3 className="text-lg font-semibold">Oracle Resolution</h3>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                This market can now be resolved by anyone using the Pyth price feed.
              </p>
              <button
                onClick={handleResolveOracle}
                disabled={resolving}
                className="btn-primary w-full"
              >
                {resolving ? "Resolving..." : "Resolve Market"}
              </button>
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
