"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { GAME_CONFIG, X_URL, CA, TICKER } from "./config";
import { display, ui } from "./fonts";
import { MusicEngine } from "./music";
import { useBank, fmtChips } from "./bank";
import { Chip, XIcon } from "./components";

const GAMES = [
  { id: "plinko", name: "PLINKO", icon: "🔻", desc: "drop & multiply", glow: "#f5c542" },
  { id: "crash", name: "CRASH", icon: "📈", desc: "cash out in time", glow: "#39d98a" },
  { id: "mines", name: "MINES", icon: "💣", desc: "dodge the bombs", glow: "#e6356f" },
  { id: "slots", name: "SLOTS", icon: "🎰", desc: "spin to win", glow: "#a06bff" },
  { id: "coinflip", name: "COIN FLIP", icon: "🪙", desc: "bull or bear", glow: "#19e0ff" },
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

  function enterSite() {
    const off = (() => { try { return localStorage.getItem("trenchbet_music_off") === "1"; } catch { return false; } })();
    if (engineRef.current && !off) engineRef.current.play();
    setIntroLeaving(true); setTimeout(() => setIntro(false), 700);
  }
  function claimDaily() {
    const amt = bank.claim();
    if (amt > 0) { setToast(`+${fmtChips(amt)} CHIPS`); setTimeout(() => setToast(null), 2200); }
    else setToast("come back later");
    setTimeout(() => setToast(null), 2200);
  }
  function walletClick() { if (!connected) setVisible(true); }

  return (
    <main className={`fixed inset-0 overflow-y-auto ${display.variable} ${ui.variable}`} style={{ fontFamily: "var(--font-ui)", background: "radial-gradient(ellipse at 50% 0%, #1a1030 0%, #0b0816 45%, #07060d 100%)" }}>
      {/* neon ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "radial-gradient(60% 50% at 20% 90%, rgba(245,197,66,0.10), transparent 60%), radial-gradient(50% 40% at 85% 20%, rgba(160,107,255,0.12), transparent 60%)" }} />

      {/* intro */}
      {intro && (
        <div className={`fixed inset-0 z-[60] flex flex-col items-center justify-center text-center px-6 ${introLeaving ? "intro-leaving" : ""}`}
          style={{ background: "radial-gradient(ellipse at 50% 35%, #1a1030, #07060d)" }}>
          <div className="pop-in flex flex-col items-center">
            <div className="text-sm tracking-[0.4em] text-white/50 mb-3">WELCOME TO</div>
            <div className="text-5xl md:text-7xl gold-text neon-glow" style={{ fontFamily: "var(--font-display)" }}>TRENCHBET</div>
            <div className="text-3xl md:text-5xl gold-text" style={{ fontFamily: "var(--font-display)" }}>CLUB</div>
            <div className="mt-5 text-base md:text-xl text-white/70">place your bets, degen</div>
            <button onClick={enterSite} className="neon-btn mt-10 px-16 py-5 text-2xl gold-text" style={{ fontFamily: "var(--font-display)", background: "#15122a", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54288" }}>ENTER</button>
            <div className="mt-6 text-xs text-white/40">play chips · for fun · not real money</div>
          </div>
        </div>
      )}
      {introLeaving && <div className="fixed inset-0 z-[70] pointer-events-none flash-wipe" style={{ background: "radial-gradient(circle at 50% 50%, #fff3b0, #f5c54288 50%, transparent)" }} />}

      {/* lobby */}
      <div className={`relative z-10 min-h-screen flex flex-col items-center px-4 pb-10 ${!intro ? "menu-enter" : ""}`} style={{ opacity: intro ? 0 : 1 }}>
        {/* top bar */}
        <div className="w-full max-w-3xl flex items-center justify-between pt-4">
          <div className="felt-card flex items-center gap-2 px-4 py-2">
            <Chip size={22} />
            <div className="leading-none">
              <div style={{ fontFamily: "var(--font-display)", color: "#f5c542", fontSize: 16 }}>{fmtChips(bank.balance)}</div>
              <div className="text-[10px] text-white/40">LV {bank.level} · {bank.vipName}</div>
            </div>
          </div>
          <button onClick={walletClick} className="neon-btn px-4 py-2 text-sm" style={{ ["--bc" as string]: "#a06bff", ["--gl" as string]: "#a06bff55", background: "#15122a", color: "#cbb6ff" }}>
            {connected ? `✓ ${publicKey?.toBase58().slice(0, 4)}…${publicKey?.toBase58().slice(-4)}` : "◈ WALLET"}
          </button>
        </div>

        {/* logo */}
        <div className="text-center mt-8 bob select-none">
          <div className="text-5xl md:text-7xl gold-text neon-glow" style={{ fontFamily: "var(--font-display)" }}>TRENCHBET</div>
          <div className="text-2xl md:text-3xl tracking-[0.2em] text-white/80" style={{ fontFamily: "var(--font-display)" }}>CLUB</div>
        </div>

        {/* daily bonus */}
        <button onClick={claimDaily} disabled={!bank.canClaim()}
          className="neon-btn mt-6 px-8 py-3 text-lg disabled:opacity-40" style={{ fontFamily: "var(--font-display)", background: "linear-gradient(180deg,#2a8a4a,#1c6a38)", ["--bc" as string]: "#39d98a", ["--gl" as string]: "#39d98a66", color: "#eafff2" }}>
          🎁 DAILY BONUS
        </button>

        {/* game tiles */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-5 mt-8">
          {GAMES.map((g) => (
            <button key={g.id} onClick={() => router.push(`/${g.id}`)} className="game-tile p-5 flex flex-col items-center text-center" style={{ background: "linear-gradient(180deg,#17132e,#0e0b1e)", ["--gl" as string]: g.glow } as React.CSSProperties}>
              <div style={{ fontSize: 46, filter: `drop-shadow(0 0 14px ${g.glow}88)` }}>{g.icon}</div>
              <div className="mt-2 text-xl" style={{ fontFamily: "var(--font-display)", color: g.glow }}>{g.name}</div>
              <div className="text-[11px] text-white/45 mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>

        {/* secondary */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Chip2 label="🏆 RANKS" onClick={() => setModal("leaderboard")} />
          <Chip2 label="❔ HOW TO" onClick={() => setModal("howto")} />
          <Chip2 label="⚙ SETTINGS" onClick={() => setModal("settings")} />
        </div>

        {/* ticker + CA + X */}
        <div className="flex flex-col items-center gap-4 mt-8 w-full px-2">
          <div className="felt-card px-6 py-2 text-lg gold-text" style={{ fontFamily: "var(--font-display)" }}>{TICKER}</div>
          <CADisplay />
          <a href={X_URL} target="_blank" rel="noopener noreferrer" aria-label="Follow on X" className="neon-btn flex items-center justify-center" style={{ width: 48, height: 48, borderRadius: 14, background: "#15122a", color: "#fff", ["--bc" as string]: "#f5c542", ["--gl" as string]: "#f5c54255" }}>
            <XIcon size={20} />
          </a>
          <div className="text-[11px] text-white/30">{GAME_CONFIG.subtitle} · play chips for fun</div>
        </div>
      </div>

      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 felt-card px-6 py-3 text-lg gold-text pop-in" style={{ fontFamily: "var(--font-display)" }}>{toast}</div>}

      {modal && <Modal onClose={() => setModal(null)} title={modal === "leaderboard" ? "RANKINGS" : modal === "settings" ? "SETTINGS" : "HOW TO PLAY"}>
        {modal === "leaderboard" && <Leaderboard />}
        {modal === "settings" && <Settings engine={engineRef.current} />}
        {modal === "howto" && <HowTo />}
      </Modal>}
    </main>
  );
}

function Chip2({ label, onClick }: { label: string; onClick: () => void }) {
  return <button onClick={onClick} className="neon-btn px-5 py-2.5" style={{ fontFamily: "var(--font-display)", fontSize: 13, background: "#15122a", color: "#cfc8ea", ["--bc" as string]: "#3a3458", ["--gl" as string]: "#3a345844" }}>{label}</button>;
}

function CADisplay() {
  const [copied, setCopied] = useState(false);
  const isReal = CA !== "SOON" && CA !== "";
  function copy() { if (!isReal) return; navigator.clipboard.writeText(CA); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="felt-card inline-flex items-center justify-center gap-2 px-4 py-2 mx-auto" style={{ whiteSpace: "nowrap", maxWidth: "94vw" }}>
      <span className="shrink-0" style={{ color: "#f5c542", fontWeight: 800, fontSize: 13 }}>CA:</span>
      <span style={{ color: copied ? "#39d98a" : isReal ? "#e9e2ff" : "#7a7496", fontWeight: 600, fontSize: "clamp(8px, 2.5vw, 13px)" }}>{copied ? "COPIED!" : CA}</span>
      {isReal && <button onClick={copy} aria-label="Copy CA" className="shrink-0 flex items-center justify-center cursor-pointer" style={{ width: 26, height: 26, border: "2px solid #f5c542", borderRadius: 6, color: copied ? "#39d98a" : "#f5c542" }}>{copied ? "✓" : "⧉"}</button>}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: "rgba(5,4,12,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="felt-card w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "2px solid #2a2440" }}>
          <span className="text-xl gold-text" style={{ fontFamily: "var(--font-display)" }}>{title}</span>
          <button onClick={onClose} className="text-xl text-white/60 hover:text-white cursor-pointer">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const bank = useBank();
  const [rows, setRows] = useState<{ name: string; score: number; you?: boolean }[]>([]);
  useEffect(() => {
    const fake = [{ name: "WhaleWizard", score: 482000 }, { name: "RugSurvivor", score: 311000 }, { name: "PlinkoGod", score: 188000 }, { name: "AllInAndy", score: 96000 }, { name: "CrashKing", score: 54000 }, { name: "MinesMaster", score: 28000 }];
    setRows([...fake, { name: "YOU", score: bank.balance, you: true }].sort((a, b) => b.score - a.score).slice(0, 8));
  }, [bank.balance]);
  return (<div className="flex flex-col gap-1.5">
    {rows.map((r, i) => <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg" style={{ background: r.you ? "rgba(245,197,66,0.14)" : "rgba(255,255,255,0.04)", border: r.you ? "2px solid #f5c542" : "2px solid transparent", color: r.you ? "#f5c542" : "#cfc8ea", fontWeight: 600 }}><span>{i + 1}. {r.name}</span><span style={{ color: "#39d98a" }}>{fmtChips(r.score)}</span></div>)}
    <div className="mt-2 text-center text-xs text-white/40">your chip balance is your rank</div>
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
  return (<div className="flex flex-col gap-4" style={{ fontWeight: 600 }}>
    <Row label="MUSIC"><Toggle on={!musicOff} onClick={toggleMusic} /></Row>
    <Row label="SFX"><Toggle on={!muted} onClick={toggleSfx} /></Row>
    <Row label="RESET CHIPS"><button onClick={reset} className="neon-btn px-4 py-1.5 text-sm" style={{ background: "#15122a", color: "#e6356f", ["--bc" as string]: "#e6356f", ["--gl" as string]: "#e6356f44" }}>{done ? "DONE ✓" : "RESET"}</button></Row>
    <div className="text-xs text-white/40">in-game chips only · stored on this device</div>
  </div>);
}
function Row({ label, children }: { label: string; children: ReactNode }) { return <div className="flex items-center justify-between text-lg"><span className="text-white/80">{label}</span>{children}</div>; }
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) { return <button onClick={onClick} className="neon-btn px-4 py-1.5 text-sm" style={{ background: "#15122a", color: on ? "#39d98a" : "#e6356f", ["--bc" as string]: on ? "#39d98a" : "#e6356f", ["--gl" as string]: "transparent" }}>{on ? "ON" : "OFF"}</button>; }

function HowTo() {
  return (<div className="flex flex-col gap-3 text-sm text-white/80">
    <p>TrenchBet Club is a <span className="text-[#f5c542]">play-money</span> casino. You bet in-game chips, not real money, and there is no cashout. It is just for fun.</p>
    <div className="flex flex-col gap-1.5">
      <p><b className="text-[#f5c542]">PLINKO</b> drop a chip through the pegs into a multiplier slot.</p>
      <p><b className="text-[#39d98a]">CRASH</b> cash out before the multiplier crashes.</p>
      <p><b className="text-[#e6356f]">MINES</b> reveal safe tiles, dodge the bombs, cash out anytime.</p>
      <p><b className="text-[#a06bff]">SLOTS</b> spin three reels and match symbols.</p>
      <p><b className="text-[#19e0ff]">COIN FLIP</b> pick bull or bear for a near 2x.</p>
    </div>
    <p>Low on chips? Grab the <span className="text-[#39d98a]">daily bonus</span> in the lobby.</p>
  </div>);
}
