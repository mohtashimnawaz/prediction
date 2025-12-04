import { Program, AnchorProvider, web3, BN } from "@coral-xyz/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import type { Prediction } from "../../target/types/prediction";
import IDL from "../../target/idl/prediction.json";

export const PROGRAM_ID = new web3.PublicKey("ocKzKFLEt9dWXtPmD1xQSvGgA7ugaFFkGv4oXnWNa2N");

export function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;

    const provider = new AnchorProvider(connection, wallet, {
      commitment: "confirmed",
    });

    return new Program(IDL as Prediction, provider);
  }, [connection, wallet]);
}

export function getPlatformPDA() {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    PROGRAM_ID
  );
}

export function getMarketPDA(authority: web3.PublicKey, question: string) {
  const questionSeed = question.slice(0, Math.min(question.length, 32));
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("market"), authority.toBuffer(), Buffer.from(questionSeed)],
    PROGRAM_ID
  );
}

export function getVaultPDA(market: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), market.toBuffer()],
    PROGRAM_ID
  );
}

export function getBetPDA(market: web3.PublicKey, bettor: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("bet"), market.toBuffer(), bettor.toBuffer()],
    PROGRAM_ID
  );
}

export function getCardPDA(mint: web3.PublicKey) {
  return web3.PublicKey.findProgramAddressSync(
    [Buffer.from("card"), mint.toBuffer()],
    PROGRAM_ID
  );
}

export { BN };
