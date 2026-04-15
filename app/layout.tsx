import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "个人笔记",
  description: "一款部署在 Vercel 上的中文个人笔记应用。"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
