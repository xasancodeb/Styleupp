"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  STYLISTS,
  SPECIALTIES,
  COUNTRIES,
  offersInPerson,
  offersInStoreShopping,
  proximity,
  proximityRank,
  type Stylist,
} from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import { loadProfile, saveLocation, PALETTES, type ColorSeason } from "@/lib/profile";

const PRICE_BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under £90", min: 0, max: 90 },
  { label: "£90–£110", min: 90, max: 110 },
  { label: "£110+", min: 110, max: Infinity },
];

const FORMATS = [
  { value: "any", label: "Any format" },
  { value: "virtual", label: "Virtual — anywhere" },
  { value: "in-person", label: "In person near me" },
  { value: "shopping", label: "Shop with me in store" },
] as const;
type Format = (typeof FORMATS)[number]["value"];

type SortKey = "featured" | "rating" | "price-asc" | "price-desc";

export default function ExplorePage() {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("any");
  const [priceBand, setPriceBand] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [season, setSeason] = useState<ColorSeason | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string>("");

  useEffect(() => {
    const p = loadProfile();
    setSeason(p.season);
    setName(p.fullName);
    if (p.location?.country) setCountry(p.location.country);
  }, []);

  function chooseCountry(c: string) {
    setCountry(c);
    saveLocation(c ? { city: "", country: c } : null);
  }

  function nearLabel(s: Stylist): string | undefined {
    if (!country || !offersInPerson(s)) return undefined;
    const p = proximity(s, country);
    if (p === "same-country") return "In your country";
    if (p === "same-region") return "In your region";
    return undefined;
  }

  const results = useMemo(() => {
    const band = PRICE_BANDS[priceBand];
    const filtered = STYLISTS.filter((s) => {
      if (specialty && !s.specialties.includes(specialty)) return false;
      if (s.startingPrice < band.min || s.startingPrice > band.max) return false;
      if (format === "virtual" && !s.sessionTypes.includes("virtual")) return false;
      if (format === "in-person") {
        if (!offersInPerson(s)) return false;
        if (country && proximity(s, country) === "remote") return false;
      }
      if (format === "shopping") {
        if (!offersInStoreShopping(s)) return false;
        if (country && proximity(s, country) === "remote") return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const hay = `${s.name} ${s.city} ${s.country} ${s.tagline} ${s.specialties.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const cmp = (a: Stylist, b: Stylist) => {
      switch (sort) {
        case "rating":
          return b.rating - a.rating;
        case "price-asc":
          return a.startingPrice - b.startingPrice;
        case "price-desc":
          return b.startingPrice - a.startingPrice;
        default:
          return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
      }
    };

    const sorted = [...filtered];
    // When a location is known, surface the nearest stylists first.
    sorted.sort((a, b) =>
      country
        ? proximityRank(proximity(a, country)) - proximityRank(proximity(b, country)) || cmp(a, b)
        : cmp(a, b)
    );
    return sorted;
  }, [specialty, format, priceBand, query, sort, country]);

  const clear = () => {
    setSpecialty(null);
    setFormat("any");
    setPriceBand(0);
    setQuery("");
  };

  const nearCount = country
    ? results.filter((s) => offersInPerson(s) && proximity(s, country) !== "remote").length
    : 0;

  return (
    <div className="section" style={{ padding: "2.5rem 1.75rem 2rem" }}>
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--ink)", paddingBottom: "0.75rem", fontSize: "0.62rem", color: "var(--faint)" }}>
        <span>THE CATALOGUE</span>
        <span>{results.length} / {STYLISTS.length} ENTRIES</span>
      </div>
      <span className="eyebrow" style={{ marginTop: "1.5rem" }}>Index 002 — The roster</span>
      <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(2.6rem, 7vw, 5rem)", letterSpacing: "-0.05em", lineHeight: 0.88, marginTop: "1rem" }}>
        The stylist<br />catalogue.
      </h1>
      <p className="lede" style={{ marginTop: "1.25rem" }}>
        Filter the index by city, specialty and format. Work over video from anywhere — or find someone
        near you to meet in person, or shop the stores with.
      </p>

      {/* Location prompt */}
      <div className="card" style={{ padding: "1.1rem 1.4rem", marginTop: "1.75rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <div className="mono" style={{ fontSize: "0.66rem", color: "var(--accent)" }}>◆ LOCATION</div>
          <div style={{ color: "var(--dim)", fontSize: "0.88rem", marginTop: "0.35rem", maxWidth: 520 }}>
            {country
              ? nearCount > 0
                ? `${nearCount} ${nearCount === 1 ? "entry" : "entries"} can meet you in person near ${country}. Everyone else works over video.`
                : `No in-person entries near ${country} yet — but every stylist works with you over video.`
              : "Set your location and the index surfaces who can meet you in person — not just video."}
          </div>
        </div>
        <select className="input" style={{ width: "auto", minWidth: 220 }} value={country} onChange={(e) => chooseCountry(e.target.value)}>
          <option value="">Anywhere (virtual)</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {season && (
        <div className="card" style={{ padding: "1.1rem 1.4rem", marginTop: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div style={{ display: "flex" }}>
              {PALETTES[season].bestColors.slice(0, 5).map((c) => (
                <span key={c.hex} style={{ width: 22, height: 28, background: c.hex, border: "1px solid var(--ink)", marginLeft: -1 }} />
              ))}
            </div>
            <div>
              <div className="mono" style={{ fontSize: "0.66rem", color: "var(--dim)" }}>
                {name ? `CALIBRATED — ${name.split(" ")[0].toUpperCase()}` : "CALIBRATED"}
              </div>
              <div style={{ fontWeight: 600, marginTop: "0.2rem" }}>You're a {PALETTES[season].name}.</div>
            </div>
          </div>
          <button onClick={() => setSpecialty(specialty === "Colour Analysis" ? null : "Colour Analysis")} className="btn btn-outline" style={{ padding: "0.6rem 1.1rem" }}>
            {specialty === "Colour Analysis" ? "Showing colour" : "Colour experts"}
          </button>
        </div>
      )}

      <div className="card" style={{ padding: "1.5rem", marginTop: "1rem", display: "grid", gap: "1.25rem" }}>
        <input className="input" placeholder="Search by name, city or specialty…" value={query} onChange={(e) => setQuery(e.target.value)} />

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>How do you want to work together?</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {FORMATS.map((f) => (
              <button key={f.value} className="tag-toggle" data-active={format === f.value} onClick={() => setFormat(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Specialty</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {SPECIALTIES.map((s) => (
              <button key={s} className="tag-toggle" data-active={specialty === s} onClick={() => setSpecialty(specialty === s ? null : s)}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Budget</label>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
            {PRICE_BANDS.map((b, i) => (
              <button key={b.label} className="tag-toggle" data-active={priceBand === i} onClick={() => setPriceBand(i)}>
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1.75rem 0 1rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <p style={{ color: "var(--dim)", fontWeight: 600 }}>
          {results.length} stylist{results.length === 1 ? "" : "s"}
          {country && (format === "in-person" || format === "shopping") ? ` near ${country}` : ""}
        </p>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <label style={{ fontSize: "0.85rem", color: "var(--faint)" }} htmlFor="sort">Sort</label>
          <select id="sort" className="input" style={{ width: "auto", padding: "0.45rem 0.7rem" }} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="featured">Featured</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
          <button onClick={clear} className="btn btn-outline" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>Clear</button>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--dim)" }}>
          {(format === "in-person" || format === "shopping") && country ? (
            <>
              <p>No stylists near <strong>{country}</strong> for that yet.</p>
              <button onClick={() => setFormat("virtual")} className="btn btn-primary" style={{ marginTop: "1rem" }}>
                See stylists available over video
              </button>
            </>
          ) : (
            "No stylists match those filters yet. Try widening your search."
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {results.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} proximityLabel={nearLabel(stylist)} />
          ))}
        </div>
      )}
    </div>
  );
}
