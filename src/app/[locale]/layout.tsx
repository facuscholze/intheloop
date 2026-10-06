import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
import { Grain } from "@/components/effects/Grain";
import { CursorBlob } from "@/components/effects/CursorBlob";
import { EnterScreen } from "@/components/enter/EnterScreen";
import { Header } from "@/components/ui/Header";
import { Menu } from "@/components/ui/Menu";
import { Player } from "@/components/player/Player";
import { ClubModeToggle, ClubModeEffect } from "@/components/effects/ClubMode";
import { ScreenShake } from "@/components/effects/ScreenShake";
import { CineMode } from "@/components/video/CineMode";
import { KonamiCode, Screensaver } from "@/components/effects/EasterEggs";
import { SkipLink } from "@/components/ui/SkipLink";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.intheloop.agency"),
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
    url: "https://www.intheloop.agency",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tommy Petersen — Tribal House DJ",
    description: "Every dancefloor has its own story. Tribal House / House / Latin grooves from Argentina.",
    creator: "@tommypetersen",
  },
  alternates: {
    canonical: "https://www.intheloop.agency",
    languages: {
      es: "https://www.intheloop.agency/es",
      en: "https://www.intheloop.agency/en",
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
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400..800&family=Space+Grotesk:wght@300..700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-display: "Syne", system-ui, sans-serif;
            --font-sans: "Space Grotesk", system-ui, sans-serif;
            --font-mono: "JetBrains Mono", monospace;
          }
        `}</style>
      </head>
      <body className="min-h-screen bg-[var(--bg)] antialiased">
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <SkipLink />
            <Grain />
            <CursorBlob />
            <ScreenShake />
            <ClubModeEffect />
            <KonamiCode />
            <Screensaver />
            <EnterScreen />
            <Header />
            <Menu />
            <ClubModeToggle />
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
