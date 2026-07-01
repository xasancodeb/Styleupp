"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const AMOUNTS = [50, 100, 150, 250];

export default function GiftPage() {
  return (
    <Suspense fallback={null}>
      <GiftFlow />
    </Suspense>
  );
}

function GiftFlow() {
  const params = useSearchParams();
  const paid = params.get("paid") === "1";
  const paidCode = params.get("code") ?? "";
  const paidValue = params.get("value") ?? "";
  const paidTo = params.get("to") ?? "";

  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = custom ? Math.max(10, Math.min(1000, Number(custom) || 0)) : amount;

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/gift/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value, to, from, message }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error ?? "Could not start checkout. Please try again.");
    } catch {
      setError("Could not start checkout. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── paid success ───────────────────────────────────────────────────────────
  if (paid && paidCode) {
    return (
      <div className="section" style={{ padding: "4rem 1.75rem 5rem", maxWidth: 640, textAlign: "center" }}>
        <span className="eyebrow" style={{ margin: "0 auto" }}>Payment confirmed</span>
        <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.035em", marginTop: "1rem" }}>
          Your gift card is ready
        </h1>
        <div
          style={{
            borderRadius: 22,
            padding: "1.9rem",
            marginTop: "1.75rem",
            color: "#fff",
            textAlign: "left",
            background: "linear-gradient(135deg, #6c4cf0 0%, #a56b8c 45%, #ff7f50 100%)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontWeight: 700, letterSpacing: "-0.03em", fontSize: "1.15rem" }}>StyleUp</span>
            <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>gift card</span>
          </div>
          <div style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "1.5rem" }}>£{paidValue}</div>
          {paidTo && <div style={{ fontSize: "0.9rem", opacity: 0.9, marginTop: "0.2rem" }}>For {paidTo}</div>}
          <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "1.05rem", letterSpacing: "0.14em", marginTop: "1.25rem" }}>
            {paidCode}
          </div>
        </div>
        <p style={{ color: "var(--dim)", marginTop: "1.25rem", lineHeight: 1.6 }}>
          Save this code and share it with your recipient — it&apos;s also on your Stripe receipt.
          To redeem, they quote it when booking and we apply it to their session.
        </p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/gift" className="btn btn-outline">Buy another</Link>
          <Link href="/explore" className="btn btn-primary">Browse stylists <span className="arrow">→</span></Link>
        </div>
      </div>
    );
  }

  // ── purchase form ──────────────────────────────────────────────────────────
  return (
    <div className="section" style={{ padding: "3.5rem 1.75rem 5rem", maxWidth: 1000 }}>
      <span className="eyebrow">Gift cards</span>
      <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.2rem, 6vw, 3.6rem)", letterSpacing: "-0.04em", lineHeight: 1.02, marginTop: "0.8rem" }}>
        Give someone their <span className="gradient-word">stylist</span>.
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        The gift that never fits wrong. A StyleUp gift card covers any stylist and any service —
        colour analysis, a wardrobe rebuild, or a shopping trip together. Pay securely, get the
        code instantly, share it however you like.
      </p>

      <div className="gift-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem", marginTop: "2.25rem", alignItems: "start" }}>
        <form onSubmit={checkout} className="card" style={{ padding: "1.75rem", display: "grid", gap: "1.1rem" }}>
          <div>
            <label style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--dim)" }}>Amount</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="tag-toggle"
                  data-active={!custom && amount === a}
                  onClick={() => {
                    setAmount(a);
                    setCustom("");
                  }}
                >
                  £{a}
                </button>
              ))}
              <input
                className="input"
                style={{ width: 120 }}
                placeholder="Custom £"
                inputMode="numeric"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>
          </div>
          <input className="input" required placeholder="Recipient's name" value={to} onChange={(e) => setTo(e.target.value)} />
          <input className="input" placeholder="Your name (optional)" value={from} onChange={(e) => setFrom(e.target.value)} />
          <textarea
            className="input"
            rows={3}
            style={{ resize: "vertical" }}
            placeholder="A personal message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {error && <p style={{ color: "#b3261e", fontSize: "0.9rem", margin: 0 }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "fit-content" }}>
            {submitting ? "Opening secure checkout…" : `Pay £${value} securely`} <span className="arrow">→</span>
          </button>
          <p style={{ color: "var(--faint)", fontSize: "0.82rem", margin: 0 }}>
            Secure checkout by Stripe · valid 24 months · usable with any stylist
          </p>
        </form>

        {/* live preview */}
        <div style={{ position: "sticky", top: "5.5rem" }}>
          <div
            style={{
              borderRadius: 22,
              padding: "1.9rem",
              color: "#fff",
              background: "linear-gradient(135deg, #6c4cf0 0%, #a56b8c 45%, #ff7f50 100%)",
              boxShadow: "var(--shadow)",
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, letterSpacing: "-0.03em", fontSize: "1.15rem" }}>StyleUp</span>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>gift card</span>
            </div>
            <div>
              <div style={{ fontSize: "2.4rem", fontWeight: 700, letterSpacing: "-0.03em" }}>£{value}</div>
              <div style={{ fontSize: "0.9rem", opacity: 0.9, marginTop: "0.2rem" }}>
                {to ? `For ${to}` : "For someone brilliant"}
                {from ? `, from ${from}` : ""}
              </div>
              {message && (
                <div style={{ fontSize: "0.85rem", opacity: 0.85, marginTop: "0.5rem", fontStyle: "italic" }}>
                  “{message.slice(0, 90)}{message.length > 90 ? "…" : ""}”
                </div>
              )}
            </div>
            <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>Code revealed after payment</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 800px) {
          .gift-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
