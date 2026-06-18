"use client";

import { useEffect, useState } from "react";

// Shared, memoised fetch so a grid of cards makes a single request.
let cache: { at: number; slugs: Set<string> } | null = null;
const listeners = new Set<() => void>();

async function loadSaved(force = false): Promise<Set<string>> {
  if (!force && cache && Date.now() - cache.at < 30000) return cache.slugs;
  try {
    const res = await fetch("/api/saved-stylists");
    if (!res.ok) {
      cache = { at: Date.now(), slugs: new Set() };
      return cache.slugs;
    }
    const data = await res.json();
    cache = { at: Date.now(), slugs: new Set<string>(data.saved ?? []) };
  } catch {
    cache = { at: Date.now(), slugs: new Set() };
  }
  listeners.forEach((l) => l());
  return cache.slugs;
}

export default function SaveHeart({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = () => active && setSaved(Boolean(cache?.slugs.has(slug)));
    listeners.add(sync);
    loadSaved().then(() => active && setSaved(Boolean(cache?.slugs.has(slug))));
    return () => {
      active = false;
      listeners.delete(sync);
    };
  }, [slug]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      await fetch(`/api/saved-stylists?slug=${slug}`, { method: "DELETE" });
      cache?.slugs.delete(slug);
      setSaved(false);
    } else {
      const res = await fetch("/api/saved-stylists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stylistSlug: slug }),
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?next=/explore`;
        return;
      }
      cache?.slugs.add(slug);
      setSaved(true);
    }
    listeners.forEach((l) => l());
  }

  return (
    <button
      onClick={toggle}
      aria-label={saved ? "Remove from saved" : "Save stylist"}
      title={saved ? "Saved" : "Save stylist"}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 4,
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "none",
        cursor: "pointer",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(4px)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: "1rem",
        lineHeight: 1,
        color: saved ? "#b3261e" : "var(--dim)",
      }}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
