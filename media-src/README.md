# media-src/ — ORIGINALES PESADOS (hero, brand, press)

⚠️ **El contenido de las secciones (galería, shows, temas, videos) ya no va acá:
cada cosa vive en su carpeta de `content/`.** Ver `content/README.md`.
Esta carpeta queda para lo que no es contenido — la foto del hero, el logo y el
material de prensa.

Soltá acá los ORIGINALES (los mejores que tengas): no hace falta optimizarlos ni
renombrarlos perfecto, los scripts los procesan y los copian a `public/media/`.
Esta carpeta NO se sube a git (ver .gitignore).

## Dónde va cada cosa
| Carpeta | Qué poner | Formato ideal |
|---|---|---|
| `audio/tracks/` | Producciones propias de Tommy (temas) | WAV o MP3 320 kbps |
| `audio/sets/` | Sets/mixes (solo si todo lo que suena tiene permiso; si no, va como link de SoundCloud) | MP3 320 kbps / WAV |
| `audio/intro/` | Sonido de entrada o ambiente (opcional, corto, loopeable) | MP3 / WAV |
| `video/live/` | Videos de shows/sets en vivo | MP4 (H.264), hasta 1080p, horizontal o vertical |
| `video/clips/` | Aftermovies, reels, clips | MP4 (H.264) |
| `video/previews/` | Loops cortos (3–6 s) para el hover de cada card (opcional: si no hay, se generan del video) | MP4/WebM |
| `images/hero/` | Fotos principales del artista (las mejores, alta resolución) | JPG/PNG/WebP, 2500 px+ de ancho |
| `images/shows/` | Una foto por show/venue | JPG/PNG/WebP |
| `images/about/` | Fotos para la bio | JPG/PNG/WebP |
| `images/press/` | Fotos de prensa / press kit | JPG/PNG |
| `images/galleries/<ciudad>/` | Galerías por ciudad/país (podés crear más carpetas) | JPG/PNG/WebP |
| `covers/` | Portadas de temas/sets (cuadradas) | JPG/PNG 1400×1400 mínimo |
| `brand/` | Logo (idealmente SVG o PNG transparente), paleta de colores, tipografías si tienen | SVG/PNG |

## Cómo nombrar (simple)
- Todo en minúsculas, sin espacios ni tildes, con guiones: `sunset-session-2026.mp4`
- Si es un tema: `titulo-del-tema.wav` y su portada con el mismo nombre: `titulo-del-tema.jpg` en `covers/`
- Si es un show: `fecha-venue.jpg`, ej: `2025-09-12-le-fleurus.jpg`

## Importante
- **Derechos:** subí audio solo si es producción propia de Tommy o tiene permiso. Los sets con temas de otros artistas, mejor como link/embed.
- **Peso:** no hay problema con archivos grandes acá; se comprimen después.
- Si tenés dudas de dónde va algo, ponelo en `media-src/_sin-clasificar/` y Claude Code lo ubica.
