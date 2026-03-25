import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chú Lăng Nghiêm – Học Thuộc",
  description: "Ứng dụng học thuộc Chú Lăng Nghiêm bằng phương pháp điền từ còn thiếu",
  keywords: ["Chú Lăng Nghiêm", "học thuộc", "kinh Phật", "fill in the blank"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="min-h-screen bg-stone-950 text-stone-100 antialiased">
        {children}
      </body>
    </html>
  );
}
