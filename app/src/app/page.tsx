'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section with animated background */}
      <div className="relative overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold mb-8 leading-tight">
              <span className="gradient-text">On-Chain Social</span>
              <br />
              <span className="text-white">Prediction Arena</span>
            </h1>
            
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              The first gamified prediction market on Solana. Collect <span className="text-purple-400 font-semibold">NFT cards</span>, 
              battle with unique traits, and watch your cards <span className="text-blue-400 font-semibold">evolve</span> with every win.
            </p>

            {connected ? (
              <div className="flex gap-6 justify-center">
                <Link 
                  href="/cards"
                  className="group px-10 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/50 hover:scale-105"
                >
                  🃏 My Cards
                  <span className="inline-block group-hover:translate-x-1 transition-transform ml-2">→</span>
                </Link>
                <Link 
                  href="/battle"
                  className="group px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-blue-500/50 hover:scale-105"
                >
                  ⚔️ Enter Battle
                  <span className="inline-block group-hover:translate-x-1 transition-transform ml-2">→</span>
                </Link>
              </div>
            ) : (
              <div className="glass-strong rounded-xl px-8 py-6 inline-block">
                <p className="text-gray-300 text-lg">✨ Connect your wallet to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer border border-purple-500/20 hover:border-purple-500/50">
            <div className="text-5xl mb-6 animate-float">🃏</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">NFT Prediction Cards</h3>
            <p className="text-gray-300 leading-relaxed">
              Each card is a real SPL token NFT with unique traits: power, rarity, and reward multipliers up to <span className="text-yellow-400 font-bold">3x</span>.
            </p>
          </div>

          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer border border-blue-500/20 hover:border-blue-500/50" style={{ animationDelay: '0.1s' }}>
            <div className="text-5xl mb-6 animate-float" style={{ animationDelay: '0.5s' }}>⚔️</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">On-Chain Battles</h3>
            <p className="text-gray-300 leading-relaxed">
              Use your cards to enter prediction battles. Card traits affect outcomes and rewards in <span className="text-green-400 font-bold">provably fair</span> battles.
            </p>
          </div>

          <div className="glass-strong rounded-2xl p-8 hover:scale-105 transition-transform duration-300 cursor-pointer border border-pink-500/20 hover:border-pink-500/50" style={{ animationDelay: '0.2s' }}>
            <div className="text-5xl mb-6 animate-float" style={{ animationDelay: '1s' }}>📈</div>
            <h3 className="text-2xl font-bold mb-4 gradient-text">Living NFTs</h3>
            <p className="text-gray-300 leading-relaxed">
              Card stats (wins/losses) update <span className="text-purple-400 font-bold">on-chain</span> after every battle. Build legendary records and climb leaderboards.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="glass-strong border border-purple-700/50 rounded-2xl p-12 text-center mb-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-10 gradient-text">Platform Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="glass p-6 rounded-xl hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-purple-400 mb-2">0</div>
                <div className="text-gray-300 text-sm font-medium">Total Cards Minted</div>
              </div>
              <div className="glass p-6 rounded-xl hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-blue-400 mb-2">0</div>
                <div className="text-gray-300 text-sm font-medium">Active Markets</div>
              </div>
              <div className="glass p-6 rounded-xl hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-green-400 mb-2">0</div>
                <div className="text-gray-300 text-sm font-medium">Total Volume (SOL)</div>
              </div>
              <div className="glass p-6 rounded-xl hover:scale-110 transition-transform duration-300">
                <div className="text-4xl font-bold text-yellow-400 mb-2">0</div>
                <div className="text-gray-300 text-sm font-medium">Battles Fought</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-16 gradient-text">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { num: 1, title: 'Mint Your Card', desc: 'Choose traits and mint your NFT prediction card', icon: '🎨' },
              { num: 2, title: 'Join Market', desc: 'Browse prediction markets and choose YES or NO', icon: '📊' },
              { num: 3, title: 'Battle', desc: 'Use your card to battle and earn multiplied rewards', icon: '⚔️' },
              { num: 4, title: 'Evolve', desc: 'Watch your card stats grow with every victory', icon: '🏆' }
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="relative mb-6 inline-block">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    {step.num}
                  </div>
                  <div className="absolute -top-2 -right-2 text-3xl">{step.icon}</div>
                </div>
                <h4 className="font-bold text-xl mb-3 text-white">{step.title}</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
