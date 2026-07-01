import Link from "next/link";
import Image from "next/image";
import { getFeatured, SERVICE_MENU } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";
import MatchRequest from "@/components/MatchRequest";
import PaletteRail from "@/components/PaletteRail";
import LiveTicker from "@/components/LiveTicker";
import PromiseStrip from "@/components/PromiseStrip";
import Transformations from "@/components/Transformations";
import FAQ from "@/components/FAQ";

const STEPS = [
  { n: "1", title: "Tell us what you need", body: "A big occasion, a wardrobe that finally works, help shopping, your colours. Thirty seconds, no sign-up." },
  { n: "2", title: "Get matched nearby", body: "We show you vetted stylists in your city first — a woman or a man, your choice. Video only if you want it." },
  { n: "3", title: "Meet and transform", body: "Book and pay securely through StyleUp. You keep the plan, the palette and the confidence." },
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
              <span className="eyebrow">Personal styling, on demand · women first, men welcome</span>
            </Reveal>
            <Reveal delay={60}>
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.7rem, 6.5vw, 5rem)", lineHeight: 1.04, letterSpacing: "-0.045em", marginTop: "1.4rem" }}>
                A personal <span className="gradient-word">stylist</span>,<br />
                near you,<br />on your budget.
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="lede" style={{ marginTop: "1.5rem" }}>
                Tell us what you need — a big occasion, a wardrobe that finally works, help shopping —
                and we match you with a vetted stylist in your city. Over video only if you prefer it.
              </p>
            </Reveal>
            <Reveal delay={180}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.8rem" }}>
                <Link href="/explore" className="btn btn-outline">Or browse all stylists</Link>
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

          {/* the request flow, front and centre — the "hail a stylist" card */}
          <Reveal delay={140} className="hero-visual">
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Get matched · takes 30 seconds</span>
              </div>
              <MatchRequest />
            </div>
          </Reveal>
        </div>
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

      {/* ─────────── Not ready to book? The free colour tool ──────────────── */}
      <section style={{ padding: "1rem 0 4.5rem" }}>
        <Reveal>
          <div style={{ textAlign: "center", padding: "0 1.75rem", marginBottom: "1.5rem" }}>
            <span className="eyebrow">Not ready to book?</span>
            <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(1.7rem, 4vw, 2.4rem)", letterSpacing: "-0.03em", marginTop: "0.6rem" }}>
              Start free: find your colours
            </h2>
            <p style={{ color: "var(--dim)", marginTop: "0.5rem", maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
              Two minutes, no card, no sign-up. One of these rows is yours — and when you do book,
              your stylist starts from it.
            </p>
          </div>
        </Reveal>
        <PaletteRail />
        <div style={{ textAlign: "center", marginTop: "1.75rem" }}>
          <Link href="/quiz" className="btn btn-primary">Take the free colour quiz <span className="arrow">→</span></Link>
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
