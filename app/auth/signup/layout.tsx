import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a StyleUp account to book and message stylists.",
  robots: { index: false, follow: false },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
