import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="glass-dark border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎮</span>
              <span className="text-lg font-bold gradient-text">Prediction Arena</span>
            </div>
            <p className="text-sm text-gray-400">
              The first gamified prediction market on Solana with NFT cards and on-chain battles.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">Markets</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/markets" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Browse Markets
                </Link>
              </li>
              <li>
                <Link href="/create" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Create Market
                </Link>
              </li>
              <li>
                <Link href="/my-bets" className="text-gray-400 hover:text-purple-400 transition-colors">
                  My Bets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">NFT Cards</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cards" className="text-gray-400 hover:text-purple-400 transition-colors">
                  My Cards
                </Link>
              </li>
              <li>
                <Link href="/battle" className="text-gray-400 hover:text-purple-400 transition-colors">
                  Battle Arena
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4 text-white">Network</h3>
            <div className="flex items-center gap-2 text-sm mb-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-gray-400">Solana Devnet</span>
            </div>
            <p className="text-xs text-gray-500">
              Currently deployed on Devnet for testing. Use devnet SOL for transactions.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} Prediction Arena. Built on Solana with ❤️
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://solana.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Powered by Solana
            </a>
            <a
              href="https://www.anchor-lang.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-purple-400 transition-colors"
            >
              Built with Anchor
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
