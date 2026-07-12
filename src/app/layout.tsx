import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const basePath = process.env.GITHUB_PAGES === "true" ? "/muscleup" : "";

export const metadata: Metadata = {
  title: "MuscleUp — ジムが楽しくなる筋トレ記録",
  description:
    "記録・成長・応援。AIマスコットと一緒に筋トレを続けられるワークアウトトラッカー",
  applicationName: "MuscleUp",
  appleWebApp: {
    capable: true,
    title: "MuscleUp",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: `${basePath}/muscleup-icon.svg`,
    apple: `${basePath}/muscleup-icon.svg`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const themeInitScript = `
try {
  var raw = localStorage.getItem("muscleup:v1:theme");
  var saved = raw ? JSON.parse(raw) : null;
  var theme = saved && saved.state ? saved.state.theme : "dark";
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
} catch (_) {
  document.documentElement.classList.add("dark");
  document.documentElement.style.colorScheme = "dark";
}
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
