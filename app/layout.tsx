import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NotificationProvider } from "@/lib/useNotifications";

export const metadata: Metadata = {
  title: "Chú Lăng Nghiêm – Học Thuộc",
  description:
    "Ứng dụng học thuộc Chú Lăng Nghiêm bằng phương pháp điền từ còn thiếu",
  keywords: [
    "Chú Lăng Nghiêm",
    "học thuộc",
    "kinh Phật",
    "fill in the blank",
    "luyện tập",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07070d",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          <NotificationProvider>{children}</NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

