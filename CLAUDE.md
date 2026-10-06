# In The Loop — Tommy Petersen — CLAUDE / Agent Guide

**Leer primero:** `docs/BRIEF.md` (brief completo) y `docs/PLAN.md` (plan maestro Fase 0-6).

## Resumen proyecto

Sitio "bien loco, flashero" para DJ Tommy Petersen. Reemplaza builder MailerLite. Objetivos: booker contrata (CTA BOOK), escuchar música + ver videos inmersivo, artista agrega contenido fácil sin tocar código animaciones.

**Dirección creativa:** tribal/orgánico/latino + rave futurista. Fondo #07070A, acentos fuego #FF5A1F, magenta #FF2E93, lime #C8FF00 / dorado #FFD60A. Grain global, halos que laten, RGB-split, patrones tribales SVG. Tipografía display gigante variable (Syne) + sans legible (Space Grotesk) + mono (JetBrains Mono). Motion tokens: club 0.76,0,0.24,1; tribal elastic; duraciones 150/300/700/1200ms.

## Stack y propósito librerías

| Librería | Propósito | Carga |
|---|---|---|
| Next.js 15 App Router | Base SSR/SSG, API routes, standalone output | core |
| React 19 + TS strict | UI | core |
| Tailwind v4 | Styling, CSS vars, @property | core |
| next-intl 4 | i18n ES (default) / EN, hreflang, middleware | core |
| next/font | Fonts optimizadas (Syne variable para audio-reactive) | core, pero fallback CSS link en sandbox por bloqueo fonts.googleapis |
| Zustand 5 | Estado global player, quality, ui (ligero) | core |
| Lenis 1.3 | Smooth scroll, sync GSAP ScrollTrigger | dynamic client, en Providers |
| GSAP 3.13 + ScrollTrigger + CustomEase | Scroll pin, reveals, parallax, cortinas, motion tokens | core |
| GSAP Flip | Video modo cine vuelo al centro | dynamic en VideoGrid (Fase 3) |
| GSAP SplitText (Club) | Hero letras escalonadas | free fallback splitTextFallback en Fase 1 |
| GSAP Draggable + Inertia (Club) | Vinilo scratch, carrusel | dynamic Player + Gallery |
| GSAP ScrambleText (Club) | Nav scramble | dynamic nav |
| Motion 12 (framer-motion) | Layout transitions, gestures React, magnetic button | core UI |
| @use-gesture/react | Gestos avanzados tilt 3D, scrub preview | dynamic gallery/video |
| Three.js + @react-three/fiber + drei + postprocessing | Shaders fluido, partículas GPU, bloom/chromatic | dynamic High/Medium only, nunca bundle inicial |
| Matter.js | Física palabras TRIBAL/HOUSE | dynamic Physics section |
| lottie-react | Loaders, micro iconos | dynamic |
| Web Audio API nativa | AudioEngine base Analyser | nativa singleton |
| WaveSurfer.js / peaks precalc | Waveform visual | dynamic o canvas custom con peaks JSON |
| Tone.js | Sampler pads interactivos | dynamic PadsSection |
| hls.js | HLS adaptive video | dynamic Video player |
| Radix UI dialog/tooltip/tabs | A11y primitives CineMode | core |
| Lucide | Iconos | core |
| Zod | Validación content JSON | core |
| detect-gpu | Tier detection High/Med/Low | dynamic quality init |
| sharp | Optimización imágenes Node | build script |
| @next/bundle-analyzer | Analizar bundle | dev |
| Leva | Tweak shaders dev only | dev dynamic |
| Husky + lint-staged | Pre-commit lint+format | dev |

**Regla oro:** si solo sirve en una sección, `next/dynamic` + `import()` y no va al bundle inicial. Documentar uso y eliminar si no se usa.

## Comandos

```bash
pnpm dev              # localhost:3000
pnpm build            # next build (standalone)
pnpm start            # prod server
pnpm lint             # next lint
pnpm typecheck        # tsc --noEmit
pnpm format           # prettier
pnpm analyze          # ANALYZE=true build

pnpm add:track        # CLI agregar track (placeholder Fase 0, completo Fase 5)
pnpm add:video
pnpm add:show
pnpm gen:waveform
pnpm optimize:images
```

## Estructura carpetas

```
src/app/            layout, page, globals.css, providers, api/booking, api/newsletter
src/components/
  enter/ EnterScreen (EQ, AudioContext unlock, reduce-motion toggle)
  hero/ Hero (SplitText, shader placeholder)
  player/ (Fase 2) PlayerBar, Vinyl, Waveform
  audio/ AudioEngine singleton
  video/ (Fase 3) VideoCard, CineMode Flip, Ambilight
  shows/ ShowsList foto flotante, MapRoute SVG
  gallery/ Carousel, Lightbox
  pads/ PadsSection Tone.js
  physics/ TribalPhysics Matter.js
  effects/ CursorBlob, Grain, Marquee
  ui/ magnetic-button, etc
src/lib/ content.ts (Zod), media.ts (CDN resolver), motion.ts (GSAP registro), quality.ts, audio-engine.ts
src/stores/ playerStore, qualityStore, uiStore (persist localStorage)
src/hooks/ useLenis, useIntersectionPause
src/i18n/ routing, request
src/shaders/ glsl
src/styles/ tokens.css (CSS vars paleta + audio reactive + motion)
content/ tracks/*.json videos/*.json shows.json site.json (Zod)
public/media/ generado (git-lfs)
media-src/ originales (gitignored)
messages/ es.json en.json
scripts/ CLI
docs/ BRIEF, PLAN, CHECKLIST
```

## Convenciones animación

- **GSAP** para scroll, timelines complejas, Flip, Draggable, SplitText, ScrollTrigger. Usar `gsap.context()` para cleanup.
- **Motion** para layout React, gestures, magnetic button, AnimatePresence menu.
- **@use-gesture** para drag/tilt avanzado donde Motion no alcanza.
- **Three/R3F** solo para fondo shader y partículas, nunca para DOM.
- **CSS** para grain, halos, RGB-split fallback, scroll-driven animations progressive.
- Motion tokens en `tokens.css`: --ease-club, --ease-tribal, --ease-smooth, duraciones.
- Registrar GSAP en `src/lib/motion.ts` `registerGSAP()` una vez en Providers.
- CustomEase.create club/tribal/smooth/expo.

## Reglas performance

- Bundle inicial <150kb gz sin Three. Three chunk separado dynamic.
- `next/image` + sharp, priority solo hero.
- LCP: hero texto + CTA SSR sin JS, shader progressive enhancement.
- Lazy: videos, gallery, facade YouTube/SoundCloud.
- No audio/video pesados en repo, solo placeholders. Usar `NEXT_PUBLIC_MEDIA_BASE_URL`.
- Tiers High/Med/Low: detect-gpu + cores + mem + FPS 2.5s + prefers-reduced-motion + save-data. Toggle manual localStorage `itl-quality`.
- Pausar RAF/WebGL cuando fuera viewport (useIntersectionPause) o tab hidden (visibilitychange).
- Lenis + GSAP ticker: `gsap.ticker.add(lenis.raf)` y `ScrollTrigger.update`.
- Objetivo: 60fps móvil medio Medium, LCP <2.5s.

## Cómo agregar contenido

- JSON en `content/` validado Zod. Copiar `_TEMPLATE.json`.
- Audio original en `media-src/audio/tracks/`, cover en `media-src/covers/`.
- Video original en `media-src/video/`, poster en `media-src/images/`.
- Scripts `pnpm add:*` generan optimizados + waveform peaks + JSON.
- `getMediaUrl()` resuelve local vs CDN bucket.

## AudioEngine

Singleton `src/lib/audio-engine.ts`:

- init() en gesto ENTER, resume() desbloquea.
- connectMediaElement(audioEl, bpm) crea MediaElementSource -> Gain -> Analyser -> destination.
- Analyser fftSize 512, smoothing 0.8, bandas bass 0-8%, mid 8-40%, high resto.
- Beat detection simple: bass spike + threshold adaptivo + min interval 60%/bpm.
- Idle cuando no suena: sinusoidal 124 BPM.
- Publica CSS vars --bass --mid --high --beat --level --bass-wght.
- subscribe(cb) para WebGL uniforms.
- duck/unduck para CineMode.
- CORS: iframes no analizables, solo self-hosted.

## Calidad adaptativa

`src/lib/quality.ts` detectInitialTier() + measureFPS(). `src/stores/qualityStore` con init() y setTier(). `src/stores/uiStore` reducedMotion, clubMode, hasEntered, etc.

## i18n

next-intl, locales ["es","en"], default "es", prefix as-needed. Middleware en `src/middleware.ts`. Messages en `messages/`. `getLocale()` en layout server.

## SEO / Deploy

- next.config.ts standalone, optimizePackageImports, headers seguridad, remotePatterns images.
- Dockerfile multi-stage (deps, builder, runner) para Coolify.
- Vercel: conectar repo, env vars, deploy auto.
- CI: .github/workflows/ci.yml pnpm lint+typecheck+build.

## Estado fases

- Fase 0 ✅ scaffold, tooling, CI, Dockerfile, Zod, i18n, ENTER placeholder, Hero placeholder, quality, audio-engine, stores, cursor, grain, magnetic button
- Fase 1 TODO: shader fluido Three.js, SplitText real, Lenis polish, marquee, menu fullscreen curtain
- Fase 2 TODO: player global completo, waveform peaks, Media Session, audio reactive vars, Modo Club
- Fase 3 TODO: VideoGrid Flip, letterbox, ambilight, HLS, PiP/Fullscreen
- Fase 4 TODO: Shows foto flotante + filtros Flip, MapRoute MotionPath, Gallery carousel, Pads Tone.js, Physics Matter.js, easter eggs Konami, 404, screensaver
- Fase 5 TODO: booking form Zod + webhook, newsletter, sitemap, robots, OG dinámico, JSON-LD, scripts CLI completos
- Fase 6 TODO: a11y, perf Lighthouse ≥85/95, responsive 360/768/1440, bundle analyzer, docs finales

## Notas sandbox

- fonts.googleapis bloqueado en build (ECONNRESET) -> fallback CSS link runtime en layout.tsx, TODO restaurar next/font/google en prod Vercel.
- gsap/ClubPlugins no instalado (licencia) -> loadClubPlugins retorna null, warning ignorado.
- pnpm 9.12 en packageManager, pero corepack usa 12.9.1 en sandbox -> funciona, no bloquear.
