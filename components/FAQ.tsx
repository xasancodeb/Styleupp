// Objection-handling FAQ. Native <details> so it needs no JavaScript.
// Content lives in lib/faq.ts, shared with the page's FAQPage structured data.
import { FAQ_ITEMS } from "@/lib/faq";

export default function FAQ() {
  return (
    <div style={{ display: "grid", gap: "0.6rem" }}>
      {FAQ_ITEMS.map((item) => (
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
