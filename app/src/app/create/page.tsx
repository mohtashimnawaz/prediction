"use client";

import { useState } from "react";
import { useProgram, getMarketPDA, getPlatformPDA, BN } from "@/lib/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { SystemProgram } from "@solana/web3.js";

const categories = [
  { value: "sports", label: "⚽ Sports", key: "sports" },
  { value: "crypto", label: "₿ Crypto", key: "crypto" },
  { value: "politics", label: "🏛️ Politics", key: "politics" },
  { value: "entertainment", label: "🎬 Entertainment", key: "entertainment" },
  { value: "weather", label: "🌤️ Weather", key: "weather" },
  { value: "technology", label: "💻 Technology", key: "technology" },
  { value: "gaming", label: "🎮 Gaming", key: "gaming" },
  { value: "other", label: "📊 Other", key: "other" },
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

      await program.methods
        .createMarket(
          formData.question,
          formData.description,
          new BN(endTime),
          categoryObj
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
