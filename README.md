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

### Canción / set — 2 minutos

```bash
pnpm add:track
# Te pregunta: título, ID, BPM, key, géneros, color, links SoundCloud/Spotify/Beatport
# Busca audio en media-src/audio/tracks/{id}.wav|mp3 y cover en media-src/covers/{id}.jpg
# Optimiza: copia audio a public/media/audio, cover a WebP 800x800 + thumb 200 + waveform peaks 120
# Escribe content/tracks/{id}.json validado Zod
```

**Importante derechos:** solo producción propia o con permiso. Sets con tracks de terceros mejor como embed SoundCloud/YouTube (el audio reactivo real solo funciona con archivos propios por CORS).

### Video — 2 minutos

```bash
pnpm add:video
# Pide: título, ID, venue, fecha, YouTube ID, ruta video local
# Copia video a public/media/video/{id}.mp4
# Genera poster ffmpeg -ss 1 + preview 5s loop + optimiza WebP 1280x720
# Escribe content/videos/{id}.json
# Manual: src puede ser video/mi-video.mp4 o youtubeId, poster en media-src/images/posters/
```

### Show — 2 minutos

```bash
pnpm add:show
# Pide: venue, ciudad, país, fecha, IG, gallery URL, featured, ID
# Busca foto en media-src/images/shows/{id}.jpg -> optimiza WebP 800x600
# Append a content/shows.json sort fecha desc
# Manual: editá content/shows.json array directo
```

Ver guía completa: `docs/CONTENT-GUIDE.md`

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

- **Fase 0 ✅** scaffold, tooling, CI, Dockerfile, Zod content, i18n ES/EN always
- **Fase 1 ✅** sistema visual completo: HeroShader canvas2D+R3F, SplitText, CursorBlob audio-reactive, Marquee BPM, Grain, Header+Menu curtain, Lenis+ScrollTrigger
- **Fase 2 ✅** AudioEngine + player global persistente + Modo Club: Vinyl jog scratch, Waveform seek, Media Session, crossfade, favs, shuffle, 3 demos WAV tribales, ClubModeToggle+Effect, ScreenShake beat
- **Fase 3 ✅** videos Modo Cine: VideoStore, VideoCard preview scrub distortion, useHLS dynamic, Ambilight canvas, VideoControls PiP/Fullscreen, CineMode Flip letterbox ducking, 4 demos
- **Fase 4 ✅** shows/mapa/galerías/pads/física/easter eggs: ShowsList filtros Flip + floating photo, MapRoute SVG animada, GalleryCarousel drag inertia tilt 3D + lightbox, PadsSection 8 pads Web Audio + crossfader + visualizer, TribalPhysics canvas + Matter.js dynamic, Konami rave confetti + Screensaver 30s + Counters reales, 404 visualizer
- **Fase 5 ✅** booking + SEO + CLI: robots.txt + sitemap.xml dinámico + OG edge 1200x630 + icon 32x32 + JSON-LD MusicGroup/MusicRecording + BookingForm Zod honeypot webhook mailto fallback + Newsletter Zod + /api/booking /api/newsletter + cli.ts helpers + add-track/add-video/add-show/gen-waveform/optimize-images scripts + docs/CONTENT-GUIDE.md + metadataBase openGraph twitter alternates hreflang — Build 30.7kB /[locale] 166kB First Load
- **Fase 6** a11y focus visible contrast keyboard, Lighthouse ≥85/95, responsive 360/768/1440, bundle analyzer, press kit PDF, Vercel+Docker verify

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
