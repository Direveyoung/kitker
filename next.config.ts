import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // v1 → v2 path 마이그레이션 (옛 URL 입력 시 새 모듈로)
      { source: "/todo", destination: "/tasks", permanent: false },
      { source: "/todo/:path*", destination: "/tasks", permanent: false },
      { source: "/notes/:id", destination: "/notes", permanent: false },
    ];
  },
};

export default nextConfig;
