import Link from "next/link";
import Image from "next/image";
import { type Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

export default function StylistCard({ stylist, proximityLabel }: { stylist: Stylist; proximityLabel?: string }) {
  const badge = proximityLabel || (stylist.featured ? "Featured" : stylist.country);

  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block", padding: "0.55rem" }}>
      <div className="photo" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={stylist.avatar}
          alt={stylist.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 300px"
          style={{ objectFit: "cover" }}
        />
        <SaveHeart slug={stylist.id} />
        {badge && (
          <span
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              padding: "0.32rem 0.7rem",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#14111f",
              background: stylist.featured && !proximityLabel ? "linear-gradient(180deg, var(--accent), var(--accent-2))" : "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              boxShadow: "0 4px 14px -6px rgba(0,0,0,0.4)",
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div style={{ padding: "1rem 0.7rem 0.6rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "0.6rem" }}>
          <h3 style={{ fontFamily: "var(--font-grotesk)", fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            {stylist.name}
          </h3>
          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", whiteSpace: "nowrap" }}>
            <span style={{ color: "var(--accent)" }}>★</span> {stylist.rating}
          </span>
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--dim)", marginTop: "0.3rem" }}>
          {stylist.city} · {stylist.specialties[0]}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--dim)", lineHeight: 1.45, marginTop: "0.6rem", minHeight: "2.6em" }}>{stylist.tagline}</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.85rem",
            paddingTop: "0.8rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.85rem",
            color: "var(--dim)",
          }}
        >
          <span>{stylist.reviewCount} reviews</span>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>from {formatGBP(stylist.startingPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
