"use client";

import { useEffect, useState } from "react";

interface LiveReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  author: string;
}

export default function LiveReviews({ slug }: { slug: string }) {
  const [reviews, setReviews] = useState<LiveReview[]>([]);

  useEffect(() => {
    fetch(`/api/reviews?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : { reviews: [] }))
      .then((d) => setReviews(d.reviews ?? []))
      .catch(() => {});
  }, [slug]);

  if (reviews.length === 0) return null;

  return (
    <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
      <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--accent)" }}>
        Verified bookings
      </p>
      {reviews.map((r) => (
        <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{r.author}</strong>
            <span style={{ color: "var(--accent)" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
          </div>
          {r.comment && <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>{r.comment}</p>}
          <p style={{ color: "var(--faint)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
            {new Date(r.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
          </p>
        </div>
      ))}
    </div>
  );
}
