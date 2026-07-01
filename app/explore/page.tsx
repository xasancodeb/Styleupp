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
  genderOf,
  type Stylist,
  type Gender,
} from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import {
  loadProfile,
  saveLocation,
  saveInternational,
  saveStylistGender,
  PALETTES,
  type ClientProfile,
  type ColorSeason,
} from "@/lib/profile";
import { matchScore, canMatch } from "@/lib/match";

const GENDERS: { value: Gender | "any"; label: string }[] = [
  { value: "any", label: "Any stylist" },
  { value: "female", label: "Women stylists" },
  { value: "male", label: "Men stylists" },
];

const PRICE_BANDS = [
  { label: "Any price", min: 0, max: Infinity },
  { label: "Under £90", min: 0, max: 90 },
  { label: "£90–£110", min: 90, max: 110 },
  { label: "£110+", min: 110, max: Infinity },
];

const FORMATS = [
  { value: "any", label: "Any format" },
  { value: "virtual", label: "Virtual, anywhere" },
  { value: "in-person", label: "In person near me" },
  { value: "shopping", label: "Shop with me in store" },
] as const;
type Format = (typeof FORMATS)[number]["value"];

type SortKey = "match" | "featured" | "rating" | "price-asc" | "price-desc";

export default function ExplorePage() {
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>("any");
  const [priceBand, setPriceBand] = useState(0);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [season, setSeason] = useState<ColorSeason | null>(null);
  const [name, setName] = useState("");
  const [country, setCountry] = useState<string>("");
  const [international, setInternational] = useState(false);
  const [gender, setGender] = useState<Gender | "any">("any");
  const [profile, setProfile] = useState<ClientProfile | null>(null);

  const matchable = profile ? canMatch(profile) : false;
  const scores = useMemo(() => {
    if (!profile || !matchable) return new Map<string, number>();
    return new Map(STYLISTS.map((s) => [s.id, matchScore(s, profile).score]));
  }, [profile, matchable]);

  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setSeason(p.season);
    setName(p.fullName);
    if (p.location?.country) setCountry(p.location.country);
    setInternational(p.international);
    setGender(p.preferences.stylistGender ?? "any");
    if (canMatch(p)) setSort("match");
    // Deep links from the services menu: /explore?specialty=Colour%20Analysis
    const wanted = new URLSearchParams(window.location.search).get("specialty");
    if (wanted && (SPECIALTIES as readonly string[]).includes(wanted)) setSpecialty(wanted);
  }, []);

  function chooseCountry(c: string) {
    setCountry(c);
    saveLocation(c ? { city: "", country: c } : null);
  }

  function toggleInternational(v: boolean) {
    setInternational(v);
    saveInternational(v);
  }

  function chooseGender(g: Gender | "any") {
    setGender(g);
    saveStylistGender(g === "any" ? null : g);
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
      if (gender !== "any" && genderOf(s) !== gender) return false;
      if (s.startingPrice < band.min || s.startingPrice > band.max) return false;
      // Country-based by default: unless the visitor opts into international,
      // only show stylists they can realistically reach (their country/region).
      if (country && !international && proximity(s, country) === "remote") return false;
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
        case "match":
          return (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) || b.rating - a.rating;
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
    // Match scoring already weighs proximity; for other sorts, surface the
    // nearest stylists first when a location is known.
    sorted.sort((a, b) =>
      country && sort !== "match"
        ? proximityRank(proximity(a, country)) - proximityRank(proximity(b, country)) || cmp(a, b)
        : cmp(a, b)
    );
    return sorted;
  }, [specialty, format, priceBand, query, sort, country, international, gender, scores]);

  const clear = () => {
    setSpecialty(null);
    setFormat("any");
    setPriceBand(0);
    setQuery("");
    chooseGender("any");
  };

  const nearCount = country
    ? results.filter((s) => offersInPerson(s) && proximity(s, country) !== "remote").length
    : 0;

  return (
    <div className="section" style={{ padding: "2.5rem 1.75rem 2rem" }}>
      <span className="eyebrow">{results.length} of {STYLISTS.length} stylists</span>
      <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.4rem, 6vw, 4rem)", letterSpacing: "-0.045em", lineHeight: 1.0, marginTop: "1rem" }}>
        Browse stylists
      </h1>
      <p className="lede" style={{ marginTop: "1.1rem" }}>
        Filter by city, specialty and format. Meet over video from anywhere, or find someone
        near you to meet in person, or shop the stores with.
      </p>

      {/* Location & scope */}
      <div className="card" style={{ padding: "1.25rem 1.4rem", marginTop: "1.75rem", display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent)" }}>Where are you?</div>
            <div style={{ color: "var(--dim)", fontSize: "0.88rem", marginTop: "0.35rem", maxWidth: 540 }}>
              {country
                ? international
                  ? `Showing stylists worldwide. ${nearCount} can also meet you in person near ${country}.`
                  : nearCount > 0
                    ? `${nearCount} stylist${nearCount === 1 ? "" : "s"} near ${country}, plus anyone there over video. Switch to international for the full roster.`
                    : `No stylists near ${country} yet — switch to international to meet someone over video.`
                : "Pick your country to see who's near you, or browse stylists internationally over video."}
            </div>
          </div>
          <select className="input" style={{ width: "auto", minWidth: 200 }} value={country} onChange={(e) => chooseCountry(e.target.value)}>
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button className="tag-toggle" data-active={!international} onClick={() => toggleInternational(false)} disabled={!country} style={{ opacity: country ? 1 : 0.5, cursor: country ? "pointer" : "not-allowed" }}>
            Near me
          </button>
          <button className="tag-toggle" data-active={international || !country} onClick={() => toggleInternational(true)}>
            International (over video)
          </button>
        </div>
      </div>

      {season && (
        <div className="card" style={{ padding: "1.1rem 1.4rem", marginTop: "0.85rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
            <div style={{ display: "flex" }}>
              {PALETTES[season].bestColors.slice(0, 5).map((c) => (
                <span key={c.hex} style={{ width: 24, height: 30, borderRadius: 7, background: c.hex, border: "2px solid var(--bg)", marginLeft: -6, boxShadow: "0 2px 8px -2px rgba(0,0,0,0.5)" }} />
              ))}
            </div>
            <div>
              <div style={{ fontSize: "0.8rem", color: "var(--dim)" }}>
                {name ? `Your palette, ${name.split(" ")[0]}` : "Your palette"}
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
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Stylist gender</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {GENDERS.map((g) => (
              <button key={g.value} className="tag-toggle" data-active={gender === g.value} onClick={() => chooseGender(g.value)}>
                {g.label}
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
            {matchable && <option value="match">Best match for you</option>}
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
            <StylistCard
              key={stylist.id}
              stylist={stylist}
              proximityLabel={nearLabel(stylist)}
              matchScore={matchable ? scores.get(stylist.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
