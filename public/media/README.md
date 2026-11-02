# public/media/ — GENERADO

Acá van los archivos ya optimizados. No edites a mano.

- `content/` → derivado de las carpetas de `content/` por `pnpm sync:media`
  (imágenes WebP + minis, audio/video copiados). Se regenera en cada
  `pnpm dev` / `pnpm build` y **no se versiona** (ver .gitignore).
- `images/hero`, `brand/`… → derivado de `media-src/` por
  `pnpm optimize:images`.

Para producción pesada, el plan es servir audio y video desde un bucket/CDN
(variable `NEXT_PUBLIC_MEDIA_BASE_URL`).
