"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X_URL, CA, TICKER } from "./config";
import { display, ui } from "./fonts";
import { MusicEngine } from "./music";
import { useBank, fmtChips } from "./bank";
import { Chip, XIcon } from "./components";
import { GameLogo } from "./icons";
import { PokerBg } from "./pokerbg";

const GAMES = [
  { id: "plinko", name: "PLINKO", desc: "drop & multiply", glow: "#f5c542" },
  { id: "crash", name: "CRASH", desc: "cash out in time", glow: "#39d98a" },
  { id: "mines", name: "MINES", desc: "dodge the bombs", glow: "#e6356f" },
  { id: "slots", name: "SLOTS", desc: "spin to win", glow: "#a06bff" },
  { id: "coinflip", name: "COIN FLIP", desc: "bull or bear", glow: "#19e0ff" },
];

export default function Lobby() {
  const router = useRouter();
  const bank = useBank();
  const { connected, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [intro, setIntro] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [modal, setModal] = useState<null | "leaderboard" | "settings" | "howto">(null);
  const [toast, setToast] = useState<string | null>(null);
  const engineRef = useRef<MusicEngine | null>(null);

  useEffect(() => { const e = new MusicEngine(); engineRef.current = e; return () => e.dispose(); }, []);

  function proceed(mode: "guest" | "wallet", address?: string) {
    try { sessionStorage.setItem("trenchbet_player", JSON.stringify({ mode, address: address ?? null })); } catch { /* */ }
    const off = (() => { try { return localStorage.getItem("trenchbet_music_off") === "1"; } catch { return false; } })();
    if (engineRef.current && !off) engineRef.current.play();
    setIntroLeaving(true); setTimeout(() => setIntro(false), 700);
  }
  useEffect(() => {
    if (connected && publicKey && intro && sessionStorage.getItem("trenchbet_wallet_pending")) {
      sessionStorage.removeItem("trenchbet_wallet_pending"); proceed("wallet", publicKey.toBase58());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);
  function walletEnter() { if (connected && publicKey) proceed("wallet", publicKey.toBase58()); else { try { sessionStorage.setItem("trenchbet_wallet_pending", "1"); } catch { /* */ } setVisible(true); } }

  function claimDaily() {
    const amt = bank.claim();
    setToast(amt > 0 ? `+${fmtChips(amt)} ${TICKER}` : "come back later");
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <main className={`fixed inset-0 overflow-y-auto ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "#07060d" }}>
      <PokerBg blur={intro ? 6 : 9} dim={intro ? 0.5 : 0.72} />

      {/* INTRO GATE: choose guest or wallet before playing */}
      {intro && (
        <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center text-center px-6 ${introLeaving ? "intro-leaving" : ""}`}>
          <div className="pop-in flex flex-col items-center">
            <div className="text-sm md:text-base tracking-[0.5em] text-white/50 mb-6">WELCOME TO</div>
            <div className="text-6xl md:text-8xl gold-text neon-glow leading-none" style={{ fontFamily: "var(--font-display)" }}>TRENCHBET</div>
            <div className="text-4xl md:text-6xl gold-text leading-none mt-2" style={{ fontFamily: "var(--font-display)" }}>CASINO</div>

            <div className="mt-24 flex flex-col sm:flex-row gap-12 items-center">
              <button onClick={() => proceed("guest")} className="neon-btn px-16 py-6 text-2xl" style={{ minWidth: 290, fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#f7d24d,#e0a51f)", color: "#2a1d00", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54288" }}>PLAY AS GUEST</button>
              <button onClick={walletEnter} className="neon-btn px-16 py-6 text-2xl" style={{ minWidth: 290, fontFamily: "var(--font-display)", background: connected ? "linear-gradient(180deg,#7dffb0,#1fae66)" : "linear-gradient(180deg,#b89bff,#7c47e0)", color: connected ? "#063" : "#fff", ["--bc" as string]: "#a06bff", ["--gl" as string]: "#a06bff88" }}>
                {connected ? "ENTER WALLET" : "CONNECT WALLET"}
              </button>
            </div>
          </div>
        </div>
      )}
      {introLeaving && <div className="fixed inset-0 z-[70] pointer-events-none flash-wipe" style={{ background: "radial-gradient(circle at 50% 50%, #fff3b0, #f5c54288 50%, transparent)" }} />}

      {/* LOBBY */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center px-4 pb-16 ${!intro ? "menu-enter" : ""}`} style={{ opacity: intro ? 0 : 1 }}>
        {/* top bar */}
        <div className="w-full max-w-5xl flex items-center justify-between pt-5">
          <div className="felt-card flex items-center gap-3 px-5 py-3">
            <Chip size={26} />
            <div className="leading-tight">
              <div style={{ fontFamily: "var(--font-display)", color: "#f5c542", fontSize: 20 }}>{fmtChips(bank.balance)}</div>
              <div className="text-[11px] text-white/45">{TICKER} · LV {bank.level} {bank.vipName}</div>
            </div>
          </div>
          <button onClick={walletEnter} className="neon-btn px-5 py-3 text-base" style={{ ["--bc" as string]: "#a06bff", ["--gl" as string]: "#a06bff55", background: "#15122a", color: "#cbb6ff" }}>
            {connected ? `✓ ${publicKey?.toBase58().slice(0, 4)}…${publicKey?.toBase58().slice(-4)}` : "◈ WALLET"}
          </button>
        </div>

        {/* logo */}
        <div className="text-center mt-8 select-none">
          <div className="text-6xl md:text-8xl gold-text neon-glow leading-none" style={{ fontFamily: "var(--font-display)" }}>TRENCHBET</div>
          <div className="text-3xl md:text-5xl tracking-[0.18em] text-white/85 mt-2" style={{ fontFamily: "var(--font-display)" }}>CASINO</div>
        </div>

        {/* main: daily bonus + games in a single column */}
        <div className="flex-1 w-full max-w-2xl flex flex-col items-stretch gap-7 mt-14">
          <button onClick={claimDaily} disabled={!bank.canClaim()} className="neon-btn self-center px-14 py-4 text-xl disabled:opacity-40" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a66", color: "#eafff2" }}>DAILY BONUS</button>

          <GameRow id="poker" name="POKER TABLE" desc="Texas Hold'em vs the trenchers" glow="#f5c542" cta="SIT DOWN" featured onClick={() => router.push("/poker")} />
          {GAMES.map((g) => <GameRow key={g.id} id={g.id} name={g.name} desc={g.desc} glow={g.glow} onClick={() => router.push(`/${g.id}`)} />)}
        </div>

        {/* bottom: secondary + ticker + CA + X */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-9 mt-20 pb-6">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Chip2 label="RANKS" onClick={() => setModal("leaderboard")} />
            <Chip2 label="HOW TO PLAY" onClick={() => setModal("howto")} />
            <Chip2 label="SETTINGS" onClick={() => setModal("settings")} />
          </div>
          <div className="felt-card px-10 py-3 text-2xl gold-text" style={{ fontFamily: "var(--font-display)" }}>{TICKER}</div>
          <CADisplay />
          <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="neon-btn flex items-center justify-center" style={{ width: 54, height: 54, borderRadius: 14, background: "#15122a", color: "#fff", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54255" }}>
            <XIcon size={22} />
          </a>
        </div>
      </div>

      {toast && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 felt-card px-8 py-4 text-xl gold-text pop-in" style={{ fontFamily: "var(--font-display)" }}>{toast}</div>}

      {modal && <Modal onClose={() => setModal(null)} title={modal === "leaderboard" ? "RANKINGS" : modal === "settings" ? "SETTINGS" : "HOW TO PLAY"}>
        {modal === "leaderboard" && <Leaderboard />}
        {modal === "settings" && <Settings engine={engineRef.current} />}
        {modal === "howto" && <HowTo />}
      </Modal>}
    </main>
  );
}

function Chip2({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="neon-btn px-9 py-3.5" style={{ fontFamily: "var(--font-display)", fontSize: 15, background: "#15122a", color: "#cfc8ea", ["--bc" as string]: "#3a3458", ["--gl" as string]: "#3a345844" }}>{label}</button>;
}

function GameRow({ id, name, desc, glow, cta, featured, onClick }: { id: string; name: string; desc: string; glow: string; cta?: string; featured?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="game-tile w-full px-6 py-5 flex items-center gap-5 text-left"
      style={{ background: featured ? "linear-gradient(110deg,#1a1330,#241a14 70%)" : "linear-gradient(180deg,#17132e,#0e0b1e)", border: featured ? "2px solid #f5c542" : "2px solid #2a2440", boxShadow: featured ? "0 0 36px #f5c54222" : "none", ["--gl" as string]: glow } as React.CSSProperties}>
      <GameLogo id={id} size={featured ? 68 : 50} color={glow} />
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-display)", fontSize: featured ? 28 : 22, color: glow }}>{name}</div>
        <div className="text-sm text-white/55 mt-1">{desc}</div>
      </div>
      <span className="neon-btn px-6 py-3 text-base hidden sm:inline-block" style={{ fontFamily: "var(--font-display)", background: featured ? "linear-gradient(180deg,#f7d24d,#e0a51f)" : "#15122a", color: featured ? "#2a1d00" : glow, ["--bc" as string]: glow, ["--gl" as string]: featured ? "#f5c54255" : "transparent" }}>{cta || "PLAY"}</span>
    </button>
  );
}

function CADisplay() {
  const [copied, setCopied] = useState(false);
  const isReal = CA !== "SOON" && CA !== "";
  function copy() { if (!isReal) return; navigator.clipboard.writeText(CA); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="felt-card inline-flex items-center justify-center gap-2 px-5 py-3 mx-auto" style={{ whiteSpace: "nowrap", maxWidth: "94vw" }}>
      <span className="shrink-0" style={{ color: "#f5c542", fontWeight: 800, fontSize: 15 }}>CA:</span>
      <span style={{ color: copied ? "#39d98a" : isReal ? "#e9e2ff" : "#7a7496", fontWeight: 600, fontSize: "clamp(9px, 2.6vw, 15px)" }}>{copied ? "COPIED!" : CA}</span>
      {isReal && <button onClick={copy} aria-label="Copy CA" className="shrink-0 flex items-center justify-center cursor-pointer" style={{ width: 28, height: 28, border: "2px solid #f5c542", borderRadius: 6, color: copied ? "#39d98a" : "#f5c542" }}>{copied ? "✓" : "⧉"}</button>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(5,4,12,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="felt-card w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "2px solid #2a2440" }}>
          <span className="text-2xl gold-text" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <button onClick={onClose} className="text-2xl text-white/60 hover:text-white cursor-pointer">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const bank = useBank();
  const [rows, setRows] = useState<{ name: string; score: number; you?: boolean }[]>([]);
  useEffect(() => {
    const fake = [{ name: "Cented", score: 482000 }, { name: "Cupsey", score: 311000 }, { name: "Trenchman", score: 188000 }, { name: "Pandora", score: 96000 }, { name: "milito", score: 54000 }, { name: "Silver", score: 28000 }];
    setRows([...fake, { name: "YOU", score: bank.balance, you: true }].sort((a, b) => b.score - a.score).slice(0, 8));
  }, [bank.balance]);
  return (<div className="flex flex-col gap-2">
    {rows.map((r, i) => <div key={i} className="flex items-center justify-between px-4 py-2 rounded-lg" style={{ background: r.you ? "rgba(245,197,66,0.14)" : "rgba(255,255,255,0.04)", border: r.you ? "2px solid #f5c542" : "2px solid transparent", color: r.you ? "#f5c542" : "#cfc8ea", fontWeight: 600 }}><span>{i + 1}. {r.name}</span><span style={{ color: "#39d98a" }}>{fmtChips(r.score)}</span></div>)}
    <div className="mt-3 text-center text-sm text-white/40">your {TICKER} balance is your rank</div>
  </div>);
}

function Settings({ engine }: { engine: MusicEngine | null }) {
  const bank = useBank();
  const [musicOff, setMusicOff] = useState(false);
  const [muted, setMuted] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => { try { setMusicOff(localStorage.getItem("trenchbet_music_off") === "1"); setMuted(localStorage.getItem("trenchbet_muted") === "1"); } catch { /* */ } }, []);
  function toggleMusic() { const n = !musicOff; setMusicOff(n); try { localStorage.setItem("trenchbet_music_off", n ? "1" : "0"); } catch { /* */ } if (engine) { if (n) engine.pause(); else engine.play(); } }
  function toggleSfx() { const n = !muted; setMuted(n); try { localStorage.setItem("trenchbet_muted", n ? "1" : "0"); } catch { /* */ } }
  function reset() { bank.reset(); setDone(true); setTimeout(() => setDone(false), 1500); }
  return (<div className="flex flex-col gap-5" style={{ fontWeight: 600 }}>
    <Row label="MUSIC"><Toggle on={!musicOff} onClick={toggleMusic} /></Row>
    <Row label="SFX"><Toggle on={!muted} onClick={toggleSfx} /></Row>
    <Row label={`RESET ${TICKER}`}><button onClick={reset} className="neon-btn px-5 py-2 text-sm" style={{ background: "#15122a", color: "#e6356f", ["--bc" as string]: "#e6356f", ["--gl" as string]: "#e6356f44" }}>{done ? "DONE ✓" : "RESET"}</button></Row>
    <div className="text-sm text-white/40">in-game {TICKER} only · stored on this device</div>
  </div>);
}
function Row({ label, children }: { label: string; children: ReactNode }) { return <div className="flex items-center justify-between text-xl"><span className="text-white/80">{label}</span>{children}</div>; }
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) { return <button onClick={onClick} className="neon-btn px-5 py-2 text-sm" style={{ background: "#15122a", color: on ? "#39d98a" : "#e6356f", ["--bc" as string]: on ? "#39d98a" : "#e6356f", ["--gl" as string]: "transparent" }}>{on ? "ON" : "OFF"}</button>; }

function HowTo() {
  return (<div className="flex flex-col gap-4 text-base text-white/80">
    <p>TrenchBet Casino is a <span className="text-[#f5c542]">play-money</span> casino. You bet in-game {TICKER}, not real money, and there is no cashout. Just for fun.</p>
    <div className="flex flex-col gap-2">
      <p><b className="text-[#f5c542]">POKER</b> Texas Hold&apos;em vs the trenchers. Pick a table and outplay them.</p>
      <p><b className="text-[#f5c542]">PLINKO</b> drop a chip through pegs into a multiplier.</p>
      <p><b className="text-[#39d98a]">CRASH</b> cash out before the multiplier crashes.</p>
      <p><b className="text-[#e6356f]">MINES</b> reveal safe tiles, dodge the bombs.</p>
      <p><b className="text-[#a06bff]">SLOTS</b> spin three reels and match symbols.</p>
      <p><b className="text-[#19e0ff]">COIN FLIP</b> pick bull or bear for a near 2x.</p>
    </div>
    <p>Low on {TICKER}? Grab the <span className="text-[#39d98a]">daily bonus</span>.</p>
  </div>);
}
