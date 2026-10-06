# In The Loop Agency — sitio de Tommy Petersen

LEER PRIMERO: `docs/BRIEF.md` (brief completo del proyecto). Ahí está el stack,
la dirección creativa, el player con audio reactivo, el modo cine para videos,
las fases de trabajo y las restricciones.

## Estructura del repo
- `media-src/` → originales que carga el cliente/dev (no van a git). Ver su README.
- `public/media/` → archivos optimizados generados desde `media-src/`.
- `content/` → datos (tracks, videos, shows.json, site.json). Validar con Zod.
- `scripts/` → scripts de procesamiento (optimizar imágenes, waveform, posters, add:track/video/show).
- `docs/` → documentación y checklist.

## Reglas
- Trabajar por fases y mostrar el plan antes de codear (ver BRIEF).
- No inventar datos del artista. `shows.json` tiene entradas con `needsReview` para confirmar con el cliente.
- Si `media-src/` está vacío en alguna carpeta, usar placeholders visuales y avisar qué falta.
- Actualizar este archivo con comandos, convenciones y decisiones a medida que el proyecto avance.
