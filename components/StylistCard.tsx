import Link from "next/link";
import type { Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

export default function StylistCard({ stylist }: { stylist: Stylist }) {
  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block" }}>
      <div
        style={{
          height: 210,
          backgroundImage: `linear-gradient(180deg, rgba(23,20,15,0) 35%, rgba(23,20,15,0.62)), url(${stylist.cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          borderBottom: "1.5px solid var(--ink)",
        }}
      >
        {stylist.featured && (
          <span className="chip" style={{ position: "absolute", top: 12, left: 12, background: "var(--accent)", color: "#fff" }}>
            ★ Featured
          </span>
        )}
        <SaveHeart slug={stylist.id} />
        <div style={{ position: "absolute", left: 16, bottom: 12, right: 16, color: "#fff" }}>
          <h3 className="font-serif" style={{ fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.05 }}>{stylist.name}</h3>
          <p style={{ fontSize: "0.66rem", marginTop: "0.3rem", textTransform: "uppercase", letterSpacing: "0.16em", opacity: 0.9 }}>
            {stylist.city} · {stylist.country}
          </p>
        </div>
      </div>
      <div style={{ padding: "1.1rem 1.25rem 1.3rem" }}>
        <p style={{ fontSize: "0.95rem", color: "var(--dark)", fontFamily: "var(--font-serif-stack)", fontStyle: "italic" }}>
          “{stylist.tagline}”
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.85rem" }}>
          {stylist.specialties.slice(0, 2).map((s) => (
            <span key={s} className="chip chip-muted">{s}</span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1.1rem",
            paddingTop: "0.9rem",
            borderTop: "1.5px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--dim)", fontWeight: 600 }}>
            ★ {stylist.rating} <span style={{ color: "var(--faint)" }}>/ {stylist.reviewCount}</span>
          </span>
          <span style={{ fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
            From {formatGBP(stylist.startingPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
