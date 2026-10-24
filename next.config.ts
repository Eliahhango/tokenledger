import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["postgres", "@modelcontextprotocol/sdk"],
};

export default nextConfig;
