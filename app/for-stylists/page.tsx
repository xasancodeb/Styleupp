import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Become a resident | StyleUp",
  description: "Take a room in the house. Bring your taste, your portfolio and your standards. We bring the clients, the bookings and the payments.",
};

const TERMS = [
  { k: "You keep", v: "80 to 90%", d: "Commission starts at 20% and drops to 10% as you book more." },
  { k: "You get paid", v: "Automatically", d: "Stripe pays out to your bank after every completed session." },
  { k: "You control", v: "Everything", d: "Your prices, your services, your calendar, your city, your clients." },
];

const STEPS = [
  { n: "1", title: "Show us your work", body: "Apply with your portfolio, your philosophy and a few of your best looks. Taste is the entry requirement." },
  { n: "2", title: "Meet us", body: "A short conversation. We vet every resident in person because the house's name is on your work." },
  { n: "3", title: "Open your room", body: "Your profile goes live with your looks, your services and your calendar. Bookings and payments run through StyleUp." },
];

export default function ForStylistsPage() {
  return (
    <div>
      {/* entrance */}
      <section className="section" style={{ padding: "4rem 1.75rem 3rem" }}>
        <div className="fs-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "4rem", alignItems: "center" }}>
          <div>
            <span className="eyebrow">For stylists</span>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.7rem, 6.5vw, 4.6rem)", lineHeight: 1.02, letterSpacing: "-0.012em", marginTop: "1rem" }}>
              Take a room<br />in the <em style={{ fontStyle: "italic", color: "var(--accent)" }}>house</em>.
            </h1>
            <p className="lede" style={{ marginTop: "1.4rem" }}>
              You bring the taste and the standards. We bring clients who are ready to book,
              payments that arrive on time, and a profile that sells your work while you sleep.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", marginTop: "1.9rem" }}>
              <Link href="/stylist-portal" className="btn btn-primary">Apply to join <span className="arrow">→</span></Link>
            </div>
          </div>
          <div className="photo arch fs-visual" style={{ aspectRatio: "4 / 5" }}>
            <Image
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1000&q=80"
              alt="A stylist at work"
              fill
              sizes="(max-width: 900px) 100vw, 460px"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* terms, in the green room */}
      <section className="room">
        <div className="section" style={{ padding: "4rem 1.75rem" }}>
          <span className="eyebrow">The terms</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
            Simple, in your favour
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem", marginTop: "2.25rem" }}>
            {TERMS.map((t) => (
              <div key={t.k}>
                <div style={{ fontSize: "0.85rem", color: "var(--accent-2)", fontWeight: 600 }}>{t.k}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "2.1rem", marginTop: "0.3rem" }}>{t.v}</div>
                <p style={{ fontSize: "0.92rem", marginTop: "0.45rem", lineHeight: 1.55 }}>{t.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how joining works */}
      <section className="section" style={{ padding: "4.5rem 1.75rem 2rem" }}>
        <span className="eyebrow">Joining</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(1.9rem, 4.5vw, 2.9rem)", letterSpacing: "-0.01em", marginTop: "0.7rem" }}>
          Three steps to residency
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem", marginTop: "2.25rem" }}>
          {STEPS.map((s) => (
            <div key={s.n} className="card" style={{ padding: "1.8rem" }}>
              <div style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "1.6rem", color: "var(--accent)" }}>{s.n}.</div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "1.4rem", marginTop: "0.6rem" }}>{s.title}</h3>
              <p style={{ color: "var(--dim)", marginTop: "0.55rem", fontSize: "0.95rem", lineHeight: 1.6 }}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* the ask */}
      <section className="section" style={{ padding: "3rem 1.75rem 2rem", textAlign: "center" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.01em" }}>
          Your taste deserves a <em style={{ fontStyle: "italic", color: "var(--accent)" }}>room</em>.
        </h2>
        <p style={{ maxWidth: 460, margin: "1rem auto 0", color: "var(--dim)" }}>
          Applications are reviewed personally, usually within five business days.
        </p>
        <Link href="/stylist-portal" className="btn btn-primary" style={{ marginTop: "1.75rem" }}>
          Apply to join <span className="arrow">→</span>
        </Link>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .fs-grid { grid-template-columns: 1fr !important; }
          .fs-visual { max-width: 420px; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
