"use client";

import { useState } from "react";
import Link from "next/link";
import { SEASON_QUIZ, determineSeason, saveSeason, PALETTES, type ColorSeason } from "@/lib/profile";

/**
 * The colour-season quiz, fully playable inline. Used both on the landing page
 * (front and centre) and on the dedicated /quiz route. One question at a time
 * with a progress bar, then a result card the visitor can act on.
 */
export default function ColorQuiz({ compact = false }: { compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ColorSeason | null>(null);

  const question = SEASON_QUIZ[step];
  const progress = Math.round(((step + (result ? 1 : 0)) / SEASON_QUIZ.length) * 100);

  function choose(index: number) {
    const next = { ...answers, [question.id]: index };
    setAnswers(next);
    if (step + 1 < SEASON_QUIZ.length) {
      setStep(step + 1);
    } else {
      const season = determineSeason(next);
      saveSeason(season);
      void fetch("/api/profile/color-season", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, answers: next }),
      }).catch(() => {});
      setResult(season);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setResult(null);
  }

  if (result) {
    const palette = PALETTES[result];
    return (
      <div className="card fade-up" style={{ padding: compact ? "1.75rem" : "2.5rem", textAlign: "center" }}>
        <span className="eyebrow" style={{ margin: "0 auto" }}>Your result</span>
        <h2 style={{ fontFamily: "var(--font-grotesk)", fontWeight: 800, fontSize: compact ? "1.9rem" : "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.035em", marginTop: "1rem", lineHeight: 1.05 }}>
          You&apos;re a{" "}
          <span style={{ background: "linear-gradient(120deg, var(--accent), var(--accent-2))", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{palette.name}</span>
        </h2>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "1.02rem" }}>{palette.tagline}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          {palette.bestColors.map((c) => (
            <span
              key={c.hex}
              title={c.name}
              style={{ width: 38, height: 38, borderRadius: "50%", background: c.hex, border: "2px solid var(--bg)", boxShadow: "0 4px 12px -4px rgba(0,0,0,0.5)" }}
            />
          ))}
        </div>

        {!compact && (
          <p style={{ color: "var(--dim)", marginTop: "1.5rem", textAlign: "left", lineHeight: 1.7 }}>{palette.description}</p>
        )}

        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.75rem", flexWrap: "wrap" }}>
          <Link href="/explore" className="btn btn-primary">Find a matching stylist <span className="arrow">→</span></Link>
          <Link href="/fitting" className="btn btn-outline">Open your fitting room</Link>
          <button onClick={restart} className="btn btn-outline">Retake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: compact ? "1.6rem" : "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--dim)", fontSize: "0.85rem", fontWeight: 600 }}>
          Question {step + 1} of {SEASON_QUIZ.length}
        </span>
        <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>~2 min</span>
      </div>
      <div style={{ height: 6, borderRadius: 9999, background: "var(--border)", marginTop: "0.75rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, var(--accent), var(--accent-2))", borderRadius: 9999, transition: "width 0.35s var(--ease)" }} />
      </div>

      <div className="fade-up" key={question.id} style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-grotesk)", fontSize: compact ? "1.3rem" : "1.55rem", fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {question.question}
        </h3>
        {question.helper && (
          <p style={{ color: "var(--dim)", marginTop: "0.5rem", fontSize: "0.92rem" }}>{question.helper}</p>
        )}
        <div style={{ display: "grid", gap: "0.6rem", marginTop: "1.25rem" }}>
          {question.options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => choose(i)}
              style={{
                textAlign: "left",
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--ink)",
                borderRadius: 14,
                padding: "0.95rem 1.15rem",
                cursor: "pointer",
                fontSize: "0.98rem",
                fontFamily: "var(--font-grotesk)",
                transition: "all 0.16s var(--ease)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "color-mix(in srgb, var(--accent) 60%, var(--border))";
                e.currentTarget.style.background = "var(--accent-soft)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--card)";
                e.currentTarget.style.transform = "none";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} style={{ marginTop: "1.1rem", background: "none", border: "none", color: "var(--dim)", cursor: "pointer", fontSize: "0.9rem", fontWeight: 500 }}>
          ← Back
        </button>
      )}
    </div>
  );
}
