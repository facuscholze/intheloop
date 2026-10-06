/**
 * Genera assets de metadata estáticos (convención file-based de Next.js):
 *   - src/app/icon.png          (32x32)
 *   - src/app/opengraph-image.png (1200x630, mismo diseño para ambos locales)
 *
 * Se usan archivos estáticos en lugar de icon.tsx / opengraph-image.tsx
 * porque con output: "export" la versión dinámica queda sin extensión
 * (out/es/opengraph-image) y GitHub Pages no le asigna content-type correcto.
 *
 * Uso: pnpm gen:meta
 */
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import path from "node:path";

const ICON_SVG = `<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#07070A"/>
  <circle cx="16" cy="16" r="14" fill="#07070A" stroke="#FF5A1F" stroke-width="2"/>
  <text x="16" y="23" font-size="19" font-weight="800" fill="#FF5A1F" text-anchor="middle" font-family="DejaVu Sans, sans-serif">T</text>
</svg>`;

const OG_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF5A1F" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#FF5A1F" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF2E93" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#FF2E93" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="name" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FF5A1F"/>
      <stop offset="0.5" stop-color="#FF2E93"/>
      <stop offset="1" stop-color="#FFD60A"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FF5A1F"/>
      <stop offset="0.5" stop-color="#FF2E93"/>
      <stop offset="1" stop-color="#C8FF00"/>
    </linearGradient>
    <filter id="blur40" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="40"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="#07070A"/>
  <ellipse cx="420" cy="260" rx="380" ry="200" fill="url(#glow1)" filter="url(#blur40)"/>
  <ellipse cx="900" cy="480" rx="320" ry="170" fill="url(#glow2)" filter="url(#blur40)"/>

  <!-- Header -->
  <circle cx="66" cy="76" r="4" fill="#C8FF00"/>
  <text x="82" y="81" font-size="14" letter-spacing="4" fill="#8A8890" font-family="DejaVu Sans Mono, monospace">IN THE LOOP AGENCY &#8226; ARG &#8594; EU &#8594; BR</text>

  <!-- Nombre -->
  <text x="60" y="215" font-size="100" font-weight="800" letter-spacing="-5" fill="#F5F3EF" font-family="DejaVu Sans, sans-serif">TOMMY</text>
  <text x="60" y="305" font-size="100" font-weight="800" letter-spacing="-5" fill="url(#name)" font-family="DejaVu Sans, sans-serif">PETERSEN</text>

  <!-- Tagline -->
  <text x="60" y="355" font-size="16" letter-spacing="3" fill="#8A8890" font-family="DejaVu Sans Mono, monospace">TRIBAL HOUSE / HOUSE / LATIN GROOVES &#8212; ARGENTINA</text>

  <!-- Quote -->
  <text x="60" y="545" font-size="20" fill="#F5F3EF" font-family="DejaVu Sans, sans-serif">Every dancefloor has its own story.</text>
  <text x="60" y="573" font-size="20" fill="#F5F3EF" font-family="DejaVu Sans, sans-serif">I'm here to tell mine.</text>

  <!-- Socials -->
  <text x="1140" y="568" text-anchor="end" font-size="12" letter-spacing="2" fill="#4A4852" font-family="DejaVu Sans Mono, monospace">SOUNDCLOUD&#160;&#160;&#160;YOUTUBE&#160;&#160;&#160;INSTAGRAM</text>

  <!-- Barra inferior -->
  <rect x="0" y="626" width="1200" height="4" fill="url(#bar)"/>
</svg>`;

async function main() {
  const root = path.resolve(import.meta.dirname, "..");

  const iconOut = path.join(root, "src/app/icon.png");
  await sharp(Buffer.from(ICON_SVG)).resize(32, 32).png().toFile(iconOut);
  console.log(`✓ ${path.relative(root, iconOut)}`);

  const ogOut = path.join(root, "src/app/opengraph-image.png");
  await sharp(Buffer.from(OG_SVG)).resize(1200, 630).png().toFile(ogOut);
  console.log(`✓ ${path.relative(root, ogOut)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
