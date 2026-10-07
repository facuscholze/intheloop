# content/ — EL CONTENIDO DEL SITIO

Cada cosa vive en **su carpeta**, con sus archivos al lado. No hay que registrar
nada en ningún índice: los loaders (`src/lib/content.ts`) leen las carpetas solas.

```
content/
  gallery/<ciudad>/     🖼  fotos sueltas + city.json (opcional)
  shows/<show>/         📍 show.json + hero.jpg
  songs/<tema>/         🎵 track.json + audio + cover.jpg
  videos/<video>/       🎬 video.json + poster.jpg (+ el video si es self-hosted)
  site.json             datos del artista / contacto
```

Las carpetas y archivos que empiezan con `_` se ignoran (`_TEMPLATE`, por ejemplo).
Cada sección trae una carpeta `_TEMPLATE/` con un `LEEME.txt` y un JSON de ejemplo.

---

## Galería por ciudad (solo soltar fotos)

1. Creá `content/gallery/<ciudad>/` — el nombre de la carpeta es la ciudad
   (`tandil`, `caba`, `berlin`…).
2. Soltá las fotos adentro: `jpg`, `jpeg`, `png`, `webp`, `avif`.
   Se ordenan por nombre de archivo (`01.jpg`, `02.jpg`, … `10.jpg`).
   La primera es la tapa de la ciudad.
3. Opcional: `city.json` si querés fijar el nombre exacto, el país (bandera) o
   el orden en el carrusel:

```json
{ "city": "París", "country": "FR", "date": "2025-09-12", "order": 1, "cover": "03.jpg" }
```

Sin `city.json` la ciudad se llama como la carpeta, y si algún show es de esa
ciudad la galería hereda el país.

## Show

1. Copiá `content/shows/_TEMPLATE/` a `content/shows/<nombre-del-show>/`.
2. Completá `show.json` (venue, ciudad, país ISO2, fecha, Instagram…).
3. Soltá la **imagen hero** en la carpeta (`hero.jpg`). Es la foto que aparece
   al pasar el mouse por la fila. Si no la nombrás `hero`, se usa la primera
   imagen que haya.

## Tema (canción / set / mix)

1. Copiá `content/songs/_TEMPLATE/` a `content/songs/<nombre-del-tema>/`.
2. Soltá el audio (`wav`, `mp3`, `m4a`, `flac`, `ogg`…) y la portada
   (`cover.jpg`, o cualquier imagen: si no la nombrás, se usa la primera).
3. Completá `track.json`. Si no ponés `audio` ni `cover`, se usan los archivos
   que estén en la carpeta. La waveform se calcula sola: WAV se lee siempre;
   para MP3/M4A/FLAC hace falta `ffmpeg` instalado (si no está, la tarjeta usa
   una waveform decorativa y listo).

**¿El tema no tiene audio propio?** Dejá la carpeta sin audio y poné una de
estas dos cosas en el JSON: `embedUrl` (el link de SoundCloud → aparece el
reproductor oficial en la tarjeta) o `links.soundcloud/spotify/beatport` (→
quedan botones "Escuchar en…"). Así una canción tuya que vive en las
plataformas se muestra igual, sin prometer un play que no existe.

## Video

1. Copiá `content/videos/_TEMPLATE/` a `content/videos/<nombre-del-video>/`.
2. Soltá el video **en un solo archivo MP4 con el audio adentro** y, si tenés,
   `poster.jpg` (miniatura) y `preview.mp4` (loop corto de 3-6 s, sin audio,
   para el hover).
3. Completá `video.json` con el nombre del archivo en `"src"`. Si usás YouTube,
   dejá `src: null` y poné `youtubeId`.

**¿Grabaste video y audio por separado?** Se unen antes de subir, con una línea:

```bash
ffmpeg -i video.mp4 -i audio.wav -map 0:v:0 -map 1:a:0 \
  -c:v copy -c:a aac -b:a 256k -shortest mi-video.mp4
```

El sitio no tiene campo para una pista de audio aparte: suena el audio que trae
el MP4. Recomendado MP4 (H.264 + AAC) 1080p; si pesa más de 100 MB, bucket.

---

## Qué pasa por debajo

- `scripts/sync-media.ts` (`pnpm sync:media`) optimiza cada imagen a
  `public/media/content/<tipo>/<slug>/<nombre>.webp` + una versión mini
  (`-thumb.webp`), copia audios/videos tal cual y borra los derivados que ya no
  tienen origen. Es incremental: lo que está al día se saltea.
- **`pnpm dev` y `pnpm build` lo corren solos.** En `pnpm dev` además queda un
  watcher mirando `content/`: soltás una foto y aparece sin reiniciar nada.
- El sitio es estático (GitHub Pages): por eso lo que se sirve es siempre
  `public/media/content/...` (generado, no se versiona).

## ¿Dónde va el audio? (peso y git)

- Por defecto los audios se versionan en git (el build los necesita), pero si
  tenés temas pesados conviene un bucket: subilos a Cloudflare R2 / S3 y
  seteá `NEXT_PUBLIC_MEDIA_BASE_URL=https://tu-bucket.r2.dev`. El sitio resuelve
  las URLs solo.
- Si preferís no versionarlos, en `.gitignore` hay líneas comentadas listas
  para descomentar (`content/songs/**/*.mp3`, etc.) o podés usar git-lfs.

## Derechos

Subí audio solo si es producción propia o tenés permiso. Sets con temas de
terceros: mejor como embed de SoundCloud/YouTube.

## Si algo está mal escrito

- **En tu compu:** la consola te avisa (`⚠️ content/shows/<carpeta>/show.json
  no valida → city: Required`) y esa carpeta se saltea: el resto del sitio
  sigue andando.
- **En el deploy (CI):** ese mismo error **frena el build**, así nunca se
  publica un contenido roto. Si necesitás publicar igual, `ITL_ALLOW_INVALID_CONTENT=1`.

## Fotos de ejemplo

`content/gallery/paris/` y `content/gallery/tandil/` traen fotos de ejemplo
(gradientes generados, **no son fotos reales**) para que veas la galería
armada. Cuando subas las tuyas:

```bash
rm -rf content/gallery/paris content/gallery/tandil
```
