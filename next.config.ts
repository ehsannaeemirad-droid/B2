import type { NextConfig } from "next";

/**
 * GitHub Pages build: `npm run build:pages` sets TAPREAD_GITHUB_PAGES=1.
 * - output: "export" produces a plain static site in ./out (Pages has no Node server)
 * - basePath "/B2" matches the project-pages URL path (user.github.io/B2/)
 * - trailingSlash makes Pages serve /lesson/.../index.html on direct loads
 * Local dev and the default `npm run build` are unaffected.
 */
const isGitHubPages = process.env.TAPREAD_GITHUB_PAGES === "1";

const nextConfig: NextConfig = {
  ...(isGitHubPages
    ? {
        output: "export" as const,
        basePath: "/B2",
        trailingSlash: true,
      }
    : {}),
  cacheComponents: !isGitHubPages,
  partialPrefetching: !isGitHubPages,
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