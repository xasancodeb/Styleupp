"use client";

import { useState } from "react";
import Image from "next/image";

// "Same person. Right colours." — the product's whole pitch in one gesture.
// Each look starts drained of colour; hovering (or tapping) floods it back in.
// These are styled looks illustrating each service, not client photographs.
const STORIES = [
  {
    img: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&h=1000&fit=crop&auto=format&q=75",
    name: "Colour analysis",
    service: "Sessions from £95",
    line: "The right palette makes you look rested and expensive. The wrong one washes you out — most people wear the wrong one.",
  },
  {
    img: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop&auto=format&q=75",
    name: "Capsule wardrobe",
    service: "Sessions from £70",
    line: "Around thirty pieces where everything goes with everything. Getting dressed takes three minutes, and all of it suits you.",
  },
  {
    img: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&h=1000&fit=crop&auto=format&q=75",
    name: "Occasion styling",
    service: "Sessions from £80",
    line: "The wedding, the interview, the milestone birthday. Walk in feeling like the best-dressed version of yourself.",
  },
];

export default function Transformations() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.25rem" }}>
      {STORIES.map((s, i) => {
        const on = active === i;
        return (
          <figure
            key={s.name}
            style={{ margin: 0, cursor: "pointer" }}
            onClick={() => setActive(on ? null : i)}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
          >
            <div className="photo" style={{ aspectRatio: "4 / 5", position: "relative" }}>
              <Image
                src={s.img}
                alt={`A styled look illustrating ${s.name.toLowerCase()}`}
                fill
                sizes="(max-width: 700px) 100vw, 380px"
                style={{
                  objectFit: "cover",
                  filter: on ? "none" : "grayscale(1) contrast(0.92)",
                  transform: on ? "scale(1.03)" : "none",
                  transition: "filter 0.55s var(--ease), transform 0.8s var(--ease)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  padding: "0.34rem 0.75rem",
                  borderRadius: 999,
                  fontSize: "0.76rem",
                  fontWeight: 600,
                  background: "rgba(255,255,255,0.92)",
                  color: on ? "var(--accent)" : "var(--ink)",
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  transition: "color 0.3s var(--ease)",
                }}
              >
                {on ? "In colour" : "Hover to add colour"}
              </span>
            </div>
            <figcaption style={{ marginTop: "0.9rem" }}>
              <div style={{ fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: "0.84rem", color: "var(--faint)", marginTop: "0.1rem" }}>{s.service}</div>
              <p style={{ color: "var(--dim)", fontSize: "0.94rem", marginTop: "0.5rem", lineHeight: 1.5 }}>{s.line}</p>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
