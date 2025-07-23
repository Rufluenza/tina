import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    HOST: process.env.HOST,
    HOST_PORT: process.env.HOST_PORT,
    HOST_BASE: process.env.HOST_BASE,
    RPI_BASE_URL: process.env.RPI_BASE_URL,
  },
};

export default nextConfig;
