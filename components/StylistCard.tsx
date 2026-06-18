import Link from "next/link";
import type { Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

export default function StylistCard({ stylist }: { stylist: Stylist }) {
  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block" }}>
      <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden" }}>
        <img
          src={stylist.avatar}
          alt={stylist.name}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(31,27,22,0) 45%, rgba(31,27,22,0.6))",
          }}
        />
        {stylist.featured && (
          <span className="chip" style={{ position: "absolute", top: 12, left: 12, background: "#fff" }}>
            ★ Featured
          </span>
        )}
        <SaveHeart slug={stylist.id} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, color: "#fff" }}>
          <h3 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.1 }}>{stylist.name}</h3>
          <p style={{ fontSize: "0.85rem", opacity: 0.92, marginTop: "0.15rem" }}>
            {stylist.city}, {stylist.country}
          </p>
        </div>
      </div>
      <div style={{ padding: "1.1rem 1.25rem 1.3rem" }}>
        <p style={{ fontSize: "0.93rem", color: "var(--dim)", lineHeight: 1.5 }}>{stylist.tagline}</p>
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
            marginTop: "1rem",
            paddingTop: "0.9rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "var(--dim)" }}>
            <strong style={{ color: "var(--dark)" }}>★ {stylist.rating}</strong>{" "}
            <span style={{ color: "var(--faint)" }}>({stylist.reviewCount})</span>
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>from {formatGBP(stylist.startingPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
