// Initials avatar tints from the home team (Figma 60:13999): the colour at 15% behind initials in
// the full colour. Picked from the name so a person keeps their colour everywhere.
export const AVATAR_TINTS = [
  "bg-event-purple/15 text-event-purple",
  "bg-event-blue/15 text-event-blue",
  "bg-avatar-emerald/15 text-avatar-emerald",
  "bg-warning/15 text-warning",
  "bg-info-500/15 text-info-500",
  "bg-avatar-rose/15 text-avatar-rose",
  "bg-progress-500/15 text-progress-500",
  "bg-slate-500/15 text-slate-500",
];

export function avatarTint(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
