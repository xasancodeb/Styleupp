/**
 * Objection-handling FAQ content, kept out of the component so the homepage
 * can also emit it as FAQPage structured data. One edit updates both the
 * visible accordion and what search engines read.
 */
export interface QAItem {
  q: string;
  a: string;
}

export const FAQ_ITEMS: QAItem[] = [
  {
    q: "Is the colour quiz really free?",
    a: "Completely. Two minutes, no sign-up, no card. You get your colour season and a palette you can shop from straight away. Book a stylist only if you want to go further.",
  },
  {
    q: "What actually happens in a session?",
    a: "You meet your stylist over video or in person. Depending on the service, they analyse your colours, audit your wardrobe, build a capsule plan or take you shopping. You always leave with something concrete: a palette, a plan or a bag of things that suit you.",
  },
  {
    q: "What if I don't like my first session?",
    a: "Then it's free. If your first session isn't worth every penny, tell us within 48 hours and we refund it in full. No forms, no argument.",
  },
  {
    q: "Can I choose who I work with?",
    a: "Yes, completely. Pick the exact stylist whose taste and vibe you like, and filter by gender if that matters to your comfort. Your preference is remembered.",
  },
  {
    q: "Are there stylists near me?",
    a: "We show your country first, so you see the people who can actually meet you in person or shop the stores with you. Prefer the whole world? Switch to international and meet anyone over video.",
  },
  {
    q: "How do payments and cancellations work?",
    a: "Payments are handled securely by Stripe; we never see your card. Cancel or reschedule up to 48 hours before your session for free, and between 24 and 48 hours before for a half refund.",
  },
];

/** FAQPage JSON-LD, so the questions can surface directly in search results. */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}
