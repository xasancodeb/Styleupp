"use client";

import { useState } from "react";

// Email capture, persisted via /api/leads.
export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) return;
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "newsletter", email, payload: { source: "footer" } }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p style={{ color: "var(--dim)", fontSize: "0.95rem", margin: 0 }}>
        <span style={{ color: "var(--accent)", fontWeight: 600 }}>You&apos;re on the list.</span>{" "}
        Style tips land in your inbox soon.
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
      <button type="submit" className="btn btn-primary" disabled={state === "sending"} style={{ padding: "0.72rem 1.3rem" }}>
        {state === "sending" ? "Joining…" : "Join the list"}
      </button>
      {state === "error" && (
        <p style={{ color: "#b3261e", fontSize: "0.85rem", width: "100%", margin: 0 }}>
          Couldn&apos;t save that just now — please try again.
        </p>
      )}
    </form>
  );
}
