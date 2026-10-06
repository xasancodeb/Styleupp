import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stylist studio",
  description: "Your bookings, earnings and availability.",
  robots: { index: false, follow: false },
};

export default function StylistDashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
