import Link from "next/link";
import Image from "next/image";
import { extrasOf, getPortfolio, type Stylist } from "@/lib/data";
import { formatGBP } from "@/lib/stripe";
import SaveHeart from "@/components/SaveHeart";

// A door in the house: arched portrait, the stylist's name, their taste in
// one line, and three pieces of their actual work underneath.
export default function StylistCard({
  stylist,
  proximityLabel,
  matchScore,
}: {
  stylist: Stylist;
  proximityLabel?: string;
  matchScore?: number;
}) {
  const badge = proximityLabel || (stylist.featured ? "House favourite" : stylist.country);

  return (
    <Link href={`/stylist/${stylist.id}`} style={{ display: "block" }}>
      <div className="photo arch" style={{ aspectRatio: "4 / 5" }}>
        <Image
          src={stylist.avatar}
          alt={stylist.name}
          fill
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 320px"
          style={{ objectFit: "cover" }}
        />
        <SaveHeart slug={stylist.id} />
        {badge && (
          <span
            style={{
              position: "absolute",
              top: "14%",
              left: "50%",
              transform: "translateX(-50%)",
              padding: "0.3rem 0.8rem",
              borderRadius: 999,
              fontSize: "0.72rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
              color: "var(--forest)",
              background: "rgba(246, 241, 230, 0.92)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          >
            {badge}
          </span>
        )}
        {matchScore != null && (
          <span
            style={{
              position: "absolute",
              bottom: 14,
              left: "50%",
              transform: "translateX(-50%)",
              padding: "0.34rem 0.8rem",
              borderRadius: 999,
              fontSize: "0.76rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: "#f2ecd9",
              background: "var(--forest)",
            }}
          >
            {matchScore}% match
          </span>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "1rem 0.4rem 0.4rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.55rem", fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.01em" }}>
          {stylist.name}
        </h3>
        <div style={{ fontSize: "0.86rem", color: "var(--dim)", marginTop: "0.3rem" }}>
          {extrasOf(stylist).vibes[0]} · {stylist.city}
        </div>
        <div style={{ fontSize: "0.84rem", color: "var(--faint)", marginTop: "0.25rem" }}>
          <span style={{ color: "var(--accent)" }}>★</span> {stylist.rating} ({stylist.reviewCount}) · from {formatGBP(stylist.startingPrice)}
        </div>
      </div>

      {/* their work, on the card */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.4rem", marginTop: "0.5rem" }}>
        {getPortfolio(stylist).slice(1, 4).map((img) => (
          <div key={img} className="photo" style={{ aspectRatio: "1 / 1", borderRadius: 10 }}>
            <Image
              src={img}
              alt={`A look styled by ${stylist.name}`}
              fill
              sizes="110px"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </Link>
  );
}
