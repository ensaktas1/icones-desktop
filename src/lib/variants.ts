// Detect style/size "variants" within a collection from icon-name suffixes,
// the same idea icones surfaces (Filled / Regular / Outline / sizes, ...).

export interface Variant {
  token: string;
  label: string;
  count: number;
}

// Recurring style words that show up as name segments across icon sets.
const STYLE_TOKENS = new Set([
  "filled", "fill", "regular", "outline", "outlined", "bold", "solid",
  "line", "linear", "broken", "duotone", "twotone", "sharp", "round",
  "rounded", "thin", "light", "extralight", "medium", "semibold", "black",
  "mono", "color", "colored", "flat", "gradient", "stroke", "curved",
]);

// Real icon sizes are 2–3 digit values (10, 12, 16, 24, 48…). Single digits like
// the "2" in "columns-2" are name parts, not size variants.
const isSize = (t: string) => /^\d{2,3}$/.test(t) && +t >= 8 && +t <= 512;

function nameOf(full: string): string {
  const i = full.indexOf(":");
  return i === -1 ? full : full.slice(i + 1);
}

// The last two dash-segments are where variant info lives (e.g. "…-24-filled").
function candidateSegments(full: string): string[] {
  const segs = nameOf(full).split("-");
  return [segs[segs.length - 1], segs[segs.length - 2]].filter(Boolean) as string[];
}

const titleCase = (t: string) => (isSize(t) ? t : t.charAt(0).toUpperCase() + t.slice(1));

export function detectVariants(names: string[]): Variant[] {
  const total = names.length;
  if (total < 12) return [];

  const counts = new Map<string, number>();
  for (const full of names) {
    for (const seg of new Set(candidateSegments(full))) {
      if (STYLE_TOKENS.has(seg) || isSize(seg)) {
        counts.set(seg, (counts.get(seg) ?? 0) + 1);
      }
    }
  }

  const min = Math.max(5, Math.floor(total * 0.03));
  const max = total * 0.97; // ~everything means it's a base, not a variant
  const variants = [...counts.entries()]
    .filter(([, n]) => n >= min && n <= max)
    .map(([token, count]) => ({ token, count, label: titleCase(token) }));

  if (variants.length === 0) return [];

  // Style words first (by frequency), then sizes ascending — mirrors icones.
  variants.sort((a, b) => {
    const as = isSize(a.token);
    const bs = isSize(b.token);
    if (as !== bs) return as ? 1 : -1;
    if (as && bs) return Number(a.token) - Number(b.token);
    return b.count - a.count;
  });

  return variants.slice(0, 24);
}

export function matchesVariant(full: string, token: string): boolean {
  return candidateSegments(full).includes(token);
}
