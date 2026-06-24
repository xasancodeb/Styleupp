import Link from "next/link";
import { getFeatured, SPECIALTIES } from "@/lib/data";
import StylistCard from "@/components/StylistCard";
import Reveal from "@/components/Reveal";
import ColorQuiz from "@/components/ColorQuiz";

const STEPS = [
  { n: "01", title: "Calibrate", body: "Take the two minute index. It finds your colour season and the stylists who fit your taste, budget and goals." },
  { n: "02", title: "Commission", body: "Pick a stylist, a service and a format. Video, in person, or a shopping trip near you." },
  { n: "03", title: "Wear it", body: "You get a real plan and a palette you can shop. We keep your bookings and looks on file." },
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
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 700, fontSize: "clamp(2.7rem, 6.5vw, 5rem)", lineHeight: 1.0, letterSpacing: "-0.045em", marginTop: "1.4rem" }}>
                Find your colour.<br />
                <span style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Then wear it</span>{" "}with confidence.
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

          {/* the quiz, front and centre */}
          <Reveal delay={140} className="hero-visual">
            <div style={{ position: "relative" }}>
              <div style={{ marginBottom: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }} />
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dim)" }}>Start here · free colour quiz</span>
              </div>
              <ColorQuiz compact />
            </div>
          </Reveal>
        </div>
      </section>

      {/* specialties strip */}
      <section className="section" style={{ padding: "0 1.75rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", paddingTop: "0.5rem" }}>
          {SPECIALTIES.map((s) => (
            <span key={s} className="chip" style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}>
              {s}
            </span>
          ))}
        </div>
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

      {/* ──────────────────────────── Featured ─────────────────────────────── */}
      <section className="section" style={{ padding: "1rem 1.75rem 5rem" }}>
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

      {/* ────────────────────────────── Closing CTA ───────────────────────────── */}
      <section className="section" style={{ padding: "0 1.75rem 5rem" }}>
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
