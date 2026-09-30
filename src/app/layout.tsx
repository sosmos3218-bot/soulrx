import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR, Noto_Serif_KR } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const sans = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Noto_Serif_KR({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SoulRx — 말씀 처방",
  description: "오늘 기분에 맞는 말씀 처방. 조용한 큐티, 운세가 아닙니다.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="min-h-full bg-[#faf7f2] text-stone-800 antialiased">
        <div className="mx-auto min-h-full max-w-md px-4 pb-24 pt-8">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
