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
  oracleSource: string;
  oracleDataType: string;
  priceFeed?: string;
  targetPrice?: number;
  strikePrice?: number;
  gameId?: string;
  teamAScore?: number;
  teamBScore?: number;
  location?: string;
  weatherMetric?: string;
  targetValue?: number;
  recordedValue?: number;
  dataIdentifier?: string;
  metricType?: string;
  threshold?: number;
  actualValue?: number;
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
        const formatted = accounts.map((acc: any) => {
          // Parse oracle source
          const oracleSourceKey = Object.keys(acc.account.oracleSource)[0];
          const oracleDataTypeKey = Object.keys(acc.account.oracleDataType)[0];
          const weatherMetricKey = acc.account.weatherMetric ? Object.keys(acc.account.weatherMetric)[0] : undefined;
          const metricTypeKey = acc.account.metricType ? Object.keys(acc.account.metricType)[0] : undefined;
          
          return {
            publicKey: acc.publicKey.toString(),
            question: acc.account.question,
            description: acc.account.description,
            endTime: acc.account.endTime.toNumber(),
            resolved: acc.account.resolved,
            outcome: acc.account.outcome,
            totalYesAmount: acc.account.totalYesAmount.toNumber(),
            totalNoAmount: acc.account.totalNoAmount.toNumber(),
            category: Object.keys(acc.account.category)[0],
            oracleSource: oracleSourceKey,
            oracleDataType: oracleDataTypeKey,
            priceFeed: acc.account.priceFeed?.toString(),
            targetPrice: acc.account.targetPrice?.toNumber(),
            strikePrice: acc.account.strikePrice?.toNumber(),
            gameId: acc.account.gameId,
            teamAScore: acc.account.teamAScore,
            teamBScore: acc.account.teamBScore,
            location: acc.account.location,
            weatherMetric: weatherMetricKey,
            targetValue: acc.account.targetValue?.toNumber(),
            recordedValue: acc.account.recordedValue?.toNumber(),
            dataIdentifier: acc.account.dataIdentifier,
            metricType: metricTypeKey,
            threshold: acc.account.threshold?.toNumber(),
            actualValue: acc.account.actualValue?.toNumber(),
          };
        });
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

  const getOracleBadge = (market: Market) => {
    const badges: Record<string, { icon: string; label: string; color: string }> = {
      manual: { icon: "👤", label: "Manual", color: "gray" },
      pythPrice: { icon: "💰", label: "Price Oracle", color: "blue" },
      chainlinkPrice: { icon: "💰", label: "Price Oracle", color: "blue" },
      chainlinkSports: { icon: "⚽", label: "Sports Oracle", color: "green" },
      chainlinkWeather: { icon: "🌤️", label: "Weather Oracle", color: "cyan" },
      switchboardPrice: { icon: "💰", label: "Price Oracle", color: "blue" },
      switchboardCustom: { icon: "📊", label: "Custom Oracle", color: "purple" },
      customApi: { icon: "🔗", label: "API Oracle", color: "orange" },
    };
    return badges[market.oracleSource] || badges.manual;
  };

  const getOracleDetails = (market: Market) => {
    switch (market.oracleDataType) {
      case "price":
        return market.targetPrice ? `Target: $${(market.targetPrice / 1e8).toFixed(2)}` : null;
      case "sportsScore":
      case "sportsWinner":
        return market.gameId ? `Game: ${market.gameId}` : null;
      case "weather":
        return market.location ? `Location: ${market.location}` : null;
      case "social":
      case "boxOffice":
        return market.threshold ? `Threshold: ${market.threshold.toLocaleString()}` : null;
      default:
        return null;
    }
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
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-lg font-medium animate-pulse">Loading prediction markets...</p>
          </div>
        </div>
      ) : filteredMarkets.length === 0 ? (
        <div className="glass-vibrant rounded-2xl p-16 text-center border-2 border-dashed border-purple-500/30">
          <div className="text-7xl mb-6">🎯</div>
          <h3 className="text-2xl font-bold gradient-text mb-3">No Markets Found</h3>
          <p className="text-gray-400 text-lg mb-6">Be the first to create a prediction market!</p>
          <Link href="/create" className="btn-primary inline-flex items-center gap-2">
            <span>Create First Market</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => {
            const total = market.totalYesAmount + market.totalNoAmount;
            const yesPercentage = total > 0 ? (market.totalYesAmount / total) * 100 : 50;
            const oracleBadge = getOracleBadge(market);
            const oracleDetails = getOracleDetails(market);

            return (
              <Link
                key={market.publicKey}
                href={`/market/${market.publicKey}`}
                className="group card card-glow hover:shadow-glow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-bold uppercase tracking-wider text-purple-400">{market.category}</div>
                      {market.oracleSource !== "manual" && (
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-2 py-1 rounded bg-${oracleBadge.color}-500/20 text-${oracleBadge.color}-400 border border-${oracleBadge.color}-500/30 w-fit flex items-center gap-1`}>
                            <span>{oracleBadge.icon}</span>
                            <span>{oracleBadge.label}</span>
                          </span>
                        </div>
                      )}
                      {oracleDetails && (
                        <div className="text-xs text-gray-500">{oracleDetails}</div>
                      )}
                    </div>
                    {market.resolved ? (
                      <span className="badge-animated bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30">
                        ✓ Resolved
                      </span>
                    ) : (
                      <span className="badge-animated bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-400 border border-blue-500/30">
                        ⏱ {formatTimeLeft(market.endTime)}
                      </span>
                    )}
                  </div>

                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{market.question}</h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">{market.description}</p>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-green-400 flex items-center gap-1">✓ YES {yesPercentage.toFixed(0)}%</span>
                      <span className="text-red-400 flex items-center gap-1">✗ NO {(100 - yesPercentage).toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar h-3 shadow-inner">
                      <div
                        className="progress-fill bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 shadow-glow-green"
                        style={{ width: `${yesPercentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="text-gray-400">Total Pool:</span>
                      <span className="font-bold text-yellow-400 text-base">{(total / LAMPORTS_PER_SOL).toFixed(2)} SOL</span>
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
