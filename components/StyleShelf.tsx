import Link from "next/link";
import Image from "next/image";
import { STYLISTS, getPortfolio, extrasOf } from "@/lib/data";

// Pick a stylist by their taste, not their bio. Each panel is a piece of a
// stylist's actual portfolio with their name on it, linking to the full
// profile. Horizontal scroll with snap, like flicking through a lookbook.
export default function StyleShelf() {
  const featured = STYLISTS.filter((s) => s.featured).slice(0, 6);

  return (
    <div className="shelf">
      {featured.map((s, i) => {
        const look = getPortfolio(s)[i % 3];
        return (
          <Link key={s.id} href={`/stylist/${s.id}`} style={{ width: "min(300px, 74vw)" }}>
            <div className="photo" style={{ aspectRatio: "3 / 4", position: "relative" }}>
              <Image
                src={look}
                alt={`A look styled by ${s.name}`}
                fill
                sizes="300px"
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(24,16,10,0.62), transparent 46%)",
                }}
              />
              <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "#fff" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", fontWeight: 560, letterSpacing: "-0.01em" }}>
                  {s.name}
                </div>
                <div style={{ fontSize: "0.82rem", opacity: 0.9, marginTop: "0.15rem" }}>
                  {extrasOf(s).vibes[0]} · {s.city}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
      <Link
        href="/explore"
        style={{
          width: "min(220px, 60vw)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="card"
      >
        <span style={{ textAlign: "center", padding: "1rem" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 560 }}>
            See every stylist
          </span>
          <span style={{ display: "block", color: "var(--dim)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
            12 portfolios →
          </span>
        </span>
      </Link>
    </div>
  );
}
