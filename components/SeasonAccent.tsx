"use client";

import { useEffect } from "react";
import { loadProfile, PALETTES } from "@/lib/profile";

/**
 * Publishes the visitor's colour season as CSS variables (--season and
 * --season-soft) once they have taken the quiz. Colour-tool surfaces can use
 * these; brand chrome never does, so the site's identity stays consistent
 * no matter what palette a visitor lands on.
 */
export default function SeasonAccent() {
  useEffect(() => {
    const apply = () => {
      try {
        const season = loadProfile().season;
        const root = document.documentElement;
        if (season) {
          const hue = PALETTES[season].bestColors[0]?.hex;
          if (hue) {
            root.style.setProperty("--season", hue);
            root.style.setProperty("--season-soft", `${hue}22`);
          }
        } else {
          root.style.removeProperty("--season");
          root.style.removeProperty("--season-soft");
        }
      } catch {
        /* no-op */
      }
    };
    apply();
    window.addEventListener("focus", apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener("focus", apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  return null;
}
