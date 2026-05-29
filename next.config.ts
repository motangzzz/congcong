import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/congcong",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
