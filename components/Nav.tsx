"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/explore", label: "Find stylists" },
  { href: "/fitting", label: "Fitting room" },
  { href: "/for-stylists", label: "For stylists" },
  { href: "/messages", label: "Messages" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
      <nav
        className="section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        <Link
          href="/"
          className="font-serif"
          style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--dark)" }}
        >
          Style<span style={{ color: "var(--accent)" }}>Up</span>
        </Link>

        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1.75rem" }}>
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: "0.95rem",
                  fontWeight: active ? 600 : 500,
                  color: active ? "var(--accent-dark)" : "var(--dim)",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <Link href="/auth/login" className="btn btn-dark" style={{ padding: "0.55rem 1.2rem" }}>
            Sign in
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
          className="nav-toggle"
          style={{
            display: "none",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
        >
          ☰
        </button>
      </nav>

      {open && (
        <div
          className="section"
          style={{ paddingBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ color: "var(--dim)", fontWeight: 500 }}>
              {link.label}
            </Link>
          ))}
          <Link href="/auth/login" className="btn btn-dark">
            Sign in
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 760px) {
          .nav-links { display: none !important; }
          .nav-toggle { display: block !important; }
        }
      `}</style>
    </header>
  );
}
