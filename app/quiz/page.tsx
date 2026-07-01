import ColorQuiz from "@/components/ColorQuiz";

export const metadata = {
  title: "The colour quiz | StyleUp",
  description: "Two minutes, nine questions, and the palette that makes you glow for the rest of your life.",
};

export default function QuizPage() {
  return (
    <div className="section" style={{ padding: "3.5rem 1.5rem 4rem", maxWidth: 680 }}>
      <span className="eyebrow">The colour room · free</span>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 400, fontSize: "clamp(2.4rem, 6vw, 3.6rem)", letterSpacing: "-0.012em", lineHeight: 1.02, marginTop: "0.8rem" }}>
        Find your colours
      </h1>
      <p className="lede" style={{ marginTop: "1rem" }}>
        Nine quick questions about your skin, hair and what earns you compliments.
        You leave with your colour season and a palette you can shop from for life.
      </p>
      <div style={{ marginTop: "1.75rem" }}>
        <ColorQuiz />
      </div>
    </div>
  );
}
