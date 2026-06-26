"use client";

import { useState } from "react";
import { display, ui } from "../fonts";
import { BalanceBar, BetControls, ResultPopup } from "../components";
import { useBank, fmtChips } from "../bank";
import { getSfx } from "../sfx";

const SIZE = 25;
const HOUSE = 0.97;

function multAfter(k: number, mines: number): number {
  let m = 1;
  for (let i = 0; i < k; i++) m *= (SIZE - i) / (SIZE - mines - i);
  return m * HOUSE;
}

export default function MinesPage() {
  const bank = useBank();
  const [bet, setBet] = useState(50);
  const [mines, setMines] = useState(3);
  const [phase, setPhase] = useState<"bet" | "play" | "done">("bet");
  const [bombs, setBombs] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [mult, setMult] = useState(1);
  const [busted, setBusted] = useState(false);
  const [result, setResult] = useState<{ win: boolean; amount: number; text?: string } | null>(null);

  function start() {
    if (!bank.canBet(bet)) return;
    bank.bet(bet); getSfx().chip();
    const set = new Set<number>();
    while (set.size < mines) set.add((Math.random() * SIZE) | 0);
    setBombs(set); setRevealed(new Set()); setMult(1); setBusted(false); setResult(null); setPhase("play");
  }
  function reveal(i: number) {
    if (phase !== "play" || revealed.has(i)) return;
    if (bombs.has(i)) {
      setBusted(true); setPhase("done"); getSfx().bust();
      setRevealed(new Set([...revealed, i]));
      setResult({ win: false, amount: bet, text: "BOOM" });
      return;
    }
    const r = new Set([...revealed, i]); setRevealed(r);
    const k = r.size; const m = multAfter(k, mines); setMult(m); getSfx().peg();
    if (k === SIZE - mines) cashout(m); // cleared everything
  }
  function cashout(curMult = mult) {
    if (phase !== "play") return;
    const w = Math.floor(bet * curMult); bank.win(w); getSfx().win();
    setPhase("done"); setResult({ win: true, amount: w, text: `${curMult.toFixed(2)}×` });
  }

  const potential = Math.floor(bet * mult);
  const nextMult = phase === "play" ? multAfter(revealed.size + 1, mines) : multAfter(1, mines);

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #3a1024 0%, #14070f 50%, #07060d 100%)" }}>
      <BalanceBar title="MINES" accent="#e6356f" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pt-16 px-4">
        {/* mines count */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">MINES</span>
          {[1, 3, 5, 10].map((m) => (
            <button key={m} onClick={() => phase === "bet" && setMines(m)} disabled={phase !== "bet"} className="neon-btn px-3 py-1.5 text-sm disabled:opacity-50" style={{ background: mines === m ? "#3a0f1e" : "#15122a", color: "#ff9db0", ["--bc" as string]: "#e6356f", ["--gl" as string]: mines === m ? "#e6356f55" : "transparent" }}>{m}</button>
          ))}
        </div>

        {/* grid */}
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: SIZE }).map((_, i) => {
            const isRev = revealed.has(i); const isBomb = bombs.has(i);
            const show = isRev || (phase === "done");
            return (
              <button key={i} onClick={() => reveal(i)} disabled={phase !== "play" || isRev}
                className="flex items-center justify-center transition-all" style={{
                  width: 54, height: 54, borderRadius: 10, fontSize: 24,
                  background: show ? (isBomb ? "radial-gradient(circle,#ff5d7a,#8a1838)" : "linear-gradient(180deg,#1e6a42,#0f3a24)") : "linear-gradient(180deg,#241d3e,#15102a)",
                  border: isRev && !isBomb ? "2px solid #39d98a" : isBomb && show ? "2px solid #ff5d7a" : "2px solid #2a2440",
                  boxShadow: isRev && !isBomb ? "0 0 12px #39d98a55" : "none", cursor: phase === "play" && !isRev ? "pointer" : "default",
                }}>
                {show ? (isBomb ? "💣" : "💎") : ""}
              </button>
            );
          })}
        </div>

        {phase === "play" ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <span className="text-2xl gold-text" style={{ fontFamily: "var(--font-display)" }}>{mult.toFixed(2)}×</span>
              <span className="text-white/50 text-sm"> · next {nextMult.toFixed(2)}×</span>
            </div>
            <button onClick={() => cashout()} className="neon-btn px-12 py-4 text-2xl" style={{ fontFamily: "var(--font-display)", color: "#eafff2", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a77" }}>
              CASH OUT {fmtChips(potential)}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <BetControls bet={bet} setBet={setBet} />
            <button onClick={start} disabled={!bank.canBet(bet)} className="neon-btn px-14 py-4 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", color: "#ff9db0", background: "#15122a", ["--bc" as string]: "#e6356f", ["--gl" as string]: "#e6356f77" }}>
              {busted ? "TRY AGAIN" : "START"}
            </button>
          </div>
        )}
      </div>
      <ResultPopup result={result} onDone={() => setResult(null)} />
    </div>
  );
}
