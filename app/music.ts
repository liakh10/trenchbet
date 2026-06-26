// Original procedural casino-lounge music (WebAudio). Smooth, jazzy-electro.
// No external assets, no copyrighted melodies.

interface Track { name: string; bpm: number; chords: number[][]; }

const TRACKS: Track[] = [
  { name: "VELVET ROOM", bpm: 92, chords: [[57, 60, 64, 67], [55, 59, 62, 65], [53, 57, 60, 64], [52, 55, 59, 62]] },
  { name: "HIGH ROLLER", bpm: 104, chords: [[60, 64, 67, 71], [57, 60, 64, 67], [62, 65, 69, 72], [55, 59, 62, 65]] },
  { name: "MIDNIGHT CHIPS", bpm: 86, chords: [[50, 53, 57, 60], [55, 58, 62, 65], [53, 57, 60, 64], [48, 52, 55, 59]] },
];

function mtof(m: number) { return 440 * Math.pow(2, (m - 69) / 12); }

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private timer: number | null = null;
  private step = 0; private nextTime = 0;
  trackIndex = 0; playing = false; volume = 0.34; muted = false;

  get trackName() { return TRACKS[this.trackIndex].name; }

  private ensure() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      const comp = this.ctx.createDynamicsCompressor();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(comp); comp.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 0.3; this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch { /* */ }
  }

  play() { this.ensure(); if (!this.ctx) return; this.ctx.resume(); if (this.playing) return; this.playing = true; this.step = 0; this.nextTime = this.ctx.currentTime + 0.08; this.timer = window.setInterval(() => this.sched(), 25); }
  pause() { this.playing = false; if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  toggle() { this.playing ? this.pause() : this.play(); }
  next() { this.trackIndex = (this.trackIndex + 1) % TRACKS.length; if (this.playing) { this.pause(); this.step = 0; this.play(); } }
  setMuted(m: boolean) { this.muted = m; if (this.master && this.ctx) this.master.gain.setValueAtTime(m ? 0 : this.volume, this.ctx.currentTime); }

  private sched() {
    if (!this.ctx) return;
    const spb = 60 / TRACKS[this.trackIndex].bpm / 2;
    while (this.nextTime < this.ctx.currentTime + 0.2) { this.tick(this.step, this.nextTime); this.step++; this.nextTime += spb; }
  }

  private tick(step: number, t: number) {
    const tr = TRACKS[this.trackIndex]; const ch = tr.chords; const bar = Math.floor(step / 8) % ch.length; const chord = ch[bar]; const s = step % 8;
    // walking bass
    if (s % 2 === 0) this.osc("triangle", mtof(chord[0] - 24), t, 0.3, 0.22, 700);
    // jazzy electric piano arp
    this.osc("sine", mtof(chord[s % chord.length] + 12), t, 0.22, 0.08, 2400);
    // soft pad chord each bar
    if (s === 0) for (const n of chord) this.osc("triangle", mtof(n), t, (60 / tr.bpm) * 2, 0.04, 1500);
    // brushed drums
    if (s === 0 || s === 4) this.kick(t);
    if (s === 4) this.snare(t);
    this.hat(t, s % 2 === 0 ? 0.03 : 0.05);
  }

  private osc(type: OscillatorType, f: number, t: number, dur: number, peak: number, filt: number) {
    if (!this.ctx || !this.master) return;
    const o = this.ctx.createOscillator(); o.type = type; o.frequency.value = f;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const fl = this.ctx.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = filt;
    o.connect(fl); fl.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.03);
  }
  private kick(t: number) { if (!this.ctx || !this.master) return; const o = this.ctx.createOscillator(); o.type = "sine"; const g = this.ctx.createGain(); o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + 0.11); g.gain.setValueAtTime(0.42, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.18); }
  private snare(t: number) { this.burst(t, 0.14, 1500, 0.16); }
  private hat(t: number, peak: number) { this.burst(t, 0.03, 8000, peak); }
  private burst(t: number, dur: number, filt: number, peak: number) { if (!this.ctx || !this.master || !this.noise) return; const s = this.ctx.createBufferSource(); s.buffer = this.noise; const f = this.ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = filt; const g = this.ctx.createGain(); g.gain.setValueAtTime(peak, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(this.master); s.start(t); s.stop(t + dur + 0.02); }

  dispose() { this.pause(); try { this.ctx?.close(); } catch { /* */ } this.ctx = null; }
}
