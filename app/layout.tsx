import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Insu-Brain x KB Pilot",
  description: "KB손해보험 설계사를 위한 AI 보험 비교 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen bg-kb-dark">
          <header className="border-b border-border bg-card/50 backdrop-blur">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">
                    Insu<span className="text-kb-yellow">-Brain</span>
                  </h1>
                  <span className="px-3 py-1 bg-kb-yellow text-black text-xs font-semibold rounded-full">
                    KB Pilot
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  KB손해보험 전용 에디션
                </div>
              </div>
            </div>
          </header>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-border mt-auto py-6">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2026 Insu-Brain. KB손해보험 파일럿 프로그램.</p>
              <p className="mt-2 text-xs text-destructive">
                본 시스템은 내부 교육 및 1:1 상담 목적으로만 사용 가능합니다.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
