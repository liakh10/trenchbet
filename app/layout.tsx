import type { Metadata } from "next";
import "./globals.css";
import { SolanaProviders } from "./providers";

export const metadata: Metadata = {
  title: "TrenchBet Club",
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
