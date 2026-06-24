import Link from "next/link";
import Image from "next/image";
import { getFeatured, SPECIALTIES } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";

const STEPS = [
  { n: "01", title: "Calibrate", body: "Take the two minute index. It finds your colour season and the stylists who fit your taste, budget and goals." },
  { n: "02", title: "Commission", body: "Pick a stylist, a service and a format. Video, in person, or a shopping trip near you." },
  { n: "03", title: "Wear it", body: "You get a real plan and a palette you can shop. We keep your bookings and looks on file." },
];

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "1.9rem", letterSpacing: "-0.03em", lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: "0.82rem", color: "var(--dim)", marginTop: "0.3rem" }}>{k}</div>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: "3rem", paddingBottom: "3.5rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <span className="eyebrow">Personal styling, in colour</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "clamp(2.9rem, 7vw, 5.4rem)", lineHeight: 1.0, letterSpacing: "-0.045em", marginTop: "1.4rem" }}>
                Find your colour.<br />
                <span style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Then wear it</span>{" "}with confidence.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ marginTop: "1.6rem" }}>
                Every stylist here is vetted. Meet over video from anywhere, or find someone near
                you to style you in person or shop the stores with you.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.9rem" }}>
                <Link href="/explore" className="btn btn-primary">Browse stylists <span className="arrow">→</span></Link>
                <Link href="/quiz" className="btn btn-outline">Find your colours</Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: "2.2rem", marginTop: "2.6rem", flexWrap: "wrap" }}>
                {[
                  { k: "Stylists", v: "13" },
                  { k: "Avg. rating", v: "4.9" },
                  { k: "Sessions", v: "10K+" },
                ].map((m) => (
                  <Spec key={m.k} k={m.k} v={m.v} />
                ))}
              </div>
            </Reveal>
          </div>

          {/* image plate */}
          <Reveal delay={140} className="hero-visual">
            <div className="photo" style={{ aspectRatio: "4 / 5", minHeight: 420, boxShadow: "var(--glow), var(--shadow)" }}>
              <Image
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80"
                alt="A styled editorial look"
                fill
                priority
                sizes="(max-width: 860px) 100vw, 540px"
                style={{ objectFit: "cover" }}
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* marquee specialties strip */}
      <section style={{ background: "var(--card)", color: "var(--dim)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="section mono" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.2rem 0", padding: "1.1rem 1.75rem", fontSize: "0.66rem" }}>
          {SPECIALTIES.map((s, i) => (
            <span key={s} style={{ padding: "0 0.85rem" }}>
              {s}
              {i < SPECIALTIES.length - 1 && <span style={{ color: "var(--accent)", marginLeft: "0.85rem" }}>◆</span>}
            </span>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem" }}>
        <Reveal>
          <span className="eyebrow">How it works</span>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.04em", marginTop: "1rem", lineHeight: 1.02 }}>
            Three simple steps.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2.5rem" }} className="method-grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="card" style={{ padding: "1.8rem", height: "100%" }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.05rem", color: "#14111f", background: "linear-gradient(150deg, var(--accent), var(--accent-2))", boxShadow: "0 8px 22px -10px color-mix(in srgb, var(--accent) 80%, transparent)" }}>{step.n}</div>
                <h3 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.025em", marginTop: "1.1rem" }}>{step.title}</h3>
                <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "0.95rem" }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.75rem 5rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="eyebrow">Featured stylists</span>
              <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.04em", marginTop: "0.9rem" }}>
                Meet a few of them
              </h2>
            </div>
            <Link href="/explore" className="btn btn-outline">See all 13 <span className="arrow">→</span></Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
          {featured.map((stylist, i) => (
            <Reveal key={stylist.id} delay={(i % 3) * 80}>
              <StylistCard stylist={stylist} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ────────────────────────────── Quiz CTA ───────────────────────────── */}
      <section className="section" style={{ padding: "0 1.75rem 5rem" }}>
        <Reveal>
          <div className="card" style={{ padding: "clamp(2.5rem, 6vw, 4.5rem) 1.75rem", textAlign: "center", overflow: "hidden", position: "relative" }}>
            <span className="eyebrow">Free · two minutes</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "clamp(2.2rem, 6vw, 4rem)", letterSpacing: "-0.045em", marginTop: "1.2rem", lineHeight: 1.0 }}>
              Find your{" "}
              <span style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>colours</span>
              <br />in two minutes.
            </h2>
            <p style={{ maxWidth: 480, margin: "1.2rem auto 0", color: "var(--dim)", fontSize: "1.02rem" }}>
              Once we know your season, the whole site wears your palette and your stylist matches get sharper.
            </p>
            <Link href="/quiz" className="btn btn-primary" style={{ marginTop: "2rem" }}>
              Take the quiz <span className="arrow">→</span>
            </Link>
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
