"use client";

import { useEffect, useRef, useState } from "react";
import { display, ui } from "../fonts";
import { BalanceBar, BetControls, ChipRain } from "../components";
import { useBank, fmtChips } from "../bank";
import { getSfx } from "../sfx";

const ROWS = 12;
const BINS = ROWS + 1; // 13
const W = 360, H = 440, SX = 24, TOP_Y = 70, BOT_Y = 350;
const BIN_LEFT = W / 2 - (BINS * SX) / 2;

const MULTS: Record<string, number[]> = {
  low: [5, 2, 1.4, 1.1, 1, 0.9, 0.5, 0.9, 1, 1.1, 1.4, 2, 5],
  med: [12, 4, 2, 1.3, 0.9, 0.6, 0.4, 0.6, 0.9, 1.3, 2, 4, 12],
  high: [40, 9, 3, 1.4, 0.6, 0.3, 0.2, 0.3, 0.6, 1.4, 3, 9, 40],
};

interface Ball { x: number; y: number; vx: number; vy: number; bet: number; }

export default function PlinkoPage() {
  const bank = useBank();
  const [bet, setBet] = useState(50);
  const [risk, setRisk] = useState<"low" | "med" | "high">("med");
  const [last, setLast] = useState<{ mult: number; win: number } | null>(null);
  const [rain, setRain] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pegs = useRef<{ x: number; y: number }[]>([]);
  const balls = useRef<Ball[]>([]);
  const riskRef = useRef(risk); riskRef.current = risk;
  const flashBin = useRef<{ idx: number; t: number } | null>(null);

  useEffect(() => {
    const ps: { x: number; y: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      const count = r + 3;
      const startX = W / 2 - ((count - 1) * SX) / 2;
      const y = TOP_Y + (r / (ROWS - 1)) * (BOT_Y - TOP_Y);
      for (let i = 0; i < count; i++) ps.push({ x: startX + i * SX, y });
    }
    pegs.current = ps;

    const ctx = canvasRef.current!.getContext("2d")!;
    let raf = 0; let last = performance.now();
    const loop = () => {
      const now = performance.now(); let dt = (now - last) / 1000; last = now; if (dt > 0.04) dt = 0.04;
      // physics
      const arr = balls.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const b = arr[i];
        b.vy += 900 * dt;
        b.x += b.vx * dt; b.y += b.vy * dt;
        for (const p of pegs.current) {
          if (Math.abs(p.y - b.y) > 18) continue;
          const dx = b.x - p.x, dy = b.y - p.y; const d = Math.hypot(dx, dy); const min = 8;
          if (d < min && d > 0.01) {
            const nx = dx / d, ny = dy / d;
            b.x = p.x + nx * min; b.y = p.y + ny * min;
            const vn = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * vn * nx) * 0.5 + (Math.random() - 0.5) * 40;
            b.vy = (b.vy - 2 * vn * ny) * 0.5;
            getSfx().peg();
          }
        }
        if (b.x < 6) { b.x = 6; b.vx = Math.abs(b.vx) * 0.5; }
        if (b.x > W - 6) { b.x = W - 6; b.vx = -Math.abs(b.vx) * 0.5; }
        if (b.y > BOT_Y + 18) {
          const idx = Math.max(0, Math.min(BINS - 1, Math.floor((b.x - BIN_LEFT) / SX)));
          const mult = MULTS[riskRef.current][idx];
          const win = Math.floor(b.bet * mult); bank.win(win);
          setLast({ mult, win });
          flashBin.current = { idx, t: 0.6 };
          if (mult >= 2) { setRain(true); setTimeout(() => setRain(false), 1500); getSfx().bigwin(); }
          else if (mult >= 1) getSfx().win(); else getSfx().lose();
          arr.splice(i, 1);
        }
      }
      if (flashBin.current) { flashBin.current.t -= dt; if (flashBin.current.t <= 0) flashBin.current = null; }

      // draw
      ctx.clearRect(0, 0, W, H);
      for (const p of pegs.current) { ctx.fillStyle = "#6a6488"; ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, 6.28); ctx.fill(); }
      const mult = MULTS[riskRef.current];
      for (let i = 0; i < BINS; i++) {
        const x = BIN_LEFT + i * SX, m = mult[i];
        const hot = m >= 4, mid = m >= 1;
        const col = hot ? "#f5c542" : mid ? "#39d98a" : "#5a5570";
        const fy = flashBin.current && flashBin.current.idx === i ? 1 : 0;
        ctx.fillStyle = fy ? "#fff3b0" : col + "33";
        ctx.fillRect(x + 1, 368, SX - 2, 30);
        ctx.fillStyle = fy ? "#1a1230" : col; ctx.font = "bold 9px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(m + "x", x + SX / 2, 383);
      }
      ctx.fillStyle = "#f5c542";
      for (const b of balls.current) { ctx.beginPath(); ctx.arc(b.x, b.y, 5, 0, 6.28); ctx.fill(); ctx.strokeStyle = "#fff3b0"; ctx.lineWidth = 1; ctx.stroke(); }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drop() {
    if (!bank.canBet(bet)) return;
    bank.bet(bet); getSfx().chip();
    balls.current.push({ x: W / 2 + (Math.random() - 0.5) * 8, y: 24, vx: (Math.random() - 0.5) * 30, vy: 0, bet });
  }

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #3a2e08 0%, #14110a 50%, #07060d 100%)" }}>
      <BalanceBar title="PLINKO" accent="#f5c542" />
      {rain && <ChipRain />}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pt-14 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/50">RISK</span>
          {(["low", "med", "high"] as const).map((r) => (
            <button key={r} onClick={() => setRisk(r)} className="neon-btn px-3 py-1.5 text-sm uppercase" style={{ background: risk === r ? "#3a2e08" : "#15122a", color: "#f5c542", ["--bc" as string]: "#f5c542", ["--gl" as string]: risk === r ? "#f5c54255" : "transparent" }}>{r}</button>
          ))}
        </div>

        <canvas ref={canvasRef} width={W} height={H} style={{ width: "min(360px, 90vw)", imageRendering: "auto", background: "linear-gradient(180deg,#120f24,#0c0a1a)", borderRadius: 14, border: "2px solid #2a2440" }} />

        {last && <div className="text-lg" style={{ fontFamily: "var(--font-display)", color: last.mult >= 1 ? "#39d98a" : "#9aa0ac" }}>{last.mult}× · {last.win >= 0 ? "+" : ""}{fmtChips(last.win)}</div>}

        <BetControls bet={bet} setBet={setBet} />
        <button onClick={drop} disabled={!bank.canBet(bet)} className="neon-btn px-14 py-3 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", color: "#f5c542", background: "#15122a", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54277" }}>DROP</button>
      </div>
    </div>
  );
}
