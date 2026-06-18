"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SEASON_QUIZ, determineSeason, saveSeason, PALETTES, type ColorSeason } from "@/lib/profile";

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ColorSeason | null>(null);

  const question = SEASON_QUIZ[step];
  const progress = Math.round((step / SEASON_QUIZ.length) * 100);

  function choose(index: number) {
    const next = { ...answers, [question.id]: index };
    setAnswers(next);
    if (step + 1 < SEASON_QUIZ.length) {
      setStep(step + 1);
    } else {
      const season = determineSeason(next);
      saveSeason(season);
      // Persist to the account when signed in (ignored if not authenticated).
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
      <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 680, textAlign: "center" }}>
        <span className="chip" style={{ margin: "0 auto" }}>Your result</span>
        <h1 className="font-serif" style={{ fontSize: "2.8rem", fontWeight: 700, marginTop: "1rem" }}>
          You're a {palette.name}
        </h1>
        <p style={{ color: "var(--dim)", marginTop: "0.6rem", fontSize: "1.1rem" }}>{palette.tagline}</p>
        <p style={{ color: "var(--dark)", marginTop: "1rem", textAlign: "left" }}>{palette.description}</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.75rem", flexWrap: "wrap" }}>
          {palette.bestColors.map((c) => (
            <span
              key={c.hex}
              title={c.name}
              style={{ width: 44, height: 44, borderRadius: "50%", background: c.hex, border: "1px solid var(--border)" }}
            />
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem", flexWrap: "wrap" }}>
          <Link href="/fitting" className="btn btn-primary">
            Open your fitting room
          </Link>
          <Link href="/explore" className="btn btn-outline">
            Find a matching stylist
          </Link>
          <button onClick={restart} className="btn btn-outline">
            Retake quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: "4rem 1.5rem", maxWidth: 640 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: "var(--faint)", fontSize: "0.9rem", fontWeight: 600 }}>
          Question {step + 1} of {SEASON_QUIZ.length}
        </span>
        <button onClick={() => router.push("/fitting")} className="btn btn-outline" style={{ padding: "0.4rem 0.9rem", fontSize: "0.82rem" }}>
          Skip
        </button>
      </div>
      <div style={{ height: 5, borderRadius: 9999, background: "var(--border)", marginTop: "0.75rem" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "var(--accent)", borderRadius: 9999, transition: "width 0.3s ease" }} />
      </div>

      <div className="card fade-up" key={question.id} style={{ padding: "2rem", marginTop: "2rem" }}>
        <h1 className="font-serif" style={{ fontSize: "1.7rem", fontWeight: 700, lineHeight: 1.25 }}>
          {question.question}
        </h1>
        {question.helper && (
          <p style={{ color: "var(--dim)", marginTop: "0.5rem", fontSize: "0.92rem" }}>{question.helper}</p>
        )}
        <div style={{ display: "grid", gap: "0.7rem", marginTop: "1.5rem" }}>
          {question.options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => choose(i)}
              style={{
                textAlign: "left",
                border: "1px solid var(--border)",
                background: "#fff",
                borderRadius: "0.75rem",
                padding: "1rem 1.25rem",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.background = "rgba(196,146,58,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.background = "#fff";
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="btn btn-outline" style={{ marginTop: "1.25rem" }}>
          ← Back
        </button>
      )}
    </div>
  );
}
