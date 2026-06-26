// Simplified Texas Hold'em engine vs trencher bots. Play-money only.
// Single-pot approximation for all-ins (fine for a casual play-money table).

export interface Card { r: number; s: number; } // r:2..14, s:0..3 (0 spade,1 heart,2 diamond,3 club)
export const SUIT_CH = ["♠", "♥", "♦", "♣"];
export function rankCh(r: number): string { return r <= 10 ? String(r) : r === 11 ? "J" : r === 12 ? "Q" : r === 13 ? "K" : "A"; }

export interface Player {
  name: string; isYou: boolean; stack: number; hole: Card[];
  folded: boolean; allIn: boolean; bet: number; committed: number; needsAction: boolean; sittingOut: boolean;
  lastAction: string;
}

export type Stage = "preflop" | "flop" | "turn" | "river" | "showdown" | "handover";

function freshDeck(): Card[] {
  const d: Card[] = [];
  for (let s = 0; s < 4; s++) for (let r = 2; r <= 14; r++) d.push({ r, s });
  for (let i = d.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [d[i], d[j]] = [d[j], d[i]]; }
  return d;
}

// ── hand evaluation (best 5 of up to 7) ──
function score5(cards: Card[]): number {
  const ranks = cards.map((c) => c.r).sort((a, b) => b - a);
  const suits = cards.map((c) => c.s);
  const flush = suits.every((s) => s === suits[0]);
  // straight detection (handles the wheel A-2-3-4-5)
  const checkStraight = (rs: number[]): number => {
    const u = Array.from(new Set(rs)).sort((a, b) => b - a);
    for (let i = 0; i <= u.length - 5; i++) { if (u[i] - u[i + 4] === 4) return u[i]; }
    if (u.includes(14) && u.includes(5) && u.includes(4) && u.includes(3) && u.includes(2)) return 5;
    return 0;
  };
  const straightHigh = checkStraight(ranks);
  const counts = new Map<number, number>();
  for (const r of ranks) counts.set(r, (counts.get(r) || 0) + 1);
  const groups = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || b[0] - a[0]); // [rank,count]
  const pack = (vals: number[]) => { let v = 0; for (let i = 0; i < 5; i++) v = v * 15 + (vals[i] || 0); return v; };
  let cat = 0, tb: number[] = [];
  if (straightHigh && flush) { cat = 8; tb = [straightHigh]; }
  else if (groups[0][1] === 4) { cat = 7; tb = [groups[0][0], groups.find((g) => g[1] !== 4)![0]]; }
  else if (groups[0][1] === 3 && groups[1] && groups[1][1] >= 2) { cat = 6; tb = [groups[0][0], groups[1][0]]; }
  else if (flush) { cat = 5; tb = ranks.slice(0, 5); }
  else if (straightHigh) { cat = 4; tb = [straightHigh]; }
  else if (groups[0][1] === 3) { cat = 3; tb = [groups[0][0], ...groups.filter((g) => g[1] === 1).map((g) => g[0]).slice(0, 2)]; }
  else if (groups[0][1] === 2 && groups[1] && groups[1][1] === 2) { cat = 2; const ps = [groups[0][0], groups[1][0]].sort((a, b) => b - a); tb = [ps[0], ps[1], groups.find((g) => g[1] === 1)![0]]; }
  else if (groups[0][1] === 2) { cat = 1; tb = [groups[0][0], ...groups.filter((g) => g[1] === 1).map((g) => g[0]).slice(0, 3)]; }
  else { cat = 0; tb = ranks.slice(0, 5); }
  return cat * 1_000_000 + pack(tb);
}

export function evalBest(cards: Card[]): number {
  if (cards.length <= 5) return score5(cards);
  let best = 0; const n = cards.length;
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) for (let d = c + 1; d < n; d++) for (let e = d + 1; e < n; e++) {
    const sc = score5([cards[a], cards[b], cards[c], cards[d], cards[e]]); if (sc > best) best = sc;
  }
  return best;
}

const CAT_NAMES = ["High Card", "Pair", "Two Pair", "Trips", "Straight", "Flush", "Full House", "Quads", "Straight Flush"];
export function handName(cards: Card[]): string { return CAT_NAMES[Math.floor(evalBest(cards) / 1_000_000)] || "High Card"; }

// ── bot strength heuristics ──
function preflopStrength(hole: Card[]): number {
  const [a, b] = hole; const hi = Math.max(a.r, b.r), lo = Math.min(a.r, b.r);
  let s = (hi - 2) / 12 * 0.5 + (lo - 2) / 12 * 0.25;
  if (a.r === b.r) s = 0.5 + (a.r - 2) / 12 * 0.5;
  if (a.s === b.s) s += 0.06;
  if (Math.abs(a.r - b.r) <= 2 && a.r !== b.r) s += 0.05;
  return Math.min(1, s);
}
function madeStrength(hole: Card[], community: Card[]): number {
  const cat = Math.floor(evalBest([...hole, ...community]) / 1_000_000);
  return Math.min(1, 0.18 + cat * 0.13);
}

export class PokerGame {
  players: Player[];
  community: Card[] = [];
  deck: Card[] = [];
  pot = 0;
  dealer = 0;
  current = 0;
  stage: Stage = "handover";
  currentBet = 0;
  minRaise = 20;
  sb = 10; bb = 20;
  message = "";
  winners: number[] = [];
  showCards = false;

  constructor(humanName: string, oppNames: string[], startStack: number) {
    this.players = [
      { name: humanName, isYou: true, stack: startStack, hole: [], folded: false, allIn: false, bet: 0, committed: 0, needsAction: false, sittingOut: false, lastAction: "" },
      ...oppNames.map((n) => ({ name: n, isYou: false, stack: startStack, hole: [], folded: false, allIn: false, bet: 0, committed: 0, needsAction: false, sittingOut: false, lastAction: "" })),
    ];
    this.dealer = (Math.random() * this.players.length) | 0;
  }

  private alive() { return this.players.filter((p) => !p.sittingOut && p.stack > 0); }
  private inHand() { return this.players.filter((p) => !p.folded && !p.sittingOut); }
  private canAct() { return this.players.filter((p) => !p.folded && !p.allIn && !p.sittingOut); }
  human() { return this.players[0]; }
  isHumanTurn() { return this.stage !== "handover" && this.stage !== "showdown" && this.current === 0 && !this.players[0].folded && !this.players[0].allIn; }

  startHand() {
    if (this.alive().length < 2) { this.message = "not enough players"; return; }
    this.deck = freshDeck(); this.community = []; this.pot = 0; this.winners = []; this.showCards = false;
    for (const p of this.players) { p.hole = []; p.folded = p.sittingOut || p.stack <= 0; p.allIn = false; p.bet = 0; p.committed = 0; p.needsAction = !p.folded; p.lastAction = ""; }
    // rotate dealer to an alive player
    do { this.dealer = (this.dealer + 1) % this.players.length; } while (this.players[this.dealer].folded);
    // deal hole cards
    for (let k = 0; k < 2; k++) for (const p of this.players) if (!p.folded) p.hole.push(this.deck.pop()!);
    // blinds
    const order = this.orderFrom(this.dealer);
    const sbP = order[0], bbP = order[1];
    this.postBlind(sbP, this.sb); this.postBlind(bbP, this.bb);
    this.currentBet = this.bb; this.minRaise = this.bb;
    this.stage = "preflop";
    this.current = this.nextActor(this.idx(bbP));
    this.message = "preflop";
  }

  private idx(p: Player) { return this.players.indexOf(p); }
  private orderFrom(d: number): Player[] { const o: Player[] = []; for (let i = 1; i <= this.players.length; i++) { const p = this.players[(d + i) % this.players.length]; if (!p.folded) o.push(p); } return o; }
  private postBlind(p: Player, amt: number) { const a = Math.min(amt, p.stack); p.stack -= a; p.bet = a; p.committed += a; this.pot += a; if (p.stack === 0) p.allIn = true; }

  private nextActor(from: number): number {
    for (let i = 1; i <= this.players.length; i++) {
      const j = (from + i) % this.players.length; const p = this.players[j];
      if (!p.folded && !p.allIn && !p.sittingOut && p.needsAction) return j;
    }
    return -1;
  }

  legal() {
    const p = this.players[this.current]; const toCall = this.currentBet - p.bet;
    const canCheck = toCall <= 0;
    const callAmount = Math.min(toCall, p.stack);
    const minRaiseTo = this.currentBet + this.minRaise;
    const maxRaiseTo = p.bet + p.stack;
    const canRaise = p.stack > toCall;
    return { canCheck, canCall: toCall > 0, callAmount, canRaise, minRaiseTo: Math.min(minRaiseTo, maxRaiseTo), maxRaiseTo };
  }

  act(kind: "fold" | "check" | "call" | "raise", raiseTo?: number): void {
    const p = this.players[this.current]; if (!p) return;
    const toCall = this.currentBet - p.bet;
    if (kind === "fold") { p.folded = true; p.needsAction = false; p.lastAction = "fold"; }
    else if (kind === "check") { if (toCall > 0) { this.act("call"); return; } p.needsAction = false; p.lastAction = "check"; }
    else if (kind === "call") { const a = Math.min(toCall, p.stack); p.stack -= a; p.bet += a; p.committed += a; this.pot += a; if (p.stack === 0) p.allIn = true; p.needsAction = false; p.lastAction = a > 0 ? "call" : "check"; }
    else if (kind === "raise") {
      let target = Math.max(raiseTo ?? this.currentBet + this.minRaise, this.currentBet + this.minRaise);
      target = Math.min(target, p.bet + p.stack); // cap all-in
      const add = target - p.bet; const a = Math.min(add, p.stack); p.stack -= a; p.bet += a; p.committed += a; this.pot += a;
      const raiseSize = p.bet - this.currentBet;
      if (raiseSize > 0) { this.minRaise = Math.max(this.minRaise, raiseSize); this.currentBet = p.bet; for (const o of this.canAct()) if (o !== p) o.needsAction = true; }
      if (p.stack === 0) p.allIn = true; p.needsAction = false; p.lastAction = p.allIn ? "all-in" : "raise";
    }
    this.advance();
  }

  botAction() {
    const p = this.players[this.current]; if (!p || p.isYou) return;
    const strength = this.community.length >= 3 ? madeStrength(p.hole, this.community) : preflopStrength(p.hole);
    const toCall = this.currentBet - p.bet; const r = Math.random();
    const betTo = (frac: number) => this.currentBet + Math.max(this.minRaise, Math.round(this.pot * frac));
    if (toCall <= 0) {
      if (strength > 0.62 && r < 0.55 && p.stack > this.minRaise) this.act("raise", betTo(0.6));
      else if (strength < 0.3 && r < 0.07 && p.stack > this.minRaise) this.act("raise", betTo(0.5));
      else this.act("check");
    } else {
      const potOdds = toCall / (this.pot + toCall);
      if (strength > 0.8 && r < 0.5 && p.stack > toCall + this.minRaise) this.act("raise", betTo(0.8));
      else if (strength > potOdds + 0.06) this.act("call");
      else if (r < 0.05 && p.stack > toCall + this.minRaise) this.act("raise", betTo(0.6));
      else this.act("fold");
    }
  }

  private advance() {
    // win by fold
    if (this.inHand().length === 1) { this.resolve([this.idx(this.inHand()[0])]); return; }
    const next = this.nextActor(this.current);
    if (next === -1) { this.endRound(); return; }
    this.current = next;
  }

  private endRound() {
    // everyone all-in but action done → run out remaining streets
    for (const p of this.players) p.bet = 0;
    this.currentBet = 0; this.minRaise = this.bb;
    if (this.stage === "preflop") { this.deal(3); this.stage = "flop"; }
    else if (this.stage === "flop") { this.deal(1); this.stage = "turn"; }
    else if (this.stage === "turn") { this.deal(1); this.stage = "river"; }
    else { this.showdown(); return; }
    this.message = this.stage;
    for (const p of this.canAct()) p.needsAction = true;
    // if nobody can act (all all-in), keep dealing
    if (this.canAct().length <= 1 && this.inHand().length >= 2) { this.endRound(); return; }
    this.current = this.nextActor(this.idx(this.players[this.dealer]));
    if (this.current === -1) this.endRound();
  }

  private deal(n: number) { for (let i = 0; i < n; i++) this.community.push(this.deck.pop()!); }

  private showdown() {
    while (this.community.length < 5) this.community.push(this.deck.pop()!);
    const contenders = this.inHand();
    let best = -1; let winners: Player[] = [];
    for (const p of contenders) { const sc = evalBest([...p.hole, ...this.community]); if (sc > best) { best = sc; winners = [p]; } else if (sc === best) winners.push(p); }
    this.showCards = true;
    this.resolve(winners.map((w) => this.idx(w)));
  }

  private resolve(winnerIdx: number[]) {
    const share = Math.floor(this.pot / winnerIdx.length);
    for (const i of winnerIdx) this.players[i].stack += share;
    this.winners = winnerIdx; this.stage = "handover";
    const names = winnerIdx.map((i) => this.players[i].name).join(", ");
    this.message = `${names} win ${this.pot}`;
  }

  // cash out the human's remaining stack
  cashout(): number { return Math.max(0, Math.floor(this.players[0].stack)); }
}
