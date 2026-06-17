import Link from "next/link";

export default function NotFound() {
  return (
    <div className="section" style={{ padding: "6rem 1.5rem", textAlign: "center", maxWidth: 560 }}>
      <div className="font-serif" style={{ fontSize: "5rem", fontWeight: 700, color: "var(--accent)" }}>
        404
      </div>
      <h1 className="font-serif" style={{ fontSize: "2rem", fontWeight: 700, marginTop: "0.5rem" }}>
        This look isn't in the wardrobe
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>
        The page you're after doesn't exist or has moved. Let's get you back to something stylish.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/explore" className="btn btn-outline">
          Browse stylists
        </Link>
      </div>
    </div>
  );
}
