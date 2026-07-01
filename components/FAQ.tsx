// Objection-handling FAQ. Native <details> so it needs no JavaScript.
const QA = [
  {
    q: "Is the colour quiz really free?",
    a: "Completely. Two minutes, no sign-up, no card. You get your colour season and a palette you can shop from straight away. Book a stylist only if you want to go further.",
  },
  {
    q: "What actually happens in a session?",
    a: "You meet your stylist over video or in person. Depending on the service, they analyse your colours, audit your wardrobe, build a capsule plan or take you shopping. You always leave with something concrete: a palette, a plan or a bag of things that suit you.",
  },
  {
    q: "What if I don't like my first session?",
    a: "Then it's free. If your first session isn't worth every penny, tell us within 48 hours and we refund it in full. No forms, no argument.",
  },
  {
    q: "Can I choose a woman or a man as my stylist?",
    a: "Yes. There's a filter for it, and your preference is remembered. Most of our clients are women and most of our stylists are too, but everyone is welcome on both sides.",
  },
  {
    q: "Are there stylists near me?",
    a: "We show your country first, so you see the people who can actually meet you in person or shop the stores with you. Prefer the whole world? Switch to international and meet anyone over video.",
  },
  {
    q: "How do payments and cancellations work?",
    a: "Payments are handled securely by Stripe; we never see your card. Cancel or reschedule up to 48 hours before your session for free, and 24–48 hours before for a half refund.",
  },
];

export default function FAQ() {
  return (
    <div style={{ display: "grid", gap: "0.6rem" }}>
      {QA.map((item) => (
        <details
          key={item.q}
          className="card"
          style={{ padding: "0.25rem 1.4rem", borderRadius: 16 }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1.02rem",
              letterSpacing: "-0.015em",
              padding: "1rem 0",
              listStyle: "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {item.q}
            <span aria-hidden style={{ color: "var(--faint)", fontSize: "1.2rem", fontWeight: 400 }}>+</span>
          </summary>
          <p style={{ color: "var(--dim)", lineHeight: 1.6, margin: "0 0 1.15rem", maxWidth: "68ch" }}>{item.a}</p>
        </details>
      ))}
    </div>
  );
}
