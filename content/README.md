# content/ — EL CONTENIDO DEL SITIO

Cada cosa vive en **su carpeta**, con sus archivos al lado. No hay que registrar
nada en ningún índice: los loaders (`src/lib/content.ts`) leen las carpetas solas.

```
content/
  gallery/<ciudad>/     🖼  fotos sueltas (una carpeta por ciudad)
  shows/<show>/         📍 show.json + hero.jpg
  songs/<tema>/         🎵 song.json + audio + cover.jpg
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
3. Opcional: `_city.json` si querés fijar el nombre exacto, el país (bandera) o
   el orden en el carrusel:

```json
{ "city": "París", "country": "FR", "date": "2025-09-12", "order": 1, "cover": "03.jpg" }
```

Sin `_city.json` la ciudad se llama como la carpeta, y si algún show es de esa
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
3. Completá `song.json`. Si no ponés `audio` ni `cover`, se usan los archivos
   que estén en la carpeta. Si el audio es **WAV**, los peaks de la waveform y
   la duración se calculan solos al cargar.

## Video

1. Copiá `content/videos/_TEMPLATE/` a `content/videos/<nombre-del-video>/`.
2. Soltá `poster.jpg` (miniatura) y, si es self-hosted, el `mp4`.
3. Completá `video.json`. Si usás YouTube, dejá `src: null` y poné `youtubeId`.
   Los MP4 de más de 100 MB conviene subirlos a un bucket.

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

## Derechos

Subí audio solo si es producción propia o tenés permiso. Sets con temas de
terceros: mejor como embed de SoundCloud/YouTube.

## Fotos de ejemplo

`content/gallery/paris/` y `content/gallery/tandil/` traen fotos de ejemplo
(gradientes generados, **no son fotos reales**) para que veas la galería
armada. Cuando subas las tuyas:

```bash
rm -rf content/gallery/paris content/gallery/tandil
```
