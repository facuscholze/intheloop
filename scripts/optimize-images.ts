#!/usr/bin/env tsx
/**
 * pnpm optimize:images
 * Optimiza imágenes de media-src/ (hero, about, press, brand, covers legacy) a
 * public/media/ con sharp: WebP + thumbs.
 *
 * Ojo: las imágenes del CONTENIDO (galerías, shows, temas, videos) NO pasan por
 * acá — cada una vive en su carpeta de content/ y las procesa `pnpm sync:media`.
 */

import fs from "node:fs";
import path from "node:path";

async function optimizeDir(srcDir: string, destDir: string, options: { width?: number; height?: number } = {}) {
  if (!fs.existsSync(srcDir)) {
    console.log(`⏭️  ${srcDir} no existe`);
    return;
  }

  fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(srcDir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f) && !f.startsWith("."));

  if (files.length === 0) {
    console.log(`⏭️  ${srcDir} vacío`);
    return;
  }

  const sharp = (await import("sharp")).default;

  for (const file of files) {
    const srcPath = path.join(srcDir, file);
    const name = path.parse(file).name;
    const destWebP = path.join(destDir, `${name}.webp`);
    const destThumb = path.join(destDir, `${name}-thumb.webp`);

    try {
      // .rotate() sin argumentos = aplicar la orientación EXIF. Las fotos de
      // celular suelen venir guardadas "acostadas" + flag EXIF (ej. la foto
      // del hero: 4000×3000 con orientation 8); sin esto el WebP sale de costado.
      await sharp(srcPath)
        .rotate()
        .resize(options.width || 1280, options.height || undefined, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(destWebP);

      await sharp(srcPath).rotate().resize(400, 400, { fit: "cover" }).webp({ quality: 70 }).toFile(destThumb);

      console.log(`✅ ${srcPath} -> ${destWebP} + thumb`);
    } catch (e) {
      console.warn(`⚠️  Falló ${srcPath}: ${e}`);
    }
  }
}

async function main() {
  console.log("🖼️  Optimizando imágenes con sharp...\n");

  await optimizeDir("media-src/images/hero", "public/media/images/hero", { width: 1920 });
  await optimizeDir("media-src/images/shows", "public/media/images/shows", { width: 800 });
  await optimizeDir("media-src/images/about", "public/media/images/about", { width: 1200 });
  await optimizeDir("media-src/covers", "public/media/images/covers", { width: 800 });
  await optimizeDir("media-src/images/press", "public/media/images/press", { width: 1600 });
  await optimizeDir("media-src/brand", "public/media/images/brand");

  // Galleries
  const galleriesDir = "media-src/images/galleries";
  if (fs.existsSync(galleriesDir)) {
    const cities = fs.readdirSync(galleriesDir).filter((f) => fs.statSync(path.join(galleriesDir, f)).isDirectory());
    for (const city of cities) {
      await optimizeDir(path.join(galleriesDir, city), path.join("public/media/images/galleries", city), { width: 1200 });
    }
  }

  console.log("\n✅ Imágenes optimizadas a public/media/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
