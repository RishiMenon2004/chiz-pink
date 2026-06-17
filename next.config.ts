import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [50, 75, 100]
  },
  allowedDevOrigins: ['192.168.0.44'],
};

export default nextConfig;
