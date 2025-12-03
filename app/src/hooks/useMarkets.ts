import { useEffect, useState } from "react";
import { useProgram } from "@/lib/anchor";
import { web3 } from "@coral-xyz/anchor";

export interface Market {
  publicKey: web3.PublicKey;
  authority: web3.PublicKey;
  creator: web3.PublicKey;
  question: string;
  description: string;
  endTime: Date;
  createdAt: Date;
  resolved: boolean;
  outcome: boolean | null;
  totalYesAmount: number;
  totalNoAmount: number;
  category: string;
}

export function useMarkets() {
  const program = useProgram();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!program) return;

    async function fetchMarkets() {
      try {
        const accounts = await program.account.market.all();
        const formattedMarkets = accounts.map((acc) => ({
          publicKey: acc.publicKey,
          authority: acc.account.authority,
          creator: acc.account.creator,
          question: acc.account.question,
          description: acc.account.description,
          endTime: new Date(acc.account.endTime.toNumber() * 1000),
          createdAt: new Date(acc.account.createdAt.toNumber() * 1000),
          resolved: acc.account.resolved,
          outcome: acc.account.outcome,
          totalYesAmount: acc.account.totalYesAmount.toNumber(),
          totalNoAmount: acc.account.totalNoAmount.toNumber(),
          category: Object.keys(acc.account.category)[0],
        }));
        setMarkets(formattedMarkets);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchMarkets, 10000);
    return () => clearInterval(interval);
  }, [program]);

  return { markets, loading };
}
