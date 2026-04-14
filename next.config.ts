import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Prevent build-time worker thread spawn failures on constrained Windows environments.
    // (Defaults can scale to CPU count and overwhelm available resources.)
    cpus: 4,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
