"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getStylist } from "@/lib/data";
import { formatGBP, priceBreakdown } from "@/lib/stripe";
import { formatDateTime } from "@/lib/booking";

function SuccessContent() {
  const params = useSearchParams();
  const stylist = getStylist(params.get("stylist") ?? "");
  const serviceId = params.get("service");
  const when = params.get("when");
  const service = stylist?.services.find((s) => s.id === serviceId);
  const breakdown = service ? priceBreakdown(service.price) : null;

  // Reflect the real booking status — it flips to "confirmed" once Stripe's
  // webhook lands. Poll briefly so the badge updates without a refresh.
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    if (!stylist || !when) return;
    let tries = 0;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const data = await res.json();
          const match = (data.bookings ?? []).find(
            (b: { stylist_id: string; scheduled_for: string; status: string }) =>
              b.stylist_id === stylist.id && Math.abs(new Date(b.scheduled_for).getTime() - new Date(when).getTime()) < 60000
          );
          if (match) {
            setStatus(match.status);
            if (match.status === "confirmed") return;
          }
        }
      } catch {
        /* ignore */
      }
      if (tries++ < 5) timer = setTimeout(check, 2000);
    };
    void check();
    return () => clearTimeout(timer);
  }, [stylist, when]);

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 640, textAlign: "center" }}>
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
      <h1 className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700, marginTop: "1.25rem" }}>
        You're booked!
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>
        A confirmation has been sent to your email. Your stylist will be in touch with everything you
        need before the session.
      </p>

      {stylist && (
        <div className="card" style={{ padding: "1.75rem", marginTop: "2rem", textAlign: "left" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <img
              src={stylist.avatar}
              alt={stylist.name}
              width={56}
              height={56}
              style={{ borderRadius: "50%", objectFit: "cover" }}
            />
            <div>
              <strong style={{ fontSize: "1.1rem" }}>{stylist.name}</strong>
              <div style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
                {stylist.city}, {stylist.country}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.55rem", marginTop: "1.25rem", fontSize: "0.95rem" }}>
            <Row label="Service" value={service?.name ?? "Styling session"} />
            {when && <Row label="When" value={formatDateTime(when)} />}
            {service && <Row label="Format" value={cap(service.sessionType)} />}
            {breakdown && <Row label="Paid" value={formatGBP(breakdown.total)} strong />}
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
              <span style={{ color: "var(--dim)" }}>Status</span>
              <span style={{ fontWeight: 700, color: status === "confirmed" ? "#2f5d3a" : "var(--accent-dark)", textTransform: "capitalize" }}>
                {status === "confirmed" ? "● Confirmed" : status ? "● Confirming…" : "● Processing…"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
        <Link href="/dashboard" className="btn btn-primary">
          View in dashboard
        </Link>
        <Link href="/explore" className="btn btn-outline">
          Book another session
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
      <span style={{ color: "var(--dim)" }}>{label}</span>
      <span style={{ fontWeight: strong ? 700 : 500 }}>{value}</span>
    </div>
  );
}

function cap(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="section" style={{ padding: "4rem 1.5rem" }}>Loading…</div>}>
      <SuccessContent />
    </Suspense>
  );
}
