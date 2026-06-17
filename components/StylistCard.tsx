import Link from "next/link";
import type { Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";

export default function StylistCard({ stylist }: { stylist: Stylist }) {
  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block" }}>
      <div
        style={{
          height: 160,
          backgroundImage: `linear-gradient(180deg, rgba(26,22,18,0) 40%, rgba(26,22,18,0.45)), url(${stylist.cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {stylist.featured && (
          <span
            className="chip"
            style={{ position: "absolute", top: 12, left: 12, background: "var(--accent)", color: "#fff" }}
          >
            ★ Featured
          </span>
        )}
      </div>
      <div style={{ padding: "1.1rem 1.25rem 1.35rem", marginTop: "-2.5rem", position: "relative" }}>
        <img
          src={stylist.avatar}
          alt={stylist.name}
          width={64}
          height={64}
          style={{
            borderRadius: "50%",
            border: "3px solid #fff",
            objectFit: "cover",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          }}
        />
        <h3 className="font-serif" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "0.6rem" }}>
          {stylist.name}
        </h3>
        <p style={{ color: "var(--dim)", fontSize: "0.9rem", marginTop: "0.15rem" }}>
          {stylist.city}, {stylist.country}
        </p>
        <p style={{ fontSize: "0.92rem", marginTop: "0.6rem", color: "var(--dark)" }}>{stylist.tagline}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.85rem" }}>
          {stylist.specialties.slice(0, 2).map((s) => (
            <span key={s} className="chip chip-muted">
              {s}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "1rem",
            paddingTop: "0.9rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--dim)" }}>
            <strong style={{ color: "var(--dark)" }}>★ {stylist.rating}</strong> ({stylist.reviewCount})
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            from {formatGBP(stylist.startingPrice)}
          </span>
        </div>
      </div>
    </Link>
  );
}
