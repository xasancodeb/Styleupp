import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — StyleUp",
  description: "The terms governing your use of StyleUp.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. About these terms",
    body: [
      "These Terms of Service govern your access to and use of StyleUp (the “Platform”), operated by StyleUp Ltd. By creating an account, booking a session, or otherwise using the Platform, you agree to these terms.",
      "If you are using StyleUp on behalf of an organisation, you confirm you have authority to bind that organisation to these terms.",
    ],
  },
  {
    heading: "2. Our role",
    body: [
      "StyleUp is a marketplace that connects clients with independent personal stylists. Stylists are not employees of StyleUp. We facilitate bookings, payments and communication, but the styling services themselves are provided by the stylist you book.",
    ],
  },
  {
    heading: "3. Bookings and payments",
    body: [
      "When you book a session, you agree to pay the listed service price plus a 5% platform fee. Payments are processed securely through Stripe. We do not store your full card details.",
      "Prices are shown in pounds sterling (GBP) unless stated otherwise. The total payable is confirmed before you complete checkout.",
    ],
  },
  {
    heading: "4. Cancellations and refunds",
    body: [
      "You may cancel a booking subject to the following policy: cancellations made more than 48 hours before the session receive a full refund; cancellations made 24–48 hours before the session receive a 50% refund; cancellations made less than 24 hours before the session are non-refundable.",
      "Refunds are returned to your original payment method, typically within 5–10 business days.",
    ],
  },
  {
    heading: "5. Stylist commission",
    body: [
      "Stylists pay StyleUp a commission on completed sessions, ranging from 20% to 10% depending on their monthly booking volume. Commission terms for stylists are set out in the separate Stylist Agreement.",
    ],
  },
  {
    heading: "6. Acceptable use",
    body: [
      "You agree not to misuse the Platform, including by attempting to circumvent payments, harassing stylists or clients, or posting unlawful or offensive content. We may suspend or terminate accounts that breach these terms.",
    ],
  },
  {
    heading: "7. Liability",
    body: [
      "StyleUp provides the Platform “as is”. To the extent permitted by law, we are not liable for the styling advice provided by independent stylists, nor for indirect or consequential losses. Nothing in these terms excludes liability that cannot be excluded by law.",
    ],
  },
  {
    heading: "8. Changes to these terms",
    body: [
      "We may update these terms from time to time. We will notify you of material changes, and continued use of the Platform after changes take effect constitutes acceptance.",
    ],
  },
  {
    heading: "9. Contact",
    body: ["Questions about these terms? Email us at legal@styleup.example."],
  },
];

export default function TermsPage() {
  return (
    <div className="section" style={{ padding: "3.5rem 1.5rem 4rem", maxWidth: 760 }}>
      <h1 className="font-serif" style={{ fontSize: "2.6rem", fontWeight: 700 }}>
        Terms of Service
      </h1>
      <p style={{ color: "var(--faint)", marginTop: "0.4rem" }}>Last updated 17 June 2026</p>
      <div style={{ display: "grid", gap: "2rem", marginTop: "2.5rem" }}>
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2 className="font-serif" style={{ fontSize: "1.4rem", fontWeight: 700 }}>
              {s.heading}
            </h2>
            {s.body.map((p, i) => (
              <p key={i} style={{ color: "var(--dim)", marginTop: "0.6rem", lineHeight: 1.7 }}>
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
