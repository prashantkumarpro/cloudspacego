import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  // allowedDevOrigins: ["127.0.0.1", '[::1]', "10.24.249.211"],
  allowedDevOrigins: ["*"],
};

export default nextConfig;
