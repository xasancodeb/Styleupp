"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatGBP } from "@/lib/stripe";
import { PALETTES, type ColorSeason } from "@/lib/profile";
import { getStylist } from "@/lib/data";

interface Booking {
  id: string;
  stylist_id: string;
  service_id: string | null;
  service_name: string;
  scheduled_for: string;
  total: number;
  status: string;
  reschedule_count: number;
}

interface Profile {
  full_name: string | null;
  email: string;
  phone: string | null;
  color_season: ColorSeason | null;
  archetype: string | null;
  loyalty_points: number;
  referral_code: string | null;
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saved, setSaved] = useState<string[]>([]);
  const [referrals, setReferrals] = useState<{ code: string | null; loyaltyPoints: number; referrals: { referred_email: string; status: string }[] } | null>(null);
  const [tab, setTab] = useState<"bookings" | "saved" | "referrals" | "profile">("bookings");
  const [authError, setAuthError] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [b, p, s] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/profile"),
        fetch("/api/saved-stylists"),
      ]);
      if (b.status === 401 || p.status === 401) {
        setAuthError(true);
        return;
      }
      const bd = await b.json();
      const pd = await p.json();
      const sd = await s.json();
      setBookings(bd.bookings ?? []);
      setProfile(pd.profile ?? null);
      setSaved(sd.saved ?? []);
      fetch("/api/referrals")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setReferrals(d))
        .catch(() => {});
    } catch {
      setAuthError(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function cancel(b: Booking) {
    if (!window.confirm(`Cancel ${b.service_name}? Refund depends on how close the session is.`)) return;
    const res = await fetch(`/api/bookings/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    const data = await res.json();
    if (res.ok) {
      window.alert(`Cancelled. Refund: ${formatGBP(data.refund?.amount ?? 0)}.`);
      void load();
    } else {
      window.alert(data.error ?? "Could not cancel.");
    }
  }

  async function saveProfileField(patch: Partial<Profile>) {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: patch.full_name ?? undefined,
        phone: patch.phone ?? undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => (prev ? { ...prev, ...data.profile } : prev));
    }
  }

  if (authError) {
    return (
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 520, textAlign: "center" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Sign in to view your dashboard</h1>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>
          Your bookings, profile and style results live here once you're signed in.
        </p>
        <Link href="/auth/login?next=/dashboard" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
          Sign in
        </Link>
      </div>
    );
  }

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => !["cancelled", "refunded", "completed"].includes(b.status) && new Date(b.scheduled_for).getTime() >= now
  );
  const past = bookings.filter(
    (b) => ["cancelled", "refunded", "completed"].includes(b.status) || new Date(b.scheduled_for).getTime() < now
  );
  const palette = profile?.color_season ? PALETTES[profile.color_season] : null;

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem" }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>Your dashboard</h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        {profile?.loyalty_points != null && (
          <>You have <strong>{profile.loyalty_points}</strong> loyalty points · </>
        )}
        Manage your bookings, saved stylists and style profile.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1.75rem 0 1.5rem", flexWrap: "wrap" }}>
        {(["bookings", "saved", "referrals", "profile"] as const).map((t) => (
          <button key={t} className="tag-toggle" data-active={tab === t} onClick={() => setTab(t)} style={{ textTransform: "capitalize" }}>
            {t === "saved" ? "Saved stylists" : t === "profile" ? "Profile & style" : t === "referrals" ? "Refer & earn" : "Bookings"}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <div style={{ display: "grid", gap: "2rem" }}>
          <section>
            <h2 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Upcoming sessions</h2>
            {upcoming.length === 0 ? (
              <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <p style={{ color: "var(--dim)" }}>No upcoming sessions yet.</p>
                <Link href="/explore" className="btn btn-primary" style={{ marginTop: "1rem" }}>Find a stylist</Link>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {upcoming.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    onCancel={() => cancel(b)}
                    rescheduling={rescheduleId === b.id}
                    onToggleReschedule={() => setRescheduleId(rescheduleId === b.id ? null : b.id)}
                    onRescheduled={() => {
                      setRescheduleId(null);
                      void load();
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>Past & cancelled</h2>
            {past.length === 0 ? (
              <p style={{ color: "var(--dim)" }}>Your session history will appear here.</p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {past.map((b) => (
                  <BookingRow key={b.id} booking={b} onRebook reviewable={b.status === "completed"} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {tab === "saved" && (
        <div>
          {saved.length === 0 ? (
            <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
              <p style={{ color: "var(--dim)" }}>You haven't saved any stylists yet.</p>
              <Link href="/explore" className="btn btn-primary" style={{ marginTop: "1rem" }}>Browse stylists</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
              {saved.map((slug) => {
                const s = getStylist(slug);
                return (
                  <div key={slug} className="card" style={{ padding: "1.25rem" }}>
                    <strong>{s?.name ?? slug}</strong>
                    <p style={{ color: "var(--dim)", fontSize: "0.88rem" }}>{s?.city}</p>
                    <Link href={`/stylist/${slug}`} className="btn btn-outline" style={{ marginTop: "0.75rem", width: "100%" }}>View profile</Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "referrals" && (
        <ReferralsPanel data={referrals} onChange={load} />
      )}

      {tab === "profile" && profile && (
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.5rem" }} className="dash-grid">
          <section className="card" style={{ padding: "1.75rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Your details</h2>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Full name</span>
                <input className="input" defaultValue={profile.full_name ?? ""} onBlur={(e) => saveProfileField({ full_name: e.target.value })} />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Phone</span>
                <input className="input" defaultValue={profile.phone ?? ""} onBlur={(e) => saveProfileField({ phone: e.target.value })} />
              </label>
              <p style={{ color: "var(--faint)", fontSize: "0.82rem" }}>
                Email: {profile.email} · Referral code: <strong>{profile.referral_code}</strong>
              </p>
            </div>
          </section>

          <section className="card" style={{ padding: "1.75rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Your style results</h2>
            {palette ? (
              <div style={{ marginTop: "1rem" }}>
                <span className="chip">{palette.name}</span>
                {profile.archetype && <span className="chip chip-muted" style={{ marginLeft: 8 }}>{profile.archetype}</span>}
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "1rem", flexWrap: "wrap" }}>
                  {palette.bestColors.map((c) => (
                    <span key={c.hex} title={c.name} style={{ width: 36, height: 36, borderRadius: "50%", background: c.hex, border: "1px solid var(--border)" }} />
                  ))}
                </div>
                <Link href="/fitting" className="btn btn-outline" style={{ marginTop: "1.25rem" }}>Open fitting room →</Link>
              </div>
            ) : (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ color: "var(--dim)" }}>Take the quiz to discover your colour season.</p>
                <Link href="/quiz" className="btn btn-primary" style={{ marginTop: "1rem" }}>Take the quiz</Link>
              </div>
            )}
          </section>
        </div>
      )}

      <style>{`@media (max-width: 760px){.dash-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function BookingRow({
  booking,
  onCancel,
  onRebook,
  reviewable,
  rescheduling,
  onToggleReschedule,
  onRescheduled,
}: {
  booking: Booking;
  onCancel?: () => void;
  onRebook?: boolean;
  reviewable?: boolean;
  rescheduling?: boolean;
  onToggleReschedule?: () => void;
  onRescheduled?: () => void;
}) {
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const colors: Record<string, string> = {
    confirmed: "var(--accent-dark)",
    pending: "var(--dim)",
    completed: "#2f5d3a",
    cancelled: "#b3261e",
    refunded: "#b3261e",
  };
  return (
    <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <strong style={{ fontSize: "1.05rem" }}>{booking.service_name}</strong>
          <div style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
            {getStylist(booking.stylist_id)?.name ?? booking.stylist_id} · {fmt(booking.scheduled_for)}
          </div>
          <span style={{ display: "inline-block", marginTop: "0.5rem", fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize", color: colors[booking.status] ?? "var(--dim)" }}>
            ● {booking.status}
          </span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>{formatGBP(booking.total)}</div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            <Link href={`/messages/${booking.id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Message</Link>
            {onToggleReschedule && (
              <button onClick={onToggleReschedule} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Reschedule</button>
            )}
            {onCancel && (
              <button onClick={onCancel} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Cancel</button>
            )}
            {reviewable && !reviewDone && (
              <button onClick={() => setShowReview((s) => !s)} className="btn btn-outline" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>
                {showReview ? "Close" : "Leave review"}
              </button>
            )}
            {onRebook && (
              <Link href={`/book?stylist=${booking.stylist_id}${booking.service_id ? `&service=${booking.service_id}` : ""}`} className="btn btn-primary" style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem" }}>Rebook</Link>
            )}
          </div>
        </div>
      </div>
      {rescheduling && <ReschedulePanel booking={booking} onDone={onRescheduled!} />}
      {showReview && !reviewDone && (
        <ReviewForm
          bookingId={booking.id}
          onDone={() => {
            setReviewDone(true);
            setShowReview(false);
          }}
        />
      )}
      {reviewDone && <p style={{ color: "var(--accent-dark)", fontSize: "0.85rem", marginTop: "0.75rem" }}>Thanks for your review!</p>}
    </div>
  );
}

function ReviewForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, rating, comment: comment || undefined }),
    });
    setBusy(false);
    if (res.ok) onDone();
    else setError((await res.json()).error ?? "Could not submit review.");
  }

  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.4rem", color: n <= rating ? "var(--accent)" : "var(--border)" }}
            aria-label={`${n} stars`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea className="input" rows={2} style={{ resize: "vertical" }} placeholder="Share how your session went…" value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <p style={{ color: "#b3261e", fontSize: "0.82rem", marginTop: "0.4rem" }}>{error}</p>}
      <button onClick={submit} className="btn btn-primary" disabled={busy} style={{ marginTop: "0.6rem", padding: "0.45rem 1.1rem", fontSize: "0.85rem" }}>
        {busy ? "Submitting…" : "Submit review"}
      </button>
    </div>
  );
}

function ReferralsPanel({
  data,
  onChange,
}: {
  data: { code: string | null; loyaltyPoints: number; referrals: { referred_email: string; status: string }[] } | null;
  onChange: () => void;
}) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setEmail("");
      setMsg("Invite sent!");
      onChange();
    } else {
      setMsg((await res.json()).error ?? "Could not send invite.");
    }
  }

  const link = data?.code && typeof window !== "undefined" ? `${window.location.origin}/auth/signup?ref=${data.code}` : "";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1.5rem" }} className="dash-grid">
      <section className="card" style={{ padding: "1.75rem" }}>
        <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Refer & earn</h2>
        <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>
          Share your code — you and your friend both earn rewards on their first booking. You have{" "}
          <strong>{data?.loyaltyPoints ?? 0}</strong> loyalty points.
        </p>
        {data?.code && (
          <div style={{ marginTop: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input className="input" readOnly value={data.code} />
              <button
                className="btn btn-outline"
                onClick={() => {
                  navigator.clipboard?.writeText(link || data.code!);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        )}
        <form onSubmit={invite} style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
          <input className="input" type="email" required placeholder="friend@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-primary">Invite</button>
        </form>
        {msg && <p style={{ color: msg.includes("sent") ? "var(--accent-dark)" : "#b3261e", fontSize: "0.85rem", marginTop: "0.5rem" }}>{msg}</p>}
      </section>

      <section className="card" style={{ padding: "1.75rem" }}>
        <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>Your invites</h2>
        {!data || data.referrals.length === 0 ? (
          <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>No invites sent yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.5rem", marginTop: "1rem" }}>
            {data.referrals.map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                <span style={{ color: "var(--dim)" }}>{r.referred_email}</span>
                <span className="chip chip-muted">{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReschedulePanel({ booking, onDone }: { booking: Booking; onDone: () => void }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadSlots(d: string) {
    setDate(d);
    setSlot("");
    const res = await fetch(`/api/availability?slug=${booking.stylist_id}&date=${d}`);
    const data = await res.json();
    setSlots(data.slots ?? []);
  }

  async function confirm() {
    if (!date || !slot) return;
    setBusy(true);
    const scheduledFor = new Date(`${date}T${slot}:00`).toISOString();
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reschedule", scheduledFor }),
    });
    setBusy(false);
    if (res.ok) onDone();
    else window.alert((await res.json()).error ?? "Could not reschedule.");
  }

  return (
    <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <input type="date" className="input" style={{ maxWidth: 200 }} onChange={(e) => loadSlots(e.target.value)} />
        {slots.length > 0 && (
          <select className="input" style={{ maxWidth: 140 }} value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="">Time…</option>
            {slots.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
        <button className="btn btn-primary" disabled={!slot || busy} onClick={confirm} style={{ padding: "0.5rem 1.1rem" }}>
          {busy ? "Saving…" : "Confirm new time"}
        </button>
      </div>
    </div>
  );
}
