import Link from "next/link";
import Image from "next/image";
import { getFeatured, SPECIALTIES } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";

const STEPS = [
  { n: "01", title: "Tell us your style", body: "Take the two-minute quiz to discover your colour season and the stylists who fit your taste, budget and goals." },
  { n: "02", title: "Book your stylist", body: "Browse vetted stylists worldwide. Choose a service, pick a time, and book in a few taps — virtual or in person." },
  { n: "03", title: "Wear it with confidence", body: "Get a personalised plan, a shoppable palette and a wardrobe that finally feels like yours." },
];

function SectionHead({ index, kicker, title }: { index: string; kicker: string; title: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: "1.25rem", alignItems: "baseline" }}>
      <span className="font-serif" style={{ fontSize: "0.95rem", color: "var(--faint)", fontWeight: 500 }}>{index}</span>
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2 className="display" style={{ fontSize: "clamp(2rem, 4.4vw, 2.9rem)", marginTop: "0.6rem" }}>{title}</h2>
      </div>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: "5rem", paddingBottom: "4.5rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "4.5rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <span className="eyebrow">Personal styling · worldwide</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 className="display" style={{ fontSize: "clamp(3rem, 7vw, 5.8rem)", marginTop: "1.6rem" }}>
                Personal styling,
                <br />
                made <em>personal.</em>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ maxWidth: 460, marginTop: "1.9rem" }}>
                Work one-to-one with a vetted stylist — anywhere in the world. Discover your colours,
                build a wardrobe you love, and finally enjoy getting dressed.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "2.25rem" }}>
                <Link href="/explore" className="btn btn-primary">Find your stylist <span className="arrow">→</span></Link>
                <Link href="/quiz" className="btn btn-outline">Take the style quiz</Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: "3.25rem", marginTop: "3rem", flexWrap: "wrap" }}>
                {[
                  { stat: "13+", label: "Cities worldwide" },
                  { stat: "4.9", label: "Average rating" },
                  { stat: "10k+", label: "Sessions delivered" },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="font-serif" style={{ fontSize: "2.1rem", fontWeight: 450, lineHeight: 1 }}>{m.stat}</div>
                    <div className="eyebrow" style={{ marginTop: "0.6rem", color: "var(--faint)" }}>{m.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Treated editorial image */}
          <Reveal delay={140} className="hero-visual" style={{ position: "relative" }}>
            <div className="photo" style={{ borderRadius: 22, aspectRatio: "5 / 6", boxShadow: "0 50px 90px -40px rgba(28,26,22,0.4)" }}>
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80"
                alt="A styled editorial look"
                fill
                priority
                sizes="(max-width: 860px) 100vw, 560px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="card" style={{ position: "absolute", bottom: 24, left: -22, padding: "1rem 1.3rem", borderRadius: 14 }}>
              <div style={{ fontSize: "0.66rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--faint)" }}>By appointment</div>
              <div className="font-serif" style={{ fontSize: "1.1rem", marginTop: "0.2rem" }}>Hand-vetted stylists</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Specialties — quiet, framed */}
      <section className="section">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0 0.5rem", justifyContent: "center", padding: "1.6rem 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          {SPECIALTIES.map((s, i) => (
            <span key={s} className="font-serif" style={{ display: "inline-flex", alignItems: "center", color: "var(--dim)", fontSize: "1rem", padding: "0.25rem 0.75rem" }}>
              {s}
              {i < SPECIALTIES.length - 1 && <span style={{ color: "var(--accent)", opacity: 0.5, marginLeft: "0.85rem" }}>✦</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section className="section" style={{ padding: "5.5rem 1.5rem" }}>
        <Reveal>
          <SectionHead index="①" kicker="The process" title={<>Three steps to a wardrobe that <em>works.</em></>} />
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.75rem", marginTop: "3rem" }}>
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="card" style={{ padding: "2.25rem", height: "100%" }}>
                <div className="font-serif" style={{ fontSize: "1.5rem", color: "var(--accent)", fontStyle: "italic", lineHeight: 1 }}>{step.n}</div>
                <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 500, marginTop: "1.1rem" }}>{step.title}</h3>
                <p style={{ color: "var(--dim)", marginTop: "0.7rem" }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.5rem 5rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <SectionHead index="②" kicker="The roster" title="Featured stylists" />
            <Link href="/explore" className="btn btn-outline">Browse all <span className="arrow">→</span></Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.75rem", marginTop: "2.75rem" }}>
          {featured.map((stylist, i) => (
            <Reveal key={stylist.id} delay={(i % 3) * 80}>
              <StylistCard stylist={stylist} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ────────────────────────────── Quiz CTA ───────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.5rem 6rem" }}>
        <Reveal>
          <div style={{ position: "relative", borderRadius: 24, overflow: "hidden" }}>
            <div className="photo" style={{ position: "absolute", inset: 0 }}>
              <Image src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1500&q=80" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
            </div>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,26,22,0.45), rgba(28,26,22,0.68))" }} />
            <div style={{ position: "relative", padding: "5.5rem 2rem", textAlign: "center", color: "#fff" }}>
              <span className="eyebrow" style={{ color: "rgba(255,255,255,0.75)", justifyContent: "center" }}>Free · two minutes</span>
              <h2 className="display" style={{ fontSize: "clamp(2.3rem, 5.5vw, 3.8rem)", marginTop: "1.1rem" }}>
                Not sure where to <em>start?</em>
              </h2>
              <p style={{ maxWidth: 500, margin: "1.1rem auto 0", color: "rgba(255,255,255,0.85)", fontSize: "1.08rem" }}>
                Discover your colour season and get a personalised palette plus matched stylists.
              </p>
              <Link href="/quiz" className="btn" style={{ marginTop: "2rem", background: "var(--paper)", color: "var(--ink)" }}>
                Take the style quiz <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
