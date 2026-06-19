import Link from "next/link";
import Image from "next/image";
import type { Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

export default function StylistCard({ stylist, proximityLabel }: { stylist: Stylist; proximityLabel?: string }) {
  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block" }}>
      <div className="photo" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={stylist.avatar}
          alt={stylist.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 300px"
          style={{ objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: "linear-gradient(180deg, rgba(29,26,21,0) 48%, rgba(29,26,21,0.62))",
          }}
        />
        {proximityLabel ? (
          <span className="chip" style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: "var(--ink)", color: "var(--paper)" }}>
            📍 {proximityLabel}
          </span>
        ) : (
          stylist.featured && (
            <span className="chip" style={{ position: "absolute", top: 12, left: 12, zIndex: 3, background: "var(--paper)", color: "var(--ink)" }}>
              Featured
            </span>
          )
        )}
        <SaveHeart slug={stylist.id} />
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 14, zIndex: 3, color: "#fff" }}>
          <h3 className="font-serif" style={{ fontSize: "1.45rem", fontWeight: 500, lineHeight: 1.08 }}>{stylist.name}</h3>
          <p style={{ fontSize: "0.8rem", opacity: 0.9, marginTop: "0.2rem", letterSpacing: "0.03em" }}>
            {stylist.city}, {stylist.country}
          </p>
        </div>
      </div>
      <div style={{ padding: "1.1rem 1.25rem 1.3rem" }}>
        <p style={{ fontSize: "0.93rem", color: "var(--dim)", lineHeight: 1.5, minHeight: "2.8em" }}>{stylist.tagline}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.7rem" }}>
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
          <span style={{ fontSize: "0.88rem", color: "var(--dim)" }}>
            <strong style={{ color: "var(--dark)" }}>★ {stylist.rating}</strong>{" "}
            <span style={{ color: "var(--faint)" }}>({stylist.reviewCount})</span>
          </span>
          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>from {formatGBP(stylist.startingPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
