import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getStylist, STYLISTS, getPortfolio, offersInPerson, offersInStoreShopping } from "@/lib/data";
import { formatGBP, priceBreakdown } from "@/lib/stripe";
import SaveStylistButton from "@/components/SaveStylistButton";
import LiveReviews from "@/components/LiveReviews";
import StylistCard from "@/components/StylistCard";
import PortfolioGallery from "@/components/PortfolioGallery";

export function generateStaticParams() {
  return STYLISTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = getStylist(id);
  if (!stylist) return { title: "Stylist not found · StyleUp" };
  return {
    title: `${stylist.name} · StyleUp`,
    description: stylist.tagline,
  };
}

export default async function StylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = getStylist(id);
  if (!stylist) notFound();

  const catalogueNo = String(STYLISTS.findIndex((s) => s.id === stylist.id) + 1).padStart(3, "0");

  // Related stylists: share at least one specialty, ranked by overlap.
  const related = STYLISTS.filter((s) => s.id !== stylist.id)
    .map((s) => ({ s, overlap: s.specialties.filter((sp) => stylist.specialties.includes(sp)).length }))
    .filter((r) => r.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.s.rating - a.s.rating)
    .slice(0, 4)
    .map((r) => r.s);

  return (
    <div>
      {/* Entry header */}
      <div className="section" style={{ padding: "2.5rem 1.75rem 0" }}>
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--ink)", paddingBottom: "0.75rem", fontSize: "0.62rem", color: "var(--faint)" }}>
          <span>ENTRY N°{catalogueNo}</span>
          <span>{stylist.city.toUpperCase()} · {stylist.country.toUpperCase()}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: "0", marginTop: "1.75rem", border: "1px solid var(--ink)", borderRadius: 3, overflow: "hidden" }} className="entry-grid">
          <div style={{ padding: "2rem", display: "flex", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid var(--ink)" }} className="entry-info">
            <div>
              <span className="eyebrow">{stylist.yearsExperience} yrs · {stylist.specialties[0]}</span>
              <h1 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 900, textTransform: "uppercase", fontSize: "clamp(2.2rem, 5vw, 3.6rem)", letterSpacing: "-0.04em", lineHeight: 0.9, marginTop: "1rem" }}>
                {stylist.name}
              </h1>
              <p style={{ marginTop: "1rem", fontSize: "1.05rem", color: "var(--dim)", maxWidth: "46ch" }}>“{stylist.tagline}”</p>
            </div>
            <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
              {stylist.specialties.map((s) => (
                <span key={s} className="chip">{s}</span>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <Link href={`/book?stylist=${stylist.id}`} className="btn btn-primary">Commission a session <span className="arrow">→</span></Link>
              <span className="mono" style={{ fontSize: "0.7rem", color: "var(--dim)" }}>★ {stylist.rating} / {stylist.reviewCount} REVIEWS</span>
            </div>
          </div>
          <div className="photo entry-photo" style={{ position: "relative", minHeight: 320 }}>
            <Image src={stylist.avatar} alt={stylist.name} fill sizes="(max-width: 760px) 100vw, 460px" style={{ objectFit: "cover" }} />
          </div>
        </div>
      </div>

      <div className="section" style={{ padding: "0 1.75rem 3rem", marginTop: "1.5rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)", gap: "1.5rem", marginTop: "1.5rem" }} className="profile-grid">
          {/* Left column */}
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <section className="card" style={{ padding: "1.75rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                About {stylist.name.split(" ")[0]}
              </h2>
              <p style={{ color: "var(--dim)", marginTop: "0.75rem", lineHeight: 1.7 }}>{stylist.bio}</p>
              <div style={{ display: "flex", gap: "2rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
                <Stat label="Sessions" value={stylist.sessionsCompleted.toLocaleString()} />
                <Stat label="Languages" value={stylist.languages.join(", ")} />
                <Stat label="Based in" value={stylist.city} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem" }}>
                {stylist.sessionTypes.includes("virtual") && <span className="chip">Video, anywhere</span>}
                {offersInPerson(stylist) && <span className="chip">In person · {stylist.city}</span>}
                {offersInStoreShopping(stylist) && <span className="chip">Shops in store with you</span>}
              </div>
            </section>

            <section className="card" style={{ padding: "1.75rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
                <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                  Recent looks
                </h2>
                <span style={{ color: "var(--faint)", fontSize: "0.82rem" }}>Tap any image to enlarge</span>
              </div>
              <p style={{ color: "var(--dim)", marginTop: "0.5rem", fontSize: "0.95rem" }}>
                A taste of {stylist.name.split(" ")[0]}&apos;s work, so you can see whether the look is right for you.
              </p>
              <PortfolioGallery images={getPortfolio(stylist)} name={stylist.name} />
            </section>

            <section className="card" style={{ padding: "1.75rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                Services
              </h2>
              <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {stylist.services.map((svc) => {
                  const { total } = priceBreakdown(svc.price);
                  return (
                    <div
                      key={svc.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "0.85rem",
                        padding: "1.1rem 1.25rem",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: "1 1 240px" }}>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <strong style={{ fontSize: "1.05rem" }}>{svc.name}</strong>
                          <span className="chip chip-muted">{cap(svc.sessionType)}</span>
                        </div>
                        <p style={{ color: "var(--dim)", fontSize: "0.92rem", marginTop: "0.3rem" }}>
                          {svc.description}
                        </p>
                        <p style={{ color: "var(--faint)", fontSize: "0.82rem", marginTop: "0.3rem" }}>
                          {svc.durationMinutes} min · {formatGBP(svc.price)} + 5% platform fee
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div className="font-serif" style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                          {formatGBP(total)}
                        </div>
                        <Link
                          href={`/book?stylist=${stylist.id}&service=${svc.id}`}
                          className="btn btn-dark"
                          style={{ marginTop: "0.5rem", padding: "0.5rem 1.1rem", fontSize: "0.85rem" }}
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card" style={{ padding: "1.75rem" }}>
              <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                Reviews
              </h2>
              <LiveReviews slug={stylist.id} />
              <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {stylist.reviews.map((r) => (
                  <div key={r.id} style={{ borderBottom: "1px solid var(--border)", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>{r.author}</strong>
                      <span style={{ color: "var(--accent)" }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    </div>
                    <p style={{ color: "var(--dim)", marginTop: "0.4rem" }}>{r.comment}</p>
                    <p style={{ color: "var(--faint)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                      {new Date(r.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside style={{ display: "grid", gap: "1.5rem", alignContent: "start" }}>
            <div className="card" style={{ padding: "1.5rem", position: "sticky", top: 90 }}>
              <p style={{ color: "var(--dim)", fontSize: "0.9rem" }}>Starting from</p>
              <div className="font-serif" style={{ fontSize: "2rem", fontWeight: 700 }}>
                {formatGBP(stylist.startingPrice)}
              </div>
              <Link href={`/book?stylist=${stylist.id}`} className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                Book a session
              </Link>
              <SaveStylistButton slug={stylist.id} />
              <Link href="/explore" className="btn btn-outline" style={{ width: "100%", marginTop: "0.6rem" }}>
                Compare stylists
              </Link>
              <p style={{ color: "var(--faint)", fontSize: "0.8rem", marginTop: "1rem", lineHeight: 1.5 }}>
                Free cancellation up to 48 hours before your session. See our cancellation policy in
                the booking flow.
              </p>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section style={{ marginTop: "3.5rem" }}>
            <span className="eyebrow">More to explore</span>
            <h2 className="display" style={{ fontSize: "1.9rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
              You might also like
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.5rem" }}>
              {related.map((s) => (
                <StylistCard key={s.id} stylist={s} />
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .profile-grid { grid-template-columns: 1fr !important; }
          .entry-grid { grid-template-columns: 1fr !important; }
          .entry-info { border-right: none !important; border-bottom: 1px solid var(--ink); }
          .entry-photo { min-height: 360px !important; }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "var(--faint)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontWeight: 600, marginTop: "0.2rem" }}>{value}</div>
    </div>
  );
}

function cap(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
