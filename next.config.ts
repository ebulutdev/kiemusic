import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ana sayfa: mobil SoundForge arayüzü (public/soundforge.html)
  async rewrites() {
    return { beforeFiles: [{ source: "/", destination: "/soundforge.html" }] };
  },
};

export default nextConfig;
