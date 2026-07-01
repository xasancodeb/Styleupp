import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/explore", label: "Stylists" },
  { href: "/quiz", label: "Colour quiz" },
  { href: "/for-stylists", label: "Become a stylist" },
  { href: "/corporate", label: "For teams" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export default function Footer() {
  return (
    <footer className="room" style={{ marginTop: "5rem" }}>
      <div className="section" style={{ padding: "3.5rem 1.75rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "2rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.01em" }}>StyleUp</span>
              <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent-2)", display: "inline-block", marginLeft: 5 }} />
            </div>
            <p style={{ maxWidth: 380, fontSize: "0.95rem", marginTop: "0.7rem" }}>
              The house of getting dressed well. Twelve stylists, real portfolios,
              sessions in your city or on video.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 2.5rem" }}>
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="ul-link" style={{ fontSize: "0.92rem", fontWeight: 500 }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(242, 236, 217, 0.18)", marginTop: "2.5rem", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", fontSize: "0.84rem", color: "rgba(242, 236, 217, 0.6)" }}>
          <span>© {new Date().getFullYear()} StyleUp</span>
          <span>Payments secured by Stripe</span>
        </div>
      </div>
    </footer>
  );
}
