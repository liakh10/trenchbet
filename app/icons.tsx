"use client";

// Custom vector game logos (no emojis).
export function GameLogo({ id, size = 56, color = "#f5c542" }: { id: string; size?: number; color?: string }) {
  const c = color;
  const s = { width: size, height: size, display: "block" } as const;
  if (id === "poker") return (
    <svg viewBox="0 0 48 48" style={s}>
      <g transform="rotate(-12 24 26)"><rect x="8" y="12" width="20" height="28" rx="3" fill="#fff" stroke="#1a1230" strokeWidth="1.5" /><path d="M18 18l5 7-5 6-5-6z" fill="#e6356f" /></g>
      <g transform="rotate(12 24 26)"><rect x="20" y="12" width="20" height="28" rx="3" fill="#fff" stroke="#1a1230" strokeWidth="1.5" /><path d="M30 19c3 3 6 4 6 8a3 3 0 0 1-6 0 3 3 0 0 1-6 0c0-4 3-5 6-8z" fill="#1a1230" /><rect x="29" y="29" width="2" height="6" fill="#1a1230" /></g>
    </svg>
  );
  if (id === "plinko") return (
    <svg viewBox="0 0 48 48" style={s}>
      {[[24, 12], [18, 22], [30, 22], [12, 32], [24, 32], [36, 32]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.4" fill={c} opacity="0.85" />)}
      <circle cx="24" cy="7" r="4" fill={c} stroke="#fff3b0" strokeWidth="1" />
      <rect x="8" y="38" width="8" height="6" rx="1" fill={c} opacity="0.5" /><rect x="20" y="38" width="8" height="6" rx="1" fill={c} /><rect x="32" y="38" width="8" height="6" rx="1" fill={c} opacity="0.5" />
    </svg>
  );
  if (id === "crash") return (
    <svg viewBox="0 0 48 48" style={s}>
      <polyline points="6,40 16,34 22,38 32,20 40,10" fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M40 10l-7 1 4 5z" fill={c} /><circle cx="40" cy="10" r="2.5" fill="#fff3b0" />
    </svg>
  );
  if (id === "mines") return (
    <svg viewBox="0 0 48 48" style={s}>
      <circle cx="24" cy="28" r="13" fill="#15131f" stroke={c} strokeWidth="2" /><circle cx="19" cy="23" r="3" fill="#fff" opacity="0.4" />
      <rect x="22" y="9" width="4" height="7" rx="1" fill={c} transform="rotate(30 24 12)" /><circle cx="30" cy="9" r="2.5" fill="#ffd23d" /><circle cx="33" cy="6" r="1.5" fill="#fff" />
    </svg>
  );
  if (id === "slots") return (
    <svg viewBox="0 0 48 48" style={s}>
      <rect x="5" y="14" width="38" height="22" rx="4" fill="#15131f" stroke={c} strokeWidth="2" />
      {[10, 20, 30].map((x, i) => <g key={i}><rect x={x} y="18" width="8" height="14" rx="2" fill="#0d0b1c" stroke="#2a2440" strokeWidth="1" /><rect x={x + 1.5} y={i === 1 ? 22 : 24} width="5" height="3" rx="1" fill={c} /></g>)}
      <rect x="22" y="8" width="4" height="6" fill={c} /><circle cx="24" cy="7" r="3" fill={c} />
    </svg>
  );
  if (id === "coinflip") return (
    <svg viewBox="0 0 48 48" style={s}>
      <ellipse cx="24" cy="24" rx="14" ry="14" fill="url(#g)" stroke="#fff3b0" strokeWidth="2" />
      <defs><radialGradient id="g" cx="0.35" cy="0.3"><stop offset="0" stopColor="#ffe79a" /><stop offset="0.6" stopColor={c} /><stop offset="1" stopColor="#b9851f" /></radialGradient></defs>
      <text x="24" y="30" textAnchor="middle" fontSize="16" fontWeight="900" fill="#7a5400">$</text>
      <path d="M9 14a18 18 0 0 1 6-6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.6" /><path d="M39 34a18 18 0 0 1-6 6" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
  return <svg viewBox="0 0 48 48" style={s}><circle cx="24" cy="24" r="12" fill={c} /></svg>;
}
