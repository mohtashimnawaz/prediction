"use client";

import { useState, useEffect } from "react";
import { useProgram } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import Link from "next/link";

interface Market {
  publicKey: string;
  question: string;
  description: string;
  endTime: number;
  resolved: boolean;
  outcome: boolean | null;
  totalYesAmount: number;
  totalNoAmount: number;
  category: string;
}

export default function MarketsPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("active");

  useEffect(() => {
    if (!program) return;

    async function fetchMarkets() {
      try {
        const accounts = await program.account.market.all();
        const formatted = accounts.map((acc: any) => ({
          publicKey: acc.publicKey.toString(),
          question: acc.account.question,
          description: acc.account.description,
          endTime: acc.account.endTime.toNumber(),
          resolved: acc.account.resolved,
          outcome: acc.account.outcome,
          totalYesAmount: acc.account.totalYesAmount.toNumber(),
          totalNoAmount: acc.account.totalNoAmount.toNumber(),
          category: Object.keys(acc.account.category)[0],
        }));
        setMarkets(formatted);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 10000);
    return () => clearInterval(interval);
  }, [program]);

  const filteredMarkets = markets.filter((m) => {
    if (filter === "active") return !m.resolved && Date.now() < m.endTime * 1000;
    if (filter === "resolved") return m.resolved;
    return true;
  });

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      sports: "⚽",
      crypto: "₿",
      politics: "🏛️",
      entertainment: "🎬",
      weather: "🌤️",
      technology: "💻",
      gaming: "🎮",
      other: "📊",
    };
    return map[category] || "📊";
  };

  const formatTimeLeft = (endTime: number) => {
    const diff = endTime * 1000 - Date.now();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold gradient-text">Connect Wallet</h1>
          <p className="text-gray-400 text-lg">Connect your wallet to view markets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Prediction Markets</h1>
          <p className="text-gray-400">Place bets on future outcomes</p>
        </div>
        <Link href="/create" className="btn-primary">
          + Create Market
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {["all", "active", "resolved"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg capitalize transition-all ${
              filter === f
                ? "bg-primary-500 text-white shadow-glow"
                : "bg-white/5 hover:bg-white/10 text-gray-400"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading markets...</p>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No markets found</p>
          <Link href="/create" className="btn-primary inline-block mt-4">
            Create First Market
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => {
            const total = market.totalYesAmount + market.totalNoAmount;
            const yesPercentage = total > 0 ? (market.totalYesAmount / total) * 100 : 50;

            return (
              <Link
                key={market.publicKey}
                href={`/market/${market.publicKey}`}
                className="card card-glow hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{getCategoryEmoji(market.category)}</span>
                  {market.resolved ? (
                    <span className="badge-animated bg-green-500/20 text-green-400">
                      Resolved
                    </span>
                  ) : (
                    <span className="badge-animated bg-blue-500/20 text-blue-400">
                      {formatTimeLeft(market.endTime)}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{market.question}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{market.description}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">YES {yesPercentage.toFixed(0)}%</span>
                    <span className="text-red-400">NO {(100 - yesPercentage).toFixed(0)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill bg-gradient-to-r from-green-500 to-emerald-600"
                      style={{ width: `${yesPercentage}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    Total Pool: {(total / LAMPORTS_PER_SOL).toFixed(2)} SOL
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
