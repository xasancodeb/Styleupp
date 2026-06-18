"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatGBP } from "@/lib/stripe";
import { SPECIALTIES } from "@/lib/data";

interface StylistRow {
  id: string;
  slug: string;
  display_name: string;
  tagline: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
  specialties: string[];
  session_types: string[];
  starting_price: number;
  portfolio_images: string[];
  payouts_enabled: boolean;
}

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  session_type: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StylistDashboard() {
  const [tab, setTab] = useState<"earnings" | "profile" | "services" | "availability" | "payouts">("earnings");
  const [stylist, setStylist] = useState<StylistRow | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [earnings, setEarnings] = useState<{ lifetime: number; monthSessions: number; tier: string } | null>(null);
  const [upcoming, setUpcoming] = useState<{ id: string; service_name: string; scheduled_for: string; total: number }[]>([]);
  const [connect, setConnect] = useState<{ connected: boolean; payoutsEnabled: boolean }>({ connected: false, payoutsEnabled: false });
  const [authError, setAuthError] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, s, e, c] = await Promise.all([
        fetch("/api/stylist/profile"),
        fetch("/api/stylist/services"),
        fetch("/api/stylist/earnings"),
        fetch("/api/stripe/connect"),
      ]);
      if (p.status === 401) return setAuthError(true);
      setStylist((await p.json()).stylist);
      setServices((await s.json()).services ?? []);
      const ed = await e.json();
      setEarnings({ lifetime: ed.summary?.lifetime ?? 0, monthSessions: ed.summary?.monthSessions ?? 0, tier: ed.tier?.name ?? "Starter" });
      setUpcoming(ed.bookings ?? []);
      setConnect(await c.json());
    } catch {
      setAuthError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (authError) {
    return (
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 520, textAlign: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Stylist studio</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>Sign in with your stylist account to continue.</p>
        <Link href="/auth/login?next=/stylist-dashboard" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Sign in</Link>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <span className="eyebrow">Your business</span>
      <h1 className="display" style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", marginTop: "0.6rem" }}>Stylist <em>studio</em></h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        {stylist ? `Welcome back, ${stylist.display_name}.` : "Let's set up your stylist profile."}
      </p>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1.75rem 0 1.5rem", flexWrap: "wrap" }}>
        {(["earnings", "profile", "services", "availability", "payouts"] as const).map((t) => (
          <button key={t} className="tag-toggle" data-active={tab === t} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "earnings" && (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {stylist && !connect.payoutsEnabled && (
            <div
              className="card"
              style={{ padding: "1.1rem 1.4rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", background: "rgba(196,146,58,0.08)", border: "1px solid rgba(196,146,58,0.25)" }}
            >
              <span><strong>Set up payouts</strong> to start receiving your earnings automatically.</span>
              <button onClick={() => setTab("payouts")} className="btn btn-primary" style={{ padding: "0.5rem 1.1rem" }}>Connect payouts</button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "1.25rem" }}>
            <Stat label="Lifetime earnings" value={formatGBP(earnings?.lifetime ?? 0)} accent />
            <Stat label="Sessions this month" value={String(earnings?.monthSessions ?? 0)} />
            <Stat label="Commission tier" value={earnings?.tier ?? "Starter"} />
            <Stat label="Payouts" value={connect.payoutsEnabled ? "Active" : "Not set up"} />
          </div>
          <section>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.75rem" }}>Upcoming sessions</h2>
            {upcoming.length === 0 ? (
              <p style={{ color: "var(--dim)" }}>No upcoming confirmed sessions yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                {upcoming.map((b) => (
                  <div key={b.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                    <div>
                      <strong>{b.service_name}</strong>
                      <div style={{ color: "var(--dim)", fontSize: "0.85rem" }}>
                        {new Date(b.scheduled_for).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <span className="font-serif" style={{ fontWeight: 700 }}>{formatGBP(b.total)}</span>
                      <a href={`/messages/${b.id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Message</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "profile" && <ProfileForm stylist={stylist} onSaved={load} />}
      {tab === "services" && <ServicesPanel services={services} hasProfile={!!stylist} onChange={load} />}
      {tab === "availability" && <AvailabilityPanel hasProfile={!!stylist} />}
      {tab === "payouts" && <PayoutsPanel connect={connect} hasProfile={!!stylist} />}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem", borderTop: accent ? "3px solid var(--accent)" : undefined }}>
      <div style={{ color: "var(--faint)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div className="font-serif" style={{ fontSize: "1.7rem", fontWeight: 700, marginTop: "0.3rem" }}>{value}</div>
    </div>
  );
}

function ProfileForm({ stylist, onSaved }: { stylist: StylistRow | null; onSaved: () => void }) {
  const [form, setForm] = useState({
    displayName: stylist?.display_name ?? "",
    tagline: stylist?.tagline ?? "",
    bio: stylist?.bio ?? "",
    city: stylist?.city ?? "",
    country: stylist?.country ?? "",
    startingPrice: stylist?.starting_price ?? 90,
    specialties: stylist?.specialties ?? [],
    portfolioImages: (stylist?.portfolio_images ?? []).join("\n"),
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (stylist) {
      setForm({
        displayName: stylist.display_name,
        tagline: stylist.tagline ?? "",
        bio: stylist.bio ?? "",
        city: stylist.city ?? "",
        country: stylist.country ?? "",
        startingPrice: stylist.starting_price,
        specialties: stylist.specialties ?? [],
        portfolioImages: (stylist.portfolio_images ?? []).join("\n"),
      });
    }
  }, [stylist]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/stylist/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        tagline: form.tagline,
        bio: form.bio,
        city: form.city,
        country: form.country,
        startingPrice: Number(form.startingPrice),
        specialties: form.specialties,
        portfolioImages: form.portfolioImages.split("\n").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setSaving(false);
    setMsg(res.ok ? "Profile saved." : (await res.json()).error ?? "Could not save.");
    if (res.ok) onSaved();
  }

  return (
    <form onSubmit={save} className="card" style={{ padding: "1.75rem", display: "grid", gap: "1rem", maxWidth: 680 }}>
      <Field label="Display name *"><input className="input" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} /></Field>
      <Field label="Tagline"><input className="input" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
      <Field label="Bio"><textarea className="input" rows={4} style={{ resize: "vertical" }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
        <Field label="City"><input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        <Field label="Country"><input className="input" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
        <Field label="From (£)"><input className="input" type="number" value={form.startingPrice} onChange={(e) => setForm({ ...form, startingPrice: Number(e.target.value) })} /></Field>
      </div>
      <Field label="Specialties">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {SPECIALTIES.map((s) => (
            <button key={s} type="button" className="tag-toggle" data-active={form.specialties.includes(s)} onClick={() => setForm((f) => ({ ...f, specialties: f.specialties.includes(s) ? f.specialties.filter((x) => x !== s) : [...f.specialties, s] }))}>{s}</button>
          ))}
        </div>
      </Field>
      <Field label="Portfolio image URLs (one per line)"><textarea className="input" rows={3} style={{ resize: "vertical" }} value={form.portfolioImages} onChange={(e) => setForm({ ...form, portfolioImages: e.target.value })} placeholder="https://…" /></Field>
      {msg && <p style={{ color: msg.includes("saved") ? "var(--accent-dark)" : "#b3261e", fontSize: "0.9rem" }}>{msg}</p>}
      <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: "fit-content" }}>{saving ? "Saving…" : "Save profile"}</button>
    </form>
  );
}

function ServicesPanel({ services, hasProfile, onChange }: { services: ServiceRow[]; hasProfile: boolean; onChange: () => void }) {
  const [form, setForm] = useState({ name: "", description: "", durationMinutes: 60, price: 120, sessionType: "virtual" });
  const [msg, setMsg] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/stylist/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes), price: Number(form.price) }),
    });
    if (res.ok) {
      setForm({ name: "", description: "", durationMinutes: 60, price: 120, sessionType: "virtual" });
      onChange();
    } else setMsg((await res.json()).error ?? "Could not add service.");
  }

  async function remove(id: string) {
    await fetch(`/api/stylist/services?id=${id}`, { method: "DELETE" });
    onChange();
  }

  if (!hasProfile) return <Notice>Create your profile first to add services.</Notice>;

  return (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: 680 }}>
      <div style={{ display: "grid", gap: "0.75rem" }}>
        {services.length === 0 && <p style={{ color: "var(--dim)" }}>No services yet.</p>}
        {services.map((s) => (
          <div key={s.id} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>{s.name}</strong>
              <div style={{ color: "var(--dim)", fontSize: "0.85rem" }}>{s.duration_minutes} min · {s.session_type} · {formatGBP(s.price)}</div>
            </div>
            <button onClick={() => remove(s.id)} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Remove</button>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}>
        <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Add a service</h3>
        <input className="input" required placeholder="Service name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Short description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
          <input className="input" type="number" placeholder="Minutes" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Price £" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <select className="input" value={form.sessionType} onChange={(e) => setForm({ ...form, sessionType: e.target.value })}>
            <option value="virtual">Virtual</option>
            <option value="in-person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        {msg && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{msg}</p>}
        <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>Add service</button>
      </form>
    </div>
  );
}

function AvailabilityPanel({ hasProfile }: { hasProfile: boolean }) {
  const [rows, setRows] = useState(
    WEEKDAYS.map((_, i) => ({ weekday: i, enabled: i >= 1 && i <= 5, startTime: "09:00", endTime: "17:00", slotMinutes: 60 }))
  );
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    const rules = rows.filter((r) => r.enabled).map((r) => ({ weekday: r.weekday, startTime: r.startTime, endTime: r.endTime, slotMinutes: r.slotMinutes, isAvailable: true }));
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rules }),
    });
    setMsg(res.ok ? "Availability saved." : (await res.json()).error ?? "Could not save.");
  }

  if (!hasProfile) return <Notice>Create your profile first to set availability.</Notice>;

  return (
    <div className="card" style={{ padding: "1.75rem", maxWidth: 680 }}>
      <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Weekly availability</h3>
      <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
        {rows.map((r, i) => (
          <div key={r.weekday} style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <label style={{ width: 90, display: "flex", gap: "0.4rem", alignItems: "center" }}>
              <input type="checkbox" checked={r.enabled} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, enabled: e.target.checked } : x)))} />
              {WEEKDAYS[r.weekday]}
            </label>
            <input type="time" className="input" style={{ maxWidth: 120 }} value={r.startTime} disabled={!r.enabled} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, startTime: e.target.value } : x)))} />
            <span>–</span>
            <input type="time" className="input" style={{ maxWidth: 120 }} value={r.endTime} disabled={!r.enabled} onChange={(e) => setRows((rs) => rs.map((x, j) => (j === i ? { ...x, endTime: e.target.value } : x)))} />
          </div>
        ))}
      </div>
      {msg && <p style={{ color: msg.includes("saved") ? "var(--accent-dark)" : "#b3261e", fontSize: "0.9rem", marginTop: "0.75rem" }}>{msg}</p>}
      <button onClick={save} className="btn btn-primary" style={{ marginTop: "1rem" }}>Save availability</button>
    </div>
  );
}

function PayoutsPanel({ connect, hasProfile }: { connect: { connected: boolean; payoutsEnabled: boolean }; hasProfile: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/stripe/connect", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.url) window.location.href = data.url;
    else {
      setError(data.error ?? "Could not start onboarding.");
      setBusy(false);
    }
  }

  if (!hasProfile) return <Notice>Create your profile first to enable payouts.</Notice>;

  return (
    <div className="card" style={{ padding: "1.75rem", maxWidth: 560 }}>
      <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700 }}>Payouts via Stripe</h3>
      <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>
        {connect.payoutsEnabled
          ? "Your payouts are active. Earnings are transferred automatically after each session is paid."
          : "Connect a Stripe account to receive automatic payouts. The platform commission is deducted before transfer."}
      </p>
      {error && <p style={{ color: "#b3261e", fontSize: "0.9rem", marginTop: "0.5rem" }}>{error}</p>}
      <button onClick={start} className="btn btn-primary" disabled={busy} style={{ marginTop: "1rem" }}>
        {busy ? "Redirecting…" : connect.payoutsEnabled ? "Open Stripe dashboard" : connect.connected ? "Finish onboarding" : "Connect payouts"}
      </button>
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

function Notice({ children }: { children: React.ReactNode }) {
  return <div className="card" style={{ padding: "1.5rem", color: "var(--dim)", maxWidth: 560 }}>{children}</div>;
}
