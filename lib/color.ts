/**
 * Colour maths for the season takeover.
 *
 * Once someone knows their season, the site wears their palette. The problem
 * is that a palette is chosen to flatter a face, not to be legible on paper:
 * Spring's Golden Yellow (#FFC75F) sits at about 1.7:1 against our ivory
 * background, so used raw as a text colour it is effectively invisible.
 *
 * So we keep the hue, which is the part that belongs to the visitor, and move
 * only the lightness until the colour clears a contrast threshold. Coral stays
 * recognisably coral; it just gets deep enough to read.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** WCAG relative luminance. */
export function luminance({ r, g, b }: Rgb): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG contrast ratio between two colours, 1 (identical) to 21 (black/white). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// ───────────────────────────── HSL conversion ──────────────────────────────
// Lightness is the only channel we touch, so hue and saturation survive intact.

interface Hsl {
  h: number;
  s: number;
  l: number;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  if (s === 0) {
    const v = l * 255;
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const toChannel = (t: number) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return {
    r: toChannel(h + 1 / 3) * 255,
    g: toChannel(h) * 255,
    b: toChannel(h - 1 / 3) * 255,
  };
}

/**
 * Darken `hex` just enough to reach `minRatio` against `bg`, keeping its hue.
 * Returns the original when it already passes, and gives up gracefully at
 * black rather than looping forever on an impossible target.
 */
export function ensureContrast(hex: string, bg: string, minRatio = 4.5): string {
  const colour = hexToRgb(hex);
  const background = hexToRgb(bg);
  if (!colour || !background) return hex;
  if (contrastRatio(colour, background) >= minRatio) return hex;

  const { h, s } = rgbToHsl(colour);
  let { l } = rgbToHsl(colour);

  // 1% steps: fine enough that the result never looks stepped, and bounded.
  for (let i = 0; i < 100 && l > 0; i += 1) {
    l = Math.max(0, l - 0.01);
    const candidate = hslToRgb({ h, s, l });
    if (contrastRatio(candidate, background) >= minRatio) return rgbToHex(candidate);
  }
  return "#000000";
}

/**
 * The colour a season should actually wear as the site's accent: the most
 * characteristic hue in the palette, deepened until it is legible.
 */
export function accentFromPalette(hexes: string[], bg = "#ffffff"): string | null {
  const first = hexes.find((h) => hexToRgb(h));
  return first ? ensureContrast(first, bg, 4.5) : null;
}
