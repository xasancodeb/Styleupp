"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
          data: { full_name: fullName },
          emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/api/auth/callback` : undefined,
        },
      });
      if (error) {
        setError(error.message);
        return;
      }
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setMessage("Check your inbox to confirm your email, then sign in.");
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
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
          Create your account
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
          Join StyleUp to book stylists and save your style profile.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Full name</span>
            <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Doe" />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Email</span>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </label>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--dim)", fontWeight: 600 }}>Password</span>
            <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
          </label>
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
