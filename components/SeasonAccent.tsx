"use client";

import { useEffect } from "react";
import { loadProfile, PALETTES } from "@/lib/profile";

/**
 * StyleUp starts in its default lilac glow until it knows your colours. Once a
 * visitor has a saved colour season, their palette's two signature hues become
 * the live accent gradient across the whole system — the mesh, glass glow and
 * controls — so the interface literally "wears" their colours.
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
          const hue2 = palette.bestColors[2]?.hex ?? palette.bestColors[1]?.hex ?? hue;
          if (hue) {
            root.style.setProperty("--accent", hue);
            root.style.setProperty("--accent-2", hue2 ?? hue);
            root.style.setProperty("--accent-soft", `${hue}24`);
          }
        } else {
          root.style.removeProperty("--accent");
          root.style.removeProperty("--accent-2");
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
