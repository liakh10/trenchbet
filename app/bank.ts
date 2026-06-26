"use client";
import { useEffect, useReducer } from "react";

// Shared in-game chip bank. Play money only — no real wagering, no cashout.
const KEY = "trenchbet_save_v1";
const START = 1000;
const DAILY = 1000;
const DAILY_COOLDOWN = 12 * 3600 * 1000;
const FAUCET_FLOOR = 200;

interface BankData { balance: number; wagered: number; bestWin: number; lastDaily: number; }

function load(): BankData {
  if (typeof window === "undefined") return { balance: START, wagered: 0, bestWin: 0, lastDaily: 0 };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw); return { balance: d.balance ?? START, wagered: d.wagered ?? 0, bestWin: d.bestWin ?? 0, lastDaily: d.lastDaily ?? 0 }; }
  } catch { /* */ }
  return { balance: START, wagered: 0, bestWin: 0, lastDaily: 0 };
}

let data = load();
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* */ } emit(); }

export const Bank = {
  get balance() { return data.balance; },
  get wagered() { return data.wagered; },
  get bestWin() { return data.bestWin; },
  get level() { return 1 + Math.floor(data.wagered / 5000); },
  get vipName() { const l = Bank.level; return l >= 20 ? "WHALE" : l >= 12 ? "DEGEN LORD" : l >= 6 ? "HIGH ROLLER" : l >= 3 ? "GAMBLER" : "ROOKIE"; },
  minBet() { return 10; },
  maxBet() { return Math.max(10, Math.min(data.balance, 25000 + (Bank.level - 1) * 5000)); },
  canBet(n: number) { return n >= 10 && n <= data.balance; },
  bet(n: number): boolean { if (!Bank.canBet(n)) return false; data.balance -= n; data.wagered += n; save(); return true; },
  win(n: number) { if (n <= 0) return; data.balance += n; if (n > data.bestWin) data.bestWin = n; save(); },
  refund(n: number) { data.balance += n; save(); },
  // daily bonus / faucet so you can never get stuck at 0
  canClaim(): boolean { return data.balance < FAUCET_FLOOR || (Date.now() - data.lastDaily > DAILY_COOLDOWN); },
  claimAmount(): number { return data.balance < FAUCET_FLOOR ? Math.max(DAILY, FAUCET_FLOOR) : DAILY; },
  claim(): number { if (!Bank.canClaim()) return 0; const amt = Bank.claimAmount(); data.balance += amt; data.lastDaily = Date.now(); save(); return amt; },
  nextClaimIn(): number { return Math.max(0, DAILY_COOLDOWN - (Date.now() - data.lastDaily)); },
  reset() { data = { balance: START, wagered: 0, bestWin: 0, lastDaily: 0 }; save(); },
  subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
};

export function useBank() {
  const [, force] = useReducer((x) => x + 1, 0);
  useEffect(() => Bank.subscribe(force), []);
  return Bank;
}

export function fmtChips(n: number): string { return Math.floor(n).toLocaleString(); }
