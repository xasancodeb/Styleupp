import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your dashboard",
  description: "Your upcoming sessions, saved stylists and messages.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
