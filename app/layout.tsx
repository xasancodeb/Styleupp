import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";
import SeasonAccent from "@/components/SeasonAccent";

export const metadata: Metadata = {
  title: "StyleUp | The house of getting dressed well",
  description:
    "Twelve stylists, each with a portfolio. Walk the house, find the taste that feels like yours, and book them in your city or on video.",
  openGraph: {
    title: "StyleUp | The house of getting dressed well",
    description: "Walk the house. Find your stylist. Get dressed well.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Instrument+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SeasonAccent />
        <ToastProvider>
          <Nav />
          <main style={{ minHeight: "70vh" }}>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}

