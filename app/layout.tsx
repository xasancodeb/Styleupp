import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";
import SeasonAccent from "@/components/SeasonAccent";

export const metadata: Metadata = {
  title: "StyleUp · a styling system",
  description:
    "An indexed atelier of vetted personal stylists. Colour analysis, capsule wardrobes, occasion styling and in-person shopping, virtual or near you.",
  openGraph: {
    title: "StyleUp · a styling system",
    description: "An indexed atelier of vetted personal stylists, near you or over video.",
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
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap"
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

