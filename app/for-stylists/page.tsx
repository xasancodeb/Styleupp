import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a StyleUp stylist — grow your styling business",
  description:
    "Join StyleUp's global community of personal stylists. Reach new clients, set your own rates, get paid securely, and pay commission as low as 10%.",
};

const TIERS = [
  { name: "Starter", commission: "20%", req: "0–4 sessions / month", perks: ["Profile listing", "Secure payments", "Booking management"] },
  { name: "Silver", commission: "15%", req: "5–14 sessions / month", perks: ["Everything in Starter", "Priority in search", "Client reviews boost"] },
  { name: "Gold", commission: "12%", req: "15–29 sessions / month", perks: ["Everything in Silver", "Featured placement", "Marketing support"] },
  { name: "Elite", commission: "10%", req: "30+ sessions / month", perks: ["Everything in Gold", "Dedicated success manager", "Lowest commission"] },
];

const BENEFITS = [
  { title: "Keep more of what you earn", body: "Commission drops as you grow — from 20% down to just 10% for our top stylists. The more you work, the more you keep." },
  { title: "Clients who are ready to book", body: "Our quiz and matching surface clients who already know what they want. Spend less time chasing and more time styling." },
  { title: "We handle the admin", body: "Payments, scheduling, reminders and refunds are all taken care of. You focus on the work you love." },
  { title: "Work on your terms", body: "Set your own prices, services and availability. Offer virtual, in-person or hybrid sessions — anywhere in the world." },
];

export default function ForStylistsPage() {
  return (
    <div>
      <section style={{ background: "radial-gradient(900px 400px at 80% -10%, rgba(224,67,31,0.28), transparent), var(--ink)", color: "var(--paper)" }}>
        <div className="section" style={{ padding: "5rem 1.5rem 4rem", maxWidth: 820 }}>
          <span className="eyebrow" style={{ color: "rgba(244,240,231,0.7)" }}>For stylists</span>
          <h1 className="display" style={{ fontSize: "clamp(2.6rem, 6vw, 4.6rem)", marginTop: "1rem" }}>
            Build a styling business you <em>love.</em>
          </h1>
          <p style={{ fontSize: "1.15rem", opacity: 0.85, marginTop: "1rem" }}>
            Join a global community of personal stylists. Reach new clients, set your own rates, and
            get paid securely — with commission as low as 10%.
          </p>
          <div style={{ display: "flex", gap: "0.9rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
            <Link href="/stylist-portal" className="btn btn-primary">
              Apply to join
            </Link>
            <Link href="#tiers" className="btn btn-outline" style={{ borderColor: "rgba(250,248,245,0.3)", color: "var(--bg)" }}>
              See commission tiers
            </Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ padding: "4rem 1.5rem" }}>
        <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center" }}>
          Why stylists choose StyleUp
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            marginTop: "2.5rem",
          }}
        >
          {BENEFITS.map((b) => (
            <div key={b.title} className="card" style={{ padding: "1.75rem" }}>
              <h3 className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                {b.title}
              </h3>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem" }}>{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tiers" className="section" style={{ padding: "2rem 1.5rem 4rem" }}>
        <h2 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center" }}>
          Commission tiers
        </h2>
        <p style={{ textAlign: "center", color: "var(--dim)", marginTop: "0.5rem" }}>
          Your commission rate is based on your monthly completed sessions. Grow with us and pay less.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            marginTop: "2.5rem",
          }}
        >
          {TIERS.map((t, i) => (
            <div
              key={t.name}
              className="card"
              style={{
                padding: "1.75rem",
                border: i === 3 ? "2px solid var(--accent)" : "1px solid var(--border)",
              }}
            >
              <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                {t.name}
              </h3>
              <div className="font-serif" style={{ fontSize: "2.4rem", fontWeight: 700, color: "var(--accent)", marginTop: "0.25rem" }}>
                {t.commission}
              </div>
              <p style={{ color: "var(--faint)", fontSize: "0.85rem" }}>commission · {t.req}</p>
              <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "grid", gap: "0.5rem" }}>
                {t.perks.map((p) => (
                  <li key={p} style={{ color: "var(--dim)", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--accent)" }}>✓</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link href="/stylist-portal" className="btn btn-primary" style={{ padding: "0.9rem 2rem" }}>
            Start your application
          </Link>
        </div>
      </section>
    </div>
  );
}
