import Link from "next/link";
import Image from "next/image";
import { STYLISTS, getPortfolio, extrasOf } from "@/lib/data";

// The corridor: walk past the stylists' work, each look framed in an arch
// like a doorway you can step through. Tap any arch to enter that stylist's
// room.
export default function Corridor() {
  const featured = STYLISTS.filter((s) => s.featured).slice(0, 6);

  return (
    <div className="corridor">
      {featured.map((s, i) => {
        const look = getPortfolio(s)[i % 3];
        return (
          <Link key={s.id} href={`/stylist/${s.id}`} style={{ width: "min(272px, 70vw)", textAlign: "center" }}>
            <div className="photo arch" style={{ aspectRatio: "3 / 4" }}>
              <Image
                src={look}
                alt={`A look styled by ${s.name}`}
                fill
                sizes="272px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <div style={{ marginTop: "0.85rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", letterSpacing: "-0.01em" }}>{s.name}</span>
              <div style={{ fontSize: "0.84rem", color: "var(--dim)", marginTop: "0.2rem" }}>
                {extrasOf(s).vibes[0]} · {s.city}
              </div>
            </div>
          </Link>
        );
      })}
      <Link
        href="/explore"
        style={{
          width: "min(200px, 55vw)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid var(--border)",
          borderRadius: "var(--arch)",
          aspectRatio: "3 / 4",
          alignSelf: "flex-start",
        }}
      >
        <span style={{ textAlign: "center", padding: "1rem" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>Every room</span>
          <span style={{ display: "block", color: "var(--dim)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            12 stylists →
          </span>
        </span>
      </Link>
    </div>
  );
}
