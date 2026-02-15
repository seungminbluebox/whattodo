import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "What To Do",
  description: "Minimalist Todo List",
  manifest: "/whattodo/manifest.json", // GitHub Pages 경로 주의
  viewport:
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "What To Do",
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
