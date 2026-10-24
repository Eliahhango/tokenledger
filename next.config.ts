import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["postgres", "@modelcontextprotocol/sdk"],
};

export default nextConfig;
