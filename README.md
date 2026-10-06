# In The Loop Agency — Tommy Petersen

Sitio web del DJ y productor **Tommy Petersen** (Tribal House / House / Latin grooves, Argentina). Reemplazo de https://www.intheloop.agency/ — experiencia flashera, audio-reactiva, con player global persistente, modo cine para videos, mapa de shows, pads sampler y física tribal.

> **Stack:** Next.js 15 App Router + React 19 + TypeScript + Tailwind v4 + next-intl (ES/EN) + Zustand + GSAP + Motion + Lenis + Three.js/R3F + Tone.js + Matter.js + Zod + Radix + Lucide.

---

## Quick start

```bash
# 1. Instalar
pnpm install

# 2. Dev (http://localhost:3000)
pnpm dev

# 3. Build + start
pnpm build
pnpm start

# 4. Lint + typecheck
pnpm lint
pnpm typecheck
```

**Requisitos:** Node 20+, pnpm 9+ (`corepack enable`).

---

## Estructura

```
content/              # JSON validado con Zod (tracks, videos, shows.json, site.json)
  tracks/_TEMPLATE.json
  videos/_TEMPLATE.json
  shows.json
  site.json
public/media/         # Generado (optimizado) - no editar a mano
  audio/ images/ video/
media-src/            # ORIGINALES que sube el cliente (no va a git)
  audio/tracks/ sets/ intro/
  video/live/ clips/ previews/
  images/hero/ shows/ about/ press/ galleries/
  covers/ brand/
src/
  app/                # Next App Router, layout, page, globals.css, API routes
  components/
    enter/ hero/ player/ audio/ video/ shows/ gallery/ pads/ physics/ effects/ ui/
  lib/                # audio-engine, content (Zod), quality, media, motion
  stores/             # Zustand: player, quality, ui
  hooks/ i18n/ shaders/ styles/
messages/             # es.json / en.json (next-intl)
scripts/              # CLI: add:track, add:video, add:show, gen:waveform, optimize:images
docs/                 # BRIEF, PLAN, CHECKLIST
```

---

## Contenido — cómo agregar

Todo en `content/` validado con Zod (`src/lib/content.ts`). Para agregar:

### Canción / set

```bash
pnpm add:track
# Por ahora placeholder: copiá content/tracks/_TEMPLATE.json -> content/tracks/mi-tema.json
# Completá: id, title, bpm, key, genres, audioSrc, cover, links
# Audio original va a media-src/audio/tracks/mi-tema.wav
# Cover original a media-src/covers/mi-tema.jpg
# Luego pnpm optimize:images + pnpm gen:waveform (Fase 5)
```

**Importante derechos:** solo producción propia o con permiso. Sets con tracks de terceros mejor como embed SoundCloud/YouTube (el audio reactivo real solo funciona con archivos propios por CORS).

### Video

```bash
pnpm add:video
# Copiá content/videos/_TEMPLATE.json
# src puede ser /media/video/mi-video.mp4 o youtubeId
# Poster y previewSrc en media-src/video/...
```

### Show

```bash
pnpm add:show
# O editá content/shows.json directo (array, sort por fecha desc)
# Campos: id, venue, city, country, date (YYYY-MM-DD), instagram, galleryUrl, photo, featured, needsReview
```

### Media

- Originales pesados en `media-src/` (no se sube a git).
- Optimizados en `public/media/` (git-lfs o bucket).
- En producción, setear `NEXT_PUBLIC_MEDIA_BASE_URL=https://tu-bucket.r2.dev` y `getMediaUrl()` resuelve.

---

## Variables de entorno

Ver `.env.example`:

```env
NEXT_PUBLIC_MEDIA_BASE_URL= # bucket CDN para audio/video en prod (vacío = local)
BOOKING_WEBHOOK_URL=        # webhook n8n para formulario booking
NEWSLETTER_ENDPOINT=        # endpoint MailerLite / newsletter
```

Nunca commitear secretos. `.env` está en `.gitignore`.

---

## Deploy

### Vercel (recomendado)

1. Conectar repo en Vercel, framework Next.js.
2. Setear env vars.
3. Deploy automático en push a main.

### Docker / Coolify (VPS)

```bash
# Build standalone (next.config.ts output: "standalone")
pnpm build
# Dockerfile ya listo:
docker build -t intheloop .
docker run -p 3000:3000 --env-file .env intheloop
```

En Coolify: crear servicio Docker, apuntar al Dockerfile, setear env vars, puerto 3000.

### Bundle analyzer

```bash
pnpm analyze
```

---

## Calidad adaptativa

Tiers `High / Medium / Low` detectados con `detect-gpu` + `hardwareConcurrency` + `deviceMemory` + FPS medido 2.5s:

- **High:** shaders full-res, postprocessing, partículas masivas.
- **Medium:** res reducida, post liviano.
- **Low / prefers-reduced-motion / save-data:** solo CSS/GSAP, sin WebGL, igual lindo.

Toggle manual: `Efectos: Max / Normal / Mínimo` (guarda en localStorage `itl-quality`). WebGL/canvas pausados cuando fuera de viewport (`IntersectionObserver`) o tab hidden.

Objetivo: 60fps móvil medio en Medium, LCP <2.5s, contenido principal visible sin JS.

---

## Audio reactivo

`src/lib/audio-engine.ts` singleton:

- `AudioContext` se crea en gesto ENTER (desbloquea audio).
- `AnalyserNode` calcula bass/mid/high/level/beat cada frame.
- Publica CSS vars `--bass --mid --high --beat --level` y `--bass-wght` para variable fonts.
- Cuando no suena: idle pulse a 124 BPM.
- Suscripción: `audioEngine.subscribe(cb)`.
- Solo archivos propios (self-hosted) son analizables. Iframes SoundCloud/YouTube no (CORS) — documentado en UI.

---

## Roadmap fases

- **Fase 0 ✅** scaffold, tooling, CI, Dockerfile, Zod content, i18n
- **Fase 1** sistema visual, layout, hero, Lenis, cursor, ENTER
- **Fase 2** AudioEngine + player global + reactive + Modo Club
- **Fase 3** videos Modo Cine (Flip, letterbox, ambilight, HLS, PiP)
- **Fase 4** shows/mapa/galerías, pads Tone.js, física Matter.js, easter eggs
- **Fase 5** booking, newsletter, SEO, scripts CLI, CMS opcional
- **Fase 6** a11y, perf, tests responsive, bundle

---

## Accesibilidad y seguridad

- Nada >3 flashes/segundo. `prefers-reduced-motion` y Low tier eliminan strobes/shake.
- Contraste, focus visible, navegación teclado, alt reales, aria-live player.
- Audio opt-in, mute global siempre accesible.
- Headers seguridad (nosniff, etc), `rel="noopener noreferrer"`, sin secretos en repo.

---

## Checklist cliente

Ver `docs/CHECKLIST-CLIENTE.md` y `content/shows.json` campo `needsReview` para nombres dudosos.

---

## Licencias

- GSAP free (sin Club). Si tenés Club, instalar plugins pagos desde registro privado GreenSock y habilitar en `src/lib/motion.ts`.
- No usar audio/video/imágenes con copyright de terceros sin permiso.
