// The StyleUp promise: the three guarantees that remove the risk of booking.
const PROMISES = [
  {
    icon: "♥",
    title: "Love it or it's free",
    body: "If your first session isn't worth every penny, we refund it. No forms, no fuss.",
  },
  {
    icon: "✓",
    title: "Every stylist vetted",
    body: "Portfolio-reviewed, reference-checked and interviewed before they can take a booking.",
  },
  {
    icon: "↺",
    title: "Cancel free up to 48h",
    body: "Plans change. Reschedule or cancel up to 48 hours before and pay nothing.",
  },
];

export default function PromiseStrip() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
      {PROMISES.map((p) => (
        <div key={p.title} style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
          <span
            aria-hidden
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--accent-soft)",
              color: "var(--accent)",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            {p.icon}
          </span>
          <div>
            <div style={{ fontWeight: 600, letterSpacing: "-0.01em" }}>{p.title}</div>
            <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.25rem", lineHeight: 1.5 }}>{p.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
