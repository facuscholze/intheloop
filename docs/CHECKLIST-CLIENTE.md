# Checklist de datos — Tommy Petersen / In The Loop Agency

Pendientes que **el cliente** tiene que confirmar o completar. El sitio no
inventa datos: mientras falte información, se muestra lo seguro y este
archivo es la única lista interna (no se renderiza en la UI pública).

## Videos

- [ ] **Temple CABA** — falta el ID real de YouTube. El JSON
      (`content/videos/temple-caba.json`) tenía un ID de demo (`dQw4w9WgXcQ`)
      y quedó marcado `draft: true` (no se publica) hasta tener el ID real.
- [ ] Confirmar IDs/archivos reales de los demás videos
      (`live-le-fleurus-paris`, `pirata-berlin`, `sundowner-colonia`):
      hoy se muestran como tarjetas con visualizador, sin material.

## Shows (content/shows.json)

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

## Fotos y media (media-src/)

- [ ] Foto hero real (`media-src/images/hero/`) — hoy se muestra una
      composición de marca.
- [ ] Fotos de shows (`media-src/images/shows/<id>.jpg`).
- [ ] Fotos de galerías (`media-src/images/galleries/`).
- [ ] Posters de videos (`media-src/video/` + `images/posters/`).

## Press kit

- [ ] PDF oficial en `media-src/press/tommy-petersen-press-kit.pdf`
      (hoy se genera un TXT con bio + stats).
- [ ] ZIP de fotos HD (`press/images.zip`, `press/press-kit-complete.zip`).

> Los contadores públicos (shows, países, rango de años) se calculan
> automáticamente desde `content/shows.json` — al cargar shows nuevos se
> actualizan solos.
