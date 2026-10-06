"use client";

import { useEffect } from "react";
import { loadProfile, PALETTES } from "@/lib/profile";
import { ensureContrast } from "@/lib/color";

/**
 * The season takeover.
 *
 * Once someone knows their colour season, StyleUp wears it: the accent that
 * runs through the whole site becomes a colour from their own palette. This
 * is the one thing here that no other styling site does, and the quiz has
 * always promised it.
 *
 * Two things keep it from being a gimmick:
 *
 *  - Legibility. A palette is picked to flatter a face, not to be read on a
 *    page, so the hue is kept and the lightness is lowered until it clears
 *    WCAG AA against the background (see lib/color.ts). Autumn and Winter
 *    pass untouched; Spring's coral simply deepens.
 *  - Consent. It can be switched off in the fitting room, and the choice is
 *    remembered.
 *
 * The resolved colour is cached under ACCENT_KEY so the inline script in the
 * root layout can paint it before first paint, with no violet-to-coral flash.
 */
export const ACCENT_KEY = "styleup.accent";

/** Brand default, used whenever there's no season or the takeover is off. */
const BRAND = "#6c4cf0";
const BRAND_2 = "#9b7bff";

export default function SeasonAccent() {
  useEffect(() => {
    const apply = () => {
      try {
        const profile = loadProfile();
        const root = document.documentElement;
        const palette = profile.season ? PALETTES[profile.season] : null;
        const on = palette && profile.wearColors !== false;

        if (on && palette) {
          // The signature hue, deepened only as far as legibility requires.
          const accent = ensureContrast(palette.bestColors[0].hex, "#ffffff", 4.5);
          // The companion is decorative (gradients only), so it needs less.
          const second = palette.bestColors[1]?.hex ?? palette.bestColors[0].hex;
          const accent2 = ensureContrast(second, "#ffffff", 3);

          root.style.setProperty("--accent", accent);
          root.style.setProperty("--accent-2", accent2);
          root.style.setProperty("--season", palette.bestColors[0].hex);
          root.dataset.season = profile.season ?? "";
          window.localStorage.setItem(ACCENT_KEY, JSON.stringify([accent, accent2]));
        } else {
          root.style.setProperty("--accent", BRAND);
          root.style.setProperty("--accent-2", BRAND_2);
          root.style.removeProperty("--season");
          delete root.dataset.season;
          window.localStorage.removeItem(ACCENT_KEY);
        }
      } catch {
        /* localStorage can be unavailable; the brand default already applies. */
      }
    };

    apply();
    // Re-read when the visitor returns, or changes it in another tab, and when
    // the quiz writes a new result in this one.
    window.addEventListener("focus", apply);
    window.addEventListener("storage", apply);
    window.addEventListener("styleup:season", apply);
    return () => {
      window.removeEventListener("focus", apply);
      window.removeEventListener("storage", apply);
      window.removeEventListener("styleup:season", apply);
    };
  }, []);

  return null;
}

/** Tell the running page that the season changed, without a reload. */
export function announceSeasonChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("styleup:season"));
}
