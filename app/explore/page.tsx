"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { STYLISTS, SPECIALTIES, SESSION_TYPES, type SessionType } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import { loadProfile, PALETTES, type ColorSeason } from "@/lib/profile";

const PRICE_BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under £90", min: 0, max: 90 },
  { label: "£90–£110", min: 90, max: 110 },
  { label: "£110+", min: 110, max: Infinity },
];

type SortKey = "featured" | "rating" | "price-asc" | "price-desc";

export default function ExplorePage() {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [session, setSession] = useState<SessionType | null>(null);
  const [priceBand, setPriceBand] = useState(0);
  const [query, setQuery] = useState("");
  const [season, setSeason] = useState<ColorSeason | null>(null);
  const [name, setName] = useState("");

  // Reflect the visitor's saved quiz result back to them.
  useEffect(() => {
    const p = loadProfile();
    setSeason(p.season);
    setName(p.fullName);
  }, []);
  const [sort, setSort] = useState<SortKey>("featured");

  const results = useMemo(() => {
    const band = PRICE_BANDS[priceBand];
    const filtered = STYLISTS.filter((s) => {
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
    const sorted = [...filtered];
    switch (sort) {
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        sorted.sort((a, b) => a.startingPrice - b.startingPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.startingPrice - a.startingPrice);
        break;
      default:
        sorted.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
    }
    return sorted;
  }, [specialty, session, priceBand, query, sort]);

  const clear = () => {
    setSpecialty(null);
    setSession(null);
    setPriceBand(0);
    setQuery("");
  };

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 2rem" }}>
      <span className="eyebrow">The roster — {STYLISTS.length} stylists</span>
      <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.2rem)", marginTop: "0.85rem" }}>
        Find your <em>stylist.</em>
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.75rem", maxWidth: 600 }}>
        Browse our global roster of vetted personal stylists. Filter by specialty, session type and
        budget to find your perfect match.
      </p>

      {season ? (
        <div className="card" style={{ padding: "1.25rem 1.5rem", marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div style={{ display: "flex" }}>
              {PALETTES[season].bestColors.slice(0, 4).map((c, i) => (
                <span key={c.hex} style={{ width: 26, height: 26, borderRadius: "50%", background: c.hex, border: "2px solid var(--card)", marginLeft: i ? -8 : 0 }} />
              ))}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>
                {name ? `${name.split(" ")[0]}, you're a ${PALETTES[season].name}` : `You're a ${PALETTES[season].name}`}
              </div>
              <div style={{ color: "var(--dim)", fontSize: "0.88rem" }}>
                We'd start with a colour specialist to bring your palette to life.
              </div>
            </div>
          </div>
          <button onClick={() => setSpecialty(specialty === "Colour Analysis" ? null : "Colour Analysis")} className="btn btn-outline" style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}>
            {specialty === "Colour Analysis" ? "Showing colour experts" : "Show colour experts"}
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: "1.25rem 1.5rem", marginTop: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ color: "var(--dim)", fontSize: "0.92rem" }}>
            <strong style={{ color: "var(--dark)" }}>Not sure who to pick?</strong> Take the 2-minute quiz and we'll match you to your colours.
          </div>
          <Link href="/quiz" className="btn btn-outline" style={{ padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}>
            Take the quiz
          </Link>
        </div>
      )}

      <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem", display: "grid", gap: "1.25rem" }}>
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
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--faint)" }} htmlFor="sort">Sort</label>
          <select
            id="sort"
            className="input"
            style={{ width: "auto", padding: "0.45rem 0.7rem" }}
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button onClick={clear} className="btn btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
            Clear
          </button>
        </div>
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
