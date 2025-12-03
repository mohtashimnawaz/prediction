import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Navbar from '@/components/Navbar';
import dynamic from 'next/dynamic';

const inter = Inter({ subsets: ['latin'] });

// Dynamically import Navbar to prevent hydration issues
const DynamicNavbar = dynamic(() => import('@/components/Navbar'), {
  ssr: false,
  loading: () => (
    <nav className="glass-strong border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-xl font-bold gradient-text">🎮 Prediction Arena</div>
        </div>
      </div>
    </nav>
  ),
});

export const metadata: Metadata = {
  title: 'On-Chain Social Prediction Arena',
  description: 'Battle with NFT prediction cards on Solana',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletContextProvider>
          <DynamicNavbar />
          <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
