"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

// Five things. Nothing else earns a place in the header.
const LINKS = [
  { href: "/explore", label: "Stylists" },
  { href: "/quiz", label: "Colour quiz" },
  { href: "/for-stylists", label: "Become a stylist" },
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
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "color-mix(in srgb, var(--bg) 90%, transparent)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: "1px solid var(--line)" }}>
      <nav className="section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" aria-label="StyleUp home" style={{ display: "inline-flex", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 600, letterSpacing: "-0.02em", color: "var(--ink)", lineHeight: 1 }}>
            StyleUp
          </span>
          <span aria-hidden style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block", marginLeft: 4 }} />
        </Link>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className="ul-link"
                data-active={active}
                style={{ color: active ? "var(--ink)" : "var(--dim)", fontSize: "0.92rem", fontWeight: 500 }}
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
                  style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--ink)", color: "#fffdf9", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600 }}
                >
                  {initials}
                </button>
                {menuOpen && (
                  <div className="card" style={{ position: "absolute", right: 0, top: "3.1rem", width: 210, padding: "0.4rem", zIndex: 60 }}>
                    {accountLinks.map((l) => (
                      <Link key={l.href} href={l.href} style={{ display: "block", padding: "0.68rem 0.85rem", borderRadius: 8, fontSize: "0.92rem", fontWeight: 500, color: "var(--ink)" }}>
                        {l.label}
                      </Link>
                    ))}
                    <button onClick={signOut} style={{ display: "block", width: "100%", textAlign: "left", padding: "0.68rem 0.85rem", borderRadius: 8, fontSize: "0.92rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-primary" style={{ padding: "0.55rem 1.2rem", fontSize: "0.9rem" }}>
              Sign in
            </Link>
          )}
        </div>

        <button aria-label="Toggle menu" onClick={() => setOpen((o) => !o)} className="nav-toggle" style={{ display: "none", background: "none", color: "var(--ink)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.5rem 0.95rem", fontSize: "0.88rem", fontWeight: 500, cursor: "pointer" }}>
          Menu
        </button>
      </nav>

      {open && (
        <div className="section" style={{ paddingBottom: "1.1rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ color: "var(--dim)", fontSize: "1rem", fontWeight: 500, padding: "0.45rem 0" }}>
              {link.label}
            </Link>
          ))}
          {me ? (
            <>
              {accountLinks.map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "var(--dim)", fontSize: "1rem", fontWeight: 500, padding: "0.45rem 0" }}>
                  {l.label}
                </Link>
              ))}
              <button onClick={signOut} className="btn btn-outline" style={{ marginTop: "0.5rem" }}>Sign out</button>
            </>
          ) : (
            <Link href="/auth/login" className="btn btn-primary" style={{ marginTop: "0.5rem" }}>Sign in</Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
