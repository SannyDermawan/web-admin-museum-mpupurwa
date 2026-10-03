import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root. Without this Next.js warns when a stray package-lock.json
  // exists in a parent folder (e.g. the home directory).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
