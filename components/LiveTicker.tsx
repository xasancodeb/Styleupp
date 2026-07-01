"use client";

import { useEffect, useState } from "react";

// Rotating recent-activity line: quiet social proof that the marketplace is
// alive. Renders the first item on the server and only starts rotating after
// mount, so hydration always matches.
const EVENTS = [
  { who: "Nadia in Toronto", what: "booked a Colour Analysis", when: "12 min ago" },
  { who: "Sofia in Milan", what: "booked a Personal Shopping day", when: "28 min ago" },
  { who: "James in London", what: "took the colour quiz", when: "just now" },
  { who: "Amelie in Paris", what: "booked a Capsule Wardrobe session", when: "1 hr ago" },
  { who: "Yuki in Tokyo", what: "left a 5-star review", when: "2 hrs ago" },
  { who: "Fatima in Dubai", what: "booked Occasion Styling", when: "3 hrs ago" },
];

export default function LiveTicker() {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((n) => (n + 1) % EVENTS.length);
        setVisible(true);
      }, 350);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const e = EVENTS[i];
  return (
    <div
      aria-live="off"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.55rem",
        padding: "0.5rem 0.95rem",
        borderRadius: 999,
        background: "var(--bg-2)",
        fontSize: "0.84rem",
        color: "var(--dim)",
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(4px)",
        transition: "opacity 0.35s var(--ease), transform 0.35s var(--ease)",
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34c759", flexShrink: 0 }} />
      <span>
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{e.who}</span> {e.what} · {e.when}
      </span>
    </div>
  );
}
