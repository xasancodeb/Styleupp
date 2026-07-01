import Link from "next/link";
import { getFeatured } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";
import MatchRequest from "@/components/MatchRequest";
import StyleShelf from "@/components/StyleShelf";
import PaletteRail from "@/components/PaletteRail";
import PromiseStrip from "@/components/PromiseStrip";
import Transformations from "@/components/Transformations";
import FAQ from "@/components/FAQ";

const STEPS = [
  {
    n: "1",
    title: "Browse their work",
    body: "Every stylist has a portfolio. Scroll their looks, read their philosophy, and pick the taste that feels like where you want to go.",
  },
  {
    n: "2",
    title: "Book your way",
    body: "In your city when we have someone near you. Over video with anyone, anywhere. You choose the person and the format.",
  },
  {
    n: "3",
    title: "Get transformed",
    body: "A session ends with something real: a palette, a plan, a wardrobe that works. Pay securely through StyleUp, protected by our guarantee.",
  },
];

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.9rem", letterSpacing: "-0.02em", lineHeight: 1 }}>{v}</div>
      <div style={{ fontSize: "0.82rem", color: "var(--dim)", marginTop: "0.35rem" }}>{k}</div>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeatured();

  return (
    <div>
      {/* ───────────────────────────── Hero ───────────────────────────── */}
      <section className="section" style={{ paddingTop: "3.5rem", paddingBottom: "3rem" }}>
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "3.5rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <span className="eyebrow">Personal styling, done properly</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(2.9rem, 7vw, 5.2rem)", lineHeight: 1.02, letterSpacing: "-0.02em", marginTop: "1.3rem" }}>
                The best-dressed person you know is about to be <em style={{ fontStyle: "italic", color: "var(--accent)" }}>you</em>.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ marginTop: "1.5rem" }}>
                Real stylists, chosen by their work. Browse each portfolio, pick the taste you love,
                and book them in your city or over video. For weddings, wardrobes, work and everything you wear.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.9rem" }}>
                <Link href="/explore" className="btn btn-primary">Meet the stylists <span className="arrow">→</span></Link>
                <Link href="/quiz" className="btn btn-outline">Find your colours first</Link>
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: "2.4rem", marginTop: "2.6rem", flexWrap: "wrap" }}>
                {[
                  { k: "Stylists with portfolios", v: "12" },
                  { k: "Cities", v: "10" },
                  { k: "Sessions from", v: "£60" },
                ].map((m) => (
                  <Spec key={m.k} k={m.k} v={m.v} />
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={140} className="hero-visual">
            <div>
              <div style={{ marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Tell us what you need. 30 seconds.</span>
              </div>
              <MatchRequest />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────── The shelf: pick by taste ──────────────────── */}
      <section style={{ padding: "2.5rem 0 1rem" }}>
        <Reveal>
          <div className="section" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <span className="eyebrow">Their work speaks first</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
                Choose a stylist by their taste
              </h2>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 520 }}>
                Not by a bio. Scroll the looks, find the one that makes you think
                <em style={{ fontFamily: "var(--font-display)", color: "var(--accent)" }}> that&apos;s it</em>, and see their full profile.
              </p>
            </div>
          </div>
        </Reveal>
        <StyleShelf />
      </section>

      {/* the promise */}
      <section className="section" style={{ padding: "3rem 1.75rem 0" }}>
        <Reveal>
          <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "2rem 0" }}>
            <PromiseStrip />
          </div>
        </Reveal>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 1rem" }}>
        <Reveal>
          <span className="eyebrow">How it works</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
            Three steps to never guessing again
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2.25rem" }}>
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 90}>
              <div className="card" style={{ padding: "1.8rem", height: "100%" }}>
                <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.6rem", color: "var(--accent)" }}>{step.n}.</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "1.35rem", letterSpacing: "-0.015em", marginTop: "0.7rem" }}>{step.title}</h3>
                <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "0.95rem", lineHeight: 1.6 }}>{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "3.5rem 1.75rem 4.5rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="eyebrow">The roster</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
                Stylists people come back to
              </h2>
            </div>
            <Link href="/explore" className="btn btn-outline">See everyone <span className="arrow">→</span></Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
          {featured.slice(0, 3).map((stylist, i) => (
            <Reveal key={stylist.id} delay={(i % 3) * 80}>
              <StylistCard stylist={stylist} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ─────────────────────── What a stylist changes ─────────────────────── */}
      <section style={{ background: "var(--bg-2)" }}>
        <div className="section" style={{ padding: "4.5rem 1.75rem" }}>
          <Reveal>
            <span className="eyebrow">Why it works</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
              Same person. Right clothes.
            </h2>
            <p style={{ color: "var(--dim)", marginTop: "0.6rem", maxWidth: 560 }}>
              Hover each look to see it in full colour. This is the difference a trained eye makes.
            </p>
          </Reveal>
          <div style={{ marginTop: "2rem" }}>
            <Transformations />
          </div>
        </div>
      </section>

      {/* ─────────── The free colour tool ──────────────── */}
      <section style={{ padding: "4.5rem 0 4rem" }}>
        <Reveal>
          <div style={{ textAlign: "center", padding: "0 1.75rem", marginBottom: "1.5rem" }}>
            <span className="eyebrow" style={{ justifyContent: "center" }}>Start free</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
              Find your colours in two minutes
            </h2>
            <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              No card, no sign-up. One of these rows belongs to you, and when you book,
              your stylist starts from it.
            </p>
          </div>
        </Reveal>
        <PaletteRail />
        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <Link href="/quiz" className="btn btn-primary">Take the colour quiz <span className="arrow">→</span></Link>
        </div>
      </section>

      {/* ───────────────────────────────── FAQ ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.75rem 0", maxWidth: 880 }}>
        <Reveal>
          <span className="eyebrow">Good to know</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", letterSpacing: "-0.02em", marginTop: "0.7rem" }}>
            Questions, answered
          </h2>
        </Reveal>
        <div style={{ marginTop: "1.75rem" }}>
          <FAQ />
        </div>
      </section>

      {/* ────────────────────────────── Closing ───────────────────────────── */}
      <section className="section" style={{ padding: "4rem 1.75rem 5rem" }}>
        <Reveal>
          <div className="card" style={{ padding: "clamp(2.5rem, 6vw, 4.5rem) 1.75rem", textAlign: "center" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(2rem, 5.5vw, 3.4rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
              Stop guessing.<br />Start <em style={{ fontStyle: "italic", color: "var(--accent)" }}>getting dressed</em>.
            </h2>
            <p style={{ maxWidth: 480, margin: "1.1rem auto 0", color: "var(--dim)", fontSize: "1.02rem" }}>
              Your first session is protected by our guarantee. If it isn&apos;t worth every penny, it&apos;s free.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.9rem" }}>
              <Link href="/explore" className="btn btn-primary">Meet the stylists <span className="arrow">→</span></Link>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
