"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getUpcoming,
  getPast,
  cancelBooking,
  refundForBooking,
  formatDateTime,
  type Booking,
} from "@/lib/booking";
import { loadProfile, saveProfile, PALETTES, type ClientProfile } from "@/lib/profile";
import { formatGBP } from "@/lib/stripe";

export default function DashboardPage() {
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [tab, setTab] = useState<"bookings" | "profile">("bookings");

  function refresh() {
    setUpcoming(getUpcoming());
    setPast(getPast());
  }

  useEffect(() => {
    refresh();
    setProfile(loadProfile());
  }, []);

  function handleCancel(b: Booking) {
    const refund = refundForBooking(b);
    const ok = window.confirm(
      `Cancel your session with ${b.stylistName}?\n\n${refund.policy}\nRefund: ${formatGBP(
        refund.refundAmount
      )}`
    );
    if (!ok) return;
    cancelBooking(b.id);
    refresh();
  }

  function updateProfile(patch: Partial<ClientProfile>) {
    setProfile(saveProfile(patch));
  }

  const palette = profile?.season ? PALETTES[profile.season] : null;

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>
        Your dashboard
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        Manage your bookings, profile and style results — all in one place.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1.75rem 0 1.5rem" }}>
        {(["bookings", "profile"] as const).map((t) => (
          <button
            key={t}
            className="tag-toggle"
            data-active={tab === t}
            onClick={() => setTab(t)}
            style={{ textTransform: "capitalize" }}
          >
            {t === "bookings" ? "Bookings" : "Profile & style"}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <div style={{ display: "grid", gap: "2rem" }}>
          <section>
            <h2 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
              Upcoming sessions
            </h2>
            {upcoming.length === 0 ? (
              <EmptyState
                title="No upcoming sessions"
                body="Ready to refresh your wardrobe? Browse our stylists and book your first session."
                cta={{ href: "/explore", label: "Find a stylist" }}
              />
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {upcoming.map((b) => (
                  <BookingRow key={b.id} booking={b} onCancel={() => handleCancel(b)} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
              Past & cancelled
            </h2>
            {past.length === 0 ? (
              <p style={{ color: "var(--dim)" }}>Your session history will appear here.</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "profile" && profile && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: "1.5rem" }} className="dash-grid">
          <section className="card" style={{ padding: "1.75rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              Your details
            </h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Full name</span>
                <input
                  className="input"
                  value={profile.fullName}
                  onChange={(e) => updateProfile({ fullName: e.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Email</span>
                <input
                  className="input"
                  value={profile.email}
                  onChange={(e) => updateProfile({ email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Preferred budget</span>
                <select
                  className="input"
                  value={profile.preferences.budget ?? ""}
                  onChange={(e) =>
                    updateProfile({
                      preferences: { ...profile.preferences, budget: (e.target.value || null) as ClientProfile["preferences"]["budget"] },
                    })
                  }
                >
                  <option value="">No preference</option>
                  <option value="value">Value</option>
                  <option value="mid">Mid-range</option>
                  <option value="premium">Premium</option>
                </select>
              </label>
              <p style={{ color: "var(--faint)", fontSize: "0.82rem" }}>
                Changes save automatically to this device.
              </p>
            </div>
          </section>

          <section className="card" style={{ padding: "1.75rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              Your colour results
            </h2>
            {palette ? (
              <div style={{ marginTop: "1rem" }}>
                <span className="chip">{palette.name}</span>
                <p style={{ color: "var(--dim)", marginTop: "0.75rem" }}>{palette.tagline}</p>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  {palette.bestColors.map((c) => (
                    <span
                      key={c.hex}
                      title={c.name}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: c.hex,
                        border: "1px solid var(--border)",
                      }}
                    />
                  ))}
                </div>
                <Link href="/fitting" className="btn btn-outline" style={{ marginTop: "1.25rem" }}>
                  Open fitting room →
                </Link>
              </div>
            ) : (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ color: "var(--dim)" }}>
                  You haven't taken the style quiz yet. Discover your colour season in two minutes.
                </p>
                <Link href="/quiz" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                  Take the quiz
                </Link>
              </div>
            )}
          </section>
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .dash-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function BookingRow({ booking, onCancel }: { booking: Booking; onCancel?: () => void }) {
  const statusColor: Record<string, string> = {
    confirmed: "var(--accent-dark)",
    pending: "var(--dim)",
    completed: "#2f5d3a",
    cancelled: "#b3261e",
  };
  return (
    <div
      className="card"
      style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}
    >
      <div>
        <strong style={{ fontSize: "1.05rem" }}>{booking.serviceName}</strong>
        <div style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
          with {booking.stylistName} · {formatDateTime(booking.scheduledFor)}
        </div>
        <span
          style={{
            display: "inline-block",
            marginTop: "0.5rem",
            fontSize: "0.78rem",
            fontWeight: 700,
            textTransform: "capitalize",
            color: statusColor[booking.status] ?? "var(--dim)",
          }}
        >
          ● {booking.status}
        </span>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
          {formatGBP(booking.total)}
        </div>
        {onCancel && booking.status !== "cancelled" && (
          <button
            onClick={onCancel}
            className="btn btn-outline"
            style={{ marginTop: "0.5rem", padding: "0.4rem 0.9rem", fontSize: "0.82rem" }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
      <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
        {title}
      </h3>
      <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 420, margin: "0.5rem auto 0" }}>{body}</p>
      <Link href={cta.href} className="btn btn-primary" style={{ marginTop: "1.25rem" }}>
        {cta.label}
      </Link>
    </div>
  );
}
