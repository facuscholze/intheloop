# In The Loop Agency — Tommy Petersen

Sitio web del DJ y productor **Tommy Petersen** (Tribal House / House / Latin grooves, Argentina). Reemplazo de https://www.intheloop.agency/ — experiencia flashera, audio-reactiva, con player global persistente, modo cine para videos, mapa de shows y física tribal.

> **Stack:** Next.js 15 App Router + React 19 + TypeScript + Tailwind v4 + next-intl (ES/EN) + Zustand + GSAP + Motion + Lenis + Three.js/R3F + Matter.js + Zod + Radix + Lucide.

---

## Quick start

```bash
# 1. Instalar
pnpm install

# 2. Dev (http://localhost:3000)
pnpm dev

# 3. Build estático (genera out/) + preview local
pnpm build
pnpm preview   # sirve out/ en http://localhost:3000

# 4. Lint + typecheck
pnpm lint
pnpm typecheck
```

**Requisitos:** Node 20+, pnpm 9+ (`corepack enable`).

---

## Estructura

```
content/              # UNA CARPETA POR COSA (JSON + archivos + validación Zod)
  gallery/<ciudad>/   #   fotos sueltas → aparecen solas en GALLERY
  shows/<show>/       #   show.json + hero.jpg (foto del hover)
  songs/<tema>/       #   song.json + audio + cover.jpg
  videos/<video>/     #   video.json + poster.jpg (+ video)
  site.json           #   datos del artista / contacto
  */_TEMPLATE/        #   plantillas para copiar (las carpetas con _ se ignoran)
public/media/         # Generado - no editar a mano
  content/            #   derivado de content/ (WebP + thumbs) por `pnpm sync:media`
  images/hero/ ...    #   hero/press/brand desde media-src/
media-src/            # ORIGINALES pesados para hero/brand/press (no va a git)
  images/hero/ about/ press/
  brand/
src/
  app/                # Next App Router, layout, page, globals.css, API routes
  components/
    enter/ hero/ player/ audio/ video/ shows/ gallery/ physics/ effects/ ui/
  lib/                # audio-engine, content (Zod), quality, media, motion
  stores/             # Zustand: player, quality, ui
  hooks/ i18n/ shaders/ styles/
messages/             # es.json / en.json (next-intl)
scripts/              # sync-media (content → public/media), dev, migrate, CLI: add:track/add:video/add:show
docs/                 # BRIEF, PLAN, CHECKLIST
```

---

## Contenido — cada cosa en su carpeta

Todo vive en `content/` y se lee solo: **no hay que registrar nada en un índice**.
Cada item es una carpeta con su JSON y sus archivos (validado con Zod en `src/lib/content.ts`).

```
content/gallery/tandil/         01.jpg, 02.jpg…            → carrusel de GALLERY
content/shows/temple-caba/      show.json + hero.jpg       → fila del show + foto del hover
content/songs/beach-groove/     track.json + tema.wav + cover.jpg
content/videos/live-paris/      video.json + poster.jpg
```

```bash
pnpm dev        # sitio + watcher: soltás una foto en su carpeta y aparece sola
pnpm sync:media # optimiza las imágenes a public/media/content/ (WebP + minis)
```

- **Galería:** una carpeta por ciudad, adentro las fotos. Opcional `city.json`
  para forzar nombre/bandera/orden.
- **Show:** `show.json` + la foto `hero.jpg` (la del hover). Si no la nombrás
  `hero`, se usa la primera imagen de la carpeta.
- **Tema:** `track.json` + audio + cover. Los peaks y la duración se calculan
  solos (WAV siempre; MP3/M4A si hay ffmpeg). Sin audio propio, `embedUrl` de
  SoundCloud o los `links.*` se muestran como embed/botones en la tarjeta.
- **Video:** `video.json` + `poster.jpg` (+ mp4 si es self-hosted).

También hay CLI interactiva que crea la carpeta, copia los archivos y escribe el JSON:

```bash
pnpm add:track   # crea content/songs/<id>/ con audio + cover + track.json
pnpm add:show    # crea content/shows/<id>/ con hero + show.json
pnpm add:video   # crea content/videos/<id>/ con poster/preview + video.json
pnpm add:gallery # crea content/gallery/<ciudad>/ y copia las fotos que le pases
```

**Importante derechos:** solo producción propia o con permiso. Sets con tracks de terceros mejor como embed SoundCloud/YouTube (el audio reactivo real solo funciona con archivos propios por CORS).

Ver guía completa: `docs/CONTENT-GUIDE.md` · resumen para el artista: `content/README.md`

### Media

- Las imágenes de `content/` se optimizan a `public/media/content/` con
  `pnpm sync:media` (lo corren `pnpm dev` y `pnpm build` solos). Esa carpeta es
  generada y no se versiona.
- Originales pesados de hero/brand/press en `media-src/` (no se sube a git).
- En producción, setear `NEXT_PUBLIC_MEDIA_BASE_URL=https://tu-bucket.r2.dev` y `getMediaUrl()` resuelve (subí ahí `public/media/` tal cual).
- Un JSON inválido avisa por consola en local y **falla el build en CI**
  (`ITL_ALLOW_INVALID_CONTENT=1` para forzar uno permisivo).

---

## Variables de entorno

Ver `.env.example`:

```env
NEXT_PUBLIC_MEDIA_BASE_URL=       # bucket CDN para audio/video en prod (vacío = local)
NEXT_PUBLIC_BASE_PATH=            # prefijo de ruta si va en subdirectorio (ej. "/intheloop" en GitHub Pages)
NEXT_PUBLIC_SITE_URL=             # URL canónica para sitemap/OG (default https://www.intheloop.agency)
NEXT_PUBLIC_CONTACT_WEBHOOK_URL=  # webhook público n8n (ver docs/CONTACT-FORM.md)
```

Nunca commitear secretos. `.env` está en `.gitignore`.

---

## Deploy

El sitio se compila como **export estático** (`next.config.ts` → `output: "export"`, carpeta `out/`), así que sirve cualquier hosting estático.

### GitHub Pages

Deploy automático con el workflow `.github/workflows/deploy.yml`:

1. En el repo: **Settings → Pages → Source: GitHub Actions**.
2. Pushear a `main` (o correr el workflow manualmente desde la pestaña Actions).
3. En **Settings → Pages → Custom domain**, guardar `www.intheloop.agency`.
4. En el proveedor DNS, crear un registro **CNAME** con nombre `www` y destino `facuscholze.github.io` (sin `https://` ni rutas). Reemplazar cualquier registro conflictivo para `www`.
5. Cuando GitHub valide el DNS y emita el certificado, activar **Enforce HTTPS** en Pages.
6. El sitio queda en `https://www.intheloop.agency/`.

El workflow configura `NEXT_PUBLIC_BASE_PATH` vacío y `NEXT_PUBLIC_SITE_URL=https://www.intheloop.agency`. `public/CNAME` incluye el dominio en el export; con GitHub Actions, el custom domain también debe configurarse en Settings → Pages. No requiere API routes: contacto usa un webhook público n8n (ver docs/CONTACT-FORM.md).

Build local equivalente al deploy:

```bash
NEXT_PUBLIC_BASE_PATH= NEXT_PUBLIC_SITE_URL=https://www.intheloop.agency pnpm build
# El sitio estático queda en out/
```

> El cambio del workflow debe integrarse a `main` para que el próximo deploy use el dominio nuevo. No configurar el CNAME de `www` hacia `intheloop.agency`: debe apuntar directamente a `facuscholze.github.io`.

### Vercel / Netlify / cualquier estático

1. Conectar repo, framework Next.js (build `pnpm build`, output `out/`).
2. Setear env vars si hace falta.
3. Deploy automático en push a main.

### Docker / Coolify (VPS)

```bash
# Build estático (output/ sirve con cualquier servidor de archivos)
pnpm build
docker build -t intheloop .
docker run -p 3000:3000 intheloop
```

> El `Dockerfile` actual es de la época standalone; para servir `out/` alcanza con cualquier servidor de archivos estáticos (nginx, `serve`, etc.).

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
- **Fase 6 ✅** a11y + perf + responsive + deploy: skip link + main landmark, focus visible lime 3px, contraste AA fg-muted #a8a6b0 7.2:1 fg-dim #6e6c78 4.8:1, touch 44px min, keyboard Tab/Esc focus trap Menu dialog, aria labels roles live, reduced-motion disable flashes <3Hz FIXED rave 0.1s 10Hz -> 0.6s 1.6Hz, Marquee pausa + IntersectionObserver, ClubMode safe flash, Player lucide icons progressbar, BookingForm fieldset labels htmlFor aria-invalid aria-describedby role alert, PerformanceMonitor dev LCP CLS FPS, 404 a11y, Hero dl dt dd, VideoCard role button keyboard, bundle 32.9kB /[locale] 171kB First Load analyzer .next/analyze/, responsive 360/768/1024/1440 safe areas 100svh, deploy Vercel + Dockerfile standalone Coolify verified, docs FASE6-REPORT WCAG checklist + perf Lighthouse 85/95 targets — Build final 32.9kB /[locale] 171kB

---

## Accesibilidad y seguridad

- **WCAG 2.1 AA:** skip link, focus visible lime 3px, contraste AA 7.2:1 / 4.8:1, touch 44px min, keyboard Tab/Esc focus trap Menu dialog restore focus, aria labels roles live regions, alt text, semantic main/nav/section/footer, fieldset legend, aria-invalid aria-describedby role alert, progressbar, marquee pause button.
- **Flashes <3Hz:** FIXED Konami rave 0.1s 10Hz violation -> 0.6s 1.6Hz safe, ClubMode beat flash Math.min(beat*0.1,0.08) 200ms max 2Hz, ScreenShake low tier disabled, prefers-reduced-motion disable all.
- **Audio:** opt-in ENTER desbloquea AudioContext, mute global siempre accesible Volume2/VolumeX, Media Session API, keyboard Space play/pause.
- **Headers seguridad:** X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, rel noopener noreferrer, sin secretos en repo.
- **Perf:** LCP <2.5s hero SSR sin JS, bundle 32.9kB /[locale] 171kB First Load, dynamic Three/Matter/Tone/HLS, IntersectionObserver pausa RAF fuera viewport, next/image avif/webp, font preconnect, grain 6%, 60fps Medium tier, PerformanceMonitor dev LCP CLS FPS.
- Ver reporte completo: `docs/FASE6-REPORT.md`

---

## Checklist cliente

Ver `docs/CHECKLIST-CLIENTE.md` y `needsReview` dentro de cada
`content/shows/<show>/show.json` para nombres dudosos.

---

## Licencias

- GSAP free (sin Club). Si tenés Club, instalar plugins pagos desde registro privado GreenSock y habilitar en `src/lib/motion.ts`.
- No usar audio/video/imágenes con copyright de terceros sin permiso.

### Guardados y eliminaciones desde Pages CMS

Las carpetas de shows, canciones y videos sin ficha JSON se consideran ítems
no publicados: se omiten con un aviso y sus archivos se conservan. Esto permite
subir media antes de guardar la ficha y eliminar fichas desde el CMS sin bloquear
el despliegue por los archivos residuales. Los JSON malformados, los datos que no
validan y las referencias rotas siguen siendo errores en CI.

Prueba de regresión: `pnpm exec tsx scripts/test-content-loaders.ts`.
