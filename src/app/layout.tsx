import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Họa sĩ Lê Phú và những bức chân dung có hồn | Đường sách TP.HCM",
  description:
    "Phóng sự ảnh: Giữa nhịp sống hối hả của Thành phố và sự bùng nổ của AI, tại Đường sách Nguyễn Văn Bình vẫn có một góc yên bình nơi họa sĩ Lê Phú lặng lẽ dùng nét chì kết nối những tâm hồn du khách.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Be+Vietnam+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-[#FAF2DE] text-stone-900 antialiased">
        {children}
      </body>
    </html>
  );
}
