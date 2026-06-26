"use client";

import { useEffect, useRef, useState } from "react";
import { display, ui } from "../fonts";
import { BalanceBar, BetControls, ChipRain } from "../components";
import { useBank, fmtChips } from "../bank";
import { getSfx } from "../sfx";

const W = 360, H = 240;

function genCrash(): number {
  const r = Math.random();
  if (r < 0.02) return 1.0; // instant rug
  return Math.max(1.01, Math.floor((0.99 / (1 - r)) * 100) / 100);
}

export default function CrashPage() {
  const bank = useBank();
  const [bet, setBet] = useState(50);
  const [phase, setPhase] = useState<"idle" | "run" | "crash" | "cashed">("idle");
  const [mult, setMult] = useState(1);
  const [history, setHistory] = useState<number[]>([]);
  const [rain, setRain] = useState(false);
  const [banner, setBanner] = useState<{ win: boolean; text: string } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase); phaseRef.current = phase;
  const crashAt = useRef(2); const start = useRef(0); const betRef = useRef(0);
  const pts = useRef<{ t: number; m: number }[]>([]);
  const lastTick = useRef(0);

  function place() {
    if (phase === "run" || !bank.canBet(bet)) return;
    bank.bet(bet); betRef.current = bet; getSfx().chip();
    crashAt.current = genCrash(); start.current = performance.now(); pts.current = [];
    setBanner(null); setMult(1); setPhase("run");
  }
  function cashout() {
    if (phaseRef.current !== "run") return;
    const win = Math.floor(betRef.current * mult); bank.win(win); getSfx().bigwin();
    setRain(true); setTimeout(() => setRain(false), 1500);
    setBanner({ win: true, text: `CASHED ${mult.toFixed(2)}× · +${fmtChips(win)}` });
    setPhase("cashed"); setHistory((h) => [mult, ...h].slice(0, 8));
    setTimeout(() => setPhase("idle"), 1600);
  }

  useEffect(() => {
    const ctx = canvasRef.current!.getContext("2d")!;
    let raf = 0;
    const loop = () => {
      if (phaseRef.current === "run") {
        const t = (performance.now() - start.current) / 1000;
        const m = Math.exp(0.45 * t);
        if (Math.floor(t * 10) !== lastTick.current) { lastTick.current = Math.floor(t * 10); getSfx().tick(); }
        if (m >= crashAt.current) {
          setMult(crashAt.current); setPhase("crash"); getSfx().bust();
          setBanner({ win: false, text: `CRASHED @ ${crashAt.current.toFixed(2)}× · -${fmtChips(betRef.current)}` });
          setHistory((h) => [crashAt.current, ...h].slice(0, 8));
          setTimeout(() => setPhase("idle"), 1700);
        } else { setMult(m); pts.current.push({ t, m }); }
      }
      // draw
      const p = phaseRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.strokeStyle = "#221c38"; ctx.lineWidth = 1;
      for (let gy = 0; gy <= 4; gy++) { const y = (gy / 4) * H; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      const arr = pts.current;
      if (arr.length > 1) {
        const maxM = Math.max(2, mult * 1.1); const maxT = Math.max(1, arr[arr.length - 1].t);
        const col = p === "crash" ? "#e6356f" : "#39d98a";
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath();
        arr.forEach((pt, i) => { const x = (pt.t / maxT) * (W - 10) + 5; const y = H - 8 - ((pt.m - 1) / (maxM - 1)) * (H - 24); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
        ctx.stroke();
        const lp = arr[arr.length - 1]; const lx = (lp.t / maxT) * (W - 10) + 5; const ly = H - 8 - ((lp.m - 1) / (maxM - 1)) * (H - 24);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, ly, 5, 0, 6.28); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mult]);

  const multColor = phase === "crash" ? "#e6356f" : phase === "cashed" ? "#f5c542" : "#39d98a";

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #0a2a1e 0%, #08140f 50%, #07060d 100%)" }}>
      <BalanceBar title="CRASH" accent="#39d98a" />
      {rain && <ChipRain />}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pt-14 px-4">
        {/* history */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-md">
          {history.map((h, i) => <span key={i} className="px-2 py-0.5 rounded text-[11px]" style={{ background: h >= 2 ? "#143a28" : "#3a1420", color: h >= 2 ? "#5dffa0" : "#ff8aa0", fontWeight: 700 }}>{h.toFixed(2)}×</span>)}
        </div>

        <div className="relative">
          <canvas ref={canvasRef} width={W} height={H} style={{ width: "min(360px,90vw)", background: "linear-gradient(180deg,#0c1a14,#0a120e)", borderRadius: 14, border: "2px solid #2a2440" }} />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span style={{ fontFamily: "var(--font-display)", fontSize: 46, color: multColor, textShadow: `0 0 24px ${multColor}88` }}>{mult.toFixed(2)}×</span>
          </div>
        </div>

        {banner && <div className="text-lg" style={{ fontFamily: "var(--font-display)", color: banner.win ? "#39d98a" : "#e6356f" }}>{banner.text}</div>}

        <BetControls bet={bet} setBet={setBet} disabled={phase === "run"} />
        {phase === "run"
          ? <button onClick={cashout} className="neon-btn px-16 py-4 text-2xl" style={{ fontFamily: "var(--font-display)", color: "#eafff2", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a88" }}>CASH OUT {fmtChips(Math.floor(betRef.current * mult))}</button>
          : <button onClick={place} disabled={!bank.canBet(bet)} className="neon-btn px-16 py-4 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", color: "#7dffb0", background: "#15122a", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a66" }}>PLACE BET</button>}
      </div>
    </div>
  );
}
