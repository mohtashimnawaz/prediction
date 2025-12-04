import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 border-t border-white/5 bg-black/40 backdrop-blur-xl">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-950/10 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-3 group mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl">
                  <span className="text-white font-black text-lg">PA</span>
                </div>
              </div>
              <div>
                <div className="text-2xl font-black gradient-text-animated text-heading">
                  Prediction Arena
                </div>
                <div className="text-xs text-gray-500 font-semibold tracking-wide uppercase">
                  NFT-Powered Prediction Markets
                </div>
              </div>
            </Link>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              The first gamified prediction market on Solana featuring dynamic NFT cards, 
              multi-oracle support, and on-chain PvP battles.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">𝕏</span>
              </a>
              <a 
                href="https://discord.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">💬</span>
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-purple-600/30 border border-white/10 hover:border-purple-500/50 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <span className="text-xl">🔗</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Platform</h3>
            <ul className="space-y-3">
              {[
                { href: '/markets', label: 'Browse Markets' },
                { href: '/create', label: 'Create Market' },
                { href: '/cards', label: 'NFT Cards' },
                { href: '/battle', label: 'Battle Arena' },
                { href: '/my-bets', label: 'My Bets' }
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link 
                    href={href}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Resources</h3>
            <ul className="space-y-3">
              {[
                { label: 'Documentation', href: '#' },
                { label: 'Oracle Guide', href: '#' },
                { label: 'Smart Contracts', href: '#' },
                { label: 'Audit Report', href: '#' },
                { label: 'Community', href: '#' }
              ].map(({ href, label }) => (
                <li key={label}>
                  <a 
                    href={href}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm font-medium flex items-center gap-2 group"
                  >
                    <span className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p>© {currentYear} Prediction Arena. All rights reserved.</p>
              <p className="text-xs mt-1">Built on <span className="text-purple-400 font-semibold">Solana</span> • Powered by <span className="text-blue-400 font-semibold">Pyth Oracles</span></p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm text-gray-500">
                <span className="text-green-400 font-semibold">Live</span> on Devnet
              </span>
            </div>

            <div className="flex gap-4 text-xs text-gray-500">
              <a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
