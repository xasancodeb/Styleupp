import type { MetadataRoute } from "next";
import { STYLISTS } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const now = new Date();

  const staticPaths = [
    "",
    "/explore",
    "/fitting",
    "/quiz",
    "/for-stylists",
    "/stylist-portal",
    "/corporate",
    "/terms",
    "/privacy",
    "/auth/login",
    "/auth/signup",
  ];

  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const stylistPages: MetadataRoute.Sitemap = STYLISTS.map((s) => ({
    url: `${base}/stylist/${s.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...pages, ...stylistPages];
}
