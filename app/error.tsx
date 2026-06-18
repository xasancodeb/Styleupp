"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="section" style={{ padding: "6rem 1.5rem", textAlign: "center", maxWidth: 540 }}>
      <div className="font-serif" style={{ fontSize: "3rem", fontWeight: 700, color: "var(--accent)" }}>
        Something slipped
      </div>
      <h1 className="font-serif" style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: "0.5rem" }}>
        We hit an unexpected snag
      </h1>
      <p style={{ color: "var(--dim)", marginTop: "0.6rem" }}>
        Sorry about that. You can try again, or head back home and pick up where you left off.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  );
}
