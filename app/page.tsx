import Link from "next/link";
import Image from "next/image";
import { getFeatured, SERVICE_MENU } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";
import ColorQuiz from "@/components/ColorQuiz";
import PaletteRail from "@/components/PaletteRail";
import LiveTicker from "@/components/LiveTicker";
import PromiseStrip from "@/components/PromiseStrip";
import Transformations from "@/components/Transformations";
import FAQ from "@/components/FAQ";

const STEPS = [
  { n: "1", title: "Take the quiz", body: "Two minutes, no sign-up. It finds your colour season — the shades that make you look rested, radiant and expensive." },
  { n: "2", title: "Meet your stylist", body: "Choose who you work with: a woman or man stylist, near you or over video, at a price that suits." },
  { n: "3", title: "Wear it", body: "You leave with a real plan and a palette you can shop from. We keep your looks and bookings on file." },
];

const QUOTES = [
  { text: "I get compliments every single week now. I finally understand what suits me.", name: "Priya", detail: "Colour analysis, London" },
  { text: "My stylist came shopping with me. Two hours, one bag, zero regrets.", name: "Claire", detail: "Shopping trip, Milan" },
  { text: "I own half as much and look twice as good.", name: "Daniel", detail: "Capsule wardrobe, Tokyo" },
];

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "1.9rem", letterSpacing: "-0.03em", lineHeight: 1 }}>{v}</div>
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
        <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1.02fr 1fr", gap: "3rem", alignItems: "center" }}>
          <div>
            <Reveal>
              <span className="eyebrow">Personal styling for women · men welcome too</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.7rem, 6.5vw, 5rem)", lineHeight: 1.04, letterSpacing: "-0.045em", marginTop: "1.4rem" }}>
                Find your <span className="gradient-word">colour</span>.<br />
                Then wear it<br />with confidence.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ marginTop: "1.5rem" }}>
                Start with the free colour quiz on the right. Then book a vetted stylist near you, or
                over video from anywhere. Choose who you work with, including a woman or man stylist.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.8rem" }}>
                <Link href="/explore" className="btn btn-primary">Browse stylists <span className="arrow">→</span></Link>
                <Link href="/explore" className="btn btn-outline">Find someone near me</Link>
              </div>
            </Reveal>
            <Reveal delay={220}>
              <div style={{ marginTop: "1.6rem" }}>
                <LiveTicker />
              </div>
            </Reveal>
            <Reveal delay={240}>
              <div style={{ display: "flex", gap: "2.2rem", marginTop: "2rem", flexWrap: "wrap" }}>
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

          {/* the quiz, front and centre */}
          <Reveal delay={140} className="hero-visual">
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Start here · free colour quiz</span>
              </div>
              <ColorQuiz compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* the palette rail — every colour we can dress you in */}
      <section style={{ padding: "1.5rem 0 0" }}>
        <Reveal>
          <p style={{ textAlign: "center", color: "var(--dim)", fontSize: "0.95rem", marginBottom: "1.5rem", padding: "0 1.75rem" }}>
            Twenty-four colours across four seasons. <span style={{ color: "var(--ink)", fontWeight: 600 }}>One row of these is yours.</span>
          </p>
        </Reveal>
        <PaletteRail />
      </section>

      {/* the promise */}
      <section className="section" style={{ padding: "3.5rem 1.75rem 0" }}>
        <Reveal>
          <div style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", padding: "2rem 0" }}>
            <PromiseStrip />
          </div>
        </Reveal>
      </section>

      {/* ──────────────────────────── How it works ─────────────────────────── */}
      <section style={{ background: "var(--bg-2)", marginTop: "2rem" }}>
        <div className="section" style={{ padding: "4.5rem 1.75rem" }}>
          <Reveal>
            <span className="eyebrow">How it works</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.035em", marginTop: "0.6rem", lineHeight: 1.04 }}>
              Three simple steps.
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2.5rem" }} className="method-grid">
            {STEPS.map((step, i) => (
              <Reveal key={step.n} delay={i * 90}>
                <div className="card" style={{ padding: "1.8rem", height: "100%" }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "1.05rem", color: "#fff", background: "var(--ink)" }}>{step.n}</div>
                  <h3 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 600, fontSize: "1.35rem", letterSpacing: "-0.02em", marginTop: "1.1rem" }}>{step.title}</h3>
                  <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "0.95rem" }}>{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────── Services ─────────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 1rem" }}>
        <Reveal>
          <span className="eyebrow">What you can book</span>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.035em", marginTop: "0.6rem" }}>
            Six ways to level up
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem", marginTop: "2rem" }}>
          {SERVICE_MENU.map((svc, i) => (
            <Reveal key={svc.name} delay={(i % 3) * 80}>
              <Link href={`/explore?specialty=${encodeURIComponent(svc.specialty)}`} className="card" style={{ display: "block", padding: "1.6rem", height: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "0.8rem" }}>
                  <h3 style={{ fontWeight: 600, fontSize: "1.15rem", letterSpacing: "-0.02em" }}>{svc.name}</h3>
                  <span style={{ fontSize: "0.84rem", color: "var(--faint)", whiteSpace: "nowrap" }}>from £{svc.from}</span>
                </div>
                <p style={{ color: "var(--dim)", fontSize: "0.92rem", marginTop: "0.5rem", lineHeight: 1.5 }}>{svc.blurb}</p>
                <span style={{ display: "inline-block", marginTop: "0.9rem", fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)" }}>
                  See stylists →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "3.5rem 1.75rem 5rem" }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="eyebrow">Featured stylists</span>
              <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.035em", marginTop: "0.6rem" }}>
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

      {/* ──────────────────────── Editorial statement ──────────────────────── */}
      <section className="section" style={{ padding: "0 1.75rem 4.5rem" }}>
        <Reveal>
          <div style={{ position: "relative", borderRadius: 28, overflow: "hidden", minHeight: "min(76vh, 620px)", display: "flex", alignItems: "flex-end" }}>
            <Image
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80"
              alt="A woman in a striking, colour-matched outfit"
              fill
              sizes="(max-width: 1180px) 100vw, 1120px"
              style={{ objectFit: "cover" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.06) 55%)" }} />
            <div style={{ position: "relative", padding: "clamp(1.75rem, 5vw, 3.5rem)", color: "#fff", maxWidth: 640 }}>
              <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.4rem)", letterSpacing: "-0.035em", lineHeight: 1.04 }}>
                Wear what makes you glow.
              </h2>
              <p style={{ marginTop: "0.9rem", fontSize: "1.05rem", color: "rgba(255,255,255,0.85)", maxWidth: 460 }}>
                Not what the trend cycle says. Your palette is decided by your skin, hair and eyes,
                and it never goes out of season.
              </p>
              <Link href="/fitting" className="btn" style={{ marginTop: "1.5rem", background: "#fff", color: "var(--ink)" }}>
                Open the fitting room <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─────────────────────── See the difference ────────────────────────── */}
      <section className="section" style={{ padding: "0 1.75rem 4.5rem" }}>
        <Reveal>
          <span className="eyebrow">Real transformations</span>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.035em", marginTop: "0.6rem" }}>
            Same person. Right colours.
          </h2>
          <p style={{ color: "var(--dim)", marginTop: "0.6rem", maxWidth: 560 }}>
            Hover over each photo to see what happens when someone starts wearing their season.
          </p>
        </Reveal>
        <div style={{ marginTop: "2rem" }}>
          <Transformations />
        </div>
      </section>

      {/* ─────────────────────────── Loved by clients ──────────────────────── */}
      <section style={{ background: "var(--bg-2)" }}>
        <div className="section" style={{ padding: "4.5rem 1.75rem" }}>
          <Reveal>
            <span className="eyebrow">From real sessions</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.035em", marginTop: "0.6rem" }}>
              People leave glowing
            </h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginTop: "2.25rem" }}>
            {QUOTES.map((q, i) => (
              <Reveal key={q.name} delay={i * 90}>
                <figure className="card" style={{ padding: "1.8rem", margin: 0, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <blockquote style={{ margin: 0, fontSize: "1.1rem", fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.45 }}>
                    &ldquo;{q.text}&rdquo;
                  </blockquote>
                  <figcaption style={{ marginTop: "1.4rem", fontSize: "0.88rem" }}>
                    <span style={{ fontWeight: 600 }}>{q.name}</span>
                    <span style={{ color: "var(--faint)" }}> · {q.detail}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────────── FAQ ─────────────────────────────── */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 0", maxWidth: 880 }}>
        <Reveal>
          <span className="eyebrow">Good to know</span>
          <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.8rem)", letterSpacing: "-0.035em", marginTop: "0.6rem" }}>
            Questions, answered
          </h2>
        </Reveal>
        <div style={{ marginTop: "1.75rem" }}>
          <FAQ />
        </div>
      </section>

      {/* ────────────────────────────── Closing CTA ───────────────────────────── */}
      <section className="section" style={{ padding: "4rem 1.75rem 5rem" }}>
        <Reveal>
          <div className="card" style={{ padding: "clamp(2.5rem, 6vw, 4.5rem) 1.75rem", textAlign: "center", overflow: "hidden", position: "relative" }}>
            <span className="eyebrow">Near you, or anywhere</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.1rem, 6vw, 3.6rem)", letterSpacing: "-0.045em", marginTop: "1.2rem", lineHeight: 1.02 }}>
              Meet your{" "}
              <span style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>stylist</span>
            </h2>
            <p style={{ maxWidth: 520, margin: "1.2rem auto 0", color: "var(--dim)", fontSize: "1.02rem" }}>
              We start with stylists in your country and the people you can actually meet in person.
              Want the whole world to choose from? Switch to international and meet anyone over video.
            </p>
            <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", marginTop: "2rem" }}>
              <Link href="/explore" className="btn btn-primary">Browse stylists <span className="arrow">→</span></Link>
              <Link href="/explore" className="btn btn-outline">Find someone near me</Link>
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
