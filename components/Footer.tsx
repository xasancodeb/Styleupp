import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Browse stylists" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/corporate", label: "Corporate" },
];

export default function Footer() {
  return (
    <footer style={{ background: "var(--ink)", color: "var(--paper)", borderTop: "1.5px solid var(--ink)", marginTop: "4rem" }}>
      <div className="section" style={{ padding: "3.5rem 1.5rem 2rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "2rem" }}>
          <div style={{ maxWidth: 360 }}>
            <div className="font-serif" style={{ fontSize: "2rem", fontWeight: 600 }}>
              Style<span style={{ fontStyle: "italic", color: "var(--accent)" }}>Up</span>
              <sup style={{ fontSize: "0.7rem", marginLeft: 2 }}>®</sup>
            </div>
            <p style={{ color: "rgba(244,240,231,0.7)", marginTop: "0.85rem", fontSize: "0.95rem", lineHeight: 1.6 }}>
              Personal styling, made personal. Book vetted stylists across the globe — virtually or
              in person — and dress like the most confident version of yourself.
            </p>
          </div>
          <nav style={{ display: "grid", gap: "0.85rem", alignContent: "start" }}>
            <span className="eyebrow" style={{ color: "rgba(244,240,231,0.55)" }}>Index</span>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="ul-link"
                style={{ color: "var(--paper)", fontWeight: 600, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.14em" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Oversized wordmark */}
        <div
          className="font-serif"
          aria-hidden
          style={{
            fontSize: "clamp(3rem, 16vw, 12rem)",
            fontWeight: 600,
            lineHeight: 0.85,
            letterSpacing: "-0.04em",
            marginTop: "2.5rem",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(244,240,231,0.35)",
            userSelect: "none",
          }}
        >
          STYLE<span style={{ fontStyle: "italic" }}>UP</span>
        </div>

        <div
          style={{
            borderTop: "1.5px solid rgba(244,240,231,0.18)",
            marginTop: "1rem",
            paddingTop: "1.5rem",
            color: "rgba(244,240,231,0.55)",
            fontSize: "0.72rem",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>© {new Date().getFullYear()} StyleUp Ltd</span>
          <span>Made for people who want to feel good in what they wear</span>
        </div>
      </div>
    </footer>
  );
}
