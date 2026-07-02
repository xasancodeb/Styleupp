"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

const LINKS = [
  { href: "/explore", label: "Stylists" },
  { href: "/quiz", label: "Colour quiz" },
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
        ...(me.role === "stylist" || me.role === "admin" ? [{ href: "/stylist-dashboard", label: "Stylist Studio" }] : []),
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
    <header style={{ position: "sticky", top: 0, zIndex: 50, padding: "0.7rem 0" }}>
      <div className="section">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, padding: "0 0.6rem 0 1.2rem", background: "color-mix(in srgb, var(--card) 82%, transparent)", border: "1px solid var(--line)", borderRadius: 14, backdropFilter: "blur(18px) saturate(1.4)", WebkitBackdropFilter: "blur(18px) saturate(1.4)", boxShadow: "var(--shadow-soft)" }}>
          <Link href="/" aria-label="StyleUp home" style={{ display: "inline-flex", alignItems: "baseline", gap: 2 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}>
              StyleUp
            </span>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", marginLeft: 3 }} />
          </Link>

          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.7rem" }}>
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ul-link"
                  data-active={active}
                  style={{ color: active ? "var(--ink)" : "var(--dim)", fontSize: "0.9rem", fontWeight: 500 }}
                >
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
                    style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                  >
                    {initials}
                  </button>
                  {menuOpen && (
                    <div className="card" style={{ position: "absolute", right: 0, top: "3.2rem", width: 214, padding: "0.4rem", zIndex: 60 }}>
                      {accountLinks.map((l) => (
                        <Link key={l.href} href={l.href} style={{ display: "block", padding: "0.7rem 0.85rem", borderRadius: 10, fontSize: "0.9rem", fontWeight: 500, color: "var(--ink)" }}>
                          {l.label}
                        </Link>
                      ))}
                      <button onClick={signOut} style={{ display: "block", width: "100%", textAlign: "left", padding: "0.7rem 0.85rem", borderRadius: 10, fontSize: "0.9rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-dark" style={{ padding: "0.6rem 1.2rem" }}>
                Sign in
              </Link>
            )}
          </div>

          <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="nav-toggle" style={{ display: "none", background: "var(--card)", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: 999, padding: "0.5rem 1rem", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer" }}>
            Menu
          </button>
        </div>

        {open && (
          <div className="card" style={{ marginTop: "0.6rem", padding: "1rem 1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} style={{ color: "var(--dim)", fontSize: "0.95rem", fontWeight: 500, padding: "0.4rem 0" }}>
                {link.label}
              </Link>
            ))}
            {me ? (
              <>
                {accountLinks.map((l) => (
                  <Link key={l.href} href={l.href} style={{ color: "var(--dim)", fontSize: "0.95rem", fontWeight: 500, padding: "0.4rem 0" }}>
                    {l.label}
                  </Link>
                ))}
                <button onClick={signOut} className="btn btn-outline" style={{ marginTop: "0.5rem" }}>Sign out</button>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-dark" style={{ marginTop: "0.5rem" }}>Sign in</Link>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
