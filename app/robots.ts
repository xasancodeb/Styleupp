import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL;
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
