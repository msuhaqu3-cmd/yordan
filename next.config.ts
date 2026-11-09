import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  // Keep the original public URLs (used in Google, sitemap.xml and canonicals).
  async rewrites() {
    return [
      { source: "/privacy-policy.html", destination: "/privacy-policy" },
      { source: "/cookie-policy.html", destination: "/cookie-policy" },
      { source: "/terms.html", destination: "/terms" },
      { source: "/index.html", destination: "/" },
    ];
  },
  async headers() {
    return [
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // The service worker must always be revalidated so new deployments are picked up.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default config;
