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
- Fase 1 ✅ sistema visual completo: HeroShader canvas 2D + R3F GLSL, Hero cinético SplitText, CursorBlob estela audio-reactive, Marquee infinito BPM+scroll+beat, Grain, Header+Menu curtain, Lenis+ScrollTrigger, i18n always /es /en
- Fase 2 ✅ AudioEngine + player global + Modo Club:
  - PlayerProvider: audio element crossOrigin anonymous, connectMediaElement(bpm), timeupdate, ended -> next, volume, play/pause, keyboard shortcuts Space/Cmd+Arrow, Media Session API (metadata + handlers)
  - Vinyl: rotationRef RAF 0.5+bass*1.5 + progress*720deg, scale 1+beat*0.05, beat pulse ring, draggable scratch (mouse/touch angle delta -> audio.currentTime), GSAP scale elastic
  - Waveform: canvas 2D bar peaks (120 points), barHeight peak*h*(0.6+bass*0.4+beat), played color accent + shadowBlur beat, progress indicator, seek via mouse/touch drag, data-cursor drag
  - MiniWaveform for bar
  - PlayerBar fixed bottom: vinyl 48px, title/bpm/key/genres, MiniWaveform, prev/play/next, volume range, expand toggle, progress bar 0.5px bottom, boxShadow bass reactive
  - PlayerExpanded fullscreen: vinyl 280px, title, bpm/key, fav/shuffle/repeat toggles (Zustand persist), Waveform 80px height seek, queue list with current highlight + pulse, favs, audio reactive debug (bass/mid/high)
  - MusicSection client: setQueue(tracks) on mount, playTrack(track,tracks), cards con cover, eq animation when current+playing, waveform 40 bars beat scale, glow radial con bass, hover scale 1.02, data-cursor play
  - 3 demo tracks generados via scripts/gen-sample-audio.ts: WAV mono 22kHz 8s ~345KB, tribal kick + shaker 16th + bassline pattern + conga + mel texture, peaks 120, JSON con bpm/key/colorAccent/waveformPeaks, audioSrc audio/*.wav
  - ClubModeToggle fixed bottom-right sobre player, ClubModeEffect overlay black 0.7-bass*0.3 + vignette + beat flash fire mix-blend-screen, .club-mode filter brightness 0.6 contrast 1.2
  - ScreenShake: on beat>0.85 && bass>0.5, translate random intensity (beat-0.85)*bass*4 *3px, 80ms reset, disabled Low/reducedMotion
  - Layout: Grain+Cursor+ScreenShake+ClubModeEffect+Enter+Header+Menu+ClubToggle+Player en [locale]/layout para persistencia
  - Build verde 6.56 kB /[locale] (reducido por code splitting), lint warnings fixed
  - .gitattributes LFS comentado para demo audios pequeños, prod usar bucket NEXT_PUBLIC_MEDIA_BASE_URL
- Fase 3 ✅ Videos Modo Cine:
  - VideoStore Zustand: activeVideo, activeElement, isCineMode, openVideo(video,element), closeVideo()
  - VideoCard: IntersectionObserver via useIntersectionPause, preview loop muted autoplay when isVisible && isHovered, scrub X mouse -> preview.currentTime = x*duration, distortion shader overlay SVG feTurbulence+feDisplacementMap scale bass*10, RGB-split bass translate, glow radial colorAccent, beat scale, data-cursor view, YouTube facade thumbnail hqdefault.jpg + black overlay, placeholder gradient + waveform simulated when no src
  - VideoGrid: grid md 2 cols, empty state dashed border
  - useHLS hook: dynamic import hls.js, Hls.isSupported() loadSource + attachMedia, fallback native HLS, cleanup destroy
  - Ambilight: canvas low res w/4 h/4, drawImage video 0,0,w,h + filter blur 40px saturate 1.5 brightness 1.2, RAF loop when !paused, resize handler, disabled Low tier
  - VideoControls: timeupdate, loadedmetadata, play/pause, seek range, volume range, fullscreen API, PiP API, formatTime, title, progress tooltip
  - CineMode: Flip animation custom (GSAP timeline): overlay opacity 0->1 0.4s, container x/y/width/height from cardRect to 100vw/100vh borderRadius 1.5rem->0 0.8s club ease, filter blur 10px hue-rotate 90deg -> 0, letterbox top/bottom y -100%/100% ->0 0.6s club delay 0.3s, chromatic portal gradient overlay, Ambilight background + backdrop-blur 20px + black/60, ducking audioEngine.duck(0.12) open + unduck(1,0.6) close, body overflow hidden, close handlers: X button, Esc key, click outside overlay, swipe down touch >100px, reverse animation y letterbox, onComplete closeVideo + setCineMode false
  - HLS support + YouTube iframe autoplay modestbranding, placeholder UI when no src with instructions media-src/video/live
  - Radix not needed yet but aria-modal dialog, focus trap TODO Phase 5 polish, close aria-label
  - 4 demo videos JSON via gen-sample-videos.ts: le-fleurus, sundowner, pirata, temple (youtubeId demo), colorAccent fire/magenta/lime/violet, src null placeholder
  - Integration: CineMode in [locale]/layout persistente, VideoGrid in page, docs Modo Cine en UI
  - Build verde 7.9 kB /[locale] (aumentó por video components), lint warnings fixed
- Fase 4 TODO: Shows foto flotante + filtros Flip, MapRoute MotionPath DrawSVG, Gallery carousel Draggable/Inertia, Pads Tone.js, Physics Matter.js, easter eggs Konami, 404 interactiva, screensaver
- Fase 5 TODO: booking form Zod + webhook + mailto, newsletter, sitemap, robots, OG dinámico, JSON-LD, scripts CLI completos
- Fase 6 TODO: a11y, perf Lighthouse ≥85/95, responsive 360/768/1440, bundle analyzer

## Notas sandbox

- fonts.googleapis bloqueado -> fallback CSS link runtime en [locale]/layout
- gsap/ClubPlugins no instalado -> loadClubPlugins null
- motion package RAF manual en Marquee
- Audio demos WAV 22kHz mono 8s 345KB cada uno, generados con Node (sin ffmpeg), peaks precalculados, LFS deshabilitado para demos, prod usar MP3/AAC + bucket
- Player audio element crossOrigin anonymous para AnalyserNode, CORS ok para local files, externo (SoundCloud/YouTube) no analizable -> documentado en UI
- Media Session API + keyboard shortcuts + persist queue/favs
