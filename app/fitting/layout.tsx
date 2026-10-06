import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your fitting room",
  description:
    "Your colour season, your saved stylists and the looks you have shortlisted, all in one place.",
  alternates: { canonical: "/fitting" },
  openGraph: {
    title: "Your fitting room · StyleUp",
    description:
      "Your colour season, your saved stylists and the looks you have shortlisted, all in one place.",
    url: "/fitting",
  },
};

export default function FittingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
