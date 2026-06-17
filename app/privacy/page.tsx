import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — StyleUp",
  description: "How StyleUp collects, uses and protects your personal data.",
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "1. Introduction",
    body: [
      "This Privacy Policy explains how StyleUp Ltd (“we”, “us”) collects, uses and protects your personal data when you use our platform. We are committed to handling your data responsibly and in line with applicable data protection laws, including the UK GDPR.",
    ],
  },
  {
    heading: "2. Data we collect",
    body: [
      "Account data: your name, email address and password (stored securely and hashed).",
      "Booking data: the sessions you book, your stylist, scheduling and payment records.",
      "Style profile: your colour season, quiz answers and preferences, which help us recommend stylists.",
      "Payment data: processed by Stripe. We receive confirmation of payment but never store your full card number.",
    ],
  },
  {
    heading: "3. How we use your data",
    body: [
      "We use your data to provide and improve the Platform: to facilitate bookings, process payments, match you with stylists, personalise recommendations, and communicate with you about your account and sessions.",
      "We do not sell your personal data.",
    ],
  },
  {
    heading: "4. Legal bases",
    body: [
      "We process your data on the basis of performing our contract with you (to deliver bookings), our legitimate interests (to improve and secure the Platform), and your consent where required (for example, marketing emails).",
    ],
  },
  {
    heading: "5. Sharing your data",
    body: [
      "We share necessary booking details with the stylist you book so they can deliver your session. We use trusted processors — including Supabase (data hosting) and Stripe (payments) — who are bound to protect your data.",
    ],
  },
  {
    heading: "6. Data retention",
    body: [
      "We keep your data for as long as your account is active and as needed to comply with legal obligations. You can request deletion of your account at any time.",
    ],
  },
  {
    heading: "7. Your rights",
    body: [
      "You have the right to access, correct, delete or export your personal data, and to object to or restrict certain processing. To exercise these rights, contact us at privacy@styleup.example.",
    ],
  },
  {
    heading: "8. Cookies",
    body: [
      "We use essential cookies to keep you signed in and to remember your preferences. We do not use third-party advertising cookies.",
    ],
  },
  {
    heading: "9. Contact",
    body: ["For any privacy questions or requests, email privacy@styleup.example."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="section" style={{ padding: "3.5rem 1.5rem 4rem", maxWidth: 760 }}>
      <h1 className="font-serif" style={{ fontSize: "2.6rem", fontWeight: 700 }}>
        Privacy Policy
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
