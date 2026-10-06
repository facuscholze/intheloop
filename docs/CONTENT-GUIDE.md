# Guía de contenido — agregar canción / video / show en 2 minutos

Todo el contenido vive en `content/` validado con Zod (`src/lib/content.ts`). No toques código de animaciones.

## Audios: producción propia o con permiso

> **Derechos:** solo subí audio si es producción propia de Tommy o tenés permiso. Sets con tracks de terceros mejor como embed SoundCloud/YouTube (link en JSON). El audio reactivo real solo funciona con archivos propios (CORS).

## 1) Agregar canción

```bash
pnpm add:track
```

**Qué hace:**
1. Pregunta título, ID, BPM, key, géneros, color, links SoundCloud/Spotify/Beatport
2. Busca audio en `media-src/audio/tracks/{id}.wav|mp3` y cover en `media-src/covers/{id}.jpg|png`
3. Copia audio a `public/media/audio/{id}.ext` y optimiza cover a `public/media/images/covers/{id}.webp` (800x800) + thumb 200x200 con sharp
4. Genera waveform peaks 120 puntos leyendo WAV (si es WAV) o random placeholder
5. Escribe `content/tracks/{id}.json` validado Zod

**Manual (sin CLI):**
- Copiá `content/tracks/_TEMPLATE.json` → `content/tracks/mi-tema.json`
- Completá campos
- Poné audio original en `media-src/audio/tracks/mi-tema.wav` (WAV o MP3 320kbps ideal)
- Cover cuadrado 1400x1400 mínimo en `media-src/covers/mi-tema.jpg`
- `pnpm gen:waveform` + `pnpm optimize:images`

**En producción:**
- Audios pesados no van a git. Subilos a bucket (Cloudflare R2 / S3) y seteá `NEXT_PUBLIC_MEDIA_BASE_URL=https://tu-bucket.r2.dev`
- `getMediaUrl()` resuelve: si env está seteado, usa `https://bucket/audio/...`, si no, local `/media/audio/...`

## 2) Agregar video

```bash
pnpm add:video
```

**Qué hace:**
1. Pide título, ID, venue, fecha, color, YouTube ID opcional, ruta local video
2. Copia video a `public/media/video/{id}.mp4`
3. Intenta generar poster con ffmpeg `ffmpeg -y -i video -ss 00:00:01 -vframes 1 poster.jpg`
4. Intenta generar preview 5s loop `ffmpeg -ss 00:00:02 -t 5 -an -vf scale=640:-2`
5. Optimiza poster a WebP 1280x720 con sharp
6. Escribe `content/videos/{id}.json`

**Manual:**
- Copiá `_TEMPLATE.json` en `content/videos/`
- `src` puede ser `video/mi-video.mp4` (self-hosted) o dejar null y usar `youtubeId`
- Poster en `media-src/images/posters/` y preview loop 3-6s en `media-src/video/previews/`
- Si no hay poster/preview, UI usa gradiente + waveform simulada

**HLS (streaming adaptativo):**
- Generá HLS con ffmpeg: `ffmpeg -i input.mp4 -c:v libx264 -crf 22 -c:a aac -hls_time 6 -hls_playlist_type vod output.m3u8`
- Subí a `public/media/video/hls/{id}/` o bucket, y en JSON `src: "video/hls/{id}/output.m3u8"`
- `useHLS` hook carga hls.js dinámico

## 3) Agregar show

```bash
pnpm add:show
```

**Qué hace:**
1. Pide venue, ciudad, país ISO2, fecha, IG, gallery URL, featured, ID
2. Busca foto en `media-src/images/shows/{id}.jpg`
3. Optimiza a WebP 800x600 en `public/media/images/shows/`
4. Append a `content/shows.json` y sort por fecha desc

**Manual:**
- Editá `content/shows.json` directo (array). Campos: id, venue, city, country, date YYYY-MM-DD, instagram, galleryUrl, photo, featured, needsReview
- Foto original en `media-src/images/shows/fecha-venue.jpg` (ej: `2025-09-12-le-fleurus.jpg`)

## Scripts útiles

```bash
pnpm gen:sample-audio   # genera 3 WAV demo tribales 124/126/122 BPM + JSON + peaks
pnpm gen:sample-videos  # genera 4 JSON demo videos
pnpm gen:waveform       # regenera peaks para tracks sin peaks (lee WAV)
pnpm optimize:images    # sharp: media-src/images/* -> public/media/images/* WebP + thumbs
```

## Flujo completo 2 minutos

1. Soltá archivo original en `media-src/` (no importa nombre perfecto, pero ideal minúsculas con guiones)
2. `pnpm add:track` (o video/show) → responde prompts → listo
3. `pnpm dev` → probá en /es#music o #videos o #shows
4. Commit y push → Vercel deploy auto o Coolify Docker

## Validación Zod

Todo JSON se valida en build con `src/lib/content.ts`:
- `TrackSchema`: id, title, artist default, type track|set|mix, audioSrc nullable, cover nullable, bpm 60-200, key, duration, date, genres[], colorAccent, links{}, waveformPeaks[]
- `VideoSchema`: id, title, src nullable, youtubeId nullable, poster, previewSrc, date, venue, colorAccent
- `ShowSchema`: id, venue, city, country, date, instagram, galleryUrl, photo, featured, needsReview

Si falta cover/poster, UI genera fallback visual gradiente/shader, no hueco.

## CMS opcional (fase final)

Para que cliente edite sin tocar JSON, podés agregar Keystatic o Decap CMS (git-based, sin DB):
- Keystatic: `npm install @keystatic/core @keystatic/next` + config en `keystatic.config.ts` leyendo `content/` schemas
- Decap: `public/admin/` con `config.yml` + `decap-cms-app`

Ambos hacen commit + deploy automático. Por ahora no incluido para mantener bundle liviano.

## Checklist contenido inicial

- [ ] Fotos hero alta resolución `media-src/images/hero/` 2500px+ ancho
- [ ] 2-3 temas propios WAV/MP3 + covers cuadradas 1400x1400
- [ ] 2-3 videos 1080p MP4 + posters
- [ ] Confirmar shows con `needsReview` en `shows.json`
- [ ] Logo SVG/PNG transparente en `media-src/brand/`
- [ ] Press kit PDF en `media-src/press/` (opcional)
