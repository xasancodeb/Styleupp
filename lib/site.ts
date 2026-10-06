/**
 * One source of truth for the site's public identity.
 *
 * The canonical URL matters more than it looks: sitemap.xml, robots.txt and
 * every Open Graph tag are absolute URLs, so a wrong value here silently ships
 * "http://localhost:3000" links to Google and to anyone sharing a page.
 * Resolution order: an explicit NEXT_PUBLIC_APP_URL wins, then Vercel's own
 * production domain, then the current deployment, and only then localhost.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (prod) return `https://${prod.replace(/\/+$/, "")}`;

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment.replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const SITE_NAME = "StyleUp";

export const SITE_TAGLINE = "A personal stylist, near you";

export const SITE_DESCRIPTION =
  "Tell us what you need, whether that's a big occasion, a wardrobe that finally works or help shopping, and get matched with a vetted personal stylist in your city. Over video if you prefer.";

/** Brand colour used for the browser chrome and generated share images. */
export const BRAND_COLOR = "#6c4cf0";

export const BRAND_INK = "#1d1d1f";

/** Absolute URL for a site-relative path, for metadata and structured data. */
export function absoluteUrl(path = ""): string {
  if (!path) return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
