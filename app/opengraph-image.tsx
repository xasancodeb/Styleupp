import { ImageResponse } from "next/og";
import { SITE_NAME, BRAND_COLOR, BRAND_INK } from "@/lib/site";

// The card people see when a StyleUp link is pasted into a message, a group
// chat or a social post. Rendered once at build time.
export const alt = `${SITE_NAME} · a personal stylist, near you`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#faf9f7",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 13,
              background: BRAND_INK,
              color: BRAND_COLOR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: BRAND_INK, letterSpacing: "-0.03em" }}>
            {SITE_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: BRAND_INK,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            A personal <span style={{ color: BRAND_COLOR, marginLeft: 20 }}>stylist</span>,
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              color: BRAND_INK,
              letterSpacing: "-0.045em",
              lineHeight: 1.04,
            }}
          >
            near you.
          </div>
          {/* Deliberately shorter than the page's meta description: a share
              card is read in a glance, at thumbnail size. */}
          <div style={{ fontSize: 31, color: "#5d5d66", marginTop: 26, maxWidth: 820, lineHeight: 1.4 }}>
            Get matched with a vetted stylist in your city, or meet over video.
          </div>
        </div>

        <div style={{ display: "flex", gap: 40, fontSize: 25, color: "#5d5d66" }}>
          <div style={{ display: "flex" }}>Colour analysis</div>
          <div style={{ display: "flex" }}>Capsule wardrobes</div>
          <div style={{ display: "flex" }}>Personal shopping</div>
        </div>
      </div>
    ),
    size
  );
}
