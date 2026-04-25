import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Prevent build-time worker thread spawn failures on constrained Windows environments.
    // (Defaults can scale to CPU count and overwhelm available resources.)
    cpus: 4,
  },
  images: {
    // RSS article images come from thousands of CDNs — domain whitelisting isn't
    // feasible for an aggregator. HTTP is dropped; SVG execution is blocked.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
};

export default nextConfig;
