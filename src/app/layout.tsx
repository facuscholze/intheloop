import type { Metadata } from "next";

// Origen canónico para resolver metadata routes (OG image, icon).
// La metadata completa vive en [locale]/layout.tsx.
export const metadata: Metadata = {
  metadataBase: new URL(
    (process.env.NEXT_PUBLIC_SITE_URL || "https://www.intheloop.agency").replace(/\/$/, "")
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
