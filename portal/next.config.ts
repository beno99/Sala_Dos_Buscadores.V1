import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  poweredByHeader: false,
  allowedDevOrigins: ["192.168.*.*"],
};

export default nextConfig;
