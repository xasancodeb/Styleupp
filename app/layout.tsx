import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";
import SeasonAccent from "@/components/SeasonAccent";

export const metadata: Metadata = {
  title: "StyleUp · personal styling, in colour",
  description:
    "Vetted personal stylists for colour analysis, capsule wardrobes and occasion styling. Meet over video or find someone near you to style you in person or shop the stores with you.",
  openGraph: {
    title: "StyleUp · personal styling, in colour",
    description: "Vetted personal stylists, near you or over video.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
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

