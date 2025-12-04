'use client';

import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with animated background */}
      <div className="relative overflow-hidden bg-gradient-to-b from-black via-purple-950/20 to-black">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        
        <div className="container mx-auto px-4 py-32 relative z-10">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-8 animate-fade-in">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
              </span>
              <span className="text-sm font-medium text-purple-300">Live on Solana Devnet</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight text-display">
              <span className="gradient-text-animated inline-block transform hover:scale-105 transition-transform">Predict.</span>
              <br />
              <span className="gradient-text-animated inline-block transform hover:scale-105 transition-transform" style={{animationDelay: '0.2s'}}>Battle.</span>
              <br />
              <span className="text-white inline-block transform hover:scale-105 transition-transform">Dominate.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              The world's first <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">NFT-powered</span> prediction market on Solana. 
              Create markets on <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">crypto prices</span>, <span className="text-green-400 font-bold bg-green-500/10 px-2 py-0.5 rounded">sports</span>, 
              <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded"> weather</span>, and <span className="text-pink-400 font-bold bg-pink-500/10 px-2 py-0.5 rounded">social media</span>—powered by real oracles.
            </p>

            {mounted && (
              <>
                {connected ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link 
                      href="/markets"
                      className="group relative px-10 py-5 text-lg font-black rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 bg-[length:200%_auto] animate-gradient text-heading"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className="text-2xl">🎯</span>
                        Explore Markets
                        <span className="inline-block group-hover:translate-x-1 transition-transform text-xl">→</span>
                      </span>
                    </Link>
                    <Link 
                      href="/cards"
                      className="px-10 py-5 text-lg font-black rounded-2xl glass-strong hover:bg-white/20 transition-all duration-300 hover:scale-105 border-2 border-white/10 hover:border-purple-500/50 text-heading"
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">🃏</span>
                        My NFT Cards
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div className="glass-strong rounded-2xl px-10 py-8 inline-block border-2 border-purple-500/30 animate-pulse-slow">
                    <p className="text-gray-300 text-lg mb-2 font-medium">👆 Connect your wallet to start</p>
                    <p className="text-sm text-gray-500 font-light">Free on Devnet • No gas fees</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto mt-20">
            {[
              { icon: '⚡', label: 'Instant Settlement', color: 'yellow' },
              { icon: '🔮', label: 'Oracle-Powered', color: 'purple' },
              { icon: '🎴', label: 'NFT Cards', color: 'blue' },
              { icon: '⚔️', label: 'PvP Battles', color: 'red' }
            ].map((item, i) => (
              <div key={i} className="glass text-center py-6 rounded-xl hover:scale-105 transition-all duration-300 border border-white/5 hover:border-${item.color}-500/30 group cursor-pointer">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24 relative">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-heading">
            <span className="gradient-text-animated">Why Prediction Arena?</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
            Next-gen prediction markets powered by NFTs and real-time oracles
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {/* NFT Cards Feature */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative card-premium border-2 border-purple-500/20 hover:border-purple-500/50 bg-black/40 backdrop-blur-xl p-8 h-full">
              <div className="w-20 h-20 mb-6 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-3xl font-black text-white">NFT</span>
              </div>
              <h3 className="text-3xl font-black mb-4 text-white group-hover:text-purple-400 transition-colors text-heading">
                Dynamic NFT Cards
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-lg font-light">
                Mint unique SPL token NFTs with custom <span className="text-purple-400 font-bold">power</span>, 
                <span className="text-pink-400 font-bold"> rarity</span>, and reward 
                <span className="text-yellow-400 font-bold"> multipliers</span> up to 3x.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>On-chain metadata & stats</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Win/loss records that evolve</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Boost prediction rewards</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Multi-Oracle Feature */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative card-premium border-2 border-blue-500/20 hover:border-blue-500/50 bg-black/40 backdrop-blur-xl p-8 h-full">
              <div className="w-20 h-20 mb-6 bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-3xl">🔮</span>
              </div>
              <h3 className="text-3xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors text-heading">
                Multi-Oracle System
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-lg font-light">
                Create markets on anything: <span className="text-blue-400 font-bold">crypto prices</span>, 
                <span className="text-green-400 font-bold"> sports scores</span>, 
                <span className="text-cyan-400 font-bold"> weather data</span>, 
                <span className="text-pink-400 font-bold"> social metrics</span>.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Pyth price feeds (live)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Sports, weather, social data</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Trustless resolution</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Battle Feature */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
            <div className="relative card-premium border-2 border-red-500/20 hover:border-red-500/50 bg-black/40 backdrop-blur-xl p-8 h-full">
              <div className="w-20 h-20 mb-6 bg-gradient-to-br from-red-500 via-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-3xl">⚔️</span>
              </div>
              <h3 className="text-3xl font-black mb-4 text-white group-hover:text-red-400 transition-colors text-heading">
                PvP Card Battles
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6 text-lg font-light">
                Challenge other players in <span className="text-red-400 font-bold">on-chain battles</span>. 
                Higher power wins. Build <span className="text-yellow-400 font-bold">legendary records</span>.
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Provably fair battles</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Real-time stat updates</span>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <span className="text-green-400">✓</span>
                  <span>Climb the leaderboards</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-heading">
              <span className="gradient-text-animated">How It Works</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              Four simple steps to start earning on predictions
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { 
                num: '01', 
                icon: '🎨',
                title: 'Mint Your Card', 
                desc: 'Create your unique NFT with custom traits and multipliers',
                color: 'purple'
              },
              { 
                num: '02', 
                icon: '🎯',
                title: 'Choose Market', 
                desc: 'Browse prediction markets on prices, sports, weather, and more',
                color: 'blue'
              },
              { 
                num: '03', 
                icon: '⚔️',
                title: 'Battle & Bet', 
                desc: 'Use your card to battle or place bets with multiplied rewards',
                color: 'red'
              },
              { 
                num: '04', 
                icon: '🏆',
                title: 'Earn & Evolve', 
                desc: 'Win rewards and watch your card stats grow with victories',
                color: 'yellow'
              }
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div className={`absolute inset-0 bg-gradient-to-br from-${step.color}-600/10 to-${step.color}-600/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                <div className="relative glass-strong p-8 rounded-2xl border-2 border-white/5 hover:border-${step.color}-500/30 transition-all duration-300 h-full">
                  <div className="text-7xl font-black text-white/5 absolute top-4 right-4 group-hover:scale-110 transition-transform">
                    {step.num}
                  </div>
                  <div className="relative z-10">
                    <div className="text-5xl mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 inline-block">
                      {step.icon}
                    </div>
                    <h4 className="font-black text-2xl mb-3 text-white text-heading">
                      {step.title}
                    </h4>
                    <p className="text-gray-400 leading-relaxed font-light">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10 rounded-3xl blur-2xl"></div>
          <div className="relative glass-strong border-2 border-purple-500/30 rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.05)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text-animated text-heading">
                Platform Stats
              </h2>
              <p className="text-gray-400 mb-12 text-lg font-light">Building the future of prediction markets</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '0', label: 'Cards Minted', color: 'purple', icon: '🎴' },
                  { value: '0', label: 'Active Markets', color: 'blue', icon: '📊' },
                  { value: '0', label: 'Total Volume', color: 'green', icon: '💰', suffix: ' SOL' },
                  { value: '0', label: 'Battles', color: 'red', icon: '⚔️' }
                ].map((stat, i) => (
                  <div key={i} className="group">
                    <div className="glass p-6 rounded-2xl hover:scale-110 transition-all duration-300 border border-white/5 hover:border-${stat.color}-500/30">
                      <div className="text-4xl mb-3">{stat.icon}</div>
                      <div className={`text-5xl font-black mb-2 text-${stat.color}-400`}>
                        {stat.value}{stat.suffix || ''}
                      </div>
                      <div className="text-gray-400 text-sm font-semibold">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-24">
          <div className="inline-block glass-strong border-2 border-purple-500/30 rounded-3xl p-12 max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6 gradient-text-animated text-heading">
              Ready to Start?
            </h2>
            <p className="text-xl text-gray-400 mb-8 font-light">
              Join the revolution in decentralized prediction markets
            </p>
            {mounted && !connected && (
              <div className="space-y-4">
                <p className="text-gray-300 flex items-center justify-center gap-2 font-medium">
                  <span className="text-3xl">👆</span>
                  <span>Connect your wallet to get started</span>
                </p>
                <p className="text-sm text-purple-400 font-semibold">Free on Solana Devnet • No KYC Required</p>
              </div>
            )}
            {mounted && connected && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/create"
                  className="px-10 py-5 text-lg font-black rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50 text-heading"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">✨</span>
                    Create Market
                  </span>
                </Link>
                <Link 
                  href="/battle"
                  className="px-10 py-5 text-lg font-black rounded-2xl glass-strong hover:bg-white/20 transition-all duration-300 hover:scale-105 border-2 border-white/10 hover:border-red-500/50 text-heading"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-xl">⚔️</span>
                    Enter Battle
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
