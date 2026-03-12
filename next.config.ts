import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true, // Ton option gardée

  // Correction : ppr → cacheComponents
  cacheComponents: true, // Active Partial Prerendering (ex-ppr)

  // Images pour API Quran
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.alquran.cloud",
      },
    ],
  },
};

export default nextConfig;
