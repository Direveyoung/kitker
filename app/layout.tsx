import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Noto_Serif_KR } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SwRegister } from "@/components/pwa/sw-register";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  display: "swap",
  weight: "45 920",
});

const notoSerifKR = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-noto-serif-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "eveworks",
  description: "영아 이사(Eve)의 1인 워크스페이스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "eveworks",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1419" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${notoSerifKR.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="eveworks-theme"
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <SwRegister />
      </body>
    </html>
  );
}
