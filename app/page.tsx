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
      <div className="mono" style={{ fontSize: "0.6rem", color: "var(--faint)" }}>{k}</div>
      <div style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-0.03em", marginTop: "0.2rem" }}>{v}</div>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* running spec bar */}
      <div className="mono section" style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 1.75rem", borderBottom: "1px solid var(--border)", fontSize: "0.62rem", color: "var(--faint)" }}>
        <span>STYLEUP / A STYLING SYSTEM</span>
        <span style={{ display: "inline-flex", gap: "1.5rem" }} className="spec-hide"><span>13 STYLISTS · 12 CITIES</span><span>EST. MMXXVI</span></span>
      </div>

      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "3.5rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "3.5rem", alignItems: "stretch" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Reveal>
              <span className="eyebrow">Index 001 / Personal styling, systemised</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(3.2rem, 9vw, 7rem)", lineHeight: 0.86, letterSpacing: "-0.05em", marginTop: "1.5rem" }}>
                Personal<br />styling,<br /><span style={{ color: "var(--accent)" }}>indexed.</span>
              </h1>
            </Reveal>
            <div>
              <Reveal delay={120}>
                <p className="lede" style={{ marginTop: "1.75rem" }}>
                  Every stylist here is vetted. Search the index by city, specialty and format.
                  Meet over video from anywhere, or find someone near you to style you in person or shop the stores with you.
                </p>
              </Reveal>
              <Reveal delay={180}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.9rem" }}>
                  <Link href="/explore" className="btn btn-primary">Open the catalogue <span className="arrow">→</span></Link>
                  <Link href="/quiz" className="btn btn-outline">Calibrate your colours</Link>
                </div>
              </Reveal>
            </div>
          </div>

          {/* image plate */}
          <Reveal delay={140} className="hero-visual">
            <div style={{ border: "1px solid var(--ink)", borderRadius: 3, overflow: "hidden", height: "100%", minHeight: 440, display: "flex", flexDirection: "column" }}>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", padding: "0.55rem 0.85rem", borderBottom: "1px solid var(--ink)", fontSize: "0.6rem", color: "var(--dim)" }}>
                <span>FIG. 01</span><span>EDITORIAL / SS26</span>
              </div>
              <div className="photo" style={{ flex: 1, position: "relative" }}>
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=80"
                  alt="A styled editorial look"
                  fill
                  priority
                  sizes="(max-width: 860px) 100vw, 560px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* spec ledger */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--ink)", marginTop: "3rem" }} className="spec-ledger">
          {[
            { k: "Cities", v: "12" },
            { k: "Avg. rating", v: "4.9" },
            { k: "Sessions", v: "10K+" },
            { k: "Lowest fee", v: "10%" },
          ].map((m, i) => (
            <div key={m.k} style={{ padding: "1.5rem 1.25rem", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
              <Spec k={m.k} v={m.v} />
            </div>
          ))}
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
      <section className="section" style={{ padding: "5rem 1.75rem" }}>
        <Reveal>
          <span className="eyebrow">The method</span>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", letterSpacing: "-0.04em", marginTop: "1rem", lineHeight: 0.95 }}>
            Three movements.
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0", marginTop: "2.5rem", borderTop: "1px solid var(--ink)" }} className="method-grid">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div style={{ padding: "1.9rem 1.5rem 1.9rem 0", borderRight: i < STEPS.length - 1 ? "1px solid var(--border)" : "none", height: "100%" }} className="method-cell">
                <div className="mono" style={{ fontSize: "0.7rem", color: "var(--accent)" }}>STEP / {step.n}</div>
                <h3 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: "1.6rem", textTransform: "uppercase", letterSpacing: "-0.03em", marginTop: "1rem" }}>{step.title}</h3>
                <p style={{ color: "var(--dim)", marginTop: "0.7rem", fontSize: "0.95rem" }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.75rem 5rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", borderTop: "1px solid var(--ink)", paddingTop: "1.5rem" }}>
            <div>
              <span className="eyebrow">From the catalogue</span>
              <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(2rem, 4.5vw, 3rem)", letterSpacing: "-0.04em", marginTop: "0.8rem" }}>
                Featured entries
              </h2>
            </div>
            <Link href="/explore" className="btn btn-outline">All 13 <span className="arrow">→</span></Link>
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
      <section style={{ background: "var(--ink)", color: "var(--bg)" }}>
        <div className="section" style={{ padding: "5rem 1.75rem", textAlign: "center" }}>
          <Reveal>
            <span className="eyebrow" style={{ color: "var(--bg)", justifyContent: "center" }}>Free · two minutes</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", letterSpacing: "-0.05em", marginTop: "1.2rem", lineHeight: 0.9 }}>
              Calibrate<br />your <span style={{ color: "var(--accent)" }}>colours.</span>
            </h2>
            <p style={{ maxWidth: 480, margin: "1.2rem auto 0", color: "color-mix(in srgb, var(--bg) 75%, transparent)", fontSize: "1rem" }}>
              Once we know your season, the whole site wears your palette and your stylist matches get sharper.
            </p>
            <Link href="/quiz" className="btn" style={{ marginTop: "2rem", background: "var(--bg)", color: "var(--ink)", borderColor: "var(--bg)" }}>
              Run the calibration <span className="arrow">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .spec-ledger { grid-template-columns: repeat(2, 1fr) !important; }
          .spec-ledger > div:nth-child(2) { border-right: none !important; }
          .spec-ledger > div:nth-child(1), .spec-ledger > div:nth-child(2) { border-bottom: 1px solid var(--border); }
          .method-cell { border-right: none !important; border-bottom: 1px solid var(--border); padding-left: 0 !important; }
          .spec-hide { display: none !important; }
        }
      `}</style>
    </div>
  );
}
