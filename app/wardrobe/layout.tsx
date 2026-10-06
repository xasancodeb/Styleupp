import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your wardrobe",
  description: "Photograph what you own and get outfits built from your real clothes, in your colours.",
  // Behind sign-in and personal to each visitor, so it stays out of the index.
  robots: { index: false, follow: false },
};

export default function WardrobeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
