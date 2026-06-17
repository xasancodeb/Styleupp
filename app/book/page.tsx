"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { STYLISTS, getStylist, type Service } from "@/lib/data";
import { formatGBP, priceBreakdown } from "@/lib/stripe";
import { addBooking, availableSlots, nextAvailableDates, formatDate } from "@/lib/booking";

function BookingFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const initialStylist = params.get("stylist");
  const initialService = params.get("service");

  const [stylistId, setStylistId] = useState<string | null>(initialStylist);
  const [serviceId, setServiceId] = useState<string | null>(initialService);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stylist = stylistId ? getStylist(stylistId) : null;
  const service: Service | null = useMemo(
    () => stylist?.services.find((s) => s.id === serviceId) ?? null,
    [stylist, serviceId]
  );

  const dates = useMemo(() => nextAvailableDates(10), []);
  const slots = date ? availableSlots(date) : [];

  // Reset downstream selections when an upstream one changes.
  useEffect(() => {
    setServiceId((current) => (stylist?.services.some((s) => s.id === current) ? current : null));
  }, [stylist]);
  useEffect(() => setSlot(null), [date]);

  const breakdown = service ? priceBreakdown(service.price) : null;
  const step = !stylist ? 1 : !service ? 2 : !date || !slot ? 3 : 4;

  async function handleConfirm() {
    if (!stylist || !service || !date || !slot) return;
    setSubmitting(true);
    setError(null);
    const scheduledFor = new Date(`${date}T${slot}:00`).toISOString();

    // Record the booking locally so it shows in the dashboard immediately.
    addBooking({
      stylistId: stylist.id,
      stylistName: stylist.name,
      serviceId: service.id,
      serviceName: service.name,
      sessionType: service.sessionType,
      scheduledFor,
      durationMinutes: service.durationMinutes,
      basePrice: service.price,
    });

    // Try Stripe Checkout; if keys aren't configured, fall back to the
    // confirmation page so the flow still completes in the demo.
    try {
      const res = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stylistId: stylist.id,
          serviceId: service.id,
          scheduledFor,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { url?: string };
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {
      // ignore and fall back
    }
    router.push(
      `/booking/success?stylist=${stylist.id}&service=${service.id}&when=${encodeURIComponent(scheduledFor)}`
    );
  }

  return (
    <div className="section" style={{ padding: "3rem 1.5rem 4rem", maxWidth: 900 }}>
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700 }}>
        Book a session
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
        Four quick steps and you're booked. Secure payment, free cancellation up to 48 hours before.
      </p>

      {/* Progress */}
      <div style={{ display: "flex", gap: "0.5rem", margin: "1.5rem 0 2rem" }}>
        {["Stylist", "Service", "Date & time", "Confirm"].map((label, i) => (
          <div key={label} style={{ flex: 1 }}>
            <div
              style={{
                height: 4,
                borderRadius: 9999,
                background: step > i ? "var(--accent)" : "var(--border)",
              }}
            />
            <span style={{ fontSize: "0.78rem", color: step > i ? "var(--accent-dark)" : "var(--faint)", fontWeight: 600 }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: "1.5rem" }} className="book-grid">
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {/* Step 1: Stylist */}
          <section className="card" style={{ padding: "1.5rem" }}>
            <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
              1. Choose your stylist
            </h2>
            <select
              className="input"
              style={{ marginTop: "0.75rem" }}
              value={stylistId ?? ""}
              onChange={(e) => {
                setStylistId(e.target.value || null);
                setServiceId(null);
              }}
            >
              <option value="">Select a stylist…</option>
              {STYLISTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.city}
                </option>
              ))}
            </select>
          </section>

          {/* Step 2: Service */}
          {stylist && (
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                2. Choose a service
              </h2>
              <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.75rem" }}>
                {stylist.services.map((svc) => {
                  const active = serviceId === svc.id;
                  return (
                    <button
                      key={svc.id}
                      onClick={() => setServiceId(svc.id)}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                        background: active ? "rgba(196,146,58,0.07)" : "#fff",
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

          {/* Step 3: Date & time */}
          {service && (
            <section className="card" style={{ padding: "1.5rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                3. Pick a date & time
              </h2>
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
                      <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                        {dt.toLocaleDateString("en-GB", { weekday: "short" })}
                      </div>
                      <div style={{ fontSize: "1.15rem", fontWeight: 700 }}>{dt.getDate()}</div>
                      <div style={{ fontSize: "0.72rem", opacity: 0.8 }}>
                        {dt.toLocaleDateString("en-GB", { month: "short" })}
                      </div>
                    </button>
                  );
                })}
              </div>

              {date && (
                <div style={{ marginTop: "1rem" }}>
                  {slots.length === 0 ? (
                    <p style={{ color: "var(--dim)" }}>No availability on this day — try another date.</p>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                      {slots.map((s) => (
                        <button
                          key={s}
                          className="tag-toggle"
                          data-active={slot === s}
                          onClick={() => setSlot(s)}
                        >
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

        {/* Summary */}
        <aside>
          <div className="card" style={{ padding: "1.5rem", position: "sticky", top: 90 }}>
            <h3 className="font-serif" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              Order summary
            </h3>
            {stylist ? (
              <div style={{ marginTop: "0.9rem", display: "grid", gap: "0.6rem", fontSize: "0.92rem" }}>
                <Row label="Stylist" value={stylist.name} />
                <Row label="Service" value={service?.name ?? "—"} />
                <Row label="Format" value={service ? cap(service.sessionType) : "—"} />
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
              <p style={{ color: "var(--dim)", marginTop: "0.75rem", fontSize: "0.92rem" }}>
                Select a stylist to get started.
              </p>
            )}

            {error && <p style={{ color: "#b3261e", fontSize: "0.85rem", marginTop: "0.75rem" }}>{error}</p>}

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1.25rem", opacity: step === 4 && !submitting ? 1 : 0.5 }}
              disabled={step !== 4 || submitting}
              onClick={handleConfirm}
            >
              {submitting ? "Processing…" : breakdown ? `Confirm & pay ${formatGBP(breakdown.total)}` : "Confirm & pay"}
            </button>
            <p style={{ color: "var(--faint)", fontSize: "0.78rem", marginTop: "0.75rem", lineHeight: 1.5 }}>
              By booking you agree to our <Link href="/terms" style={{ color: "var(--accent-dark)" }}>terms</Link> and
              cancellation policy: full refund 48h+, 50% within 24–48h, none under 24h.
            </p>
          </div>
        </aside>
      </div>

      <style>{`
        @media (max-width: 820px) {
          .book-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
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

function cap(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="section" style={{ padding: "4rem 1.5rem" }}>Loading…</div>}>
      <BookingFlow />
    </Suspense>
  );
}
