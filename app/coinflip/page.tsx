"use client";

import { useState } from "react";
import { display, ui } from "../fonts";
import { BalanceBar, BetControls, ResultPopup } from "../components";
import { useBank } from "../bank";
import { getSfx } from "../sfx";

const PAYOUT = 1.96;

export default function CoinFlipPage() {
  const bank = useBank();
  const [bet, setBet] = useState(50);
  const [pick, setPick] = useState<"bull" | "bear">("bull");
  const [face, setFace] = useState<"bull" | "bear">("bull");
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState<{ win: boolean; amount: number; text?: string } | null>(null);

  function flip() {
    if (flipping || !bank.canBet(bet)) return;
    bank.bet(bet); getSfx().spin(); setFlipping(true); setResult(null);
    const outcome: "bull" | "bear" = Math.random() < 0.5 ? "bull" : "bear";
    let t = 0;
    const iv = setInterval(() => {
      setFace((f) => (f === "bull" ? "bear" : "bull")); getSfx().tick(); t++;
      if (t > 11) { clearInterval(iv); setFace(outcome); finish(outcome); }
    }, 85);
  }
  function finish(outcome: "bull" | "bear") {
    setFlipping(false);
    if (outcome === pick) { const w = Math.floor(bet * PAYOUT); bank.win(w); getSfx().win(); setResult({ win: true, amount: w, text: "WIN!" }); }
    else { getSfx().lose(); setResult({ win: false, amount: bet, text: "MISS" }); }
  }

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #15233a 0%, #0b1018 50%, #07060d 100%)" }}>
      <BalanceBar title="COIN FLIP" accent="#19e0ff" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pt-16 px-4">
        <div className={flipping ? "bob" : ""} style={{ width: 150, height: 150, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 78, background: face === "bull" ? "radial-gradient(circle at 35% 30%,#7dffb0,#1fae66 60%,#0d6b3c)" : "radial-gradient(circle at 35% 30%,#ff9db0,#e6356f 60%,#8a1838)", border: "5px solid #fff3b0", boxShadow: `0 0 40px ${face === "bull" ? "#39d98a88" : "#e6356f88"}` }}>
          {face === "bull" ? "🐂" : "🐻"}
        </div>

        <div className="flex gap-6">
          {(["bull", "bear"] as const).map((p) => (
            <button key={p} onClick={() => !flipping && setPick(p)} className="neon-btn px-8 py-3 text-xl" style={{ fontFamily: "var(--font-display)", background: pick === p ? (p === "bull" ? "linear-gradient(180deg,#2a8a4a,#1c6a38)" : "linear-gradient(180deg,#b5294e,#8a1838)") : "#15122a", color: p === "bull" ? "#7dffb0" : "#ff9db0", ["--bc" as string]: p === "bull" ? "#39d98a" : "#e6356f", ["--gl" as string]: pick === p ? (p === "bull" ? "#39d98a66" : "#e6356f66") : "transparent" }}>
              {p === "bull" ? "🐂 BULL" : "🐻 BEAR"}
            </button>
          ))}
        </div>

        <BetControls bet={bet} setBet={setBet} disabled={flipping} />

        <button onClick={flip} disabled={flipping || !bank.canBet(bet)} className="neon-btn px-14 py-4 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", color: "#f5c542", background: "#15122a", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54277" }}>
          {flipping ? "FLIPPING…" : "FLIP"}
        </button>
        <div className="text-xs text-white/40">win pays {PAYOUT}× your bet</div>
      </div>
      <ResultPopup result={result} onDone={() => setResult(null)} />
    </div>
  );
}
