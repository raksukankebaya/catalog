import type { NextConfig } from "next";

const basePath = process.env.PAGES_BASE_PATH || "";
const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
  typescript: { ignoreBuildErrors: true },
  experimental: { cpus: 1, workerThreads: true },
};
export default nextConfig;
