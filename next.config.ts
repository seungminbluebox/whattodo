import type { NextConfig } from "next";

const nextConfig = {
  output: "export", // 정적 HTML 내보내기 설정
  images: {
    unoptimized: true, // GitHub Pages는 이미지 최적화 서버가 없으므로 비활성화
  },
  // 만약 레포지토리 이름이 'what-to-do'라면 아래 설정이 필요할 수 있습니다.
  basePath: "/whattodo", // GitHub Pages에서 호스팅할 때 경로 설정
};

export default nextConfig;
