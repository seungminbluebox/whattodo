import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        background: "#FFFFFF",
        foreground: "#000000",
      },
    },
  },
  plugins: [],
};
export default config;
