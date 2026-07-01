"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  STYLISTS,
  SPECIALTIES,
  COUNTRIES,
  offersInPerson,
  offersInStoreShopping,
  proximity,
  proximityRank,
  genderOf,
  extrasOf,
  getPortfolio,
  type Stylist,
  type Gender,
} from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import { loadProfile, saveLocation, saveStylistGender } from "@/lib/profile";

// Not a grid of cards. The register: every resident gets a full-width row,
// like an index page in a lookbook. Portrait in an arch, name in serif, their
// taste in one line, three of their looks, and the door to their room.

const FORMATS = [
  { value: "any", label: "Any format" },
  { value: "virtual", label: "On video" },
  { value: "in-person", label: "In person near me" },
  { value: "shopping", label: "Shopping together" },
] as const;
type Format = (typeof FORMATS)[number]["value"];

const GENDERS: { value: Gender | "any"; label: string }[] = [
  { value: "any", label: "Any stylist" },
  { value: "female", label: "Women" },
  { value: "male", label: "Men" },
];

export default function ExplorePage() {
  const [country, setCountry] = useState("");
  const [format, setFormat] = useState<Format>("any");
  const [gender, setGender] = useState<Gender | "any">("any");
  const [specialty, setSpecialty] = useState<string | null>(null);

  useEffect(() => {
    const p = loadProfile();
    if (p.location?.country) setCountry(p.location.country);
    setGender(p.preferences.stylistGender ?? "any");
    const wanted = new URLSearchParams(window.location.search).get("specialty");
    if (wanted && (SPECIALTIES as readonly string[]).includes(wanted)) setSpecialty(wanted);
  }, []);

  function chooseCountry(c: string) {
    setCountry(c);
    saveLocation(c ? { city: "", country: c } : null);
  }

  function chooseGender(g: Gender | "any") {
    setGender(g);
    saveStylistGender(g === "any" ? null : g);
  }

  const results = useMemo(() => {
    const filtered = STYLISTS.filter((s) => {
      if (gender !== "any" && genderOf(s) !== gender) return false;
      if (specialty && !s.specialties.includes(specialty)) return false;
      if (format === "virtual" && !s.sessionTypes.includes("virtual")) return false;
      if (format === "in-person") {
        if (!offersInPerson(s)) return false;
        if (country && proximity(s, country) === "remote") return false;
      }
      if (format === "shopping") {
        if (!offersInStoreShopping(s)) return false;
        if (country && proximity(s, country) === "remote") return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) =>
      country
        ? proximityRank(proximity(a, country)) - proximityRank(proximity(b, country)) ||
          Number(b.featured) - Number(a.featured) ||
          b.rating - a.rating
        : Number(b.featured) - Number(a.featured) || b.rating - a.rating
    );
  }, [country, format, gender, specialty]);

  function whereLine(s: Stylist): string {
    if (country && offersInPerson(s)) {
      const p = proximity(s, country);
      if (p === "same-country") return `In ${s.city}, can meet you in person`;
      if (p === "same-region") return `${s.city} · in your region`;
    }
    return `${s.city} · works on video anywhere`;
  }

  return (
    <div className="section" style={{ padding: "3rem 1.75rem 2rem" }}>
      <span className="eyebrow">The register</span>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.5rem, 6vw, 4rem)", letterSpacing: "-0.012em", lineHeight: 1.02, marginTop: "0.8rem" }}>
        Every resident of the house
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        Read them like an index. The work first, then the person. Set your country
        and whoever can meet you in person rises to the top.
      </p>

      {/* one calm filter row */}
      <div className="card" style={{ padding: "1.25rem 1.4rem", marginTop: "1.75rem", display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
          <select className="input" style={{ width: "auto", minWidth: 190 }} value={country} onChange={(e) => chooseCountry(e.target.value)} aria-label="Your country">
            <option value="">Where are you?</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {FORMATS.map((f) => (
              <button key={f.value} className="tag-toggle" data-active={format === f.value} onClick={() => setFormat(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
            {GENDERS.map((g) => (
              <button key={g.value} className="tag-toggle" data-active={gender === g.value} onClick={() => chooseGender(g.value)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
          {SPECIALTIES.map((s) => (
            <button key={s} className="tag-toggle" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }} data-active={specialty === s} onClick={() => setSpecialty(specialty === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: "var(--dim)", fontWeight: 500, margin: "2rem 0 0.5rem" }}>
        {results.length} stylist{results.length === 1 ? "" : "s"}
        {country ? `, nearest to ${country} first` : ""}
      </p>

      {results.length === 0 ? (
        <div className="card" style={{ padding: "3rem", textAlign: "center", color: "var(--dim)", marginTop: "1rem" }}>
          <p>Nobody fits those filters yet.</p>
          <button onClick={() => { setFormat("any"); setSpecialty(null); chooseGender("any"); }} className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Show everyone
          </button>
        </div>
      ) : (
        <div>
          {results.map((s, idx) => {
            const x = extrasOf(s);
            const looks = getPortfolio(s).slice(1, 4);
            return (
              <article
                key={s.id}
                className="register-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "170px minmax(0, 1.2fr) minmax(0, 1fr) auto",
                  gap: "1.75rem",
                  alignItems: "center",
                  padding: "1.9rem 0",
                  borderTop: "1px solid var(--border)",
                }}
              >
                {/* the arch */}
                <Link href={`/stylist/${s.id}`} className="photo arch" style={{ aspectRatio: "4 / 5", display: "block" }}>
                  <Image src={s.avatar} alt={s.name} fill sizes="170px" style={{ objectFit: "cover" }} />
                </Link>

                {/* the person */}
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--faint)", fontWeight: 600, letterSpacing: "0.08em" }}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <Link href={`/stylist/${s.id}`}>
                    <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", letterSpacing: "-0.01em", lineHeight: 1.05, marginTop: "0.25rem" }}>
                      {s.name}
                    </h2>
                  </Link>
                  <div style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: 600, marginTop: "0.35rem" }}>
                    {x.vibes.join(" · ")}
                  </div>
                  <p style={{ color: "var(--dim)", fontSize: "0.94rem", marginTop: "0.5rem", lineHeight: 1.55, maxWidth: "44ch" }}>
                    “{x.philosophy}”
                  </p>
                  <div style={{ color: "var(--faint)", fontSize: "0.85rem", marginTop: "0.55rem" }}>
                    {whereLine(s)} · <span style={{ color: "var(--accent)" }}>★</span> {s.rating} ({s.reviewCount}) · from {formatGBP(s.startingPrice)}
                  </div>
                </div>

                {/* the work */}
                <Link href={`/stylist/${s.id}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }} className="register-looks">
                  {looks.map((img) => (
                    <span key={img} className="photo" style={{ aspectRatio: "3 / 4", borderRadius: 10, display: "block" }}>
                      <Image src={img} alt={`A look styled by ${s.name}`} fill sizes="120px" style={{ objectFit: "cover" }} />
                    </span>
                  ))}
                </Link>

                {/* the door */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} className="register-cta">
                  <Link href={`/book?stylist=${s.id}`} className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>Book</Link>
                  <Link href={`/stylist/${s.id}`} className="btn btn-outline" style={{ whiteSpace: "nowrap" }}>Their room</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 980px) {
          .register-row { grid-template-columns: 130px minmax(0, 1fr) auto !important; }
          .register-looks { display: none !important; }
        }
        @media (max-width: 640px) {
          .register-row { grid-template-columns: 110px minmax(0, 1fr) !important; gap: 1.1rem !important; }
          .register-cta { flex-direction: row !important; }
        }
      `}</style>
    </div>
  );
}
