"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const refCode = params.get("ref") ?? "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "stylist">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser().auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role, referral_code: refCode || undefined },
          emailRedirectTo:
            typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : undefined,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push(role === "stylist" ? "/stylist-dashboard" : "/dashboard");
        router.refresh();
      } else {
        setMessage("Check your inbox to verify your email, then sign in.");
      }
    } catch {
      setError("Authentication isn't configured yet. Add your Supabase keys to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 440 }}>
      <div className="card" style={{ padding: "2rem" }}>
        <span className="eyebrow">Join StyleUp</span>
        <h1 className="display" style={{ fontSize: "2.4rem", marginTop: "0.5rem" }}>
          Create your <em>account</em>
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
          Join StyleUp to book stylists and save your style profile.
        </p>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.25rem" }}>
          {(["client", "stylist"] as const).map((r) => (
            <button
              key={r}
              type="button"
              className="tag-toggle"
              data-active={role === r}
              onClick={() => setRole(r)}
              style={{ flex: 1, textTransform: "capitalize" }}
            >
              {r === "client" ? "I want to book" : "I'm a stylist"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.25rem" }}>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          {refCode && (
            <p style={{ fontSize: "0.82rem", color: "var(--accent-dark)" }}>
              Referral code applied: <strong>{refCode}</strong>
            </p>
          )}
          {error && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>}
          {message && <p style={{ color: "var(--accent-dark)", fontSize: "0.9rem" }}>{message}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "1.25rem", textAlign: "center" }}>
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="section" style={{ padding: "4rem 1.5rem" }}>Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
