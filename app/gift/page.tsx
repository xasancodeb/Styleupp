"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { loadProfile } from "@/lib/profile";

const AMOUNTS = [50, 100, 150, 250];

function makeCode(seed: string): string {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) >>> 0;
  const alpha = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alpha[h % alpha.length];
    h = (h * 31 + i) >>> 0;
    if (i === 3) out += "-";
  }
  return out;
}

export default function GiftPage() {
  const [amount, setAmount] = useState(100);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [created, setCreated] = useState(false);

  const value = custom ? Math.max(10, Math.min(1000, Number(custom) || 0)) : amount;
  const code = useMemo(() => makeCode(`${to}-${from}-${value}`), [to, from, value]);
  const referral = useMemo(() => {
    const name = typeof window !== "undefined" ? loadProfile().fullName : "";
    return makeCode(name || "styleup-friend").slice(0, 9);
  }, []);

  return (
    <div className="section" style={{ padding: "3.5rem 1.75rem 5rem", maxWidth: 1000 }}>
      <span className="eyebrow">Gift cards</span>
      <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.2rem, 6vw, 3.6rem)", letterSpacing: "-0.04em", lineHeight: 1.02, marginTop: "0.8rem" }}>
        Give someone their <span className="gradient-word">colours</span>.
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        The gift that never fits wrong. A StyleUp gift card covers any stylist, any service —
        colour analysis, a capsule wardrobe, or a shopping trip together. Delivered by email,
        beautifully, in minutes.
      </p>

      <div className="gift-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.5rem", marginTop: "2.25rem", alignItems: "start" }}>
        {/* form */}
        <div className="card" style={{ padding: "1.75rem" }}>
          {created ? (
            <div className="fade-up">
              <h2 style={{ fontWeight: 700, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>Gift card created 🎉</h2>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                We&apos;ve emailed a beautifully wrapped £{value} gift card to{" "}
                <strong style={{ color: "var(--ink)" }}>{to || "your recipient"}</strong>
                {from ? ` from ${from}` : ""}. They can redeem it against any stylist on StyleUp.
              </p>
              <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
                <button className="btn btn-outline" onClick={() => setCreated(false)}>Send another</button>
                <Link href="/explore" className="btn btn-primary">Browse stylists <span className="arrow">→</span></Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCreated(true);
              }}
              style={{ display: "grid", gap: "1.1rem" }}
            >
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
              <button type="submit" className="btn btn-primary" style={{ width: "fit-content" }}>
                Create £{value} gift card <span className="arrow">→</span>
              </button>
              <p style={{ color: "var(--faint)", fontSize: "0.82rem", margin: 0 }}>
                Valid 24 months · usable with any stylist · secure checkout by Stripe
              </p>
            </form>
          )}
        </div>

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
            <div style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem", letterSpacing: "0.12em", opacity: 0.95 }}>
              {code}
            </div>
          </div>

          {/* referral */}
          <div className="card" style={{ padding: "1.4rem 1.5rem", marginTop: "1.25rem" }}>
            <div style={{ fontWeight: 600 }}>Or share the love free</div>
            <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.3rem", lineHeight: 1.55 }}>
              Give a friend <strong style={{ color: "var(--ink)" }}>£15 off</strong> their first
              session and get <strong style={{ color: "var(--ink)" }}>£15 credit</strong> when they book.
            </p>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
              <code style={{ background: "var(--bg-2)", borderRadius: 10, padding: "0.5rem 0.8rem", fontSize: "0.9rem", letterSpacing: "0.08em" }}>{referral}</code>
              <CopyButton text={referral} />
            </div>
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn btn-outline"
      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
      onClick={() => {
        void navigator.clipboard?.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied ✓" : "Copy code"}
    </button>
  );
}
