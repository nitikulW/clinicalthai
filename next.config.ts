import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Data comes from a process-level cache (src/lib/ctgov.ts), so pages render
  // dynamically per request instead of using Cache Components.
  cacheComponents: false,
  // Ship the ClinicalTrials.gov snapshot made by `npm run sync` (prebuild)
  // with every server route, so cold starts serve data instantly.
  outputFileTracingIncludes: {
    "/**/*": ["./.cache/trials.json"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
