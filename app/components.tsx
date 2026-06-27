"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useBank, fmtChips } from "./bank";
import { TICKER } from "./config";

export function Chip({ size = 28 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ffe79a, #f5c542 55%, #b9851f)", border: "2px solid #fff3b0", boxShadow: "0 0 8px #f5c54288", color: "#7a5400", fontWeight: 900, fontSize: size * 0.5 }}>$</span>
  );
}

export function BalanceBar({ title, accent = "#f5c542" }: { title: string; accent?: string }) {
  const bank = useBank();
  const router = useRouter();
  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3" style={{ background: "linear-gradient(180deg,rgba(7,6,13,0.95),rgba(7,6,13,0))" }}>
      <button onClick={() => router.push("/")} className="neon-btn px-4 py-2 text-sm" style={{ ["--bc" as string]: "#5a5570", ["--gl" as string]: "#5a557055", background: "#15122a", color: "#cfc8ea" }}>◀ LOBBY</button>
      <div className="text-xl md:text-2xl gold-text" style={{ fontFamily: "var(--font-display)", color: accent }}>{title}</div>
      <div className="felt-card flex items-center gap-2 px-4 py-2">
        <Chip size={22} />
        <span style={{ fontFamily: "var(--font-display)", color: "#f5c542", fontSize: 16 }}>{fmtChips(bank.balance)}</span>
      </div>
    </div>
  );
}

export function BetControls({ bet, setBet, disabled }: { bet: number; setBet: (n: number) => void; disabled?: boolean }) {
  const bank = useBank();
  const clamp = (n: number) => Math.max(bank.minBet(), Math.min(bank.maxBet(), Math.round(n)));
  return (
    <div className="felt-card p-3 flex items-center gap-2 flex-wrap justify-center" style={{ opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <span className="text-xs text-white/50 w-full text-center sm:w-auto">BET</span>
      <button onClick={() => setBet(clamp(bet / 2))} className="neon-btn px-3 py-2 text-sm" style={{ ["--bc" as string]: "#5a5570", ["--gl" as string]: "#5a557044", background: "#1a1730", color: "#cfc8ea" }}>½</button>
      <input type="number" value={bet} onChange={(e) => setBet(clamp(Number(e.target.value) || bank.minBet()))}
        className="w-28 text-center py-2 rounded-lg" style={{ background: "#0d0b1c", border: "2px solid #2a2440", color: "#f5c542", fontFamily: "var(--font-display)" }} />
      <button onClick={() => setBet(clamp(bet * 2))} className="neon-btn px-3 py-2 text-sm" style={{ ["--bc" as string]: "#5a5570", ["--gl" as string]: "#5a557044", background: "#1a1730", color: "#cfc8ea" }}>2×</button>
      <button onClick={() => setBet(bank.maxBet())} className="neon-btn px-3 py-2 text-sm" style={{ ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54244", background: "#1a1730", color: "#f5c542" }}>MAX</button>
    </div>
  );
}

export function ResultPopup({ result, onDone }: { result: { win: boolean; amount: number; text?: string } | null; onDone: () => void }) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onDone, result.win ? 1800 : 1100);
    return () => clearTimeout(t);
  }, [result, onDone]);
  if (!result) return null;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" onClick={onDone}>
      {result.win && <div className="absolute inset-0 gold-flash" style={{ background: "radial-gradient(circle at 50% 45%, #fff3b0, rgba(245,197,66,0.33) 45%, transparent 75%)" }} />}
      {result.win && <ChipRain />}
      <div className={`text-center ${result.win ? "win-pulse" : "shake"}`}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 64, color: result.win ? "#39d98a" : "#e6356f", textShadow: result.win ? "0 0 30px #39d98a, 0 0 64px rgba(57,217,138,0.5)" : "0 0 26px rgba(230,53,111,0.6)" }}>
          {result.text || (result.win ? "WIN!" : "BUST")}
        </div>
        {result.amount > 0 && (
          <div className="mt-2 text-3xl" style={{ fontFamily: "var(--font-display)", color: result.win ? "#f5c542" : "#9aa0ac", textShadow: result.win ? "0 0 18px rgba(245,197,66,0.6)" : "none" }}>
            {result.win ? "+" : "-"}{fmtChips(result.amount)} {TICKER.replace("$", "")}
          </div>
        )}
      </div>
    </div>
  );
}

export function ChipRain() {
  const [chips] = useState(() => Array.from({ length: 26 }, (_, i) => ({ x: Math.random() * 100, d: 1 + Math.random() * 1.2, delay: Math.random() * 0.5, s: 14 + Math.random() * 14, id: i })));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {chips.map((c) => (
        <div key={c.id} className="chip-fall absolute" style={{ left: `${c.x}%`, top: -30, animationDuration: `${c.d}s`, animationDelay: `${c.delay}s` }}>
          <Chip size={c.s} />
        </div>
      ))}
    </div>
  );
}

export function XIcon({ size = 16 }: { size?: number }) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>);
}
