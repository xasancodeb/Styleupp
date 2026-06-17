"use client";

import { useState } from "react";
import Link from "next/link";

const PACKAGES = [
  {
    name: "Team Refresh",
    blurb: "Group colour analysis and personal styling workshops for teams of 5–20.",
    features: ["Live virtual or on-site workshop", "Individual colour palettes", "Group Q&A with a lead stylist"],
  },
  {
    name: "Executive Presence",
    blurb: "One-to-one executive styling for leadership teams ahead of key moments.",
    features: ["Private 1:1 sessions", "Boardroom & media-ready wardrobes", "Ongoing on-call advice"],
  },
  {
    name: "Onboarding & Brand",
    blurb: "Help new hires and client-facing teams represent your brand with confidence.",
    features: ["Dress-code consulting", "Bulk session credits", "Quarterly style reviews"],
  },
];

export default function CorporatePage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ company: "", name: "", email: "", teamSize: "", message: "" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div>
      <section style={{ background: "radial-gradient(900px 400px at 20% -10%, rgba(196,146,58,0.16), transparent), var(--bg)" }}>
        <div className="section" style={{ padding: "5rem 1.5rem 3.5rem", maxWidth: 760 }}>
          <span className="chip">For teams & companies</span>
          <h1 className="font-serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 700, marginTop: "1rem", lineHeight: 1.1 }}>
            Style that scales with your team.
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--dim)", marginTop: "1rem" }}>
            From leadership offsites to client-facing teams, StyleUp Corporate brings confident,
            consistent personal styling to your whole organisation — anywhere in the world.
          </p>
        </div>
      </section>

      <section className="section" style={{ padding: "3.5rem 1.5rem" }}>
        <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center" }}>
          Corporate packages
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "2.5rem",
          }}
        >
          {PACKAGES.map((p) => (
            <div key={p.name} className="card" style={{ padding: "1.75rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                {p.name}
              </h3>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>{p.blurb}</p>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
                {p.features.map((f) => (
                  <li key={f} style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--accent)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ padding: "1rem 1.5rem 4rem", maxWidth: 720 }}>
        <div className="card" style={{ padding: "2rem" }}>
          <h2 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            Talk to our corporate team
          </h2>
          <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
            Tell us about your team and we'll put together a tailored proposal.
          </p>

          {sent ? (
            <div style={{ marginTop: "1.5rem", padding: "1.25rem", borderRadius: "0.75rem", background: "rgba(196,146,58,0.1)" }}>
              <strong>Thanks, {form.name.split(" ")[0] || "there"}!</strong>
              <p style={{ color: "var(--dim)", marginTop: "0.3rem" }}>
                We've received your enquiry and will be in touch within one business day.
              </p>
              <Link href="/" className="btn btn-outline" style={{ marginTop: "1rem" }}>
                Back to home
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="corp-grid">
                <input className="input" required placeholder="Company name" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <input className="input" required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="input" required type="email" placeholder="Work email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="input" placeholder="Team size" value={form.teamSize} onChange={(e) => setForm({ ...form, teamSize: e.target.value })} />
              </div>
              <textarea
                className="input"
                rows={4}
                style={{ resize: "vertical" }}
                placeholder="What are you looking for?"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <button type="submit" className="btn btn-primary" style={{ width: "fit-content", padding: "0.85rem 2rem" }}>
                Request a proposal
              </button>
            </form>
          )}
        </div>
        <style>{`
          @media (max-width: 600px) {
            .corp-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>
    </div>
  );
}
