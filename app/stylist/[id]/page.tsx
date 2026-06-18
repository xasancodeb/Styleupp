import Link from "next/link";
import { notFound } from "next/navigation";
import { getStylist, STYLISTS } from "@/lib/data";
import { formatGBP, priceBreakdown } from "@/lib/stripe";
import SaveStylistButton from "@/components/SaveStylistButton";

export function generateStaticParams() {
  return STYLISTS.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = getStylist(id);
  if (!stylist) return { title: "Stylist not found — StyleUp" };
  return {
    title: `${stylist.name} — StyleUp`,
    description: stylist.tagline,
  };
}

export default async function StylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stylist = getStylist(id);
  if (!stylist) notFound();

  return (
    <div>
      {/* Cover */}
      <div
        style={{
          height: 260,
          backgroundImage: `linear-gradient(180deg, rgba(26,22,18,0.1), rgba(26,22,18,0.55)), url(${stylist.cover})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="section" style={{ padding: "0 1.5rem 3rem", marginTop: "-70px", position: "relative" }}>
        <div className="card" style={{ padding: "1.75rem", display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <img
            src={stylist.avatar}
            alt={stylist.name}
            width={104}
            height={104}
            style={{ borderRadius: "50%", border: "4px solid #fff", objectFit: "cover", boxShadow: "0 6px 18px rgba(0,0,0,0.15)" }}
          />
          <div style={{ flex: "1 1 280px" }}>
            <h1 className="font-serif" style={{ fontSize: "2.2rem", fontWeight: 700 }}>
              {stylist.name}
            </h1>
            <p style={{ color: "var(--dim)" }}>
              {stylist.city}, {stylist.country} · {stylist.yearsExperience} years experience
            </p>
            <p style={{ marginTop: "0.5rem", fontStyle: "italic" }}>{stylist.tagline}</p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.85rem" }}>
              {stylist.specialties.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              ★ {stylist.rating}
            </div>
            <div style={{ color: "var(--faint)", fontSize: "0.85rem" }}>{stylist.reviewCount} reviews</div>
            <Link
              href={`/book?stylist=${stylist.id}`}
              className="btn btn-primary"
              style={{ marginTop: "0.85rem", width: "100%" }}
            >
              Book a session
            </Link>
          </div>
        </div>

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
                <Stat label="Formats" value={stylist.sessionTypes.map(cap).join(", ")} />
              </div>
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
      </div>

      <style>{`
        @media (max-width: 860px) {
          .profile-grid { grid-template-columns: 1fr !important; }
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
