#!/usr/bin/env tsx
/**
 * pnpm add:show
 * CLI para agregar show a shows.json + foto
 */

import fs from "node:fs";
import path from "node:path";
import { ShowSchema } from "../src/lib/content";
import { prompt, slugify, logSuccess, logWarn } from "../src/lib/cli";

async function main() {
  console.log("📍 In The Loop — Agregar Show\n");

  const venue = await prompt("Venue", "Nombre del venue");
  const city = await prompt("Ciudad", "CABA");
  const country = await prompt("País (ISO2 ej: AR, ES, BR, FR, DE, CZ)", "AR");
  const date = await prompt("Fecha (YYYY-MM-DD)", new Date().toISOString().slice(0, 10));
  const instagram = await prompt("Instagram del venue (url)", "");
  const galleryUrl = await prompt("Gallery URL OneDrive (opcional)", "");
  const featured = (await prompt("Featured? (y/n)", "n")).toLowerCase() === "y";
  const id = slugify(await prompt("ID", `${date}-${slugify(venue)}`));

  // Foto
  const photoInput = await prompt("Ruta foto en media-src/images/shows/ (opcional)", "");
  let finalPhoto: string | null = null;

  const publicShowDir = "public/media/images/shows";
  fs.mkdirSync(publicShowDir, { recursive: true });

  const candidates = [photoInput, `media-src/images/shows/${id}.jpg`, `media-src/images/shows/${date}-${slugify(venue)}.jpg`].filter(Boolean) as string[];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      try {
        const sharp = (await import("sharp")).default;
        const dest = path.join(publicShowDir, `${id}.webp`);
        await sharp(c).resize(800, 600, { fit: "cover" }).webp({ quality: 80 }).toFile(dest);
        finalPhoto = `images/shows/${id}.webp`;
        logSuccess(`Foto optimizada ${dest}`);
        break;
      } catch {
        const ext = path.extname(c);
        const dest = path.join(publicShowDir, `${id}${ext}`);
        fs.copyFileSync(c, dest);
        finalPhoto = `images/shows/${id}${ext}`;
        logSuccess(`Foto copiada ${dest}`);
        break;
      }
    }
  }

  if (!finalPhoto) logWarn("Sin foto, se usará placeholder gradient en UI");

  const showData = {
    id,
    venue,
    city,
    country: country.toUpperCase(),
    date,
    instagram: instagram || null,
    galleryUrl: galleryUrl || null,
    photo: finalPhoto,
    featured,
    needsReview: null,
  };

  const parsed = ShowSchema.safeParse(showData);
  if (!parsed.success) {
    console.error("Zod error", parsed.error.flatten());
    process.exit(1);
  }

  const showsPath = "content/shows.json";
  const raw = fs.existsSync(showsPath) ? JSON.parse(fs.readFileSync(showsPath, "utf-8")) : [];
  raw.push(parsed.data);

  // Sort recent first
  raw.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(showsPath, JSON.stringify(raw, null, 2));
  logSuccess(`Show agregado a ${showsPath} (${raw.length} total)`);

  console.log("\n✅ Show agregado!");
  console.log(`   - ${venue} - ${city} ${country} ${date}`);
  console.log(`   - Foto: ${finalPhoto || "placeholder"}`);
  console.log("\nProbá en /es#shows + filtros + mapa");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
