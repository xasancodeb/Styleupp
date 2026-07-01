"use client";

import { useState } from "react";

// Email capture with a real lead magnet: the free colour guide.
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setDone(true);
  }

  if (done) {
    return (
      <p style={{ color: "var(--dim)", fontSize: "0.95rem", margin: 0 }}>
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>Check your inbox</span> — your
        colour guide is on its way to {email}.
      </p>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <input
        className="input"
        type="email"
        required
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ flex: "1 1 220px", maxWidth: 340 }}
        aria-label="Email address"
      />
      <button type="submit" className="btn btn-primary" style={{ padding: "0.72rem 1.3rem" }}>
        Get the free guide
      </button>
    </form>
  );
}
