"use client";

import { useEffect, useState } from "react";

export default function SaveStylistButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/saved-stylists")
      .then((r) => (r.ok ? r.json() : { saved: [] }))
      .then((d: { saved?: string[] }) => setSaved((d.saved ?? []).includes(slug)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, [slug]);

  async function toggle() {
    if (saved) {
      await fetch(`/api/saved-stylists?slug=${slug}`, { method: "DELETE" });
      setSaved(false);
    } else {
      const res = await fetch("/api/saved-stylists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stylistSlug: slug }),
      });
      if (res.status === 401) {
        window.location.href = `/auth/login?next=/stylist/${slug}`;
        return;
      }
      setSaved(true);
    }
  }

  return (
    <button onClick={toggle} className="btn btn-outline" style={{ width: "100%", marginTop: "0.6rem", opacity: ready ? 1 : 0.6 }}>
      {saved ? "♥ Saved" : "♡ Save stylist"}
    </button>
  );
}
