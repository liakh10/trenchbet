// Trenchers — Solana memecoin traders. Used as opponent names across games.
// Nicknames only, no emojis (as on the user's screenshots).
export const TRENCHERS: string[] = [
  "Sting", "ParsiiX", "gasp", "Big Bot", "Bot2", "69 Bot", "Qavec", "tdmilky",
  "Chester", "vein", "CryptoSamet", "milito", "Limfork", "dddemonology", "iceman", "Lyxe",
  "Pandora", "Noir", "Samsrep", "Cented", "decu", "lspfi", "clukz", "Radiance",
  "Ramset", "Silver", "Trenchman", "blu6k", "Fozzy", "Cupsey", "chingchongslayer",
  "Publix", "Solstice", "yode", "1s1mple", "Trollz", "Mezo", "Casino", "Groovy", "Euris",
];

export function randomTrenchers(n: number, exclude: string[] = []): string[] {
  const pool = TRENCHERS.filter((t) => !exclude.includes(t));
  for (let i = pool.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
}
