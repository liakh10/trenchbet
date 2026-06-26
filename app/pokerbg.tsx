"use client";

import { useEffect, useRef } from "react";

// Animated blurred poker-table background: green felt + drifting chips & cards.
export function PokerBg({ blur = 7, dim = 0.55 }: { blur?: number; dim?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!; const ctx = canvas.getContext("2d")!;
    const chipCols = ["#f5c542", "#e6356f", "#39d98a", "#19e0ff", "#a06bff", "#ffffff"];
    interface E { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; kind: "chip" | "card"; col: string; }
    let items: E[] = [];
    function resize() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const n = Math.round((canvas.width * canvas.height) / 90000);
      items = Array.from({ length: Math.min(40, Math.max(14, n)) }, () => {
        const card = Math.random() < 0.28;
        return { x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16, r: card ? 22 + Math.random() * 16 : 14 + Math.random() * 16, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.6, kind: card ? "card" : "chip", col: chipCols[(Math.random() * chipCols.length) | 0] };
      });
    }
    resize(); window.addEventListener("resize", resize);

    let raf = 0; let last = performance.now();
    function draw() {
      const now = performance.now(); const dt = Math.min((now - last) / 1000, 0.05); last = now;
      const W = canvas.width, H = canvas.height;
      // felt table
      ctx.fillStyle = "#0a0712"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, Math.max(W, H) * 0.6);
      g.addColorStop(0, "#1f6b46"); g.addColorStop(0.55, "#124a30"); g.addColorStop(1, "#0a0712");
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.46, H * 0.42, 0, 0, 6.28); ctx.fill();
      ctx.strokeStyle = "#3a2a18"; ctx.lineWidth = 26; ctx.beginPath(); ctx.ellipse(cx, cy, W * 0.46, H * 0.42, 0, 0, 6.28); ctx.stroke();

      for (const e of items) {
        e.x += e.vx * dt; e.y += e.vy * dt; e.rot += e.vr * dt;
        if (e.x < -40) e.x = W + 40; if (e.x > W + 40) e.x = -40; if (e.y < -40) e.y = H + 40; if (e.y > H + 40) e.y = -40;
        ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.rot);
        if (e.kind === "chip") {
          ctx.fillStyle = e.col; ctx.beginPath(); ctx.arc(0, 0, e.r, 0, 6.28); ctx.fill();
          ctx.fillStyle = "rgba(255,255,255,0.85)"; for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate((i / 6) * 6.28); ctx.fillRect(-3, -e.r, 6, e.r * 0.34); ctx.restore(); }
          ctx.fillStyle = "rgba(0,0,0,0.25)"; ctx.beginPath(); ctx.arc(0, 0, e.r * 0.6, 0, 6.28); ctx.fill();
        } else {
          ctx.fillStyle = "#f5f3ff"; const w = e.r * 0.72, h = e.r; ctx.fillRect(-w / 2, -h / 2, w, h);
          ctx.fillStyle = Math.random() < 0.5 ? "#e6356f" : "#1a1230"; ctx.beginPath(); ctx.arc(0, -h * 0.12, w * 0.22, 0, 6.28); ctx.fill();
        }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={ref} style={{ width: "100%", height: "100%", filter: `blur(${blur}px) saturate(1.1)` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(7,6,13,${dim * 0.5}) 0%, rgba(7,6,13,${dim}) 70%, rgba(7,6,13,0.96) 100%)` }} />
    </div>
  );
}
