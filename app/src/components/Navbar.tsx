'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;

  return (
    <nav className="glass-strong border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 group">
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🎮</span>
              <span className="text-xl font-bold gradient-text">
                Prediction Arena
              </span>
            </Link>
            
            <div className="hidden md:flex space-x-2">
              {[
                { href: '/markets', label: 'Markets', icon: '📊' },
                { href: '/cards', label: 'Cards', icon: '🃏' },
                { href: '/battle', label: 'Battle', icon: '⚔️' },
                { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' }
              ].map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    isActive(href)
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                      : 'hover:bg-purple-600/20 hover:text-purple-300 text-gray-300'
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !transition-all !duration-300 !rounded-lg !shadow-lg hover:!shadow-purple-500/50" />
        </div>
      </div>
    </nav>
  );
}
