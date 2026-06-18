"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import NotificationBell from "@/components/NotificationBell";

const LINKS = [
  { href: "/explore", label: "Stylists" },
  { href: "/fitting", label: "Fitting Room" },
  { href: "/for-stylists", label: "For Stylists" },
];

const TICKER = [
  "Personal styling, worldwide",
  "13 cities · one wardrobe",
  "Colour analysis · Capsule edits · Occasion",
  "Book a vetted stylist in minutes",
  "Est. MMXXVI",
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
    <header style={{ position: "sticky", top: 0, zIndex: 50 }}>
      {/* Ticker */}
      <div style={{ background: "var(--ink)", color: "var(--paper)", borderBottom: "1.5px solid var(--ink)", overflow: "hidden" }}>
        <div className="marquee" style={{ height: 30, alignItems: "center" }}>
          <div className="marquee__track" style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.22em", fontWeight: 500 }}>
            {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
                {t}
                <span style={{ color: "var(--accent)" }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "rgba(244,240,231,0.9)", backdropFilter: "blur(10px)", borderBottom: "1.5px solid var(--ink)" }}>
        <nav className="section" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
          <Link href="/" aria-label="StyleUp home" style={{ display: "inline-flex", alignItems: "baseline", gap: "0.1rem" }}>
            <span className="font-serif" style={{ fontSize: "1.7rem", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", lineHeight: 1 }}>
              Style
            </span>
            <span className="font-serif" style={{ fontSize: "1.7rem", fontWeight: 600, fontStyle: "italic", color: "var(--accent)", lineHeight: 1 }}>
              Up
            </span>
            <sup style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", marginLeft: 2 }}>®</sup>
          </Link>

          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            {LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="ul-link"
                  data-active={active}
                  style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.16em", color: active ? "var(--ink)" : "var(--dim)" }}
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
                    style={{ width: 40, height: 40, borderRadius: 4, background: "var(--ink)", color: "var(--paper)", border: "1.5px solid var(--ink)", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.05em" }}
                  >
                    {initials}
                  </button>
                  {menuOpen && (
                    <div className="card" style={{ position: "absolute", right: 0, top: "3rem", width: 210, padding: "0.4rem", zIndex: 60 }}>
                      {accountLinks.map((l) => (
                        <Link key={l.href} href={l.href} style={{ display: "block", padding: "0.6rem 0.8rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink)" }}>
                          {l.label}
                        </Link>
                      ))}
                      <button onClick={signOut} style={{ display: "block", width: "100%", textAlign: "left", padding: "0.6rem 0.8rem", borderRadius: 4, fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", background: "none", border: "none", cursor: "pointer", color: "var(--accent)" }}>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link href="/auth/login" className="btn btn-dark" style={{ padding: "0.6rem 1.3rem" }}>
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
              <Link key={link.href} href={link.href} style={{ color: "var(--dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.8rem" }}>
                {link.label}
              </Link>
            ))}
            {me ? (
              <>
                {accountLinks.map((l) => (
                  <Link key={l.href} href={l.href} style={{ color: "var(--dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.8rem" }}>
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
