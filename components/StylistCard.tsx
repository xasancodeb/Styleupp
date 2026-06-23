import Link from "next/link";
import Image from "next/image";
import { STYLISTS, type Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

export default function StylistCard({ stylist, proximityLabel }: { stylist: Stylist; proximityLabel?: string }) {
  const catalogueNo = String(STYLISTS.findIndex((s) => s.id === stylist.id) + 1).padStart(3, "0");

  return (
    <Link href={`/stylist/${stylist.id}`} className="card fade-up" style={{ overflow: "hidden", display: "block" }}>
      {/* index strip */}
      <div className="mono" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.55rem 0.85rem", borderBottom: "1px solid var(--border)", fontSize: "0.62rem", color: "var(--faint)" }}>
        <span>N°{catalogueNo}</span>
        <span style={{ color: stylist.featured ? "var(--accent)" : "var(--faint)" }}>
          {proximityLabel ? `◆ ${proximityLabel}` : stylist.featured ? "◆ Featured" : `${stylist.country}`}
        </span>
      </div>

      <div className="photo" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={stylist.avatar}
          alt={stylist.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 300px"
          style={{ objectFit: "cover" }}
        />
        <SaveHeart slug={stylist.id} />
      </div>

      <div style={{ padding: "1rem 1.1rem 1.2rem" }}>
        <h3 style={{ fontFamily: "var(--font-grotesk)", fontSize: "1.35rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.03em", textTransform: "uppercase" }}>
          {stylist.name}
        </h3>
        <div className="mono" style={{ fontSize: "0.62rem", color: "var(--dim)", marginTop: "0.4rem" }}>
          {stylist.city} · {stylist.specialties[0]}
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--dim)", lineHeight: 1.45, marginTop: "0.7rem", minHeight: "2.6em" }}>{stylist.tagline}</p>
        <div
          className="mono"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.9rem",
            paddingTop: "0.8rem",
            borderTop: "1px solid var(--border)",
            fontSize: "0.66rem",
            color: "var(--dim)",
          }}
        >
          <span><span style={{ color: "var(--ink)" }}>★ {stylist.rating}</span> / {stylist.reviewCount}</span>
          <span style={{ color: "var(--ink)" }}>FR. {formatGBP(stylist.startingPrice)}</span>
        </div>
      </div>
    </Link>
  );
}
