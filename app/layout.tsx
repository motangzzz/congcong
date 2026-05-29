import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "匆匆那年",
  description: "属于我们的匆匆那年 - 留言板",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {/* 装饰性背景元素 */}
        <div className="fixed top-10 left-10 text-4xl opacity-20 animate-float select-none pointer-events-none">
          🌸
        </div>
        <div className="fixed top-20 right-16 text-3xl opacity-20 animate-float select-none pointer-events-none" style={{ animationDelay: "0.5s" }}>
          🍊
        </div>
        <div className="fixed bottom-20 left-20 text-4xl opacity-20 animate-float select-none pointer-events-none" style={{ animationDelay: "1s" }}>
          🌙
        </div>
        <div className="fixed bottom-32 right-12 text-3xl opacity-20 animate-float select-none pointer-events-none" style={{ animationDelay: "1.5s" }}>
          ⭐
        </div>

        {/* 主内容 */}
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
