"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

const LINKS = [
  { href: "/explore", label: "Find stylists" },
  { href: "/fitting", label: "Fitting room" },
  { href: "/for-stylists", label: "For stylists" },
];

interface Me {
  email: string;
  role: "client" | "stylist" | "admin";
  fullName: string | null;
}

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabaseBrowser().auth.getSession();
      if (!session) {
        setMe(null);
        return;
      }
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setMe({ email: data.profile.email, role: data.profile.role, fullName: data.profile.full_name });
      }
    } catch {
      setMe(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void loadMe();
    const { data } = supabaseBrowser().auth.onAuthStateChange(() => void loadMe());
    return () => data.subscription.unsubscribe();
  }, [loadMe]);

  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    setMe(null);
    router.push("/");
    router.refresh();
  }

  const accountLinks = me
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/messages", label: "Messages" },
        ...(me.role === "stylist" || me.role === "admin" ? [{ href: "/stylist-dashboard", label: "Stylist studio" }] : []),
        ...(me.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
      ]
    : [];

  const initials = (me?.fullName || me?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(250, 248, 245, 0.85)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <nav className="section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        <Link href="/" className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--dark)" }}>
          Style<span style={{ color: "var(--accent)" }}>Up</span>
        </Link>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link key={link.href} href={link.href} style={{ fontSize: "0.95rem", fontWeight: active ? 600 : 500, color: active ? "var(--accent-dark)" : "var(--dim)" }}>
                {link.label}
              </Link>
            );
          })}

          {!ready ? null : me ? (
            <>
              <NotificationBell />
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-label="Account menu"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "var(--dark)",
                    color: "var(--bg)",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                  }}
                >
                  {initials}
                </button>
                {menuOpen && (
                  <div className="card" style={{ position: "absolute", right: 0, top: "2.8rem", width: 200, padding: "0.4rem", zIndex: 60 }}>
                    {accountLinks.map((l) => (
                      <Link key={l.href} href={l.href} style={{ display: "block", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.9rem", color: "var(--dark)" }}>
                        {l.label}
                      </Link>
                    ))}
                    <button
                      onClick={signOut}
                      style={{ display: "block", width: "100%", textAlign: "left", padding: "0.55rem 0.75rem", borderRadius: "0.5rem", fontSize: "0.9rem", background: "none", border: "none", cursor: "pointer", color: "#b3261e" }}
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-dark" style={{ padding: "0.55rem 1.2rem" }}>
              Sign in
            </Link>
          )}
        </div>

        <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="nav-toggle" style={{ display: "none", background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer" }}>
          ☰
        </button>
      </nav>

      {open && (
        <div className="section" style={{ paddingBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ color: "var(--dim)", fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
          {me ? (
            <>
              {accountLinks.map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "var(--dim)", fontWeight: 500 }}>
                  {l.label}
                </Link>
              ))}
              <button onClick={signOut} className="btn btn-outline">Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-dark">Sign in</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 820px) {
          .nav-links { display: none !important; }
          .nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
