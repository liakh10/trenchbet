"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { display, ui } from "../fonts";
import { useBank, fmtChips } from "../bank";
import { CasinoAmbience } from "../ambience";
import { TICKER } from "../config";
import { getSfx } from "../sfx";
import { MEMES, MemeAvatar, memeByName, randomMemes } from "../memes";
import { PokerGame, Card as PCard, SUIT_CH, rankCh, handName } from "./engine";

const BUYINS = [500, 1000, 2500];

export default function PokerPage() {
  const router = useRouter();
  const bank = useBank();
  const [phase, setPhase] = useState<"select" | "table">("select");
  const [, bump] = useReducer((x) => x + 1, 0);
  const [version, setVersion] = useState(0);
  const tick = () => { setVersion((v) => v + 1); bump(); };

  const [buyIn, setBuyIn] = useState(1000);
  const [picked, setPicked] = useState<string[]>([]);
  const gameRef = useRef<PokerGame | null>(null);

  function togglePick(n: string) { setPicked((p) => p.includes(n) ? p.filter((x) => x !== n) : p.length >= 3 ? p : [...p, n]); }
  function sit() {
    const oppMemes = picked.length ? picked.map((id) => MEMES.find((m) => m.id === id)!) : randomMemes(3);
    const opps = oppMemes.map((m) => m.name);
    const bi = Math.min(buyIn, bank.balance);
    if (!bank.bet(bi)) return;
    const playerName = (() => { try { const s = sessionStorage.getItem("trenchbet_player"); if (s) { const j = JSON.parse(s); if (j.mode === "wallet" && j.address) return `${j.address.slice(0, 4)}…`; } } catch { /* */ } return "YOU"; })();
    const g = new PokerGame(playerName, opps, bi);
    gameRef.current = g; g.startHand(); getSfx().chip();
    setPhase("table"); tick();
  }

  // bot auto-play
  useEffect(() => {
    const g = gameRef.current; if (!g || phase !== "table") return;
    if (g.stage === "handover") return;
    if (g.isHumanTurn()) return;
    const t = setTimeout(() => { g.botAction(); getSfx().tick(); tick(); }, 750 + Math.random() * 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, phase]);

  function doAct(kind: "fold" | "check" | "call" | "raise", amt?: number) {
    const g = gameRef.current; if (!g) return;
    if (kind === "fold") getSfx().lose(); else if (kind === "raise") getSfx().chip(); else getSfx().click();
    g.act(kind, amt); tick();
  }
  function nextHand() {
    const g = gameRef.current; if (!g) return;
    for (const p of g.players) if (!p.isYou && p.stack <= 0) p.stack = buyIn; // auto-rebuy bots
    if (g.players[0].stack <= 0) return;
    g.startHand(); getSfx().chip(); tick();
  }
  function rebuy() { const g = gameRef.current; if (!g) return; const bi = Math.min(buyIn, bank.balance); if (bi <= 0 || !bank.bet(bi)) return; g.players[0].stack += bi; tick(); }
  function leave() { const g = gameRef.current; if (g) bank.win(g.cashout()); router.push("/"); }

  // ── SELECT ──
  if (phase === "select") {
    return (
      <div className={`fixed inset-0 overflow-y-auto ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #143a28 0%, #0a1810 45%, #07060d 100%)" }}>
        <CasinoAmbience glow="#f5c542" />
        <div className="min-h-screen flex flex-col items-center px-4 py-8 cine-in">
          <button onClick={() => router.push("/")} className="neon-btn self-start px-4 py-2 text-sm" style={{ background: "#15122a", color: "#cfc8ea", ["--bc" as string]: "#5a5570", ["--gl" as string]: "#5a557044" }}>◀ LOBBY</button>
          <div className="text-5xl md:text-7xl gold-text neon-glow mt-4 text-center" style={{ fontFamily: "var(--font-display)" }}>POKER TABLE</div>
          <div className="text-lg text-white/70 mt-3 text-center max-w-xl">Texas Hold&apos;em against the trenchers. Pick up to 3 opponents (or leave empty for a random table), choose your buy-in, and sit down.</div>

          <div className="text-sm tracking-[0.3em] text-white/40 mt-10">BUY-IN</div>
          <div className="flex gap-5 mt-3">
            {BUYINS.map((b) => (
              <button key={b} onClick={() => setBuyIn(b)} disabled={b > bank.balance} className="neon-btn px-7 py-3 text-xl disabled:opacity-30" style={{ fontFamily: "var(--font-display)", background: buyIn === b ? "linear-gradient(180deg,#f7d24d,#e0a51f)" : "#15122a", color: buyIn === b ? "#2a1d00" : "#f5c542", ["--bc" as string]: "#f5c542", ["--gl" as string]: buyIn === b ? "#f5c54266" : "transparent" }}>{fmtChips(b)}</button>
            ))}
          </div>

          <div className="text-sm tracking-[0.3em] text-white/40 mt-10">PICK TRENCHERS ({picked.length}/3)</div>
          <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {MEMES.map((m) => {
              const on = picked.includes(m.id);
              return (
                <button key={m.id} onClick={() => togglePick(m.id)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all" style={{ background: on ? "rgba(245,197,66,0.16)" : "rgba(255,255,255,0.04)", border: on ? "2px solid #f5c542" : "2px solid #2a2440" }}>
                  <MemeAvatar id={m.id} size={40} ring={on ? "#f5c542" : undefined} />
                  <span style={{ color: on ? "#f5c542" : "#cfc8ea", fontWeight: 600, fontSize: 14 }}>{m.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-5 mt-12 mb-10">
            <button onClick={() => setPicked(randomMemes(3).map((m) => m.id))} className="neon-btn px-8 py-4 text-xl" style={{ fontFamily: "var(--font-display)", background: "#15122a", color: "#cbb6ff", ["--bc" as string]: "#a06bff", ["--gl" as string]: "#a06bff55" }}>RANDOM</button>
            <button onClick={sit} disabled={bank.balance < 10} className="neon-btn px-12 py-4 text-2xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", color: "#eafff2", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a77" }}>SIT DOWN</button>
          </div>
        </div>
      </div>
    );
  }

  // ── TABLE ──
  const g = gameRef.current!;
  const me = g.players[0];
  const opps = g.players.slice(1);
  const legal = g.isHumanTurn() ? g.legal() : null;
  const handOver = g.stage === "handover";
  const seatPos = oppPositions(opps.length);

  return (
    <div className={`fixed inset-0 ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "#07060d" }}>
      <CasinoAmbience glow="#f5c542" />
      {/* top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3">
        <button onClick={leave} className="neon-btn px-4 py-2 text-sm" style={{ background: "#15122a", color: "#cfc8ea", ["--bc" as string]: "#5a5570", ["--gl" as string]: "#5a557044" }}>◀ LEAVE & CASH OUT</button>
        <div className="text-2xl gold-text" style={{ fontFamily: "var(--font-display)" }}>POKER</div>
        <div className="felt-card px-4 py-2 text-sm" style={{ color: "#f5c542", fontFamily: "var(--font-display)" }}>BANK {fmtChips(bank.balance)}</div>
      </div>

      {/* players panel — trenchers at the table + what they've farmed */}
      <PlayersPanel opps={opps} />

      {/* felt table */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative" style={{ width: "min(94vw, 860px)", height: "min(70vh, 540px)", borderRadius: "50%", background: "radial-gradient(ellipse at 50% 45%, #1f7a4e, #124a30 70%, #0c3320)", border: "14px solid #3a2a18", boxShadow: "0 0 60px rgba(0,0,0,0.6), inset 0 0 60px rgba(0,0,0,0.4)" }}>
          {/* community + pot */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
            <div className="text-sm text-white/70" style={{ fontFamily: "var(--font-display)" }}>POT {fmtChips(g.pot)}</div>
            <div className="flex gap-1.5">{Array.from({ length: 5 }).map((_, i) => g.community[i] ? <Card key={i} c={g.community[i]} /> : <CardBack key={i} faded />)}</div>
            <div className="text-xs text-[#ffe79a] h-4">{g.message}</div>
          </div>

          {/* opponents */}
          {opps.map((p, i) => (
            <Seat key={i} p={p} memeId={memeByName.get(p.name)?.id} pos={seatPos[i]} dealer={g.dealer === g.players.indexOf(p)} toAct={g.current === g.players.indexOf(p) && !handOver} reveal={g.showCards} winner={g.winners.includes(g.players.indexOf(p))} community={g.community} />
          ))}

          {/* you */}
          <div className="absolute left-1/2 bottom-[-10px] -translate-x-1/2 flex flex-col items-center">
            <div className="flex gap-1.5">{me.folded ? [<CardBack key="a" />, <CardBack key="b" />] : me.hole.map((c, i) => <Card key={i} c={c} big />)}</div>
            <div className="felt-card px-4 py-1.5 mt-1 flex items-center gap-2" style={{ border: g.current === 0 && !handOver ? "2px solid #f5c542" : "2px solid #2a2440" }}>
              <span style={{ fontFamily: "var(--font-display)", color: g.current === 0 && !handOver ? "#f5c542" : "#fff", fontSize: 13 }}>{me.name}</span>
              <span className="text-[#39d98a] text-sm">{fmtChips(me.stack)}</span>
              {me.bet > 0 && <span className="text-[11px] text-[#ffe79a]">bet {me.bet}</span>}
              {g.winners.includes(0) && !me.folded && <span className="text-[11px] text-[#f5c542]">{handName([...me.hole, ...g.community])}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      <div className="absolute bottom-4 left-0 right-0 z-30 flex flex-col items-center gap-3 px-4">
        {handOver ? (
          <div className="flex flex-col items-center gap-3">
            <div className="text-xl gold-text" style={{ fontFamily: "var(--font-display)" }}>{g.message}</div>
            {me.stack > 0
              ? <button onClick={nextHand} className="neon-btn px-12 py-3 text-2xl" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", color: "#eafff2", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a66" }}>NEXT HAND</button>
              : <div className="flex gap-4">
                  <button onClick={rebuy} disabled={bank.balance < 10} className="neon-btn px-8 py-3 text-xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", background: "#15122a", color: "#f5c542", ["--bc" as string]: "#f5c542" }}>REBUY {fmtChips(Math.min(buyIn, bank.balance))}</button>
                  <button onClick={leave} className="neon-btn px-8 py-3 text-xl" style={{ fontFamily: "var(--font-display)", background: "#15122a", color: "#e6356f", ["--bc" as string]: "#e6356f" }}>LEAVE</button>
                </div>}
          </div>
        ) : legal ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => doAct("fold")} className="neon-btn px-7 py-3 text-lg" style={{ fontFamily: "var(--font-display)", background: "#2a0f18", color: "#ff8aa0", ["--bc" as string]: "#e6356f", ["--gl" as string]: "#e6356f44" }}>FOLD</button>
            <button onClick={() => doAct(legal.canCheck ? "check" : "call")} className="neon-btn px-7 py-3 text-lg" style={{ fontFamily: "var(--font-display)", background: "#0f2a1a", color: "#7dffb0", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a44" }}>
              {legal.canCheck ? "CHECK" : `CALL ${fmtChips(legal.callAmount)}`}
            </button>
            {legal.canRaise && <RaiseMenu legal={legal} pot={g.pot} currentBet={g.currentBet} onRaise={(amt) => doAct("raise", amt)} />}
          </div>
        ) : (
          <div className="text-sm text-white/40" style={{ fontFamily: "var(--font-display)" }}>trenchers thinking…</div>
        )}
      </div>
    </div>
  );
}

function RaiseMenu({ legal, pot, currentBet, onRaise }: { legal: { minRaiseTo: number; maxRaiseTo: number }; pot: number; currentBet: number; onRaise: (n: number) => void }) {
  const clamp = (n: number) => Math.max(legal.minRaiseTo, Math.min(legal.maxRaiseTo, Math.round(n)));
  const opts: [string, number][] = [["MIN", legal.minRaiseTo], ["½ POT", clamp(currentBet + pot * 0.5)], ["POT", clamp(currentBet + pot)], ["ALL IN", legal.maxRaiseTo]];
  const uniq = opts.filter((o, i) => opts.findIndex((x) => x[1] === o[1]) === i);
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {uniq.map(([label, amt]) => (
        <button key={label} onClick={() => onRaise(amt)} className="neon-btn px-4 py-3 text-sm" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#f7d24d,#e0a51f)", color: "#2a1d00", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54255" }}>
          {label} {fmtChips(amt)}
        </button>
      ))}
    </div>
  );
}

function Seat({ p, memeId, pos, dealer, toAct, reveal, winner, community }: { p: { name: string; stack: number; hole: PCard[]; folded: boolean; bet: number; lastAction: string; allIn: boolean }; memeId?: string; pos: { x: string; y: string }; dealer: boolean; toAct: boolean; reveal: boolean; winner: boolean; community: PCard[] }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1" style={{ left: pos.x, top: pos.y, opacity: p.folded ? 0.4 : 1 }}>
      {memeId && (
        <div style={{ filter: winner ? "drop-shadow(0 0 8px #f5c542)" : toAct ? "drop-shadow(0 0 7px #19e0ff)" : "none", transition: "filter 0.2s" }}>
          <MemeAvatar id={memeId} size={40} ring={winner ? "#f5c542" : toAct ? "#19e0ff" : undefined} />
        </div>
      )}
      <div className="flex gap-1">{p.folded ? <CardBack faded /> : reveal ? p.hole.map((c, i) => <Card key={i} c={c} small />) : [<CardBack key="a" small />, <CardBack key="b" small />]}</div>
      <div className="felt-card px-3 py-1 flex flex-col items-center" style={{ border: winner ? "2px solid #f5c542" : toAct ? "2px solid #19e0ff" : "2px solid #2a2440", boxShadow: winner ? "0 0 16px #f5c54266" : "none" }}>
        <div className="flex items-center gap-1.5">
          {dealer && <span className="text-[9px] px-1 rounded-full" style={{ background: "#fff", color: "#1a1230", fontWeight: 900 }}>D</span>}
          <span style={{ fontFamily: "var(--font-display)", fontSize: 11, color: toAct ? "#19e0ff" : "#fff" }}>{p.name}</span>
        </div>
        <span className="text-[#39d98a] text-xs">{fmtChips(p.stack)}</span>
        {p.bet > 0 && <span className="text-[10px] text-[#ffe79a]">bet {p.bet}</span>}
        {p.lastAction && !p.bet && <span className="text-[10px] text-white/50">{p.lastAction}</span>}
        {winner && reveal && !p.folded && <span className="text-[10px] text-[#f5c542]">{handName([...p.hole, ...community])}</span>}
      </div>
    </div>
  );
}

function PlayersPanel({ opps }: { opps: { name: string; stack: number; folded: boolean }[] }) {
  const rows = opps.map((p) => ({ p, m: memeByName.get(p.name) })).sort((a, b) => b.p.stack - a.p.stack);
  const lead = rows[0]?.p.stack ?? 0;
  return (
    <div className="absolute top-14 right-2 z-30 felt-card px-2.5 py-2 sm:px-3 sm:py-2.5" style={{ background: "rgba(13,11,28,0.78)", backdropFilter: "blur(4px)", maxWidth: "44vw" }}>
      <div className="text-[9px] sm:text-[10px] tracking-[0.2em] text-white/45 mb-1.5 text-center" style={{ fontFamily: "var(--font-display)" }}>FARMED {TICKER}</div>
      <div className="flex flex-col gap-1.5">
        {rows.map(({ p, m }, i) => (
          <div key={i} className="flex items-center gap-2" style={{ opacity: p.folded ? 0.45 : 1 }}>
            <MemeAvatar id={m?.id ?? "wojak"} size={22} ring={i === 0 && lead > 0 ? "#f5c542" : undefined} />
            <div className="leading-tight min-w-0">
              <div className="truncate" style={{ fontSize: 11, color: "#fff", fontWeight: 600, maxWidth: 92 }}>{i === 0 && lead > 0 ? "👑 " : ""}{p.name}</div>
              <div style={{ fontSize: 11, color: "#39d98a", fontFamily: "var(--font-display)" }}>{fmtChips(p.stack)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function oppPositions(n: number): { x: string; y: string }[] {
  if (n <= 1) return [{ x: "50%", y: "8%" }];
  if (n === 2) return [{ x: "18%", y: "20%" }, { x: "82%", y: "20%" }];
  return [{ x: "14%", y: "30%" }, { x: "50%", y: "6%" }, { x: "86%", y: "30%" }];
}

function Card({ c, big, small }: { c: PCard; big?: boolean; small?: boolean }) {
  const red = c.s === 1 || c.s === 2;
  const w = big ? 44 : small ? 28 : 34, h = big ? 62 : small ? 40 : 48;
  return (
    <div className="card-gloss" style={{ width: w, height: h, borderRadius: 6, background: "linear-gradient(160deg,#ffffff,#e9e4f5)", border: "1.5px solid #0d0a18", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: red ? "#e6356f" : "#1a1230", fontWeight: 800, lineHeight: 1, boxShadow: "0 4px 10px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
      <span style={{ fontSize: big ? 18 : small ? 11 : 14 }}>{rankCh(c.r)}</span>
      <span style={{ fontSize: big ? 20 : small ? 13 : 16 }}>{SUIT_CH[c.s]}</span>
    </div>
  );
}
function CardBack({ small, faded }: { small?: boolean; faded?: boolean }) {
  const w = small ? 28 : 34, h = small ? 40 : 48;
  return <div style={{ width: w, height: h, borderRadius: 5, background: faded ? "rgba(255,255,255,0.06)" : "repeating-linear-gradient(45deg,#7c2b4a,#7c2b4a 4px,#a03a60 4px,#a03a60 8px)", border: "1.5px solid #1a1230", opacity: faded ? 0.5 : 1 }} />;
}
