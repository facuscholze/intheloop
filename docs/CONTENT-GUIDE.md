# Guía de contenido — cada cosa en su carpeta

Todo el contenido vive en `content/`, **una carpeta por cosa**, con sus archivos
adentro. El sitio lee las carpetas en build: no hay que registrar nada en ningún
índice, ni tocar código de animaciones.

```
content/
  gallery/<ciudad>/      fotos sueltas + city.json (opcional)
  shows/<show>/          show.json + hero.jpg (la foto del hover)
  songs/<tema>/          track.json + audio + cover.jpg
  videos/<video>/        video.json + poster.jpg (+ video)
  site.json              artista, contacto, redes
```

Regla de oro: **las carpetas y archivos que empiezan con `_` se ignoran**
(`_TEMPLATE`, borradores, notas). Cada sección trae su `_TEMPLATE/` para copiar.

---

## 0) El flujo corto (sin CLI)

```bash
# 1. creás la carpeta del item y soltás los archivos
# 2. (opcional) completás el JSON — copiá el de _TEMPLATE/
pnpm dev
```

`pnpm dev` levanta el sitio y, en paralelo, un watcher de `content/`: todo lo que
sueltes se optimiza al vuelo (`public/media/content/...`) y aparece al refrescar.
Al hacer `pnpm build` (o el deploy de GitHub Pages) lo mismo corre automático.

Si querés forzarlo a mano:

```bash
pnpm sync:media     # optimiza lo que haga falta (incremental) y limpia huérfanos
pnpm watch:media    # queda mirando content/ sin levantar el sitio
```

---

## 1) Galería por ciudad

Una carpeta por ciudad, las fotos adentro. Nada más: se ordenan por nombre de
archivo y aparecen en el carrusel de GALLERY (la primera foto es la tapa).

```
content/gallery/tandil/
  01.jpg
  02.jpg
  10.jpg
```

**Opcional** `city.json` para forzar nombre/bandera/orden:

```json
{
  "city": "París",
  "country": "FR",
  "date": "2025-09-12",
  "order": 1,
  "cover": "03.jpg",
  "description": "Sunset session en el Sena"
}
```

| Campo | Para qué |
|---|---|
| `city` | Nombre que se muestra (si falta: el nombre de la carpeta) |
| `country` | Código ISO2 para la bandera (si falta, se hereda del show de esa ciudad) |
| `date` | Fecha que aparece en el lightbox |
| `order` | Menor = aparece antes en el carrusel |
| `cover` | Foto de tapa (si falta: la primera) |

Formatos de imagen: `jpg`, `jpeg`, `png`, `webp`, `avif`, `gif`, `tiff`.
Podés anidar subcarpetas dentro de la ciudad si querés organizar por fecha; se
respetan en el orden.

**Derechos y peso:** las fotos se versionan en git. Bajalas a ~2000 px de ancho
antes de subirlas para no inflar el repo (la optimización a WebP es automática).

---

## 2) Shows

```
content/shows/temple-caba/
  show.json
  hero.jpg        ← la que aparece al pasar el mouse por la fila
```

`show.json` (schema Zod en `src/lib/content.ts` → `ShowSchema`):

```json
{
  "venue": "Temple",
  "city": "CABA",
  "country": "AR",
  "date": "2026-06-27",
  "instagram": "https://www.instagram.com/club.temple/",
  "galleryUrl": null,
  "hero": "hero.jpg",
  "featured": false
}
```

- Si no ponés `hero`, se usa la primera imagen de la carpeta.
- `featured: true` muestra el badge en la lista.
- `draft: true` (opcional) saca el show del sitio sin borrarlo.
- `needsReview` es interno (nunca se renderiza).

Con CLI: `pnpm add:show` crea la carpeta, copia la foto y escribe el JSON.

---

## 3) Temas (canciones / sets / mixes)

```
content/songs/beach-groove-126/
  track.json
  beach-groove-126.wav
  cover.jpg
```

```json
{
  "title": "Beach Groove",
  "artist": "Tommy Petersen",
  "type": "track",
  "audio": "beach-groove-126.wav",
  "cover": "cover.jpg",
  "bpm": 126,
  "key": "Fm",
  "date": "2026-01-15",
  "genres": ["Tribal House", "House"],
  "colorAccent": "#FF2E93",
  "links": { "soundcloud": null, "spotify": null, "beatport": null }
}
```

- El **id** del tema es el nombre de la carpeta.
- Si no ponés `audio`/`cover`, se usan el primer audio y la primera imagen que
  haya en la carpeta.
- La **waveform** se calcula sola: WAV se lee con JS; MP3, M4A, FLAC, OGG…
  necesitan **ffmpeg** (los runners de GitHub Actions ya lo traen; local:
  `brew install ffmpeg`, `apt install ffmpeg` o `FFMPEG_PATH=/ruta/a/ffmpeg`).
  Si no hay ffmpeg, el tema queda sin peaks y la tarjeta usa su waveform
  decorativa (no se rompe nada). Los peaks se guardan si corrés
  `pnpm gen:waveform`; si no, se calculan en memoria durante el build.
- **Sin audio propio**: si el tema vive en SoundCloud/Spotify/Beatport, dejá la
  carpeta sin audio y usá:
  - `"embedUrl": "https://soundcloud.com/…"` → reproductor oficial embebido en
    la tarjeta (el iframe se carga al hacer clic).
  - `"links": { "soundcloud": …, "spotify": …, "beatport": …, "youtube": … }`
    → botones "Escuchar en…".
  Estos temas **no** entran a la cola del player del sitio (no hay archivo que
  reproducir), así que `next/prev` nunca cae en un tema mudo.
- `type`: `track` | `set` | `mix`. `draft: true` lo oculta.
- Los audios LARGO plazo conviene servirlos desde un bucket
  (`NEXT_PUBLIC_MEDIA_BASE_URL`) — ver más abajo.

Con CLI: `pnpm add:track`.

---

## 4) Videos

### ¿Video con audio adentro o video y audio por separado?

**Un solo archivo, con el audio adentro.** El sitio no tiene un campo para una
pista de audio externa: reproduce el archivo con su propio sonido (y cuando
abrís el modo cine, el player del sitio se baja solo para que se escuche el
video). Si grabaste video y audio por separado, se unen en **un** MP4 con
ffmpeg antes de subirlo (receta más abajo).

```
content/videos/live-le-fleurus-paris/
  video.json        ← los datos
  set-vivo.mp4      ← el video CON su audio adentro
  poster.jpg        ← la miniatura (la genera ffmpeg o la sacás vos)
  preview.mp4       ← opcional: loop de 3-6 s sin audio para el hover
```

```json
{
  "title": "Live @ Le Fleurus Paris",
  "src": "set-vivo.mp4",
  "youtubeId": null,
  "poster": "poster.jpg",
  "previewSrc": "preview.mp4",
  "date": "2025-09-12",
  "venue": "Le Fleurus",
  "colorAccent": "#FF2E93"
}
```

- `src` puede ser un archivo dentro de la carpeta (`"set-vivo.mp4"`), una ruta
  absoluta del sitio (`/media/...`) o una URL de bucket. Con `youtubeId` se usa
  el facade de YouTube (ahí no subís archivo).
- `previewSrc` es **opcional**: loop corto y **sin audio** para el hover (en la
  grilla suena en mute igual). Si falta, se usa el video completo.
- `poster` es **opcional**: si no lo ponés, se usa la primera imagen de la
  carpeta.
- `draft: true` lo oculta (útil si todavía no tenés el archivo ni el ID).
- Un MP4 de más de ~100 MB: mejor a un bucket (GitHub Pages tiene límites).

### Recetas con ffmpeg

```bash
# 1) Unir video + audio separados en UN mp4 (audio del mixer, video de cámara)
ffmpeg -i video.mp4 -i audio.wav \
  -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 256k -shortest set-vivo.mp4

# 2) Recomendado para subir: 1080p H.264 + AAC, listo para web (faststart)
ffmpeg -i original.mov -c:v libx264 -crf 20 -preset slow -vf scale=1920:-2 \
  -c:a aac -b:a 256k -movflags +faststart set-vivo.mp4

# 3) Poster (miniatura)
ffmpeg -ss 00:00:01 -i set-vivo.mp4 -vframes 1 poster.jpg

# 4) Preview de 5 s para el hover (sin audio)
ffmpeg -ss 00:00:02 -t 5 -i set-vivo.mp4 -an -vf scale=640:-2 -c:v libx264 -crf 28 preview.mp4

# 5) (Opcional) HLS para sets largos: playlist + segmentos en la misma carpeta
ffmpeg -i set-vivo.mp4 -c:v libx264 -crf 22 -c:a aac -hls_time 6 \
  -hls_playlist_type vod -hls_segment_filename "seg-%03d.ts" stream.m3u8
#    → en el JSON: "src": "stream.m3u8"  (los .ts se copian solos; dejá los
#      nombres de los segmentos en minúsculas y sin espacios, tal como los
#      escribe ffmpeg)
```

### Formatos y tamaños

| Qué | Formato recomendado | Nota |
|---|---|---|
| Video | **MP4 (H.264 + AAC)** | `webm` y `mov` también se copian; `mkv` no lo reproduce el navegador |
| Resolución | 1080p (1920 px de ancho) | 4K pesa mucho y no se nota en la card |
| Peso | ideal < 100 MB | si pesa más: bucket (`NEXT_PUBLIC_MEDIA_BASE_URL`) |
| Poster | JPG/PNG, 16:9 | se optimiza a WebP 1600 px + mini |
| Preview | MP4 corto (3-6 s), sin audio | opcional |
| HLS (opcional) | `.m3u8` + segmentos `.ts` | para sets largos |

### Si el video no tiene audio

Funciona igual (se ve en silencio). Si querés que *suene* algo mientras tanto,
subí por separado ese audio como tema en `content/songs/` — pero ojo: se
reproduce en el player del sitio por su cuenta, **no sincronizado** con el
video. Si necesitás video mudo + audio propio sincronizado, avisá y se agrega.

Con CLI: `pnpm add:video` (crea la carpeta, copia el video, y genera poster y
preview con ffmpeg si está instalado).

---

## 5) Foto del hero

La tarjeta del hero (al lado de "TOMMY PETERSEN") sigue usando
`public/media/images/hero/hero.webp`. Para cambiarla:

1. Poné la foto nueva en `media-src/images/hero/hero.jpg` (vertical 3:4 o 4:5).
2. `pnpm optimize:images` → regenera `public/media/images/hero/hero.webp`.
3. Commit y push.

El texto alternativo está en `HERO_PHOTO.alt` (`src/components/hero/Hero.tsx`).

---

## 6) Cómo funciona la media (para entender, no hace falta tocarlo)

El sitio es **estático** (`output: "export"`): Next sólo puede servir archivos
que estén en `public/`. Por eso `scripts/sync-media.ts` copia cada imagen de
`content/` a:

```
content/gallery/tandil/01.jpg
        ↓  pnpm sync:media
public/media/content/gallery/tandil/01.webp        (optimizada, máx 1920 px)
public/media/content/gallery/tandil/01-thumb.webp  (mini, para grillas)
```

- Las reglas de nombres viven en `src/lib/content-media.ts` y las usan **los
  loaders y el script**, así que nunca se desincronizan.
- Audio y video se copian tal cual (no se reconvierten).
- `public/media/content/` es generado: no se versiona y se regenera en cada
  build. Si algo no aparece, corré `pnpm sync:media` (o mirá la consola: el
  loader avisa qué archivo falta).
- Con `NEXT_PUBLIC_MEDIA_BASE_URL=https://tu-bucket` la media se sirve desde el
  bucket (`https://bucket/content/...`): subí ahí el contenido de
  `public/media/` tal cual.

## 7) Formatos y límites

| Qué | Válido |
|---|---|
| Imágenes | jpg, jpeg, png, webp, avif, gif, tiff → se convierten a WebP |
| Audio | wav, mp3, m4a, aac, ogg, opus, flac, aiff (peaks de MP3/M4A/etc. requieren ffmpeg) |
| Video | mp4, webm, mov, m4v, ogv, m3u8, mkv (+ segmentos .ts/.m4s de un HLS) |

Si una imagen no se puede leer (HEIC, por ejemplo), `sync:media` avisa y la
saltea: pasala a JPG/PNG/WebP.

---

## Errores de contenido: local vs CI

Una carpeta con problemas **no borra el sitio en tu compu**: la consola avisa
qué carpeta y qué campo falla, y ese item se omite.

- `⚠️  content/shows/temple-caba/show.json no valida → city: Required`
- `⚠️  content/songs/mi-tema/ no tiene track.json …`
- `⚠️  falta public/media/content/… — corré "pnpm sync:media"`

En **CI** (GitHub Actions, Vercel…) ese mismo problema **falla el build**, así
un JSON roto nunca llega a producción. Escape hatch:
`ITL_ALLOW_INVALID_CONTENT=1 pnpm build`.

Casos que son solo advertencia (no frenan nada): una carpeta de galería que
todavía no tiene fotos, y una carpeta con varios JSON (se usa el primero y se
avisa cuál).

## Scripts útiles

```bash
pnpm dev                # sitio + watcher de content/ (soltás fotos y aparecen)
pnpm build              # sync:media + next build (export estático)
pnpm sync:media         # optimiza imágenes / copia media pendiente
pnpm sync:media --force # regenera TODO (útil si cambiaste los tamaños)
pnpm add:track          # CLI: crea content/songs/<id>/ con audio, cover y JSON
pnpm add:show           # CLI: crea content/shows/<id>/ con hero y JSON
pnpm add:video          # CLI: crea content/videos/<id>/ con poster/preview y JSON
pnpm gen:waveform       # escribe los peaks en los song.json (los WAV ya se calculan solos)
pnpm optimize:images    # solo hero/brand de media-src/ → public/media/
pnpm migrate:content    # migra contenido del formato viejo (JSON suelto) al nuevo
```

## Audios: git, git-lfs o bucket

Por defecto `content/songs/<tema>/*.mp3|wav` **se versiona** (el build necesita
los archivos). Si tenés sets pesados:

1. Bucket/CDN (recomendado): subí el audio y poné la URL en `"audio"` (o seteá
   `NEXT_PUBLIC_MEDIA_BASE_URL` y subí el contenido de `public/media/`).
2. Git-lfs: `git lfs track "content/songs/**/*.wav"`.
3. No versionarlos: descomentá las líneas de audio en `.gitignore` (ojo: el
   build local y el deploy necesitan el archivo de todas formas).

## Migración desde el formato viejo

Si venías del formato plano (`content/shows.json`, `content/tracks/*.json`,
`content/videos/*.json`), corré:

```bash
pnpm migrate:content
```

Crea las carpetas por item, mueve los archivos que cada JSON referenciaba
(audio, cover, poster) desde `public/media/` a la carpeta del item y borra los
archivos viejos (quedan en el historial de git). Es idempotente: no pisa nada.

## Validación Zod

`src/lib/content.ts` valida todo en build y avisa por consola:

- `TrackSchema`: title, artist, type, audio, embedUrl, cover, bpm (60-200),
  key, duration, date, genres, colorAccent, links, waveformPeaks, draft.
- `ShowSchema`: venue, city, country, date, instagram, galleryUrl, hero,
  featured, needsReview, draft.
- `VideoSchema`: title, src, youtubeId, poster, previewSrc, date, venue,
  colorAccent, draft.
- `GalleryCitySchema` (`_city.json`): city, country, date, order, description, cover.

Si un JSON no valida, ese item se saltea con un aviso claro (el resto del sitio
sigue andando). Si falta una imagen o un cover, la UI usa su fallback visual.
