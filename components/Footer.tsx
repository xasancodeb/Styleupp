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
    <footer style={{ borderTop: "1px solid var(--border)", marginTop: "5rem", background: "#fff" }}>
      <div
        className="section"
        style={{ padding: "3rem 1.5rem 2.5rem", display: "grid", gap: "2rem" }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          <div style={{ maxWidth: 320 }}>
            <div className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              Style<span style={{ color: "var(--accent)" }}>Up</span>
            </div>
            <p style={{ color: "var(--dim)", marginTop: "0.75rem", fontSize: "0.95rem" }}>
              Personal styling, made personal. Book vetted stylists across the globe — virtually or
              in person — and dress like the most confident version of yourself.
            </p>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "flex-start" }}>
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href + link.label}
                href={link.href}
                style={{ color: "var(--dim)", fontWeight: 500, fontSize: "0.95rem" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: "1.5rem",
            color: "var(--faint)",
            fontSize: "0.85rem",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <span>© {new Date().getFullYear()} StyleUp Ltd. All rights reserved.</span>
          <span>Made for people who want to feel good in what they wear.</span>
        </div>
      </div>
    </footer>
  );
}
