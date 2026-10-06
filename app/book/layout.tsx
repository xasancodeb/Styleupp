import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book a session",
  description: "Choose your service, pick a time and pay securely.",
  robots: { index: false, follow: false },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return children;
}
