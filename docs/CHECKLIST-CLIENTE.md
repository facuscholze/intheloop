# Checklist de datos — Tommy Petersen / In The Loop Agency

Pendientes que **el cliente** tiene que confirmar o completar. El sitio no
inventa datos: mientras falte información, se muestra lo seguro y este
archivo es la única lista interna (no se renderiza en la UI pública).

## Videos

- [ ] **Temple CABA** — falta el ID real de YouTube. El JSON
      (`content/videos/temple-caba/video.json`) tenía un ID de demo (`dQw4w9WgXcQ`)
      y quedó marcado `draft: true` (no se publica) hasta tener el ID real.
- [ ] Confirmar IDs/archivos reales de los demás videos
      (`live-le-fleurus-paris`, `pirata-berlin`, `sundowner-colonia`):
      hoy se muestran como tarjetas con visualizador, sin material.

## Shows (content/shows/<show>/show.json)

- [ ] **Ciudades faltantes** (hoy se muestra solo el país):
      - `despues-cosmosolar` (Después — Cosmosolar y Vicky Jauregui)
      - `eventos-privados`
- [ ] **City Lounge (CZ)** — el campo ciudad dice "República Checa"
      (es el país, no la ciudad). Confirmar ciudad real.
- [ ] **Club Araoz (CABA)** — el Instagram linkeado parece ser el de City
      Lounge; confirmar handle correcto.
- [ ] Nombres a confirmar (antes traducidos automáticamente):
      - `nane-recoleta` — "Nane" (en el sitio viejo figuraba "Nombre")
      - `brothers-bar-tandil` — "Brothers Bar" (antes "Hermanos")
      - `glow-bar-tandil` — "Glow Bar" (antes "Brilla")
      - `call-me-fest-azul` — "Call Me Fest" (antes "¡Llámame!")
- [ ] `club-camboriu` — el sitio viejo decía "Carolina del Sur"; es
      Camboriú, Brasil (ya corregido en los datos, falta foto).

## Fotos y media (content/)

- [x] Foto hero real — cargada (`public/media/images/hero.jpg`, se muestra
      optimizada desde `public/media/images/hero/hero.webp`).
- [ ] Fotos hero de cada show → `content/shows/<show>/hero.jpg` (la del hover).
- [ ] Fotos de galerías → una carpeta por ciudad en `content/gallery/<ciudad>/`
      (las `paris` y `tandil` que hay hoy son de EJEMPLO, borrarlas al subir las reales).
- [ ] Posters de videos → `content/videos/<video>/poster.jpg`.

> Los contadores públicos (shows, países, rango de años) se calculan
> automáticamente desde las carpetas de `content/shows/` — al cargar shows
> nuevos se actualizan solos.
