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
    body: "Browse vetted stylists worldwide. Choose a service, pick a time, and book in a few taps — virtual or in person.",
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
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "2.5rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3rem", alignItems: "center" }}>
          <div className="fade-up">
            <span className="eyebrow">Personal styling, worldwide</span>
            <h1 className="display" style={{ fontSize: "clamp(2.8rem, 6.5vw, 5rem)", marginTop: "1.25rem" }}>
              Personal styling,
              <br />
              made <em>personal.</em>
            </h1>
            <p style={{ fontSize: "1.12rem", color: "var(--dim)", maxWidth: 460, marginTop: "1.5rem" }}>
              Work one-to-one with a vetted stylist — anywhere in the world. Discover your colours,
              build a wardrobe you love, and finally enjoy getting dressed.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", marginTop: "1.75rem" }}>
              <Link href="/explore" className="btn btn-primary">Find your stylist</Link>
              <Link href="/quiz" className="btn btn-outline">Take the style quiz</Link>
            </div>
            <div style={{ display: "flex", gap: "2.5rem", marginTop: "2.25rem", flexWrap: "wrap" }}>
              {[
                { stat: "13+", label: "Cities worldwide" },
                { stat: "4.9★", label: "Average rating" },
                { stat: "10k+", label: "Sessions delivered" },
              ].map((m) => (
                <div key={m.label}>
                  <div className="font-serif" style={{ fontSize: "1.75rem", fontWeight: 600 }}>{m.stat}</div>
                  <div style={{ color: "var(--faint)", fontSize: "0.88rem" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Clean editorial image */}
          <div className="hero-visual fade-up" style={{ position: "relative", minHeight: 420 }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 18,
                overflow: "hidden",
                boxShadow: "0 24px 60px rgba(31,27,22,0.18)",
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              className="card"
              style={{
                position: "absolute",
                bottom: 18,
                left: -18,
                padding: "0.85rem 1.1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}
            >
              <span style={{ fontSize: "1.4rem" }}>✦</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>Vetted stylists</div>
                <div style={{ color: "var(--faint)", fontSize: "0.78rem" }}>By appointment, worldwide</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet specialties strip */}
      <section className="section" style={{ paddingBottom: "1rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.5rem 0.6rem",
            justifyContent: "center",
            padding: "1.25rem 0",
            borderTop: "1px solid var(--border)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {SPECIALTIES.map((s) => (
            <span key={s} style={{ color: "var(--dim)", fontSize: "0.88rem", padding: "0.25rem 0.7rem" }}>
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section className="section" style={{ padding: "4rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span className="eyebrow" style={{ justifyContent: "center" }}>The process</span>
          <h2 className="display" style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", marginTop: "0.75rem" }}>
            Three steps to a wardrobe that <em>works.</em>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {STEPS.map((step) => (
            <div key={step.n} className="card" style={{ padding: "1.85rem" }}>
              <div className="font-serif" style={{ fontSize: "2rem", color: "var(--accent)", fontWeight: 600, lineHeight: 1 }}>
                {step.n}
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 600, marginTop: "0.85rem" }}>{step.title}</h3>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.5rem 3.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="eyebrow">The roster</span>
            <h2 className="display" style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", marginTop: "0.6rem" }}>
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
      <section className="section" style={{ padding: "1rem 1.5rem 4.5rem" }}>
        <div
          className="card"
          style={{
            padding: "3.5rem 2rem",
            textAlign: "center",
            background: "linear-gradient(135deg, var(--accent-soft), #fff)",
            border: "1px solid var(--border)",
          }}
        >
          <span className="eyebrow" style={{ justifyContent: "center" }}>Free · two minutes</span>
          <h2 className="display" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", marginTop: "0.85rem" }}>
            Not sure where to start?
          </h2>
          <p style={{ maxWidth: 520, margin: "0.85rem auto 0", color: "var(--dim)", fontSize: "1.05rem" }}>
            Discover your colour season and get a personalised palette plus matched stylists —
            completely free.
          </p>
          <Link href="/quiz" className="btn btn-primary" style={{ marginTop: "1.75rem" }}>
            Take the style quiz
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-visual { min-height: 300px !important; }
        }
      `}</style>
    </div>
  );
}
