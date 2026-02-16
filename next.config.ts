import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 정적 HTML 내보내기 설정
  basePath: "/whattodo", // GitHub Pages 저장소 이름에 맞게 설정
  images: {
    unoptimized: true, // GitHub Pages는 이미지 최적화 서버가 없으므로 비활성화
  },
};

export default nextConfig;
