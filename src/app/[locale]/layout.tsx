import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Providers } from "../providers";
import "../globals.css";

export const metadata: Metadata = {
  title: "Tommy Petersen — Tribal House DJ | In The Loop Agency",
  description:
    "Tommy Petersen — DJ y productor de Argentina. Tribal House, House y Latin grooves. Bookings: events@intheloop.agency.",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
