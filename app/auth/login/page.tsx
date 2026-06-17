"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabaseBrowser().auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Authentication isn't configured yet. Add your Supabase keys to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 440 }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
          Welcome back
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
          Sign in to manage your bookings and style profile.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Email</span>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Password</span>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </label>
          {error && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "1.25rem", textAlign: "center" }}>
          New to StyleUp?{" "}
          <Link href="/auth/signup" style={{ color: "var(--accent-dark)", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
