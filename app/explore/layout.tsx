import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse stylists",
  description:
    "Browse vetted personal stylists by city, specialty and format. Meet over video from anywhere, in person near you, or shop the stores together.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Browse stylists · StyleUp",
    description:
      "Browse vetted personal stylists by city, specialty and format. Meet over video from anywhere, in person near you, or shop the stores together.",
    url: "/explore",
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
