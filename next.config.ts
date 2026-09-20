import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site: `npm run build` produces ./out, which can be hosted on
  // Cloudflare Pages, GitHub Pages, Netlify or any static server.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
