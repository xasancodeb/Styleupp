"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatGBP } from "@/lib/stripe";

interface Stats {
  totalBookings: number;
  confirmedBookings: number;
  grossRevenue: number;
  platformRevenue: number;
  activeStylists: number;
  totalUsers: number;
  pendingApplications: number;
}
interface Application {
  id: string;
  full_name: string;
  email: string;
  city: string | null;
  country: string | null;
  years_experience: number | null;
  specialties: string[];
  about: string | null;
  portfolio_url: string | null;
  status: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "applications" | "users" | "stylists" | "reviews">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [stylists, setStylists] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [analytics, setAnalytics] = useState<{ months: { month: string; revenue: number }[] } | null>(null);
  const [denied, setDenied] = useState(false);

  const loadCore = useCallback(async () => {
    const [s, a] = await Promise.all([fetch("/api/admin/stats"), fetch("/api/admin/analytics")]);
    if (s.status === 401 || s.status === 403) return setDenied(true);
    const sd = await s.json();
    setStats(sd.stats);
    setApplications(sd.applications ?? []);
    setAnalytics(await a.json());
  }, []);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (tab === "users" && users.length === 0) fetch("/api/admin/users").then((r) => r.json()).then((d) => setUsers(d.users ?? []));
    if (tab === "stylists" && stylists.length === 0) fetch("/api/admin/stylists").then((r) => r.json()).then((d) => setStylists(d.stylists ?? []));
    if (tab === "reviews" && reviews.length === 0) fetch("/api/admin/reviews").then((r) => r.json()).then((d) => setReviews(d.reviews ?? []));
  }, [tab, users.length, stylists.length, reviews.length]);

  async function reviewApp(id: string, status: "approved" | "rejected") {
    setApplications((apps) => apps.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`/api/admin/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function moderateReview(reviewId: string, status: string) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, status }),
    });
    setReviews((rs) => rs.map((r) => (r.id === reviewId ? { ...r, status } : r)));
  }

  async function setUserRole(userId: string, role: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    setUsers((us) => us.map((u) => (u.id === userId ? { ...u, role } : u)));
  }

  if (denied) {
    return (
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 520, textAlign: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Admin access required</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>You need an admin account to view this page.</p>
        <Link href="/auth/login?next=/admin" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>Sign in</Link>
      </div>
    );
  }

  const pending = applications.filter((a) => a.status === "pending");

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <span className="eyebrow">Control room</span>
      <h1 className="display" style={{ fontSize: "clamp(2.4rem, 6vw, 3.8rem)", marginTop: "0.6rem" }}>Admin</h1>
      <div style={{ display: "flex", gap: "0.5rem", margin: "1.5rem 0", flexWrap: "wrap" }}>
        {(["overview", "applications", "users", "stylists", "reviews"] as const).map((t) => (
          <button key={t} className="tag-toggle" data-active={tab === t} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: "1.25rem" }}>
            <StatCard label="Total bookings" value={stats.totalBookings.toLocaleString()} />
            <StatCard label="Confirmed" value={stats.confirmedBookings.toLocaleString()} />
            <StatCard label="Gross revenue" value={formatGBP(stats.grossRevenue)} />
            <StatCard label="Platform revenue" value={formatGBP(stats.platformRevenue)} accent />
            <StatCard label="Active stylists" value={String(stats.activeStylists)} />
            <StatCard label="Total users" value={String(stats.totalUsers)} />
          </div>
          {analytics && analytics.months.length > 0 && (
            <div className="card" style={{ padding: "1.75rem", marginTop: "1.5rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Revenue (last 6 months)</h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", height: 160, marginTop: "1rem" }}>
                {analytics.months.map((m) => {
                  const max = Math.max(...analytics.months.map((x) => x.revenue), 1);
                  return (
                    <div key={m.month} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ height: `${(m.revenue / max) * 120}px`, background: "var(--accent)", borderRadius: "6px 6px 0 0", minHeight: 4 }} />
                      <div style={{ fontSize: "0.72rem", color: "var(--faint)", marginTop: "0.4rem" }}>{m.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {tab === "applications" && (
        <div style={{ display: "grid", gap: "1rem" }}>
          {pending.length === 0 ? (
            <div className="card" style={{ padding: "2.5rem", textAlign: "center", color: "var(--dim)" }}>No pending applications.</div>
          ) : (
            pending.map((app) => (
              <div key={app.id} className="card" style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 320px" }}>
                  <strong style={{ fontSize: "1.1rem" }}>{app.full_name}</strong>{" "}
                  <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>{app.email}</span>
                  <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    {[app.city, app.country].filter(Boolean).join(", ")}
                    {app.years_experience != null && ` · ${app.years_experience} yrs`}
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.5rem" }}>
                    {app.specialties.map((s) => <span key={s} className="chip chip-muted">{s}</span>)}
                  </div>
                  {app.about && <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.5rem" }}>{app.about}</p>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", justifyContent: "center" }}>
                  <button onClick={() => reviewApp(app.id, "approved")} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>Approve</button>
                  <button onClick={() => reviewApp(app.id, "rejected")} className="btn btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>Reject</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "users" && (
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {users.map((u) => (
            <div key={u.id as string} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <strong>{(u.full_name as string) || "—"}</strong>
                <div style={{ color: "var(--faint)", fontSize: "0.85rem" }}>{u.email as string}</div>
              </div>
              <select className="input" style={{ maxWidth: 140 }} value={u.role as string} onChange={(e) => setUserRole(u.id as string, e.target.value)}>
                <option value="client">client</option>
                <option value="stylist">stylist</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {tab === "stylists" && (
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {stylists.map((s) => (
            <div key={s.id as string} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <strong>{s.display_name as string}</strong>
                <div style={{ color: "var(--faint)", fontSize: "0.85rem" }}>
                  {[s.city, s.country].filter(Boolean).join(", ")} · ★ {String(s.rating)} · {String(s.sessions_completed)} sessions
                </div>
              </div>
              <span className="chip chip-muted">{s.status as string}{s.payouts_enabled ? " · payouts ✓" : ""}</span>
            </div>
          ))}
          {stylists.length === 0 && <p style={{ color: "var(--dim)" }}>No stylist accounts yet.</p>}
        </div>
      )}

      {tab === "reviews" && (
        <div style={{ display: "grid", gap: "0.6rem" }}>
          {reviews.map((r) => (
            <div key={r.id as string} className="card" style={{ padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 320px" }}>
                <span style={{ color: "var(--accent)" }}>{"★".repeat(Number(r.rating))}</span>
                <p style={{ color: "var(--dim)", fontSize: "0.9rem" }}>{(r.comment as string) || "No comment"}</p>
                <span className="chip chip-muted">{r.status as string}</span>
              </div>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <button onClick={() => moderateReview(r.id as string, "published")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Publish</button>
                <button onClick={() => moderateReview(r.id as string, "hidden")} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Hide</button>
              </div>
            </div>
          ))}
          {reviews.length === 0 && <p style={{ color: "var(--dim)" }}>No reviews to moderate.</p>}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem", borderTop: accent ? "3px solid var(--accent)" : undefined }}>
      <div style={{ color: "var(--faint)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 700, marginTop: "0.3rem" }}>{value}</div>
    </div>
  );
}
