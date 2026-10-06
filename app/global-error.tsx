"use client";

/**
 * Last-resort boundary: catches failures in the root layout itself, which
 * app/error.tsx cannot reach. It therefore renders its own <html>/<body> and
 * cannot rely on globals.css having loaded, so the styling is inline.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf9f7",
          color: "#1d1d1f",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 440, textAlign: "center" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#6c4cf0" }}>
            StyleUp
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: 700, letterSpacing: "-0.03em", marginTop: "0.9rem" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#5d5d66", marginTop: "0.6rem", lineHeight: 1.6 }}>
            That one is on us, not you. Try again, and if it keeps happening your
            booking and payment details are safe either way.
          </p>
          <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.6rem", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                background: "#1d1d1f",
                color: "#fff",
                border: "none",
                borderRadius: 980,
                padding: "0.8rem 1.5rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                background: "transparent",
                color: "#1d1d1f",
                border: "1px solid #dcdce2",
                borderRadius: 980,
                padding: "0.8rem 1.5rem",
                fontSize: "0.95rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
