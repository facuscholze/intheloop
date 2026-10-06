import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { Providers } from "./providers";

// TODO Phase 1: restore next/font/google Syne, Space Grotesk, JetBrains Mono when network allows
// For sandbox build (fonts.googleapis blocked), use system fallbacks with same CSS variables
// In production Vercel build, re-enable next/font for optimization

const display = { variable: "--font-display" } as const;
const sans = { variable: "--font-sans" } as const;
const mono = { variable: "--font-mono" } as const;

export const metadata: Metadata = {
  title: "Tommy Petersen — Tribal House DJ | In The Loop Agency",
  description:
    "Tommy Petersen — DJ y productor de Argentina. Tribal House, House y Latin grooves. Bookings: events@intheloop.agency. Every dancefloor has its own story.",
  keywords: ["Tommy Petersen", "DJ", "Tribal House", "House", "Argentina", "In The Loop Agency", "booking"],
  authors: [{ name: "Tommy Petersen" }],
  openGraph: {
    title: "Tommy Petersen — Tribal House DJ",
    description: "Every dancefloor has its own story. I'm here to tell mine.",
    type: "profile",
    locale: "es_AR",
    siteName: "In The Loop Agency",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tommy Petersen — Tribal House DJ",
    description: "Every dancefloor has its own story.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={`dark ${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Fallback fonts via CSS when next/font blocked - loaded at runtime, not build time */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
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
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
