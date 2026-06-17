import Link from "next/link";
import { getFeatured, SPECIALTIES } from "@/lib/data";
import StylistCard from "@/components/StylistCard";

const STEPS = [
  {
    n: "01",
    title: "Tell us your style",
    body: "Take our two-minute style quiz to discover your colour season and the stylists who fit your taste, budget and goals.",
  },
  {
    n: "02",
    title: "Book your stylist",
    body: "Browse vetted stylists worldwide. Choose a service, pick a time, and pay securely — virtual or in person.",
  },
  {
    n: "03",
    title: "Look and feel your best",
    body: "Get a personalised plan, a shoppable palette and the confidence to wear it. Keep everything in your dashboard.",
  },
];

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* Hero */}
      <section
        style={{
          background:
            "radial-gradient(1200px 480px at 75% -10%, rgba(196,146,58,0.16), transparent), var(--bg)",
        }}
      >
        <div
          className="section"
          style={{ padding: "5rem 1.5rem 4rem", display: "grid", gap: "1.5rem", maxWidth: 820 }}
        >
          <span className="chip fade-up" style={{ width: "fit-content" }}>
            ✦ Trusted by thousands worldwide
          </span>
          <h1
            className="font-serif fade-up"
            style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)", lineHeight: 1.05, fontWeight: 700 }}
          >
            Personal styling,
            <br />
            made personal.
          </h1>
          <p
            className="fade-up"
            style={{ fontSize: "1.2rem", color: "var(--dim)", maxWidth: 600 }}
          >
            Work one-to-one with a vetted personal stylist — anywhere in the world. Discover your
            colours, build a wardrobe you love, and finally enjoy getting dressed.
          </p>
          <div className="fade-up" style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem", marginTop: "0.5rem" }}>
            <Link href="/explore" className="btn btn-primary" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
              Find your stylist
            </Link>
            <Link href="/quiz" className="btn btn-outline" style={{ padding: "0.85rem 1.8rem", fontSize: "1rem" }}>
              Take the style quiz
            </Link>
          </div>
          <div style={{ display: "flex", gap: "2.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            {[
              { stat: "13+", label: "Cities worldwide" },
              { stat: "4.9★", label: "Average rating" },
              { stat: "10k+", label: "Sessions delivered" },
            ].map((m) => (
              <div key={m.label}>
                <div className="font-serif" style={{ fontSize: "1.8rem", fontWeight: 700 }}>
                  {m.stat}
                </div>
                <div style={{ color: "var(--faint)", fontSize: "0.9rem" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ padding: "4rem 1.5rem" }}>
        <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center" }}>
          How it works
        </h2>
        <p style={{ textAlign: "center", color: "var(--dim)", marginTop: "0.5rem" }}>
          Three simple steps to a wardrobe that works for you.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
            marginTop: "2.5rem",
          }}
        >
          {STEPS.map((step) => (
            <div key={step.n} className="card" style={{ padding: "1.75rem" }}>
              <div
                className="font-serif"
                style={{ fontSize: "2rem", color: "var(--accent)", fontWeight: 700 }}
              >
                {step.n}
              </div>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "0.5rem" }}>
                {step.title}
              </h3>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Specialties strip */}
      <section className="section" style={{ padding: "0 1.5rem 1rem" }}>
        <div
          className="card"
          style={{
            padding: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            gap: "0.6rem",
            justifyContent: "center",
            background: "var(--dark)",
            border: "none",
          }}
        >
          {SPECIALTIES.map((s) => (
            <span
              key={s}
              style={{
                color: "var(--bg)",
                opacity: 0.85,
                fontSize: "0.9rem",
                padding: "0.3rem 0.8rem",
                border: "1px solid rgba(250,248,245,0.2)",
                borderRadius: 9999,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Featured stylists */}
      <section className="section" style={{ padding: "3.5rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
              Featured stylists
            </h2>
            <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>
              A handpicked selection of our most loved stylists.
            </p>
          </div>
          <Link href="/explore" className="btn btn-outline">
            Browse all stylists →
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "2rem",
          }}
        >
          {featured.map((stylist) => (
            <StylistCard key={stylist.id} stylist={stylist} />
          ))}
        </div>
      </section>

      {/* Quiz CTA */}
      <section className="section" style={{ padding: "1rem 1.5rem 4rem" }}>
        <div
          className="card"
          style={{
            padding: "3rem 2rem",
            textAlign: "center",
            background:
              "linear-gradient(135deg, rgba(196,146,58,0.12), rgba(196,146,58,0.04))",
            border: "1px solid rgba(196,146,58,0.25)",
          }}
        >
          <h2 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 700 }}>
            Not sure where to start?
          </h2>
          <p style={{ color: "var(--dim)", maxWidth: 520, margin: "0.75rem auto 0" }}>
            Discover your colour season in two minutes. Get a personalised palette and stylist
            matches — completely free.
          </p>
          <Link
            href="/quiz"
            className="btn btn-primary"
            style={{ marginTop: "1.5rem", padding: "0.9rem 2rem", fontSize: "1rem" }}
          >
            Take the free style quiz
          </Link>
        </div>
      </section>
    </div>
  );
}
