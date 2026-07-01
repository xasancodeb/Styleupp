"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SEASON_QUIZ,
  determineSeason,
  saveSeason,
  saveProfile,
  loadProfile,
  PALETTES,
  type ColorSeason,
} from "@/lib/profile";

// The colour room. One question at a time, swatches where words fall short,
// and a result worth keeping for life.
export default function ColorQuiz() {
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
      const goalQ = SEASON_QUIZ.find((q) => q.goal);
      const goalChoice = goalQ ? goalQ.options[next[goalQ.id]]?.label : undefined;
      if (goalChoice) {
        const current = loadProfile();
        saveProfile({ preferences: { ...current.preferences, goals: [goalChoice] } });
      }
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
      <div className="card fade-up" style={{ padding: "2.25rem", textAlign: "center" }}>
        <span className="eyebrow" style={{ justifyContent: "center" }}>Your season</span>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.1rem, 5vw, 3rem)", letterSpacing: "-0.01em", marginTop: "0.8rem", lineHeight: 1.05 }}>
          You are a <em style={{ fontStyle: "italic", color: "var(--accent)" }}>{palette.name}</em>
        </h2>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "1.02rem" }}>{palette.tagline}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.6rem", flexWrap: "wrap" }}>
          {palette.bestColors.map((c) => (
            <span
              key={c.hex}
              title={c.name}
              style={{ width: 44, height: 58, borderRadius: "999px 999px 8px 8px", background: c.hex, border: "2px solid var(--card)", boxShadow: "0 4px 12px -4px rgba(30,49,40,0.35)" }}
            />
          ))}
        </div>

        <p style={{ color: "var(--dim)", marginTop: "1.5rem", textAlign: "left", lineHeight: 1.7 }}>{palette.description}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "1rem", marginTop: "1.25rem", textAlign: "left" }}>
          <div style={{ background: "var(--bg-2)", borderRadius: 12, padding: "0.9rem 1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--faint)" }}>Your metals</div>
            <div style={{ fontWeight: 600, marginTop: "0.25rem", fontSize: "0.95rem" }}>{palette.metals.join(" · ")}</div>
          </div>
          <div style={{ background: "var(--bg-2)", borderRadius: 12, padding: "0.9rem 1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--faint)" }}>Your neutrals</div>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
              {palette.neutrals.map((n) => (
                <span key={n.hex} title={n.name} style={{ width: 22, height: 22, borderRadius: "50%", background: n.hex, border: "1px solid var(--border)" }} />
              ))}
            </div>
          </div>
          <div style={{ background: "var(--bg-2)", borderRadius: 12, padding: "0.9rem 1rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--faint)" }}>Leave on the rail</div>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.4rem" }}>
              {palette.avoidColors.map((n) => (
                <span key={n.hex} title={n.name} style={{ width: 22, height: 22, borderRadius: "50%", background: n.hex, border: "1px solid var(--border)", opacity: 0.55 }} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", marginTop: "1.9rem", flexWrap: "wrap" }}>
          <Link href="/explore" className="btn btn-primary">Find a colour stylist <span className="arrow">→</span></Link>
          <Link href="/fitting" className="btn btn-outline">Open your fitting room</Link>
          <button onClick={restart} className="btn btn-outline">Retake</button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--dim)", fontSize: "0.85rem", fontWeight: 600 }}>
          Question {step + 1} of {SEASON_QUIZ.length}
        </span>
        <span style={{ color: "var(--faint)", fontSize: "0.85rem" }}>about 2 minutes</span>
      </div>
      <div style={{ height: 5, borderRadius: 9999, background: "var(--bg-2)", marginTop: "0.75rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--forest)", borderRadius: 9999, transition: "width 0.35s var(--ease)" }} />
      </div>

      <div className="fade-up" key={question.id} style={{ marginTop: "1.5rem" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.65rem", fontWeight: 400, lineHeight: 1.2, letterSpacing: "-0.01em" }}>
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
                borderRadius: 12,
                padding: "0.95rem 1.15rem",
                cursor: "pointer",
                fontSize: "0.98rem",
                fontFamily: "var(--font-grotesk)",
                transition: "all 0.16s var(--ease)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.9rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--forest)";
                e.currentTarget.style.background = "var(--bg-2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "var(--card)";
              }}
            >
              <span>{opt.label}</span>
              {opt.swatches && (
                <span style={{ display: "flex", flexShrink: 0 }} aria-hidden>
                  {opt.swatches.map((hex) => (
                    <span
                      key={hex}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: hex,
                        border: "2px solid var(--card)",
                        marginLeft: -7,
                        boxShadow: "0 1px 4px rgba(30,49,40,0.25)",
                      }}
                    />
                  ))}
                </span>
              )}
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
