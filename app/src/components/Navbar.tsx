'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-strong border-b border-purple-500/30 shadow-2xl backdrop-blur-xl' 
        : 'bg-transparent border-b border-white/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <span className="text-white font-black text-lg">PA</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-2xl font-black gradient-text-animated text-heading">
                  Prediction Arena
                </div>
                <div className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                  NFT-Powered Markets
                </div>
              </div>
            </Link>
            
            {/* Navigation Links */}
            <div className="hidden lg:flex space-x-1" aria-label="Primary">
              {[
                { href: '/markets', label: 'Markets', icon: '📊' },
                { href: '/create', label: 'Create', icon: '✨' },
                { href: '/cards', label: 'Cards', icon: '🎴' },
                { href: '/battle', label: 'Battle', icon: '⚔️' },
                { href: '/my-bets', label: 'My Bets', icon: '💰' }
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group relative px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm ${
                    isActive(href)
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                      : 'hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </span>
                  {isActive(href) && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Button */}
          {mounted && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <WalletMultiButton className="relative !bg-gradient-to-r !from-purple-600 !via-blue-600 !to-purple-600 hover:!from-purple-700 hover:!to-blue-700 !transition-all !duration-300 !rounded-xl !shadow-xl hover:!shadow-2xl hover:!scale-105 !font-bold !px-6 !py-3 bg-[length:200%_auto] !animate-gradient" />
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden pb-4">
          <div className="flex space-x-2 overflow-x-auto no-scrollbar">
            {[
              { href: '/markets', label: 'Markets', icon: '📊' },
              { href: '/create', label: 'Create', icon: '✨' },
              { href: '/cards', label: 'Cards', icon: '🎴' },
              { href: '/battle', label: 'Battle', icon: '⚔️' },
              { href: '/my-bets', label: 'Bets', icon: '💰' }
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex-shrink-0 px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-xs whitespace-nowrap ${
                  isActive(href)
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{icon}</span>
                  <span>{label}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
