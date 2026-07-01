import ColorQuiz from "@/components/ColorQuiz";

export const metadata = {
  title: "Find your colours · StyleUp",
  description: "Take the two-minute colour-season quiz and discover the palette that makes you glow.",
};

export default function QuizPage() {
  return (
    <div className="section" style={{ padding: "3.5rem 1.5rem 4rem", maxWidth: 680 }}>
      <span className="eyebrow">Free · about 2 minutes</span>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "clamp(2.2rem, 6vw, 3.4rem)", letterSpacing: "-0.04em", lineHeight: 1.02, marginTop: "1rem" }}>
        Find your colours
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        Answer a few quick questions about your skin, hair and what suits you. We&apos;ll reveal
        your colour season and a palette you can shop from for the rest of your life.
      </p>
      <div style={{ marginTop: "1.75rem" }}>
        <ColorQuiz />
      </div>
    </div>
  );
}
