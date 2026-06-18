import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output is only for the Docker image (built with BUILD_STANDALONE=1).
  // Everywhere else — Vercel, local `next start` — we use the default output.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  images: {
    // Delegate resizing to Unsplash's CDN (see lib/imageLoader.ts) so images
    // load directly in the browser — no optimizer round-trip, no CLS.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
};

export default nextConfig;
