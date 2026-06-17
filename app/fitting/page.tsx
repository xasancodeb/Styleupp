"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadProfile, saveSeason, PALETTES, type ColorSeason } from "@/lib/profile";

const SEASONS: ColorSeason[] = ["spring", "summer", "autumn", "winter"];

export default function FittingPage() {
  const [season, setSeason] = useState<ColorSeason | null>(null);
  const [hasResult, setHasResult] = useState(false);

  useEffect(() => {
    const profile = loadProfile();
    if (profile.season) {
      setSeason(profile.season);
      setHasResult(true);
    } else {
      setSeason("autumn");
    }
  }, []);

  function pick(s: ColorSeason) {
    setSeason(s);
    saveSeason(s);
    setHasResult(true);
  }

  const palette = season ? PALETTES[season] : null;

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>
        Colour fitting room
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem", maxWidth: 620 }}>
        Your personal palette, ready to shop from. Explore the colours that make you glow — and the
        ones to leave on the rail.
      </p>

      {!hasResult && (
        <div
          className="card"
          style={{ padding: "1.25rem 1.5rem", marginTop: "1.5rem", background: "rgba(196,146,58,0.08)", border: "1px solid rgba(196,146,58,0.25)" }}
        >
          <strong>Haven't taken the quiz?</strong>{" "}
          <span style={{ color: "var(--dim)" }}>
            Discover your true season in two minutes, or explore any palette below.
          </span>{" "}
          <Link href="/quiz" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>
            Take the quiz →
          </Link>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", margin: "1.75rem 0", flexWrap: "wrap" }}>
        {SEASONS.map((s) => (
          <button
            key={s}
            className="tag-toggle"
            data-active={season === s}
            onClick={() => pick(s)}
            style={{ textTransform: "capitalize" }}
          >
            {PALETTES[s].name}
          </button>
        ))}
      </div>

      {palette && (
        <div className="fade-up" key={palette.season}>
          <div
            className="card"
            style={{
              padding: "2rem",
              background: `linear-gradient(135deg, ${palette.bestColors[0].hex}22, ${palette.bestColors[2].hex}22)`,
            }}
          >
            <span className="chip" style={{ background: "var(--dark)", color: "var(--bg)" }}>
              {palette.name}
            </span>
            <h2 className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.75rem" }}>
              {palette.tagline}
            </h2>
            <p style={{ color: "var(--dark)", marginTop: "0.5rem", maxWidth: 640 }}>{palette.description}</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginTop: "1.5rem",
            }}
          >
            <Swatches title="Your best colours" colors={palette.bestColors} />
            <Swatches title="Your neutrals" colors={palette.neutrals} />
            <Swatches title="Colours to avoid" colors={palette.avoidColors} muted />
            <div className="card" style={{ padding: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                Metals & finishing touches
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1rem" }}>
                {palette.metals.map((m) => (
                  <span key={m} className="chip">
                    {m}
                  </span>
                ))}
              </div>
              <p style={{ color: "var(--dim)", marginTop: "1rem", fontSize: "0.92rem" }}>
                Stick to these metals for jewellery, watches and hardware to keep your look harmonious.
              </p>
            </div>
          </div>

          <div
            className="card"
            style={{ padding: "2rem", marginTop: "1.5rem", textAlign: "center", background: "var(--dark)", color: "var(--bg)" }}
          >
            <h3 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              Want a stylist to bring this to life?
            </h3>
            <p style={{ opacity: 0.85, marginTop: "0.5rem" }}>
              Book a colour analysis or capsule session and turn your palette into a wardrobe.
            </p>
            <Link href="/explore" className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
              Browse colour specialists
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Swatches({
  title,
  colors,
  muted,
}: {
  title: string;
  colors: { name: string; hex: string }[];
  muted?: boolean;
}) {
  return (
    <div className="card" style={{ padding: "1.5rem" }}>
      <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700, opacity: muted ? 0.7 : 1 }}>
        {title}
      </h3>
      <div style={{ display: "grid", gap: "0.6rem", marginTop: "1rem" }}>
        {colors.map((c) => (
          <div key={c.hex} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "0.5rem",
                background: c.hex,
                border: "1px solid var(--border)",
                flexShrink: 0,
                opacity: muted ? 0.55 : 1,
              }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{c.name}</div>
              <div style={{ color: "var(--faint)", fontSize: "0.78rem" }}>{c.hex.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
