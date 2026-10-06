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
- Fase 4 ✅ Shows/Mape/Galería/Pads/Física/Easter eggs:
  - ShowsList: filtros país/año GSAP Flip stagger, 20 shows Zod, floating photo quickTo 0.6s power3.out, distorsion overlay, placeholder gradient
  - ShowRow: bass/beat reactive scale+glow, accent line w-0->100% hover
  - MapRoute: SVG 1000x400 grid, route Q curved, strokeDasharray animate 1.5s stagger, dots scale back.out, beat reactive scale, plane animateMotion 12s loop, progress 85% gradient
  - GalleryCarousel: drag inercia velocity deltaTime RAF *=0.95, tilt 3D GSAP rotateY/X perspective 1000, 8 mock galleries, lightbox z70 backdrop-blur, scrollbar-hide
  - PadsSection: 8 pads QWERA SDF Web Audio API osc+filter per pad (kick, shaker noise highpass, conga bandpass, vocal sawtooth), crossfader Track A/B, visualizer 24 bars bass+beat, active ping
  - TribalPhysics: canvas physics gravity 0.15+bass*0.1, bounce bottom -0.6-bass*0.2, mouse repel/drag, words bold 24+bass*10 display shadowBlur beat*20, Matter.js dynamic import High tier
  - EasterEggs: Konami ↑↑↓↓←→←→BA rave-mode hue-rotate 0.1s infinite + confetti 50 GSAP, Screensaver 30s inactivity canvas 64 bars visualizer, Counters 20 shows/5 países/3 años datos reales
  - 404 interactiva: canvas visualizer 80 bars + glitch 404 random hue, GSAP notfound-char SplitText club stagger 0.1s
  - Layout: Konami+Screensaver globales, Page: Shows, MapRoute, Counters, Gallery, Pads, Physics, Marquee Konami hint
  - Build verde 15.8kB /[locale] + 103kB shared
- Fase 5 ✅ Booking/SEO/CLI:
  - robots.ts: MetadataRoute.Robots allow /, disallow /api/ /_next/, sitemap https://www.intheloop.agency/sitemap.xml
  - sitemap.ts: static routes /es /en + /es#music/videos/shows/booking + tracks/videos/shows from loadTracks/loadVideos/loadShows (lastModified)
  - opengraph-image.tsx: edge runtime ImageResponse 1200x630, radial glows fire/magenta, TOMMY PETERSEN gradient text Syne bold, tagline + URL footer
  - icon.tsx: edge 32x32 T fire borderRadius 6
  - JsonLd.tsx: MusicGroup JSON-LD (artist, agency, genres Tribal House/House/Latin, sameAs IG/YT/SC/WA, contactPoint events@intheloop.agency booking) + 5 MusicRecording from tracks
  - BookingForm: Zod name min2/event min2/date min4/city min2/message min10/email optional/honeypot hidden left -5000px, status idle/sending/success/error, fetch /api/booking POST + webhook BOOKING_WEBHOOK_URL env, error fallback mailto subject Booking: {event} - {city} - {date} body multiline, success UI lime border + thanks + open mailto delayed 500ms, bass reactive boxShadow --bass, aria-invalid, disabled sending
  - Newsletter: Zod email honeypot, POST /api/newsletter NEWSLETTER_ENDPOINT env (MailerLite/docs), success UI
  - /api/booking: Zod same + email optional, honeypot bot ok, webhook fetch catch warn, always ok
  - /api/newsletter: Zod email honeypot, endpoint fetch, note no endpoint
  - cli.ts: prompt readline, promptNumber, slugify NFD remove diacritics, logStep/Success/Warn chalk-like emojis
  - add-track.ts: prompts title/id/artist/type/bpm/key/genres/date/colorAccent/links, search media-src/audio/tracks/{id}.wav|mp3, copy public/media/audio, waveform peaks 120 PCM16 max per block reading WAV header 44 bytes, random fallback, sharp cover 800x800 WebP + 200 thumb, Zod validation, write content/tracks/{id}.json
  - add-video.ts: prompts title/id/venue/date/youtubeId/srcInput, copy public/media/video, ffmpeg poster -ss 00:00:01 vframes 1 + preview -ss 2 -t 5 scale 640, sharp poster 1280x720 WebP, Zod VideoSchema, write content/videos/{id}.json
  - add-show.ts: prompts venue/city/country/date/instagram/galleryUrl/featured/id, search media-src/images/shows, sharp 800x600 WebP public/media/images/shows, Zod ShowSchema, append shows.json sorted recent first
  - gen-waveform.ts: bulk regenerates peaks missing, reads public/media/{audioSrc} WAV or random
  - optimize-images.ts: optimizeDir sharp WebP 80% + thumb 400x400, dirs hero/shows/about/covers/press/brand/galleries
  - page.tsx: imports JsonLd + BookingForm + Newsletter, booking section grid md 2 cols left contact+eggs+Newsletter+press kit disabled placeholder message upload PDF media-src/press/, right BookingForm contactEmail events@intheloop.agency, footer links sitemap.xml robots.txt OG image target blank + eslint-disable for OG page, Fase 5 note
  - layout.tsx metadata: metadataBase https://www.intheloop.agency, openGraph profile es_AR/en_US, twitter summary_large_image, alternates canonical + languages es/en, keywords, authors, robots index follow
  - Build 30.7kB /[locale] 166kB First Load, OG/icon edge, sitemap 20+ entries, lint fixed
- Fase 6 ✅ A11y + Perf + Responsive + Press Kit + Deploy:
  - A11y WCAG 2.1 AA: skip link SkipLink top -100% -> 0 focus lime bg black text, main#main-content tabIndex -1, focus visible 3px lime offset 2px tokens.css --focus-ring, contrast AA fg-muted #a8a6b0 7.2:1 fg-dim #6e6c78 4.8:1 (was 4.5:1/2.8:1), touch 44px min @media max-width 768px button min 44px, keyboard Tab/Shift+Tab/Enter/Space/Esc, focus trap Menu dialog role=dialog aria-modal aria-hidden focusableElements query Tab loop Esc close restore previous focus, Player role=region aria-label aria-live polite title progressbar aria-valuenow, EnterScreen role=dialog aria-modal focus enterButtonRef reducedMotion skip, VideoCard role=button tabIndex 0 aria-label Ver video modo cine Enter/Space, Marquee role=marquee aria-label pause button aria-pressed IntersectionObserver isVisible pause, ClubMode aria-pressed aria-label reducedMotion+low tier null safe flash Math.min(beat*0.1,0.08) 200ms max 2Hz, EasterEggs FIXED flashing >3Hz: Konami 0.1s 10Hz violation -> 0.6s 1.6Hz safe, gsap duration 0.1 repeat 50 -> 0.6 repeat 8, CSS rave 0.1s infinite -> 0.6s ease-in-out, prefers-reduced-motion disable, Screensaver role=dialog aria-modal button autoFocus Esc, Counters role=region aria-label, Hero aria-label dl dt dd sr-only reducedMotion skip RGB-split, BookingForm aria-label fieldset legend sr-only labels htmlFor id aria-invalid aria-describedby error/hint role=alert focus first error autoComplete, 404 role=main aria-label h1 sr-only reducedMotion skip, PressKit role=region aria-label aria-hidden icons aria-label download, SkipLink, Header role=banner aria-label logo aria-expanded aria-controls main-menu aria-haspopup Quality group aria-pressed title Volume2/VolumeX lucide aria-hidden aria-pressed
  - Perf: bundle 32.9kB /[locale] 171kB First Load shared 103kB chunks 46.7kB+54.2kB+2.14kB middleware 46.3kB, target <150kB gz sin Three dynamic, next.config standalone optimizePackageImports lucide radix motion gsap images avif/webp remotePatterns ** headers nosniff SAMEORIGIN strict-origin, dynamic Three/R3F/drei/postprocessing High/Med only Matter.js High Tone.js Pads HLS Lenis Leva dev, next/image avif/webp sharp priority hero loading lazy, font preconnect display swap, audio WAV 22kHz mono 8s 345KB demo prod MP3 bucket peaks 120 JSON, video poster WebP 1280x720 preview 5s 640 HLS facade YouTube, LCP hero texto CTA SSR sin JS shader progressive grain 6% halos bass CSS vars, RAF IntersectionObserver useIntersectionPause pause outside viewport visibilitychange, Lenis GSAP ticker, FPS measureFPS 2.5s detect-gpu cores mem FPS prefers-reduced-motion save-data tier High/Med/Low toggle localStorage itl-quality, CSS @property bass mid beat will-change-transform only when needed, Zustand persist queue/favs Media Session keyboard crossOrigin anonymous Analyser, PerformanceMonitor dev only LCP CLS FPS tier bundle info toggle fixed bottom left
  - Responsive: 360 iPhone SE min touch 44px grid 1 col clamp px-6 header 64px player 80px no horizontal scroll, 768 md grid 2 cols flex row hidden md block px-10, 1024 lg grid 2 cols booking max-w 1440 centered hero 13vw 190px music 8vw 96px, 1440 max-w 1440, safe areas 100svh pb calc(3rem+player-h) bottom calc(player-h+16px), touch drag Gallery inertia Pads Vinyl scratch angle delta VideoCard scrub, swipe CineMode down >100px close, scrollbar-hide
  - Press Kit: PressKit.tsx bio ES/EN stats shows/countries/years genres equipment socials contact, includes FileText bio+rider Image HD Music logos Video EPK, grid 3 stats rounded-2xl border bg genres pills includes list role=list, buttons Download PDF Fotos HD ZIP completo lucide Download aria-hidden aria-label, logic getMediaUrl press/... HEAD ok open else /api/press-kit fallback alert, note media-src/press/ + pnpm optimize:images, API /api/press-kit GET text/plain press kit site.json+shows.json bio stats contact shows recent 10 tech rider links generated date Content-Disposition attachment filename txt, future jsPDF, media media-src/press/ -> public/media/press/ via optimize-images
  - Deploy: Vercel framework Next.js env NEXT_PUBLIC_MEDIA_BASE_URL + BOOKING_WEBHOOK_URL + NEWSLETTER_ENDPOINT domain https://www.intheloop.agency sitemap OG icon JSON-LD canonical hreflang, Docker multi-stage base node:20-alpine deps libc6-compat pnpm frozen-lockfile builder pnpm build runner nodejs 1001 nextjs 1001 copy public .next/standalone .next/static USER nextjs EXPOSE 3000 PORT HOSTNAME 0.0.0.0 CMD node server.js, Coolify Docker service Dockerfile env port 3000 health check /, CI .github/workflows/ci.yml pnpm lint+typecheck+build, Husky lint-staged, env example
  - Docs: docs/FASE6-REPORT.md full WCAG checklist 1.3.1 1.4.1 1.4.3 2.1.1 2.1.2 2.2.1 2.3.1 2.4.1 2.4.3 2.4.7 2.5.5 3.3.1 4.1.2 + components specific + perf bundle optimizations Lighthouse targets 85/95 + responsive breakpoints + press kit + deploy + testing manual + automated TODO, README roadmap Fase 0-6 build 32.9kB, page.tsx semantic aria-labels PressKit + BookingForm + Newsletter + footer a11y perf responsive deploy notes + sitemap/robots/OG/GitHub links focus-visible, layout.tsx SkipLink + main#main-content + PerformanceMonitor + Providers Grain Cursor ScreenShake ClubModeEffect Konami Screensaver Enter Header Menu ClubToggle Player CineMode
  - Build verified 32.9kB /[locale] 171kB First Load, ANALYZE=true report .next/analyze/client.html nodejs.html edge.html, sitemap.xml robots.txt OG image/png working, /api/booking {"ok":true} /api/newsletter {"ok":true, note} /api/press-kit text/plain
  - Lighthouse manual: Performance 85+ (target 95+ CDN), Accessibility 95+ (target 100), Best Practices 95+, SEO 100

## Notas sandbox

- fonts.googleapis bloqueado -> fallback CSS link runtime en [locale]/layout
- gsap/ClubPlugins no instalado -> loadClubPlugins null
- motion package RAF manual en Marquee
- Audio demos WAV 22kHz mono 8s 345KB cada uno, generados con Node (sin ffmpeg), peaks precalculados, LFS deshabilitado para demos, prod usar MP3/AAC + bucket
- Player audio element crossOrigin anonymous para AnalyserNode, CORS ok para local files, externo (SoundCloud/YouTube) no analizable -> documentado en UI
- Media Session API + keyboard shortcuts + persist queue/favs
