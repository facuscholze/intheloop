import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Deploy estático (GitHub Pages, cualquier CDN/hosting estático).
 *
 * - `output: "export"` genera el sitio completo en `out/`.
 * - `NEXT_PUBLIC_BASE_PATH`: prefijo de ruta, p. ej. `/intheloop` cuando el
 *   sitio vive en https://<usuario>.github.io/intheloop/ (project site).
 *   Vacío para dominio propio o user site (<usuario>.github.io).
 *   El workflow de GitHub Pages lo setea automáticamente.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // GitHub Pages sirve rutas con trailing slash (`/es/` -> `es/index.html`)
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  // Sin Image Optimization en export estático (no se usa next/image igual)
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tooltip",
      "motion",
      "gsap"
    ]
  },
  // Nota: `headers()` no está soportado con output: "export"
  // (GitHub Pages tampoco permite headers custom).
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
