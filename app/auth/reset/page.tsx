"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase";

export default function ResetPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/auth/update-password` : undefined;
      const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo });
      if (error) setError(error.message);
      else setSent(true);
    } catch {
      setError("Authentication isn't configured yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 440 }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
          Reset your password
        </h1>
        {sent ? (
          <p style={{ color: "var(--dim)", marginTop: "1rem" }}>
            If an account exists for <strong>{email}</strong>, we've sent a reset link. Check your inbox.
          </p>
        ) : (
          <>
            <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
              Enter your email and we'll send you a link to set a new password.
            </p>
            <form onSubmit={submit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              {error && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          </>
        )}
        <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "1.25rem", textAlign: "center" }}>
          <Link href="/auth/login" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
