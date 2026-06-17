"use client";

import { useState } from "react";
import Link from "next/link";
import { SPECIALTIES } from "@/lib/data";

interface FormState {
  fullName: string;
  email: string;
  city: string;
  country: string;
  yearsExperience: string;
  specialties: string[];
  portfolioUrl: string;
  about: string;
}

const EMPTY: FormState = {
  fullName: "",
  email: "",
  city: "",
  country: "",
  yearsExperience: "",
  specialties: [],
  portfolioUrl: "",
  about: "",
};

export default function StylistPortalPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSpecialty(s: string) {
    setForm((f) => ({
      ...f,
      specialties: f.specialties.includes(s)
        ? f.specialties.filter((x) => x !== s)
        : [...f.specialties, s],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.fullName || !form.email) {
      setError("Please add your name and email.");
      return;
    }
    if (form.specialties.length === 0) {
      setError("Please select at least one specialty.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/stylist-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.fullName,
          email: form.email,
          city: form.city,
          country: form.country,
          years_experience: form.yearsExperience ? Number(form.yearsExperience) : null,
          specialties: form.specialties,
          portfolio_url: form.portfolioUrl || null,
          about: form.about || null,
        }),
      }).catch(() => null);
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 620, textAlign: "center" }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(196,146,58,0.15)",
            color: "var(--accent-dark)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            margin: "0 auto",
          }}
        >
          ✓
        </div>
        <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 700, marginTop: "1.25rem" }}>
          Application received
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>
          Thank you, {form.fullName.split(" ")[0] || "stylist"}. Our team reviews every application
          personally and will be in touch within 3–5 business days.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "1.75rem" }}>
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem", maxWidth: 720 }}>
      <Link href="/for-stylists" style={{ color: "var(--accent-dark)", fontWeight: 600, fontSize: "0.9rem" }}>
        ← Back to For stylists
      </Link>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700, marginTop: "0.75rem" }}>
        Stylist application
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        Tell us about yourself and your work. All fields marked * are required.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: "1.75rem", marginTop: "1.75rem", display: "grid", gap: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="form-grid">
          <Field label="Full name *">
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Jane Doe" />
          </Field>
          <Field label="Email *">
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
          </Field>
          <Field label="City">
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="London" />
          </Field>
          <Field label="Country">
            <input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="United Kingdom" />
          </Field>
          <Field label="Years of experience">
            <input className="input" type="number" min={0} value={form.yearsExperience} onChange={(e) => setForm({ ...form, yearsExperience: e.target.value })} placeholder="5" />
          </Field>
          <Field label="Portfolio / website">
            <input className="input" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} placeholder="https://…" />
          </Field>
        </div>

        <Field label="Your specialties *">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.25rem" }}>
            {SPECIALTIES.map((s) => (
              <button
                key={s}
                type="button"
                className="tag-toggle"
                data-active={form.specialties.includes(s)}
                onClick={() => toggleSpecialty(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tell us about your work">
          <textarea
            className="input"
            rows={5}
            style={{ resize: "vertical" }}
            value={form.about}
            onChange={(e) => setForm({ ...form, about: e.target.value })}
            placeholder="Your styling philosophy, the clients you love working with, and what makes your approach unique…"
          />
        </Field>

        {error && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "fit-content", padding: "0.85rem 2rem" }}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>

      <style>{`
        @media (max-width: 600px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "grid", gap: "0.35rem" }}>
      <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>{label}</span>
      {children}
    </label>
  );
}
