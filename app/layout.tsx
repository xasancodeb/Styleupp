import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ToastProvider from "@/components/Toast";
import SeasonAccent from "@/components/SeasonAccent";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  BRAND_COLOR,
  absoluteUrl,
} from "@/lib/site";

// Self-hosted at build time, so there's no third-party round-trip on first
// paint and no flash of fallback type. Only the weights the design uses.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  // Without this every relative Open Graph URL resolves against localhost.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} · ${SITE_TAGLINE.toLowerCase()}`,
    // Every page supplies only its own name; the brand is appended once.
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "personal stylist",
    "personal styling",
    "colour analysis",
    "capsule wardrobe",
    "personal shopping",
    "wardrobe detox",
    "style consultation",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} · ${SITE_TAGLINE.toLowerCase()}`,
    description: SITE_DESCRIPTION,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} · ${SITE_TAGLINE.toLowerCase()}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: BRAND_COLOR,
  colorScheme: "light",
};

// Organization and WebSite markup, so search engines can attribute reviews,
// the logo and the site-search box to the brand rather than guessing.
const ORG_SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": absoluteUrl("/#organization"),
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.svg"),
      },
    },
    {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      publisher: { "@id": absoluteUrl("/#organization") },
      inLanguage: "en-GB",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: absoluteUrl("/explore?q={search_term_string}"),
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <head>
        {/*
          Paints the visitor's season accent before first paint. Without this
          the page renders brand violet and then snaps to their colour a frame
          later. The value was resolved and cached by SeasonAccent, so this
          stays a tiny synchronous read rather than any colour maths.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=JSON.parse(localStorage.getItem("styleup.accent")||"null");if(a&&a[0]){var s=document.documentElement.style;s.setProperty("--accent",a[0]);if(a[1])s.setProperty("--accent-2",a[1])}}catch(e){}`,
          }}
        />
      </head>
      <body>
        {/* Keyboard and screen-reader users shouldn't have to walk the nav on
            every page before reaching the content. */}
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <SeasonAccent />
        <ToastProvider>
          <Nav />
          <main id="main" style={{ minHeight: "70vh" }}>
            {children}
          </main>
          <Footer />
        </ToastProvider>
        <script
          type="application/ld+json"
          // Static, build-time constant: no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_SCHEMA) }}
        />
      </body>
    </html>
  );
}
