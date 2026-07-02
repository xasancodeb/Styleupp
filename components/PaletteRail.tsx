import Link from "next/link";
import { PALETTES } from "@/lib/profile";

// Every colour StyleUp can dress you in, gliding past like a swatch deck.
// Built from the real season palettes, so it doubles as a promise: one of
// these rows is yours. The track is duplicated for a seamless loop.
export default function PaletteRail() {
  const swatches = (Object.keys(PALETTES) as (keyof typeof PALETTES)[]).flatMap((season) =>
    PALETTES[season].bestColors.map((c) => ({ ...c, season: PALETTES[season].name }))
  );

  const Track = ({ hidden }: { hidden?: boolean }) => (
    <>
      {swatches.map((s, i) => (
        <Link
          key={`${s.hex}-${i}-${hidden ? "b" : "a"}`}
          href="/quiz"
          aria-hidden={hidden || undefined}
          tabIndex={hidden ? -1 : undefined}
          className="swatch-card"
          style={{ display: "block", width: 128, flexShrink: 0 }}
        >
          <div style={{ height: 84, borderRadius: 18, background: s.hex, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }} />
          <div style={{ marginTop: "0.5rem", fontSize: "0.82rem", fontWeight: 600, letterSpacing: "-0.01em" }}>{s.name}</div>
          <div style={{ fontSize: "0.74rem", color: "var(--faint)", marginTop: "0.1rem" }}>{s.season}</div>
        </Link>
      ))}
    </>
  );

  return (
    <div className="rail">
      <div className="rail-track">
        <Track />
        <Track hidden />
      </div>
    </div>
  );
}
