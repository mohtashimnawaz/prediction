import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

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
          <Navbar />
          <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
            {children}
          </main>
        </WalletContextProvider>
      </body>
    </html>
  );
}
