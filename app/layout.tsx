import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";
import SeasonAccent from "@/components/SeasonAccent";

export const metadata: Metadata = {
  title: "StyleUp · a personal stylist, near you",
  description:
    "Tell us what you need — an occasion, a wardrobe that works, help shopping — and get matched with a vetted personal stylist in your city, or over video if you prefer.",
  openGraph: {
    title: "StyleUp · a personal stylist, near you",
    description: "Get matched with a vetted personal stylist in your city.",
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

