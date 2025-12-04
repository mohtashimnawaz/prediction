import type { Metadata } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import '../styles/globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Dynamically import Navbar to prevent hydration issues
const DynamicNavbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-purple-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">PA</span>
            </div>
            <div className="text-2xl font-black gradient-text-animated">Loading...</div>
          </div>
        </div>
      </div>
    </nav>
  ),
});

export const metadata: Metadata = {
  title: 'Prediction Arena - NFT Prediction Markets on Solana',
  description: 'The first gamified prediction market on Solana featuring dynamic NFT cards, multi-oracle support, and on-chain PvP battles.',
  keywords: ['Solana', 'Prediction Market', 'NFT', 'Web3', 'Blockchain', 'DeFi', 'Oracle', 'Pyth', 'Cards', 'Gaming'],
  openGraph: {
    title: 'Prediction Arena - NFT Prediction Markets',
    description: 'Predict. Battle. Dominate. The future of decentralized prediction markets.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <WalletContextProvider>
          <DynamicNavbar />
          <main className="min-h-screen pt-20 bg-gradient-to-b from-black via-purple-950/5 to-black">
            {children}
          </main>
          <Footer />
          
          {/* Signature Watermark */}
          <a
            href="https://portfolio-main-sooty-mu.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="tubelight-signature"
          >
            by nwz
          </a>
        </WalletContextProvider>
      </body>
    </html>
  );
}
