import Link from "next/link";

import NewsletterForm from "@/components/NewsletterForm";

const FOOTER_LINKS = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Stylists" },
  { href: "/gift", label: "Gift cards" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/corporate", label: "Corporate" },
];

export default function Footer() {
  return (
    <footer style={{ marginTop: "4rem", padding: "0 0 1.5rem" }}>
      <div className="section">
        <div className="card" style={{ padding: "2.75rem 2rem 2rem", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 11, height: 11, borderRadius: "50%", background: "linear-gradient(140deg, var(--accent), var(--accent-2))", boxShadow: "0 0 14px 1px color-mix(in srgb, var(--accent) 80%, transparent)" }} />
            <span
              style={{
                fontFamily: "var(--font-grotesk)",
                fontWeight: 800,
                fontSize: "1.6rem",
                letterSpacing: "-0.04em",
                color: "var(--ink)",
              }}
            >
              StyleUp
            </span>
          </div>
          <p style={{ color: "var(--dim)", marginTop: "0.7rem", maxWidth: 380, fontSize: "0.95rem" }}>
            Personal styling, in colour. Vetted stylists for colour analysis, capsule wardrobes
            and occasion styling, near you or over video.
          </p>

          <div style={{ marginTop: "1.75rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
            <div style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>The colour edit, free</div>
            <p style={{ color: "var(--dim)", fontSize: "0.9rem", margin: "0.3rem 0 0.9rem", maxWidth: 420 }}>
              Get our 12-page guide to dressing in your season, plus one sharp styling tip a week.
              No spam, unsubscribe anytime.
            </p>
            <NewsletterForm />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1.25rem",
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid var(--border)",
              fontSize: "0.9rem",
              color: "var(--dim)",
            }}
          >
            <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap" }}>
              {FOOTER_LINKS.map((l) => (
                <Link key={l.href + l.label} href={l.href} className="ul-link" style={{ color: "var(--dim)", fontWeight: 500 }}>
                  {l.label}
                </Link>
              ))}
            </div>
            <div style={{ color: "var(--faint)" }}>© {new Date().getFullYear()} StyleUp</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
