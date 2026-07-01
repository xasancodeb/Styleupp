"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  STYLISTS,
  COUNTRIES,
  proximity,
  proximityRank,
  offersInPerson,
  offersInStoreShopping,
  genderOf,
  type Stylist,
  type Gender,
} from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import { saveLocation } from "@/lib/profile";

// The front door of StyleUp, modelled on ride-hailing: you don't browse a
// global roster, you say what you need and where you are, and we bring you
// the stylists who can actually turn up. Video is the fallback, never the
// default pitch.

const NEEDS = [
  { key: "occasion", label: "A big occasion", specialties: ["Occasion & Event", "Bridal Styling"] },
  { key: "wardrobe", label: "Fix my everyday wardrobe", specialties: ["Capsule Wardrobe", "Wardrobe Detox"] },
  { key: "work", label: "Level up for work", specialties: ["Corporate & Executive"] },
  { key: "shopping", label: "Shop with me", specialties: ["Personal Shopping"] },
  { key: "colours", label: "Find my colours", specialties: ["Colour Analysis"] },
] as const;
type NeedKey = (typeof NEEDS)[number]["key"];

const BUDGETS = [
  { key: "b1", label: "Under £100", max: 100 },
  { key: "b2", label: "£100–£200", max: 200 },
  { key: "b3", label: "£200+", max: Infinity },
] as const;

interface Ranked {
  stylist: Stylist;
  local: boolean;
  reasons: string[];
}

export default function MatchRequest() {
  const [step, setStep] = useState(0);
  const [need, setNeed] = useState<NeedKey | null>(null);
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [gender, setGender] = useState<Gender | "any">("any");
  const [budget, setBudget] = useState<(typeof BUDGETS)[number]["key"] | null>(null);
  const [done, setDone] = useState(false);
  const [waitlisted, setWaitlisted] = useState(false);
  const [email, setEmail] = useState("");

  const needDef = NEEDS.find((n) => n.key === need);

  const matches: Ranked[] = useMemo(() => {
    if (!needDef) return [];
    const budgetMax = BUDGETS.find((b) => b.key === budget)?.max ?? Infinity;

    const ranked = STYLISTS.filter((s) => {
      if (gender !== "any" && genderOf(s) !== gender) return false;
      if (needDef.key === "shopping" && !offersInStoreShopping(s)) return false;
      return needDef.specialties.some((sp) => s.specialties.includes(sp));
    })
      .map((s) => {
        const prox = proximity(s, country || null, city || null);
        const local = prox !== "remote" && offersInPerson(s);
        const reasons: string[] = [];
        if (prox === "same-city") reasons.push(`In ${s.city}, can meet you this week`);
        else if (prox === "same-country") reasons.push(`In ${s.country}, in-person possible`);
        else if (prox === "same-region") reasons.push("In your region");
        else reasons.push("Works with you over video");
        const matched = needDef.specialties.find((sp) => s.specialties.includes(sp));
        if (matched) reasons.push(matched);
        if (s.startingPrice <= budgetMax) reasons.push(`from ${formatGBP(s.startingPrice)}`);
        const budgetPenalty = s.startingPrice > budgetMax ? 1 : 0;
        return { stylist: s, local, reasons: reasons.slice(0, 2), rank: proximityRank(prox) + budgetPenalty * 2, rating: s.rating };
      })
      .sort((a, b) => a.rank - b.rank || b.rating - a.rating)
      .slice(0, 3);

    return ranked;
  }, [needDef, country, city, gender, budget]);

  const hasLocal = matches.some((m) => m.local);

  function submit() {
    if (country) saveLocation({ city, country });
    setDone(true);
  }

  function reset() {
    setDone(false);
    setStep(0);
    setNeed(null);
    setWaitlisted(false);
  }

  // ── results ──────────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="card fade-up" style={{ padding: "1.6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "1rem" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.25rem", letterSpacing: "-0.02em" }}>
            {hasLocal
              ? `Your stylists near ${city || country}`
              : "Your matches"}
          </h3>
          <button onClick={reset} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500 }}>
            Start over
          </button>
        </div>

        {!hasLocal && country && (
          <div style={{ background: "var(--accent-soft)", borderRadius: 14, padding: "0.9rem 1.1rem", marginTop: "0.9rem", fontSize: "0.9rem", lineHeight: 1.55 }}>
            {waitlisted ? (
              <span style={{ fontWeight: 600 }}>You&apos;re on the list. £20 credit when we launch in {city || country}.</span>
            ) : (
              <>
                <span style={{ fontWeight: 600 }}>We&apos;re not in {city || country} yet.</span>{" "}
                <span style={{ color: "var(--dim)" }}>
                  These stylists work brilliantly over video, or join the launch list and get £20 credit when we arrive:
                </span>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.includes("@")) return;
                    void fetch("/api/leads", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        type: "waitlist",
                        email,
                        payload: { city, country, need: needDef?.key ?? "" },
                      }),
                    }).catch(() => {});
                    setWaitlisted(true);
                  }}
                  style={{ display: "flex", gap: "0.5rem", marginTop: "0.7rem", flexWrap: "wrap" }}
                >
                  <input className="input" type="email" required placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: "1 1 180px" }} />
                  <button type="submit" className="btn btn-outline" style={{ padding: "0.6rem 1.1rem" }}>Join the list</button>
                </form>
              </>
            )}
          </div>
        )}

        <div style={{ display: "grid", gap: "0.7rem", marginTop: "1rem" }}>
          {matches.map(({ stylist: s, local, reasons }) => (
            <Link key={s.id} href={`/book?stylist=${s.id}`} className="card" style={{ display: "flex", gap: "0.9rem", padding: "0.8rem", alignItems: "center" }}>
              <div style={{ position: "relative", width: 58, height: 68, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "var(--bg-2)" }}>
                <Image src={s.avatar} alt={s.name} fill sizes="58px" style={{ objectFit: "cover" }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "baseline", flexWrap: "wrap" }}>
                  <strong style={{ letterSpacing: "-0.015em" }}>{s.name}</strong>
                  <span style={{ fontSize: "0.82rem", color: "var(--dim)" }}>
                    <span style={{ color: "var(--accent)" }}>★</span> {s.rating}
                  </span>
                  {local && (
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1d7a3c", background: "#e7f6ec", borderRadius: 999, padding: "0.15rem 0.55rem" }}>
                      Near you
                    </span>
                  )}
                </div>
                <div style={{ fontSize: "0.84rem", color: "var(--dim)", marginTop: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {reasons.join(" · ")}
                </div>
              </div>
              <span className="btn btn-primary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.88rem", flexShrink: 0 }}>Book</span>
            </Link>
          ))}
        </div>

        <Link href="/explore" style={{ display: "inline-block", marginTop: "0.9rem", fontSize: "0.9rem", fontWeight: 600, color: "var(--accent)" }}>
          See everyone available →
        </Link>
      </div>
    );
  }

  // ── request steps ─────────────────────────────────────────────────────────
  const steps = [
    {
      title: "What do you need?",
      valid: need !== null,
      body: (
        <div style={{ display: "grid", gap: "0.55rem" }}>
          {NEEDS.map((n) => (
            <button
              key={n.key}
              onClick={() => {
                setNeed(n.key);
                setStep(1);
              }}
              className="tag-toggle"
              data-active={need === n.key}
              style={{ textAlign: "left", padding: "0.8rem 1.1rem", borderRadius: 14, fontSize: "0.95rem" }}
            >
              {n.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Where are you?",
      valid: Boolean(country),
      body: (
        <div style={{ display: "grid", gap: "0.7rem" }}>
          <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="">Choose your country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="other">Somewhere else</option>
          </select>
          <input className="input" placeholder="Your city (e.g. Winnipeg)" value={city} onChange={(e) => setCity(e.target.value)} />
          <p style={{ color: "var(--faint)", fontSize: "0.82rem", margin: 0 }}>
            We match you locally first. Video is always a backup, never forced on you.
          </p>
        </div>
      ),
    },
    {
      title: "Any preference for your stylist?",
      valid: true,
      body: (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {([
            ["any", "No preference"],
            ["female", "A woman"],
            ["male", "A man"],
          ] as const).map(([val, label]) => (
            <button key={val} className="tag-toggle" data-active={gender === val} onClick={() => setGender(val)}>
              {label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Rough budget for a session?",
      valid: budget !== null,
      body: (
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {BUDGETS.map((b) => (
            <button key={b.key} className="tag-toggle" data-active={budget === b.key} onClick={() => setBudget(b.key)}>
              {b.label}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <div className="card" style={{ padding: "1.6rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--dim)", fontSize: "0.85rem", fontWeight: 600 }}>Step {step + 1} of {steps.length}</span>
        <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>~30 seconds</span>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: "var(--border)", marginTop: "0.75rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((step + 1) / steps.length) * 100}%`, background: "var(--ink)", borderRadius: 9999, transition: "width 0.35s var(--ease)" }} />
      </div>

      <div className="fade-up" key={step} style={{ marginTop: "1.4rem" }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>{current.title}</h3>
        <div style={{ marginTop: "1.1rem" }}>{current.body}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.4rem" }}>
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} style={{ background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
            ← Back
          </button>
        ) : (
          <span />
        )}
        {step > 0 && (
          <button
            className="btn btn-primary"
            style={{ opacity: current.valid ? 1 : 0.45 }}
            disabled={!current.valid}
            onClick={() => (last ? submit() : setStep(step + 1))}
          >
            {last ? "Show my stylists" : "Continue"} <span className="arrow">→</span>
          </button>
        )}
      </div>
    </div>
  );
}
