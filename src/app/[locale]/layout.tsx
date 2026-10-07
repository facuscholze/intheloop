import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
import { Grain } from "@/components/effects/Grain";
import { EnterScreen } from "@/components/enter/EnterScreen";
import { Preloader } from "@/components/enter/Preloader";
import { Header } from "@/components/ui/Header";
import { Menu } from "@/components/ui/Menu";
import { Player } from "@/components/player/Player";
import { ScreenShake } from "@/components/effects/ScreenShake";
import { CineMode } from "@/components/video/CineMode";
import { KonamiCode, Screensaver } from "@/components/effects/EasterEggs";
import { SkipLink } from "@/components/ui/SkipLink";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import "../globals.css";

// Origen canónico (sin basePath — Next lo agrega solo a metadata routes).
// Producción por defecto; GitHub Pages lo pisa via env NEXT_PUBLIC_SITE_URL.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.intheloop.agency").replace(/\/$/, "");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const fullUrl = `${siteUrl}${basePath}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Tommy Petersen — Tribal House DJ | In The Loop Agency",
  description:
    "Tommy Petersen — DJ y productor de Argentina. Tribal House, House y Latin grooves con texturas melódicas. Bookings: events@intheloop.agency. Every dancefloor has its own story.",
  keywords: ["Tommy Petersen", "DJ", "Tribal House", "House", "Argentina", "In The Loop Agency", "booking", "Latin grooves"],
  authors: [{ name: "Tommy Petersen" }],
  creator: "Tommy Petersen",
  openGraph: {
    title: "Tommy Petersen — Tribal House DJ",
    description: "Every dancefloor has its own story. I'm here to tell mine. Let's create something unforgettable.",
    type: "profile",
    locale: "es_AR",
    alternateLocale: ["en_US"],
    siteName: "In The Loop Agency",
    url: fullUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Tommy Petersen — Tribal House DJ",
    description: "Every dancefloor has its own story. Tribal House / House / Latin grooves from Argentina.",
    creator: "@tommypetersen",
  },
  alternates: {
    canonical: fullUrl,
    languages: {
      es: `${fullUrl}/es/`,
      en: `${fullUrl}/en/`,
    },
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Sora:wght@300..700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-display: "Anton", "Arial Narrow", system-ui, sans-serif;
            --font-sans: "Sora", system-ui, sans-serif;
            --font-mono: "Space Mono", monospace;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-[var(--bg)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SkipLink />
            <Grain />
            <ScreenShake />
            <KonamiCode />
            <Screensaver />
            <Preloader />
            <EnterScreen />
            <Header />
            <Menu />
            <main id="main-content" tabIndex={-1}>
              {children}
            </main>
            <Player />
            <CineMode />
            <PerformanceMonitor />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
