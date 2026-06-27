import type { Metadata } from "next";
import "./globals.css";
import { SolanaProviders } from "./providers";
import { TICKER } from "./config";

export const metadata: Metadata = {
  title: TICKER,
  description: "Degen casino arcade on Solana. Play chips for fun: Plinko, Crash, Mines, Slots and Coin Flip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SolanaProviders>{children}</SolanaProviders>
      </body>
    </html>
  );
}
