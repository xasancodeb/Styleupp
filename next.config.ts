import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Standalone output is only for the Docker image (built with BUILD_STANDALONE=1).
  // Everywhere else — Vercel, local `next start` — we use the default output.
  ...(process.env.BUILD_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
