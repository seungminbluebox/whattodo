import type { NextConfig } from "next";

const nextConfig = {
  output: "export", // 정적 HTML 내보내기 설정
  images: {
    unoptimized: true, // GitHub Pages는 이미지 최적화 서버가 없으므로 비활성화
  },
};

export default nextConfig;
