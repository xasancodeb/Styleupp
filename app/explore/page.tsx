"use client";

import { useMemo, useState } from "react";
import { STYLISTS, SPECIALTIES, SESSION_TYPES, type SessionType } from "@/lib/data";
import StylistCard from "@/components/StylistCard";

const PRICE_BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under £90", min: 0, max: 90 },
  { label: "£90–£110", min: 90, max: 110 },
  { label: "£110+", min: 110, max: Infinity },
];

export default function ExplorePage() {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [session, setSession] = useState<SessionType | null>(null);
  const [priceBand, setPriceBand] = useState(0);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const band = PRICE_BANDS[priceBand];
    return STYLISTS.filter((s) => {
      if (specialty && !s.specialties.includes(specialty)) return false;
      if (session && !s.sessionTypes.includes(session)) return false;
      if (s.startingPrice < band.min || s.startingPrice > band.max) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${s.name} ${s.city} ${s.country} ${s.tagline} ${s.specialties.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [specialty, session, priceBand, query]);

  const clear = () => {
    setSpecialty(null);
    setSession(null);
    setPriceBand(0);
    setQuery("");
  };

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 2rem" }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>
        Find your stylist
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 600 }}>
        Browse our global roster of vetted personal stylists. Filter by specialty, session type and
        budget to find your perfect match.
      </p>

      <div className="card" style={{ padding: "1.5rem", marginTop: "1.75rem", display: "grid", gap: "1.25rem" }}>
        <input
          className="input"
          placeholder="Search by name, city or specialty…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Specialty</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                className="tag-toggle"
                data-active={specialty === s}
                onClick={() => setSpecialty(specialty === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Session type</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {SESSION_TYPES.map((s) => (
                <button
                  key={s.value}
                  className="tag-toggle"
                  data-active={session === s.value}
                  onClick={() => setSession(session === s.value ? null : s.value)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Budget</label>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              {PRICE_BANDS.map((b, i) => (
                <button
                  key={b.label}
                  className="tag-toggle"
                  data-active={priceBand === i}
                  onClick={() => setPriceBand(i)}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "1.75rem 0 1rem",
        }}
      >
        <p style={{ color: "var(--dim)", fontWeight: 600 }}>
          {results.length} stylist{results.length === 1 ? "" : "s"}
        </p>
        <button onClick={clear} className="btn btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
          Clear filters
        </button>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--dim)" }}>
          No stylists match those filters yet. Try widening your search.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {results.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} />
          ))}
        </div>
      )}
    </div>
  );
}
