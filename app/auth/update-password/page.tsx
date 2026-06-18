"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    try {
      const { error } = await supabaseBrowser().auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Your reset link may have expired. Request a new one.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 440 }}>
      <div className="card" style={{ padding: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
          Set a new password
        </h1>
        {done ? (
          <p style={{ color: "var(--accent-dark)", marginTop: "1rem" }}>
            Password updated. Redirecting to your dashboard…
          </p>
        ) : (
          <form onSubmit={submit} style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
            />
            <input
              className="input"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
            />
            {error && <p style={{ color: "#b3261e", fontSize: "0.9rem" }}>{error}</p>}
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%" }}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
