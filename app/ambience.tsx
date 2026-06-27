"use client";

import { useState } from "react";

// Reusable cinematic atmosphere: central spotlight, slow god-ray sweep,
// drifting dust motes, film grain and a vignette. pointer-events-none.
const GRAIN = "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>`
);

export function CasinoAmbience({ spot = "#1f7a4e", glow = "#f5c542", intensity = 1 }: { spot?: string; glow?: string; intensity?: number }) {
  const [dust] = useState(() => Array.from({ length: 26 }, (_, i) => ({
    id: i, x: Math.random() * 100, size: 1 + Math.random() * 3, dur: 14 + Math.random() * 18, delay: -Math.random() * 30, o: 0.15 + Math.random() * 0.4,
  })));
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* central spotlight */}
      <div className="absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 42%, ${spot}22 0%, transparent 60%)`, opacity: intensity }} />
      {/* slow god-ray sweep */}
      <div className="absolute light-sweep" style={{ left: "50%", top: "40%", width: "160vmax", height: "160vmax", background: `conic-gradient(from 0deg, transparent 0deg, ${glow}0f 14deg, transparent 30deg, transparent 180deg, ${glow}0a 196deg, transparent 212deg)`, opacity: 0.7 * intensity }} />
      {/* dust motes */}
      {dust.map((d) => (
        <div key={d.id} className="dust absolute rounded-full" style={{ left: `${d.x}%`, bottom: -10, width: d.size, height: d.size, background: "#fff", ["--o" as string]: d.o, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`, boxShadow: `0 0 6px ${glow}88` }} />
      ))}
      {/* film grain */}
      <div className="absolute grain" style={{ inset: "-10%", backgroundImage: `url("${GRAIN}")`, backgroundSize: "200px 200px", opacity: 0.05 * intensity, mixBlendMode: "overlay" }} />
      {/* vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, rgba(4,3,10,0.55) 100%)" }} />
    </div>
  );
}
