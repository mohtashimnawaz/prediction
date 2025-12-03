"use client";

import { useState } from "react";
import { useProgram, getMarketPDA, getPlatformPDA, BN } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { SystemProgram, PublicKey } from "@solana/web3.js";

const categories = [
  { value: "sports", label: "Sports", key: "sports" },
  { value: "crypto", label: "Crypto", key: "crypto" },
  { value: "politics", label: "Politics", key: "politics" },
  { value: "entertainment", label: "Entertainment", key: "entertainment" },
  { value: "weather", label: "Weather", key: "weather" },
  { value: "technology", label: "Technology", key: "technology" },
  { value: "gaming", label: "Gaming", key: "gaming" },
  { value: "other", label: "Other", key: "other" },
];

// Pyth price feeds on Devnet
const PYTH_FEEDS = {
  "SOL/USD": "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
  "BTC/USD": "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J",
  "ETH/USD": "EdVCmQ9FSPcVe5YySXDPCRmc8aDQLKJ9xvYBMZPie1Vw",
};

const ORACLE_TYPES = [
  { value: "manual", label: "Manual", icon: "👤", description: "You resolve the outcome" },
  { value: "price", label: "Price Feed", icon: "💰", description: "Crypto/stock prices (Pyth)" },
  { value: "sports", label: "Sports", icon: "⚽", description: "Game scores & winners" },
  { value: "weather", label: "Weather", icon: "🌤️", description: "Temperature, precipitation" },
  { value: "social", label: "Social Media", icon: "📱", description: "Followers, likes, views" },
  { value: "entertainment", label: "Entertainment", icon: "🎬", description: "Box office, streaming" },
];

const WEATHER_METRICS = [
  { value: "temperature", label: "Temperature (°F)" },
  { value: "precipitation", label: "Precipitation (inches)" },
  { value: "windSpeed", label: "Wind Speed (mph)" },
  { value: "humidity", label: "Humidity (%)" },
];

const SOCIAL_METRICS = [
  { value: "followerCount", label: "Follower Count" },
  { value: "likeCount", label: "Like Count" },
  { value: "viewCount", label: "View Count" },
  { value: "boxOfficeGross", label: "Box Office Gross ($)" },
  { value: "streamRank", label: "Streaming Rank" },
];

export default function CreateMarketPage() {
  const program = useProgram();
  const { publicKey } = useWallet();
  const router = useRouter();

  const [formData, setFormData] = useState({
    question: "",
    description: "",
    category: "crypto",
    duration: 24,
    oracleType: "manual",
    // Price oracle fields
    priceFeed: "",
    targetPrice: "",
    // Sports oracle fields
    gameId: "",
    targetSpread: "",
    // Weather oracle fields
    location: "",
    weatherMetric: "temperature",
    targetValue: "",
    // Social oracle fields
    dataIdentifier: "",
    socialMetric: "followerCount",
    threshold: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program || !publicKey) return;

    setLoading(true);
    setError("");

    try {
      const endTime = Math.floor(Date.now() / 1000) + formData.duration * 3600;
      
      const [platformPda] = getPlatformPDA();
      const [marketPda] = getMarketPDA(publicKey, formData.question);

      const categoryObj = { [formData.category]: {} };
      
      // Determine oracle source and data type
      let oracleSource, oracleDataType;
      let priceFeed = null, targetPrice = null;
      let gameId = null, targetSpread = null;
      let location = null, weatherMetric = null, targetValue = null;
      let dataIdentifier = null, metricType = null, threshold = null;

      switch (formData.oracleType) {
        case "price":
          oracleSource = { pythPrice: {} };
          oracleDataType = { price: {} };
          priceFeed = formData.priceFeed ? new PublicKey(formData.priceFeed) : null;
          targetPrice = formData.targetPrice ? new BN(parseFloat(formData.targetPrice) * 1e8) : null;
          break;
          
        case "sports":
          oracleSource = { chainlinkSports: {} };
          oracleDataType = { sportsScore: {} };
          gameId = formData.gameId || null;
          targetSpread = formData.targetSpread ? parseInt(formData.targetSpread) : null;
          break;
          
        case "weather":
          oracleSource = { chainlinkWeather: {} };
          oracleDataType = { weather: {} };
          location = formData.location || null;
          weatherMetric = formData.weatherMetric ? { [formData.weatherMetric]: {} } : { none: {} };
          targetValue = formData.targetValue ? new BN(parseFloat(formData.targetValue) * 100) : null;
          break;
          
        case "social":
        case "entertainment":
          oracleSource = { switchboardCustom: {} };
          oracleDataType = formData.socialMetric === "boxOfficeGross" ? { boxOffice: {} } : { social: {} };
          dataIdentifier = formData.dataIdentifier || null;
          metricType = formData.socialMetric ? { [formData.socialMetric]: {} } : { none: {} };
          threshold = formData.threshold ? new BN(formData.threshold) : null;
          break;
          
        default: // manual
          oracleSource = { manual: {} };
          oracleDataType = { none: {} };
      }

      await program.methods
        .createMarket(
          formData.question,
          formData.description,
          new BN(endTime),
          categoryObj,
          oracleSource,
          oracleDataType,
          priceFeed,
          targetPrice,
          gameId,
          targetSpread,
          location,
          weatherMetric,
          targetValue,
          dataIdentifier,
          metricType,
          threshold
        )
        .accounts({
          market: marketPda,
          platform: platformPda,
          authority: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      router.push(`/market/${marketPda.toString()}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create market");
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-4xl font-bold gradient-text">Connect Wallet</h1>
          <p className="text-gray-400">Connect your wallet to create a market</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold gradient-text mb-8">Create New Market</h1>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Question *</label>
          <input
            type="text"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            placeholder="Will BTC reach $100k by EOY?"
            maxLength={100}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.question.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the market conditions and resolution criteria..."
            maxLength={200}
            rows={4}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.description.length}/200 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Category *</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.value })}
                className={`p-3 rounded-lg border transition-all ${
                  formData.category === cat.value
                    ? "border-primary-500 bg-primary-500/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Duration (hours) *</label>
          <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            min={1}
            max={720}
            required
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 mt-1">Market will end in {formData.duration} hours</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Resolution Type *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ORACLE_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, oracleType: type.value })}
                className={`p-4 rounded-lg border transition-all text-left ${
                  formData.oracleType === type.value
                    ? "border-primary-500 bg-primary-500/20 scale-105"
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:scale-102"
                }`}
              >
                <div className="text-2xl mb-2">{type.icon}</div>
                <div className="font-semibold text-sm">{type.label}</div>
                <div className="text-xs text-gray-400 mt-1">{type.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Price Oracle Fields */}
        {formData.oracleType === "price" && (
          <div className="space-y-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 font-semibold">
              <span>💰</span>
              <span>Price Feed Configuration</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Price Feed *</label>
              <select
                value={formData.priceFeed}
                onChange={(e) => setFormData({ ...formData, priceFeed: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="">Select a price feed</option>
                {Object.entries(PYTH_FEEDS).map(([symbol, address]) => (
                  <option key={symbol} value={address}>
                    {symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Price (USD) *</label>
              <input
                type="number"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                placeholder="e.g., 50000"
                step="0.01"
                min="0"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Market resolves YES if price ≥ target, otherwise NO
              </p>
            </div>
          </div>
        )}

        {/* Sports Oracle Fields */}
        {formData.oracleType === "sports" && (
          <div className="space-y-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 font-semibold">
              <span>⚽</span>
              <span>Sports Event Configuration</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Game ID *</label>
              <input
                type="text"
                value={formData.gameId}
                onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                placeholder="e.g., LAL-GSW-2024-12-04"
                maxLength={50}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: TEAM1-TEAM2-YYYY-MM-DD
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Point Spread (optional)</label>
              <input
                type="number"
                value={formData.targetSpread}
                onChange={(e) => setFormData({ ...formData, targetSpread: e.target.value })}
                placeholder="e.g., 7 (Team A by 7 points)"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty for simple winner prediction
              </p>
            </div>
          </div>
        )}

        {/* Weather Oracle Fields */}
        {formData.oracleType === "weather" && (
          <div className="space-y-4 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span>🌤️</span>
              <span>Weather Data Configuration</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, NY"
                maxLength={50}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Weather Metric *</label>
              <select
                value={formData.weatherMetric}
                onChange={(e) => setFormData({ ...formData, weatherMetric: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {WEATHER_METRICS.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Target Value *</label>
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                placeholder="e.g., 90 (for 90°F)"
                step="0.01"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Market resolves YES if value ≥ target, otherwise NO
              </p>
            </div>
          </div>
        )}

        {/* Social/Entertainment Oracle Fields */}
        {(formData.oracleType === "social" || formData.oracleType === "entertainment") && (
          <div className="space-y-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="flex items-center gap-2 text-purple-400 font-semibold">
              <span>{formData.oracleType === "social" ? "📱" : "🎬"}</span>
              <span>{formData.oracleType === "social" ? "Social Media" : "Entertainment"} Configuration</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Data Identifier *</label>
              <input
                type="text"
                value={formData.dataIdentifier}
                onChange={(e) => setFormData({ ...formData, dataIdentifier: e.target.value })}
                placeholder={formData.oracleType === "social" ? "e.g., @elonmusk or tweet ID" : "e.g., avengers-6-2025"}
                maxLength={100}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.oracleType === "social" 
                  ? "Twitter handle, tweet ID, or YouTube video ID" 
                  : "Movie ID, show ID, or custom identifier"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Metric Type *</label>
              <select
                value={formData.socialMetric}
                onChange={(e) => setFormData({ ...formData, socialMetric: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                {SOCIAL_METRICS.map((metric) => (
                  <option key={metric.value} value={metric.value}>
                    {metric.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Threshold *</label>
              <input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                placeholder="e.g., 1000000 (1M followers)"
                min="0"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary-500 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Market resolves YES if value ≥ threshold, otherwise NO
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Market"}
        </button>
      </form>
    </div>
  );
}
