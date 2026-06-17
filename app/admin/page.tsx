"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { formatGBP } from "@/lib/stripe";
import type { ApplicationStatus, StylistApplicationRow } from "@/lib/database.types";

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  grossRevenue: number;
  platformRevenue: number;
  activeStylists: number;
  pendingApplications: number;
}

// Fallback figures so the dashboard is meaningful even before any data exists.
const DEMO_STATS: Stats = {
  totalBookings: 1284,
  confirmedBookings: 1192,
  grossRevenue: 248640,
  platformRevenue: 31920,
  activeStylists: 13,
  pendingApplications: 3,
};

const DEMO_APPLICATIONS: StylistApplicationRow[] = [
  {
    id: "app-1",
    full_name: "Marta Kowalski",
    email: "marta@example.com",
    city: "Warsaw",
    country: "Poland",
    years_experience: 6,
    specialties: ["Capsule Wardrobe", "Colour Analysis"],
    portfolio_url: "https://example.com/marta",
    about: "Former retail buyer turned stylist focused on sustainable capsule wardrobes.",
    status: "pending",
    created_at: "2026-06-10T09:00:00Z",
    reviewed_at: null,
  },
  {
    id: "app-2",
    full_name: "Tariq Hassan",
    email: "tariq@example.com",
    city: "Cairo",
    country: "Egypt",
    years_experience: 9,
    specialties: ["Menswear", "Occasion & Event"],
    portfolio_url: "https://example.com/tariq",
    about: "Menswear specialist with a decade dressing grooms and executives across the Middle East.",
    status: "pending",
    created_at: "2026-06-12T11:30:00Z",
    reviewed_at: null,
  },
  {
    id: "app-3",
    full_name: "Hana Park",
    email: "hana@example.com",
    city: "Seoul",
    country: "South Korea",
    years_experience: 4,
    specialties: ["Personal Shopping", "Body Confidence"],
    portfolio_url: null,
    about: "Confidence-first stylist working with young professionals in Seoul.",
    status: "pending",
    created_at: "2026-06-14T15:45:00Z",
    reviewed_at: null,
  },
];

export default function AdminPage() {
  const [stats, setStats] = useState<Stats>(DEMO_STATS);
  const [applications, setApplications] = useState<StylistApplicationRow[]>(DEMO_APPLICATIONS);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabaseBrowser().auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          setLoading(false);
          return;
        }
        const res = await fetch("/api/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const body = (await res.json()) as { stats: Stats; applications: StylistApplicationRow[] };
          setStats(body.stats);
          setApplications(body.applications);
          setLive(true);
        }
      } catch {
        // keep demo data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function review(id: string, status: ApplicationStatus) {
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const { data } = await supabaseBrowser().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
    } catch {
      // optimistic update already applied
    }
  }

  const pending = applications.filter((a) => a.status === "pending");

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>
          Admin dashboard
        </h1>
        <span className="chip chip-muted">{live ? "Live data" : loading ? "Loading…" : "Demo data"}</span>
      </div>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        Platform overview and stylist application review.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.25rem",
          marginTop: "2rem",
        }}
      >
        <StatCard label="Total bookings" value={stats.totalBookings.toLocaleString()} />
        <StatCard label="Confirmed" value={stats.confirmedBookings.toLocaleString()} />
        <StatCard label="Gross revenue" value={formatGBP(stats.grossRevenue)} />
        <StatCard label="Platform revenue" value={formatGBP(stats.platformRevenue)} accent />
        <StatCard label="Active stylists" value={String(stats.activeStylists)} />
        <StatCard label="Pending applications" value={String(stats.pendingApplications)} />
      </div>

      <h2 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 700, margin: "2.5rem 0 1rem" }}>
        Stylist applications
      </h2>
      {pending.length === 0 ? (
        <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--dim)" }}>
          No pending applications. You're all caught up.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {pending.map((app) => (
            <div key={app.id} className="card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 320px" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "1.1rem" }}>{app.full_name}</strong>
                  <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>{app.email}</span>
                </div>
                <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                  {[app.city, app.country].filter(Boolean).join(", ")}
                  {app.years_experience != null && ` · ${app.years_experience} yrs experience`}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.6rem" }}>
                  {app.specialties.map((s) => (
                    <span key={s} className="chip chip-muted">
                      {s}
                    </span>
                  ))}
                </div>
                {app.about && <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.6rem" }}>{app.about}</p>}
                {app.portfolio_url && (
                  <a href={app.portfolio_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-dark)", fontWeight: 600, fontSize: "0.85rem" }}>
                    View portfolio →
                  </a>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                <button onClick={() => review(app.id, "approved")} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                  Approve
                </button>
                <button onClick={() => review(app.id, "rejected")} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem", borderTop: accent ? "3px solid var(--accent)" : undefined }}>
      <div style={{ color: "var(--faint)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.3rem" }}>
        {value}
      </div>
    </div>
  );
}
