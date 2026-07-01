// Objection-handling FAQ. Native <details> so it needs no JavaScript.
const QA = [
  {
    q: "Is the colour quiz really free?",
    a: "Completely. Two minutes, no sign-up, no card. You get your colour season and a palette you can shop from straight away. Book a stylist only if you want to go further.",
  },
  {
    q: "How do I choose a stylist?",
    a: "By their work. Every stylist on StyleUp has a portfolio of looks, a styling philosophy and reviews. Scroll until something feels like where you want to go, then book that person. If you'd rather be matched, answer four quick questions on the home page and we'll suggest your best fits.",
  },
  {
    q: "What actually happens in a session?",
    a: "You meet your stylist over video or in person. Depending on the service they analyse your colours, audit your wardrobe, plan a capsule or take you shopping. You always leave with something concrete: a palette, a plan, or a bag of things that genuinely suit you.",
  },
  {
    q: "What if I don't love my first session?",
    a: "Then it's free. Tell us within 48 hours and we refund it in full. No forms, no argument. We can only afford this policy because it almost never happens.",
  },
  {
    q: "Who is StyleUp for?",
    a: "Anyone who wants to look like themselves, on a good day, every day. Weddings and big occasions, wardrobes that stopped working, new jobs, new cities, new chapters. You can also choose the stylist you feel most comfortable with, including by gender.",
  },
  {
    q: "Are there stylists near me?",
    a: "We show your country first, so you see people who can meet you in person or shop the stores with you. If we're not in your city yet, every stylist also works over video, and you can join the launch list for credit when we arrive.",
  },
  {
    q: "How do payments and cancellations work?",
    a: "Payments are handled securely by Stripe and we never see your card. Cancel or reschedule up to 48 hours before your session for free, or between 24 and 48 hours before for a half refund.",
  },
];

export default function FAQ() {
  return (
    <div style={{ display: "grid", gap: "0.6rem" }}>
      {QA.map((item) => (
        <details
          key={item.q}
          className="card"
          style={{ padding: "0.25rem 1.4rem", borderRadius: 12 }}
        >
          <summary
            style={{
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "1.02rem",
              letterSpacing: "-0.01em",
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
