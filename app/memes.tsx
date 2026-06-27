"use client";

// Meme "trenchers" that sit at the poker table. Each avatar is hand-drawn SVG
// so it stays crisp at any size and ships no binary assets.

export interface Meme { id: string; name: string; color: string; }

export const MEMES: Meme[] = [
  { id: "troll", name: "Trollface", color: "#e6e6e6" },
  { id: "wojak", name: "Wojak", color: "#e9d8c6" },
  { id: "pepe", name: "Pepe", color: "#5fae4e" },
  { id: "doge", name: "Doge", color: "#e2ad5e" },
  { id: "chad", name: "Gigachad", color: "#c4c4c4" },
  { id: "pump", name: "Pumpius", color: "#f5c542" },
  { id: "popcat", name: "Popcat", color: "#f1f1f1" },
  { id: "wif", name: "dogwifhat", color: "#dcb98c" },
];

export const memeByName = new Map(MEMES.map((m) => [m.name, m]));

export function randomMemes(n: number, exclude: string[] = []): Meme[] {
  const pool = MEMES.filter((m) => !exclude.includes(m.id));
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
}

function Face({ id }: { id: string }) {
  switch (id) {
    case "troll":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#ededed" />
          <ellipse cx="50" cy="52" rx="40" ry="44" fill="#f4f4f4" />
          {/* squinty eyes */}
          <path d="M24 40 Q34 32 44 40" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M56 40 Q66 32 76 40" stroke="#111" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* the iconic wide grin */}
          <path d="M18 58 Q50 96 82 58 Q50 74 18 58 Z" fill="#fff" stroke="#111" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M30 63 V72 M42 66 V77 M58 66 V77 M70 63 V72" stroke="#111" strokeWidth="2.4" />
        </g>
      );
    case "wojak":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#dfe7ef" />
          <ellipse cx="50" cy="56" rx="34" ry="40" fill="#ead7c4" />
          <path d="M16 56 a6 9 0 0 0 0 6" fill="#ead7c4" />
          {/* simple line features */}
          <circle cx="38" cy="50" r="2.6" fill="#3a2f28" />
          <circle cx="62" cy="50" r="2.6" fill="#3a2f28" />
          <path d="M44 58 Q50 63 56 58" stroke="#3a2f28" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 74 Q50 70 60 74" stroke="#7a5b48" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
      );
    case "pepe":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#4f9a40" />
          <ellipse cx="50" cy="56" rx="42" ry="40" fill="#6cb157" />
          {/* big bulging eyes */}
          <circle cx="33" cy="36" r="14" fill="#fff" stroke="#2f5d26" strokeWidth="2.5" />
          <circle cx="67" cy="36" r="14" fill="#fff" stroke="#2f5d26" strokeWidth="2.5" />
          <circle cx="36" cy="40" r="4.5" fill="#1a1a1a" />
          <circle cx="64" cy="40" r="4.5" fill="#1a1a1a" />
          {/* wide froggy mouth */}
          <path d="M20 64 Q50 84 80 64" stroke="#b8556a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M40 50 h6 M54 50 h6" stroke="#2f5d26" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "doge":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#caa15a" />
          <ellipse cx="50" cy="54" rx="40" ry="40" fill="#e6bd76" />
          {/* ears */}
          <path d="M16 26 L30 16 L32 38 Z" fill="#caa15a" />
          <path d="M84 26 L70 16 L68 38 Z" fill="#caa15a" />
          {/* muzzle */}
          <ellipse cx="50" cy="66" rx="22" ry="18" fill="#f3dcae" />
          <circle cx="38" cy="46" r="3.4" fill="#2a2018" />
          <circle cx="62" cy="46" r="3.4" fill="#2a2018" />
          <ellipse cx="50" cy="60" rx="5" ry="3.6" fill="#2a2018" />
          <path d="M50 64 V72 M50 70 Q42 74 38 70 M50 70 Q58 74 62 70" stroke="#7a5a32" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "chad":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#bdbdbd" />
          {/* angular jaw */}
          <path d="M22 30 L78 30 L72 70 L50 92 L28 70 Z" fill="#d2cabf" />
          <path d="M22 30 L50 24 L78 30 L50 36 Z" fill="#8c8c8c" />
          {/* shades */}
          <rect x="26" y="44" width="20" height="9" rx="3" fill="#15151a" />
          <rect x="54" y="44" width="20" height="9" rx="3" fill="#15151a" />
          <rect x="46" y="47" width="8" height="3" fill="#15151a" />
          {/* stubble + stern mouth */}
          <path d="M40 74 H60" stroke="#3a342c" strokeWidth="3" strokeLinecap="round" />
          <g fill="#6b6258"><circle cx="36" cy="70" r="1" /><circle cx="44" cy="74" r="1" /><circle cx="56" cy="74" r="1" /><circle cx="64" cy="70" r="1" /></g>
        </g>
      );
    case "pump":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#2a210a" />
          {/* gold capsule mascot */}
          <rect x="32" y="14" width="36" height="72" rx="18" fill="#f5c542" stroke="#c8902a" strokeWidth="3" />
          <rect x="32" y="14" width="36" height="34" rx="18" fill="#ffe07a" opacity="0.6" />
          {/* cartoon face */}
          <circle cx="43" cy="46" r="6.5" fill="#fff" /><circle cx="44.5" cy="47" r="3" fill="#1a1a1a" />
          <circle cx="59" cy="46" r="6.5" fill="#fff" /><circle cx="60.5" cy="47" r="3" fill="#1a1a1a" />
          <path d="M40 60 Q50 70 60 60" stroke="#7a4a00" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </g>
      );
    case "popcat":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#e9e9e9" />
          {/* ears */}
          <path d="M20 14 L40 36 L18 40 Z" fill="#f4f4f4" stroke="#c9c9c9" strokeWidth="2" />
          <path d="M80 14 L60 36 L82 40 Z" fill="#f4f4f4" stroke="#c9c9c9" strokeWidth="2" />
          <ellipse cx="50" cy="52" rx="38" ry="36" fill="#fbfbfb" />
          <circle cx="37" cy="44" r="3.4" fill="#222" />
          <circle cx="63" cy="44" r="3.4" fill="#222" />
          {/* the open "pop" mouth */}
          <ellipse cx="50" cy="68" rx="13" ry="16" fill="#1b1b1b" />
          <ellipse cx="50" cy="62" rx="6" ry="4" fill="#e0566f" />
        </g>
      );
    case "wif":
      return (
        <g>
          <rect x="0" y="0" width="100" height="100" fill="#c89a64" />
          <ellipse cx="50" cy="60" rx="38" ry="36" fill="#e3c293" />
          <ellipse cx="50" cy="70" rx="20" ry="15" fill="#f5e6cc" />
          <circle cx="38" cy="56" r="3.2" fill="#2a2018" />
          <circle cx="62" cy="56" r="3.2" fill="#2a2018" />
          <ellipse cx="50" cy="66" rx="4.2" ry="3" fill="#2a2018" />
          {/* knitted beanie */}
          <path d="M14 40 Q50 6 86 40 Q50 30 14 40 Z" fill="#d98fb0" />
          <path d="M14 40 Q50 30 86 40 L84 46 Q50 38 16 46 Z" fill="#c2789a" />
          <path d="M26 36 V30 M40 31 V25 M54 31 V25 M68 36 V30" stroke="#b06088" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    default:
      return <rect x="0" y="0" width="100" height="100" fill="#333" />;
  }
}

export function MemeAvatar({ id, size = 44, ring }: { id: string; size?: number; ring?: string }) {
  const m = MEMES.find((x) => x.id === id);
  const cid = `clip-${id}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <clipPath id={cid}><circle cx="50" cy="50" r="48" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="49" fill="#0d0b1c" />
      <g clipPath={`url(#${cid})`}><Face id={id} /></g>
      <circle cx="50" cy="50" r="47" fill="none" stroke={ring ?? m?.color ?? "#2a2440"} strokeWidth="4" opacity="0.9" />
    </svg>
  );
}
