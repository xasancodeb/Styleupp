import Link from "next/link";
import Image from "next/image";
import { STYLISTS, getFeatured } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Corridor from "@/components/Corridor";
import Reveal from "@/components/Reveal";

const SERVICES = [
  { name: "Colour analysis", from: 95, blurb: "Find the palette that makes you look rested and expensive.", specialty: "Colour Analysis" },
  { name: "Wardrobe rebuild", from: 70, blurb: "A closet where everything fits, matches and gets worn.", specialty: "Capsule Wardrobe" },
  { name: "Occasions", from: 80, blurb: "Weddings, interviews, milestone nights. Arrive unforgettable.", specialty: "Occasion & Event" },
  { name: "Shopping together", from: 75, blurb: "Your stylist joins you in the stores. Two hours, zero regrets.", specialty: "Personal Shopping" },
];

const QA = [
  {
    q: "How do I choose?",
    a: "By taste. Every stylist has a portfolio of real looks, a philosophy and reviews. Walk the corridor until something makes you stop. That one.",
  },
  {
    q: "What if nobody is in my city?",
    a: "Every stylist works on video, and it works beautifully: your wardrobe on camera, their eye on you. We show your country first, so anyone near you appears at the top.",
  },
  {
    q: "What does it cost?",
    a: "Sessions start at £60 and most are under £200. You see the full price before you pay, and payment is handled securely by Stripe.",
  },
  {
    q: "What if I don't love it?",
    a: "Your first session is free if it isn't worth every penny. Tell us within 48 hours and we refund it in full, no forms and no argument.",
  },
  {
    q: "Can I pick who I'm comfortable with?",
    a: "Yes. Filter by gender, city, budget and specialty, or just choose the portfolio you love. Comfort comes first; the transformation follows.",
  },
];

export default function HomePage() {
  const featured = getFeatured();
  const hero = STYLISTS.find((s) => s.id === "grace-adeyemi") ?? featured[0];

  return (
    <div>
      {/* ─────────────────────────── The entrance ─────────────────────────── */}
      <section className="section" style={{ paddingTop: "4rem", paddingBottom: "3.5rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <span className="eyebrow">The house of getting dressed well</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(3rem, 7.5vw, 5.6rem)", lineHeight: 1.0, letterSpacing: "-0.015em", marginTop: "1.2rem" }}>
                Twelve stylists.<br />
                One of them will change<br />
                how you <em style={{ fontStyle: "italic", color: "var(--accent)" }}>dress</em>.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ marginTop: "1.5rem" }}>
                Walk the house. Each stylist keeps a room: their looks, their philosophy,
                their reviews. When one feels like where you want to go, book them.
                In your city, or on video from anywhere.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "2rem" }}>
                <Link href="/explore" className="btn btn-primary">Walk the house <span className="arrow">→</span></Link>
                <Link href="/quiz" className="btn btn-outline">Find your colours first</Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <p style={{ marginTop: "2.2rem", fontSize: "0.9rem", color: "var(--faint)" }}>
                Sessions from £60 · 10 cities · first session guaranteed
              </p>
            </Reveal>
          </div>

          <Reveal delay={140} className="hero-visual">
            <div style={{ position: "relative" }}>
              <div className="photo arch" style={{ aspectRatio: "4 / 5" }}>
                <Image
                  src={hero.avatar}
                  alt={hero.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 480px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <Link
                href={`/stylist/${hero.id}`}
                className="card"
                style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: -22, padding: "0.7rem 1.3rem", display: "flex", alignItems: "center", gap: "0.7rem", whiteSpace: "nowrap" }}
              >
                <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem" }}>{hero.name}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--dim)" }}>{hero.city} · ★ {hero.rating}</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ────────────────────────── The corridor ──────────────────────────── */}
      <section style={{ padding: "3rem 0 1.5rem" }}>
        <Reveal>
          <div className="section" style={{ marginBottom: "1.75rem" }}>
            <span className="eyebrow">The corridor</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2rem, 4.5vw, 3rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
              Choose by taste, not by bio
            </h2>
            <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 540 }}>
              These are the stylists&apos; own looks. Walk past them. When one stops you,
              step inside.
            </p>
          </div>
        </Reveal>
        <Corridor />
      </section>

      {/* ─────────────────────── The green room: services ───────────────────── */}
      <section className="room" style={{ marginTop: "3rem" }}>
        <div className="section" style={{ padding: "4.5rem 1.75rem" }}>
          <Reveal>
            <span className="eyebrow">What happens here</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2rem, 4.5vw, 3rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
              Four ways in
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1px", marginTop: "2.25rem", background: "rgba(242, 236, 217, 0.16)", border: "1px solid rgba(242, 236, 217, 0.16)", borderRadius: 16, overflow: "hidden" }}>
            {SERVICES.map((s) => (
              <Link key={s.name} href={`/explore?specialty=${encodeURIComponent(s.specialty)}`} style={{ background: "var(--forest)", padding: "1.9rem 1.6rem", display: "block", transition: "background 0.25s var(--ease)" }} className="service-cell">
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", letterSpacing: "-0.01em" }}>{s.name}</div>
                <p style={{ fontSize: "0.92rem", marginTop: "0.55rem", lineHeight: 1.55 }}>{s.blurb}</p>
                <div style={{ fontSize: "0.85rem", color: "var(--accent-2)", fontWeight: 600, marginTop: "1rem" }}>
                  from £{s.from} →
                </div>
              </Link>
            ))}
          </div>
          <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap", marginTop: "2.25rem", fontSize: "0.9rem" }}>
            <span>First session guaranteed, or it&apos;s free</span>
            <span>Cancel free up to 48 hours before</span>
            <span>Every stylist vetted in person</span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────── The residents ───────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 1rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="eyebrow">The residents</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2rem, 4.5vw, 3rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
                Meet the house
              </h2>
            </div>
            <Link href="/explore" className="btn btn-outline">All twelve <span className="arrow">→</span></Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "2rem 1.5rem", marginTop: "2.25rem" }}>
          {featured.slice(0, 3).map((stylist, i) => (
            <Reveal key={stylist.id} delay={(i % 3) * 80}>
              <StylistCard stylist={stylist} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ───────────────────────────── Questions ──────────────────────────── */}
      <section className="section" style={{ padding: "4rem 1.75rem 0", maxWidth: 860 }}>
        <Reveal>
          <span className="eyebrow">Before you knock</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.9rem, 4vw, 2.7rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
            Fair questions
          </h2>
        </Reveal>
        <div style={{ display: "grid", gap: "0.6rem", marginTop: "1.75rem" }}>
          {QA.map((item) => (
            <details key={item.q} className="card" style={{ padding: "0.25rem 1.4rem", borderRadius: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: "1.02rem", padding: "1rem 0", listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                {item.q}
                <span aria-hidden style={{ color: "var(--faint)", fontSize: "1.2rem", fontWeight: 400 }}>+</span>
              </summary>
              <p style={{ color: "var(--dim)", lineHeight: 1.6, margin: "0 0 1.15rem", maxWidth: "66ch" }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───────────────────────────── The door ───────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 1rem", textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)", letterSpacing: "-0.01em", lineHeight: 1.05 }}>
            The door is <em style={{ fontStyle: "italic", color: "var(--accent)" }}>open</em>.
          </h2>
          <p style={{ maxWidth: 460, margin: "1rem auto 0", color: "var(--dim)", fontSize: "1.02rem" }}>
            Two minutes to find your colours, or go straight to the stylists.
            Either way, you stop guessing today.
          </p>
          <div style={{ display: "flex", gap: "0.7rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.9rem" }}>
            <Link href="/explore" className="btn btn-primary">Walk the house <span className="arrow">→</span></Link>
            <Link href="/quiz" className="btn btn-outline">Take the colour quiz</Link>
          </div>
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
        .service-cell:hover { background: var(--forest-2) !important; }
      `}</style>
    </div>
  );
}
