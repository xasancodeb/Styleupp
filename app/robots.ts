import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep authenticated + transactional areas out of the index.
        disallow: ["/dashboard", "/admin", "/stylist-dashboard", "/messages", "/book", "/booking", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
