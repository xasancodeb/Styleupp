import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";

export const metadata: Metadata = {
  title: "StyleUp — Personal styling, made personal",
  description:
    "Book vetted personal stylists across the globe. Colour analysis, capsule wardrobes, occasion styling and more — virtually or in person.",
  openGraph: {
    title: "StyleUp — Personal styling, made personal",
    description:
      "Book vetted personal stylists across the globe. Virtual and in-person sessions.",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <Nav />
          <main style={{ minHeight: "70vh" }}>{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
