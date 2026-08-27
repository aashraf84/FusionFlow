import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow Prisma to work in serverless deployment
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "pg"],
  },
};

export default nextConfig;
