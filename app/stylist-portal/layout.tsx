import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to join as a stylist",
  description:
    "Apply to style with StyleUp. Set your own prices and availability, reach clients ready to book, and pay commission as low as 10%.",
  alternates: { canonical: "/stylist-portal" },
  openGraph: {
    title: "Apply to join as a stylist · StyleUp",
    description:
      "Apply to style with StyleUp. Set your own prices and availability, reach clients ready to book, and pay commission as low as 10%.",
    url: "/stylist-portal",
  },
};

export default function StylistPortalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
