import type { Metadata } from "next";
import "./globals.css";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { SubscriptionProvider } from "@/lib/hooks/use-subscription";
import FirebaseInitializer from "@/components/FirebaseInitializer";

export const metadata: Metadata = {
  title: "宅建合格ロード - AI予想問題で学ぶ",
  description: "AI生成の予想問題で宅建試験対策！最新の法改正や頻出トピックを徹底カバー。AI先生と一緒に効率的に合格を目指そう！",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning={true}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@4.3.0/fonts/remixicon.css"
          rel="stylesheet"
        />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#9333ea" />
        <meta name="background-color" content="#ffffff" />
        <meta name="display" content="standalone" />
        <meta name="orientation" content="portrait" />

        {/* PWA Meta Tags - Standard */}
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Apple PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="宅建RPG" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />

        {/* Microsoft PWA Meta Tags */}
        <meta
          name="msapplication-TileImage"
          content="/icons/icon-144x144.png"
        />
        <meta name="msapplication-TileColor" content="#9333ea" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />

        {/* Viewport for mobile optimization */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />

        {/* AdSense Code Snippet */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6068024385307000"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased bg-background text-foreground">
        <FirebaseInitializer />
        <SubscriptionProvider>
          {children}
          <PWAInstallPrompt />
        </SubscriptionProvider>
      </body>
    </html>
  );
}
