import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 允许外部图片 */
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
