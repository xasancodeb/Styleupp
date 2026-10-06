import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corporate styling",
  description:
    "Styling for teams: executive presence, on-camera confidence and client-facing polish, delivered on site or over video.",
  alternates: { canonical: "/corporate" },
  openGraph: {
    title: "Corporate styling · StyleUp",
    description:
      "Styling for teams: executive presence, on-camera confidence and client-facing polish, delivered on site or over video.",
    url: "/corporate",
  },
};

export default function CorporateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
