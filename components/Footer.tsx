import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/", label: "Index" },
  { href: "/explore", label: "Stylists" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/corporate", label: "Corporate" },
];

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--ink)", marginTop: "5rem", background: "var(--bg)" }}>
      <div className="section" style={{ padding: "3.5rem 1.75rem 2rem" }}>
        {/* oversized wordmark */}
        <div
          aria-hidden
          style={{
            fontFamily: "var(--font-grotesk)",
            fontWeight: 900,
            fontSize: "clamp(3rem, 13vw, 11rem)",
            lineHeight: 0.82,
            letterSpacing: "-0.05em",
            textTransform: "uppercase",
            color: "var(--ink)",
          }}
        >
          Styleup
        </div>

        <div
          className="mono"
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginTop: "2rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.66rem",
            color: "var(--dim)",
          }}
        >
          <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href + l.label} href={l.href} className="ul-link" style={{ color: "var(--dim)" }}>
                {l.label}
              </Link>
            ))}
          </div>
          <div style={{ color: "var(--faint)", textAlign: "right" }}>
            A styling system · Est. MMXXVI · © {new Date().getFullYear()} StyleUp
          </div>
        </div>
      </div>
    </footer>
  );
}
