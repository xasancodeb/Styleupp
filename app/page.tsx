import Link from "next/link";
import { getFeatured, SPECIALTIES } from "@/lib/data";
import StylistCard from "@/components/StylistCard";

const STEPS = [
  {
    n: "01",
    title: "Tell us your style",
    body: "Take the two-minute quiz to discover your colour season and the stylists who fit your taste, budget and goals.",
  },
  {
    n: "02",
    title: "Book your stylist",
    body: "Browse vetted stylists worldwide. Choose a service, pick a time, and pay securely — virtual or in person.",
  },
  {
    n: "03",
    title: "Wear it with confidence",
    body: "Get a personalised plan, a shoppable palette and a wardrobe that finally feels like yours.",
  },
];

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "2.5rem", alignItems: "center" }}>
          <div className="fade-up">
            <span className="eyebrow">N°01 — Personal styling worldwide</span>
            <h1 className="display" style={{ fontSize: "clamp(3rem, 8vw, 6.2rem)", marginTop: "1.25rem" }}>
              Personal
              <br />
              styling,
              <br />
              made <em>personal.</em>
            </h1>
            <p style={{ fontSize: "1.12rem", color: "var(--dim)", maxWidth: 460, marginTop: "1.5rem" }}>
              Work one-to-one with a vetted stylist — anywhere on earth. Discover your colours, build
              a wardrobe you love, and finally enjoy getting dressed.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", marginTop: "1.75rem" }}>
              <Link href="/explore" className="btn btn-primary">Find your stylist</Link>
              <Link href="/quiz" className="btn btn-outline">Take the style quiz</Link>
            </div>
          </div>

          {/* Editorial visual */}
          <div className="hero-visual fade-up" style={{ position: "relative", minHeight: 440 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                border: "1.5px solid var(--ink)",
                borderRadius: 6,
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "10px 10px 0 var(--ink)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -18,
                left: -18,
                background: "var(--accent)",
                color: "#fff",
                border: "1.5px solid var(--ink)",
                borderRadius: 6,
                padding: "0.85rem 1.1rem",
                fontFamily: "var(--font-serif-stack)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                boxShadow: "4px 4px 0 var(--ink)",
              }}
            >
              By appointment, worldwide
            </div>
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -10,
                background: "var(--paper)",
                border: "1.5px solid var(--ink)",
                borderRadius: 999,
                width: 92,
                height: 92,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.62rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                textAlign: "center",
                lineHeight: 1.3,
                transform: "rotate(8deg)",
              }}
            >
              4.9★<br />avg rating
            </div>
          </div>
        </div>

        {/* Stat ledger */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            borderTop: "1.5px solid var(--ink)",
            marginTop: "3rem",
          }}
          className="stat-ledger"
        >
          {[
            { stat: "13+", label: "Cities" },
            { stat: "10k+", label: "Sessions delivered" },
            { stat: "4.9★", label: "Average rating" },
            { stat: "10%", label: "Lowest commission" },
          ].map((m, i) => (
            <div key={m.label} style={{ padding: "1.5rem 1.25rem", borderRight: i < 3 ? "1.5px solid var(--border)" : "none" }}>
              <div className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 600, lineHeight: 1 }}>{m.stat}</div>
              <div className="eyebrow" style={{ marginTop: "0.6rem" }}>{m.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────── Specialties marquee ──────────────────────── */}
      <section style={{ background: "var(--ink)", color: "var(--paper)", borderTop: "1.5px solid var(--ink)", borderBottom: "1.5px solid var(--ink)", padding: "1.1rem 0" }}>
        <div className="marquee">
          <div className="marquee__track">
            {[...SPECIALTIES, ...SPECIALTIES].map((s, i) => (
              <span key={i} className="font-serif" style={{ fontStyle: i % 2 ? "italic" : "normal", fontSize: "1.6rem", display: "inline-flex", alignItems: "center", gap: "2.5rem" }}>
                {s}
                <span style={{ color: "var(--accent)", fontSize: "1rem" }}>✦</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
          <div>
            <span className="eyebrow">The process</span>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", marginTop: "0.75rem" }}>
              Three steps to a<br />wardrobe that <em>works.</em>
            </h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {STEPS.map((step) => (
            <div key={step.n} className="card" style={{ padding: "1.75rem" }}>
              <div className="font-serif" style={{ fontSize: "3rem", color: "var(--accent)", fontWeight: 600, lineHeight: 1 }}>
                N°{step.n}
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, marginTop: "1rem" }}>{step.title}</h3>
              <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.5rem 3.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="eyebrow">The roster</span>
            <h2 className="display" style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", marginTop: "0.75rem" }}>
              Featured stylists
            </h2>
          </div>
          <Link href="/explore" className="btn btn-outline">Browse all →</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          {featured.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} />
          ))}
        </div>
      </section>

      {/* ────────────────────────────── Quiz CTA ───────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.5rem 5rem" }}>
        <div
          className="card"
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            background: "var(--accent)",
            color: "#fff",
            borderColor: "var(--ink)",
            boxShadow: "10px 10px 0 var(--ink)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <span className="eyebrow" style={{ color: "rgba(255,255,255,0.85)" }}>Free · two minutes</span>
          <h2 className="display" style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", marginTop: "1rem" }}>
            Not sure where<br />to start?
          </h2>
          <p style={{ maxWidth: 520, margin: "1rem auto 0", opacity: 0.92, fontSize: "1.08rem" }}>
            Discover your colour season and get a personalised palette plus matched stylists —
            completely free.
          </p>
          <Link href="/quiz" className="btn" style={{ marginTop: "1.75rem", background: "var(--ink)", color: "var(--paper)", borderColor: "var(--ink)" }}>
            Take the style quiz
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { min-height: 320px !important; margin-top: 1rem; }
          .stat-ledger { grid-template-columns: repeat(2, 1fr) !important; }
          .stat-ledger > div:nth-child(2) { border-right: none !important; }
          .stat-ledger > div:nth-child(1), .stat-ledger > div:nth-child(2) { border-bottom: 1.5px solid var(--border); }
        }
      `}</style>
    </div>
  );
}
