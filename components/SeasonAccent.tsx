"use client";

import { useEffect } from "react";
import { loadProfile, PALETTES } from "@/lib/profile";

/**
 * The atelier is monochrome until it knows your colours. Once a visitor has a
 * saved colour season, their palette's signature hue becomes the live accent
 * across the whole system — so the interface quietly "wears" their colours.
 */
export default function SeasonAccent() {
  useEffect(() => {
    const apply = () => {
      try {
        const season = loadProfile().season;
        const root = document.documentElement;
        if (season) {
          const palette = PALETTES[season];
          const hue = palette.bestColors[0]?.hex ?? null;
          if (hue) {
            root.style.setProperty("--accent", hue);
            root.style.setProperty("--accent-soft", `${hue}1f`);
          }
        } else {
          root.style.removeProperty("--accent");
          root.style.removeProperty("--accent-soft");
        }
      } catch {
        /* no-op */
      }
    };
    apply();
    // React to quiz results saved in this tab or another.
    window.addEventListener("focus", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("focus", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return null;
}
