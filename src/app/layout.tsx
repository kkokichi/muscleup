import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "MuscleUp — ジムが楽しくなる筋トレ記録",
  description:
    "記録・成長・応援。AIマスコットと一緒に筋トレを続けられるワークアウトトラッカー",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="dark">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
