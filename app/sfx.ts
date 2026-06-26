// Minimal WebAudio casino blips. Created lazily after a user gesture.
export class Sfx {
  private ctx: AudioContext | null = null;
  enabled = true;

  constructor() { try { this.enabled = localStorage.getItem("trenchbet_muted") !== "1"; } catch { /* */ } }

  private ac(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)(); } catch { this.enabled = false; return null; } }
    return this.ctx;
  }
  private blip(freq: number, dur: number, type: OscillatorType, vol: number, slideTo?: number) {
    const ac = this.ac(); if (!ac) return;
    const t = ac.currentTime; const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t); if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
  }
  setEnabled(b: boolean) { this.enabled = b; }
  chip() { this.blip(700, 0.06, "triangle", 0.05, 1100); }
  click() { this.blip(420, 0.04, "square", 0.04, 600); }
  tick() { this.blip(900, 0.03, "square", 0.03); }
  peg() { this.blip(1200, 0.03, "sine", 0.03, 1600); }
  spin() { this.blip(300, 0.3, "sawtooth", 0.05, 900); }
  win() { const n = [660, 880, 1100]; n.forEach((f, i) => this.blip(f, 0.16, "triangle", 0.07, f * 1.5)); }
  bigwin() { const n = [523, 659, 784, 1047]; n.forEach((f) => this.blip(f, 0.22, "triangle", 0.08, f * 1.5)); }
  lose() { this.blip(200, 0.18, "square", 0.06, 70); }
  bust() { this.blip(150, 0.3, "sawtooth", 0.09, 50); }
  cash() { this.blip(880, 0.14, "triangle", 0.07, 1320); }
}

let _sfx: Sfx | null = null;
export function getSfx(): Sfx { if (!_sfx) _sfx = new Sfx(); return _sfx; }
