import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [50, 75, 100]
  },
  devIndicators: false,
  allowedDevOrigins: [process.env.DEV_ORIGIN as string],
};

export default nextConfig;
