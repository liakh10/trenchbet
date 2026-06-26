import { Bungee, Sora } from "next/font/google";

// TrenchBet identity — Vegas marquee display + clean modern UI. Distinct from prior games.
export const display = Bungee({ subsets: ["latin"], weight: "400", variable: "--font-display" });
export const ui = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-ui" });
