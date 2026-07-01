"use client";

import { useState } from "react";
import Link from "next/link";

// Desktop-friendly "ask first" entry point for the sidebar: nervous
// first-timers get to start with a question instead of a payment.
export function AskQuestionButton({ name }: { name: string }) {
  const [asking, setAsking] = useState(false);
  return (
    <>
      <button className="btn btn-outline" style={{ width: "100%", marginTop: "0.6rem" }} onClick={() => setAsking(true)}>
        Ask {name.split(" ")[0]} a question
      </button>
      {asking && <AskSheet name={name} onClose={() => setAsking(false)} />}
    </>
  );
}

function AskSheet({ name, onClose }: { name: string; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const first = name.split(" ")[0];

  async function send() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "question",
          email,
          payload: { stylist: name, message },
        }),
      });
      if (res.ok) setSent(true);
      else setError("Couldn't send just now — please try again.");
    } catch {
      setError("Couldn't send just now — please check your connection.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={onClose}
    >
      <div
        className="card fade-up"
        style={{ width: "100%", maxWidth: 560, borderRadius: "20px 20px 0 0", padding: "1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {sent ? (
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <div style={{ fontSize: "1.6rem" }}>✓</div>
            <h3 style={{ fontWeight: 700, fontSize: "1.15rem", marginTop: "0.4rem" }}>Question sent</h3>
            <p style={{ color: "var(--dim)", fontSize: "0.92rem", marginTop: "0.4rem" }}>
              We&apos;ve passed it to {first} and will reply to {email}, usually within a day.
            </p>
            <button className="btn btn-outline" style={{ marginTop: "1rem" }} onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontWeight: 700, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>Ask {first} a question</h3>
            <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.3rem" }}>
              Not sure which service fits, or whether {first} works with your situation? Just ask — no booking needed.
            </p>
            <textarea
              className="input"
              rows={4}
              autoFocus
              style={{ resize: "vertical", marginTop: "0.9rem" }}
              placeholder={`e.g. "Hi ${first} — I have a wedding in six weeks and no idea where to start. Is that something you do?"`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <input
              className="input"
              type="email"
              style={{ marginTop: "0.6rem" }}
              placeholder="Your email, so we can reply"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <p style={{ color: "#b3261e", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{error}</p>}
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "flex-end", marginTop: "0.9rem" }}>
              <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              <button
                className="btn btn-primary"
                style={{ opacity: message.trim().length > 5 && email.includes("@") ? 1 : 0.5 }}
                disabled={message.trim().length <= 5 || !email.includes("@") || sending}
                onClick={send}
              >
                {sending ? "Sending…" : "Send question"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Mobile booking bar: on phones the sidebar CTA scrolls away, so the two
// actions that matter — Book and Ask — stay pinned to the bottom.
export default function StickyBookBar({
  stylistId,
  name,
  fromPrice,
}: {
  stylistId: string;
  name: string;
  fromPrice: string;
}) {
  const [asking, setAsking] = useState(false);

  return (
    <>
      <div className="sticky-book-bar" style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, display: "none", padding: "0.7rem 1rem calc(0.7rem + env(safe-area-inset-bottom))", background: "color-mix(in srgb, var(--bg) 88%, transparent)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--dim)" }}>from {fromPrice}</div>
          </div>
          <button className="btn btn-outline" style={{ padding: "0.6rem 1rem", fontSize: "0.88rem" }} onClick={() => setAsking(true)}>
            Ask
          </button>
          <Link href={`/book?stylist=${stylistId}`} className="btn btn-primary" style={{ padding: "0.6rem 1.3rem", fontSize: "0.9rem" }}>
            Book
          </Link>
        </div>
      </div>

      {/* Ask-a-question sheet, opened from the bar */}
      {asking && <AskSheet name={name} onClose={() => setAsking(false)} />}

      <style>{`
        @media (max-width: 860px) {
          .sticky-book-bar { display: block !important; }
        }
      `}</style>
    </>
  );
}
