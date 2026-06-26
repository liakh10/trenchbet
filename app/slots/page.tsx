"use client";

import { useRef, useState } from "react";
import { display, ui } from "../fonts";
import { BalanceBar, BetControls, ResultPopup } from "../components";
import { useBank } from "../bank";
import { getSfx } from "../sfx";

const SYMS = ["🍒", "🐸", "🐕", "🚀", "💎", "7️⃣", "💀"];
const WEIGHTS: Record<string, number> = { "🍒": 24, "🐸": 20, "🐕": 16, "🚀": 12, "💎": 7, "7️⃣": 4, "💀": 17 };
const THREE: Record<string, number> = { "7️⃣": 50, "💎": 20, "🚀": 12, "🐕": 8, "🐸": 6, "🍒": 4, "💀": 2 };
const PAIR = 1.5;

const POOL: string[] = [];
for (const s of SYMS) for (let i = 0; i < WEIGHTS[s]; i++) POOL.push(s);
const pick = () => POOL[(Math.random() * POOL.length) | 0];

export default function SlotsPage() {
  const bank = useBank();
  const [bet, setBet] = useState(50);
  const [reels, setReels] = useState(["🍒", "💎", "🚀"]);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ win: boolean; amount: number; text?: string } | null>(null);
  const ivs = useRef<number[]>([]);

  function spin() {
    if (spinning || !bank.canBet(bet)) return;
    bank.bet(bet); getSfx().spin(); setSpinning(true); setResult(null);
    const final = [pick(), pick(), pick()];
    [0, 1, 2].forEach((r) => { ivs.current[r] = window.setInterval(() => { setReels((p) => { const c = [...p]; c[r] = SYMS[(Math.random() * SYMS.length) | 0]; return c; }); }, 70); });
    const stop = (r: number, delay: number) => setTimeout(() => { clearInterval(ivs.current[r]); getSfx().tick(); setReels((p) => { const c = [...p]; c[r] = final[r]; return c; }); if (r === 2) evaluate(final); }, delay);
    stop(0, 700); stop(1, 1000); stop(2, 1300);
  }
  function evaluate(f: string[]) {
    setSpinning(false);
    if (f[0] === f[1] && f[1] === f[2]) { const w = Math.floor(bet * THREE[f[0]]); bank.win(w); getSfx().bigwin(); setResult({ win: true, amount: w, text: `${THREE[f[0]]}×` }); }
    else if (f[0] === f[1] || f[1] === f[2] || f[0] === f[2]) { const w = Math.floor(bet * PAIR); bank.win(w); getSfx().win(); setResult({ win: true, amount: w, text: "PAIR" }); }
    else { getSfx().lose(); setResult({ win: false, amount: bet, text: "NO LUCK" }); }
  }

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #2a1040 0%, #120a22 50%, #07060d 100%)" }}>
      <BalanceBar title="SLOTS" accent="#a06bff" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pt-16 px-4">
        <div className="felt-card flex gap-3 p-4" style={{ border: "3px solid #a06bff", boxShadow: "0 0 40px #a06bff44" }}>
          {reels.map((s, i) => (
            <div key={i} className="flex items-center justify-center" style={{ width: 92, height: 110, borderRadius: 12, background: "linear-gradient(180deg,#0d0b1c,#1a1730)", border: "2px solid #2a2440", fontSize: 56 }}>
              {s}
            </div>
          ))}
        </div>

        <BetControls bet={bet} setBet={setBet} disabled={spinning} />

        <button onClick={spin} disabled={spinning || !bank.canBet(bet)} className="neon-btn px-16 py-4 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", color: "#cbb6ff", background: "#15122a", ["--bc" as string]: "#a06bff", ["--gl" as string]: "#a06bff77" }}>
          {spinning ? "SPINNING…" : "SPIN"}
        </button>

        <div className="felt-card px-4 py-2 text-[11px] text-white/55 flex gap-3 flex-wrap justify-center">
          <span>7️⃣7️⃣7️⃣ 50×</span><span>💎 20×</span><span>🚀 12×</span><span>🐕 8×</span><span>🐸 6×</span><span>🍒 4×</span><span>pair 1.5×</span>
        </div>
      </div>
      <ResultPopup result={result} onDone={() => setResult(null)} />
    </div>
  );
}
