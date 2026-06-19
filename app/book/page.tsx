"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getStylist, type Service } from "@/lib/data";
import { formatGBP, priceBreakdown } from "@/lib/stripe";
import { nextAvailableDates, formatDate, availableSlots } from "@/lib/booking";
import { supabaseBrowser } from "@/lib/supabase";
import StylistPicker from "@/components/StylistPicker";

function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();

  const [stylistId, setStylistId] = useState<string | null>(params.get("stylist"));
  const [serviceId, setServiceId] = useState<string | null>(params.get("service"));
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stylist = stylistId ? getStylist(stylistId) : null;
  const service: Service | null = useMemo(
    () => stylist?.services.find((s) => s.id === serviceId) ?? null,
    [stylist, serviceId]
  );
  const dates = useMemo(() => nextAvailableDates(10), []);
  const breakdown = service ? priceBreakdown(service.price) : null;
  const step = !stylist ? 1 : !service ? 2 : !date || !slot ? 3 : 4;

  useEffect(() => {
    setServiceId((current) => (stylist?.services.some((s) => s.id === current) ? current : null));
  }, [stylist]);
  useEffect(() => setSlot(null), [date]);

  // Show sensible default time slots instantly (computed on the client), then
  // quietly refine from the server to drop already-booked or blacked-out times.
  useEffect(() => {
    if (!stylistId || !date) {
      setSlots([]);
      return;
    }
    setSlots(availableSlots(date));
    setLoadingSlots(false);

    let cancelled = false;
    fetch(`/api/availability?slug=${stylistId}&date=${date}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { slots?: string[] } | null) => {
        if (!cancelled && data?.slots) setSlots(data.slots);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [stylistId, date]);

  async function handleConfirm() {
    if (!stylist || !service || !date || !slot) return;
    setSubmitting(true);
    setError(null);
    const scheduledFor = new Date(`${date}T${slot}:00`).toISOString();

    // Require a signed-in user before payment.
    const {
      data: { session },
    } = await supabaseBrowser().auth.getSession().catch(() => ({ data: { session: null } }));
    if (!session) {
      router.push(`/auth/login?next=${encodeURIComponent(`/book?stylist=${stylist.id}&service=${service.id}`)}`);
      return;
    }

    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stylistId: stylist.id, serviceId: service.id, scheduledFor }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem", maxWidth: 900 }}>
      <span className="eyebrow">Booking</span>
      <h1 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)", marginTop: "0.5rem" }}>
        Book a <em>session</em>
      </h1>
      <p className="lede" style={{ marginTop: "0.5rem" }}>
        Four quick steps. Secure payment, free cancellation up to 48 hours before.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", margin: "1.5rem 0 2rem" }}>
        {["Stylist", "Service", "Date & time", "Confirm"].map((label, i) => (
          <div key={label} style={{ flex: 1 }}>
            <div style={{ height: 4, borderRadius: 9999, background: step > i ? "var(--accent)" : "var(--border)" }} />
            <span style={{ fontSize: "0.78rem", color: step > i ? "var(--accent-dark)" : "var(--faint)", fontWeight: 600 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: "1.5rem" }} className="book-grid">
        <div style={{ display: "grid", gap: "1.5rem" }}>
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>1. Choose your stylist</h2>
            <StylistPicker
              value={stylistId}
              onChange={(id) => {
                setStylistId(id);
                setServiceId(null);
                setDate(null);
              }}
            />
          </section>

          {stylist && (
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>2. Choose a service</h2>
              <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.75rem" }}>
                {stylist.services.map((svc) => {
                  const active = serviceId === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setServiceId(svc.id)}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${active ? "var(--ink)" : "var(--border)"}`,
                        background: active ? "var(--accent-soft)" : "#fff",
                        borderRadius: "0.75rem",
                        padding: "0.9rem 1.1rem",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                        <strong>{svc.name}</strong>
                        <span style={{ fontWeight: 600 }}>{formatGBP(priceBreakdown(svc.price).total)}</span>
                      </div>
                      <p style={{ color: "var(--dim)", fontSize: "0.88rem", marginTop: "0.25rem" }}>
                        {svc.durationMinutes} min · {svc.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {service && (
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>3. Pick a date & time</h2>
              <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", marginTop: "0.85rem", paddingBottom: "0.4rem" }}>
                {dates.map((d) => {
                  const active = date === d;
                  const dt = new Date(d);
                  return (
                    <button
                      key={d}
                      onClick={() => setDate(d)}
                      style={{
                        minWidth: 78,
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "var(--dark)" : "#fff",
                        color: active ? "var(--bg)" : "var(--dark)",
                        borderRadius: "0.7rem",
                        padding: "0.6rem 0.4rem",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>{dt.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>{dt.getDate()}</div>
                      <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>{dt.toLocaleDateString("en-GB", { month: "short" })}</div>
                    </button>
                  );
                })}
              </div>

              {date && (
                <div style={{ marginTop: "1rem" }}>
                  {loadingSlots ? (
                    <p style={{ color: "var(--dim)" }}>Loading availability…</p>
                  ) : slots.length === 0 ? (
                    <p style={{ color: "var(--dim)" }}>No availability on this day — try another date.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {slots.map((s) => (
                        <button key={s} className="tag-toggle" data-active={slot === s} onClick={() => setSlot(s)}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        <aside>
          <div className="card" style={{ padding: "1.5rem", position: "sticky", top: 90 }}>
            <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Order summary</h3>
            {stylist ? (
              <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.6rem", fontSize: "0.92rem" }}>
                <Row label="Stylist" value={stylist.name} />
                <Row label="Service" value={service?.name ?? "—"} />
                <Row label="When" value={date && slot ? `${formatDate(date)} · ${slot}` : "—"} />
                {breakdown && (
                  <>
                    <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.4rem 0" }} />
                    <Row label="Service" value={formatGBP(breakdown.base)} />
                    <Row label="Platform fee (5%)" value={formatGBP(breakdown.fee)} />
                    <Row label="Total" value={formatGBP(breakdown.total)} strong />
                  </>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--dim)", marginTop: "0.75rem", fontSize: "0.92rem" }}>Select a stylist to get started.</p>
            )}

            {error && <p style={{ color: "#b3261e", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.25rem", opacity: step === 4 && !submitting ? 1 : 0.5 }}
              disabled={step !== 4 || submitting}
              onClick={handleConfirm}
            >
              {submitting ? "Processing…" : breakdown ? `Pay ${formatGBP(breakdown.total)}` : "Confirm & pay"}
            </button>
            <div style={{ marginTop: "1.1rem", paddingTop: "1.1rem", borderTop: "1px solid var(--border)", display: "grid", gap: "0.55rem" }}>
              {[
                ["✓", "Free cancellation up to 48 hours before"],
                ["✓", "Every stylist is personally vetted"],
                ["✓", "Secure payment — you're never charged twice"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.84rem", color: "var(--dim)" }}>
                  <span style={{ color: "var(--accent-dark)" }}>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "var(--faint)", fontSize: "0.76rem", marginTop: "0.85rem", lineHeight: 1.5 }}>
              By booking you agree to our <Link href="/terms" style={{ textDecoration: "underline" }}>terms</Link>.
              No pressure — you can reschedule or cancel any time from your dashboard.
            </p>
          </div>
        </aside>
      </div>

      <style>{`@media (max-width: 820px){.book-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: "var(--dim)" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="section" style={{ padding: "4rem 1.5rem" }}>Loading…</div>}>
      <BookingFlow />
    </Suspense>
  );
}
