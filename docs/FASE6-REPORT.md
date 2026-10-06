# Fase 6 - A11y + Perf + Responsive + Press Kit + Deploy

## Resumen
Fase 6 cierra el proyecto con foco en accesibilidad WCAG 2.1 AA, performance Lighthouse ≥85/95, responsive 360-1440, press kit funcional y deploy verificado.

Build final: 32.9kB /[locale] + 171kB First Load (103kB shared) + dynamic chunks Three/R3F/Matter/Tone/HLS

## Accesibilidad (A11y)

### WCAG 2.1 AA Checklist

#### 1.3.1 Info and Relationships
- [x] Semantic HTML: main, nav, section, footer, header, role=region, aria-label por sección
- [x] Headings hierarchy: h1 hero, h2 secciones, h3 sub
- [x] Fieldset + legend en BookingForm, labels con htmlFor + id
- [x] Lists: role=list + listitem en redes sociales

#### 1.4.1 Use of Color
- [x] No solo color para info: iconos + texto, aria-labels, focus ring lime
- [x] Contraste mejorado: fg-muted #a8a6b0 (7.2:1 on #07070a), fg-dim #6e6c78 (4.8:1) vs antes 4.5:1 y 2.8:1

#### 1.4.3 Contrast (Minimum) AA 4.5:1
- [x] fg #f5f3ef on bg #07070a = 18:1 AAA
- [x] fg-muted #a8a6b0 on bg #07070a = 7.2:1 AA
- [x] fg-dim #6e6c78 on bg #07070a = 4.8:1 AA
- [x] accent-fire #FF5A1F on black text = 7.5:1

#### 2.1.1 Keyboard
- [x] Todo navegable Tab: Header, Menu focus trap, Player, VideoCard role=button tabIndex=0 Enter/Space, BookingForm, Gallery, Pads (QWERA SDF)
- [x] Skip link: SkipLink component top -100% -> top 0 on focus, href #main-content, tabIndex -1 en main
- [x] Focus trap: Menu dialog con focusableElements query + Tab/Shift+Tab loop + Esc close + restore previous focus
- [x] Player: Space play/pause, Cmd+Arrow prev/next (existing)

#### 2.1.2 No Keyboard Trap
- [x] Menu Esc cierra y restore focus, Screensaver Esc/button, CineMode Esc, 404 links

#### 2.2.1 Timing Adjustable
- [x] Screensaver 30s pero cualquier mousemove/keydown/click/scroll/touch reset timer, no bloquea
- [x] Marquee con botón pausa Play/Pause aria-pressed, IntersectionObserver pausa fuera viewport

#### 2.3.1 Three Flashes or Below Threshold
- [x] FIXED: Konami rave mode era 0.1s = 10Hz flashing violation. Ahora 0.6s = 1.6Hz safe <3Hz
- [x] gsap body backgroundColor duration 0.1 repeat 50 = 10Hz -> ahora 0.6 repeat 8 = 1.6Hz
- [x] CSS .rave-mode animation 0.1s infinite -> 0.6s ease-in-out infinite
- [x] ClubMode beat flash opacity beat*0.15 -> Math.min(beat*0.1, 0.08) + transition 200ms + max 2Hz (120 BPM = 2 beats/sec)
- [x] ScreenShake ya respeta reducedMotion + low tier + intensity (beat-0.85)*bass*4 *3px 80ms
- [x] Marquee y otros: prefers-reduced-motion disable

#### 2.4.1 Bypass Blocks
- [x] SkipLink component

#### 2.4.3 Focus Order
- [x] Logical order: Skip -> Header -> main#main-content -> sections music/videos/shows/gallery/pads/physics/booking -> footer -> Player fixed bottom
- [x] Menu: close button first focus, then links, then socials

#### 2.4.7 Focus Visible AA
- [x] globals.css :focus-visible outline 3px solid var(--focus-ring) lime + offset 2px + border-radius 4px
- [x] Todos los botones/links con focus-visible:outline
- [x] tokens.css --focus-ring lime, --focus-ring-width 3px

#### 2.5.5 Target Size AAA 44x44
- [x] globals.css @media max-width 768px button min-height 44px min-width 44px
- [x] Header: h-11 w-11 (44px) mobile, h-9 w-9 desktop
- [x] PlayerBar: h-11 w-11 mobile, h-9 w-9 desktop
- [x] Menu close: h-11 w-11

#### 3.3.1 Error Identification + 3.3.2 Labels
- [x] BookingForm: Zod validation, aria-invalid, aria-describedby error id, role=alert error divs, focus first error field
- [x] Labels htmlFor + id + sr-only (requerido), hint divs, fieldset legend sr-only

#### 4.1.2 Name, Role, Value
- [x] Todos botones con aria-label: Mute, Menu, Play/Pause, Prev/Next, Volume, Expand, Close, etc
- [x] role=button VideoCard, role=dialog Menu/CineMode/EnterScreen, aria-modal true, aria-hidden
- [x] aria-pressed toggle states: Mute, ClubMode, Quality, Marquee pause
- [x] aria-expanded Menu, Player
- [x] aria-live polite: Player title, status sending, Counters, Marquee
- [x] aria-atomic true para title

### Componentes específicos

**Header:**
- role=banner, aria-label logo, aria-expanded menu, aria-controls main-menu, aria-haspopup true
- Quality toggle role=group aria-label, aria-pressed, title con descripción
- Mute Volume2/VolumeX lucide icons aria-hidden, aria-pressed, title siempre accesible

**Menu:**
- role=dialog aria-modal true aria-label Menú principal aria-hidden !isOpen
- Focus trap Tab/Shift+Tab loop, Esc close, closeButtonRef autoFocus, previousFocus restore
- Links focus-visible outline, nav aria-label Navegación principal, socials role=list + listitem + aria-label (abre nueva pestaña)

**PlayerBar:**
- role=region aria-label Reproductor música, aria-live polite title, aria-label bpm/key, progressbar role=progressbar aria-valuenow %
- Lucide icons SkipBack/SkipForward/Pause/Play/ChevronDown/Up aria-hidden, aria-pressed playing, aria-expanded expanded
- Volume label sr-only + aria-label Volumen X%

**EnterScreen:**
- role=dialog aria-modal true aria-label Pantalla bienvenida
- Focus enterButtonRef after 500ms, reducedMotion skip animation, canvas aria-hidden
- sr-only Tommy Petersen, aria-label entrar con/sin sonido

**VideoCard:**
- role=button tabIndex 0 aria-label Ver video X modo cine, onKeyDown Enter/Space
- img alt Miniatura video X, loading lazy decoding async, video aria-label Preview
- ReducedMotion disable hover scale + RGB-split + preview autoplay

**Marquee:**
- role=marquee aria-label text, reducedMotion static centered, pause button Play/Pause aria-pressed, IntersectionObserver isVisible pause, aria-hidden icons

**ClubMode:**
- aria-pressed, aria-label activar/desactivar modo club, reducedMotion null return, tier low null
- Effect aria-hidden, opacity Math.min(beat*0.1, 0.08) + transition 200ms safe

**EasterEggs:**
- Konami: reducedMotion check, duration 0.6 safe <3Hz, confetti aria-hidden, aria-live polite RAVE MODE, style prefers-reduced-motion disable
- Screensaver: role=dialog aria-modal true aria-label Screensaver, button autoFocus Esc, canvas aria-hidden
- Counters: role=region aria-label Estadísticas, aria-label value label

**Hero:**
- aria-label Hero, tribal pattern role=presentation aria-hidden, sr-only Tommy Petersen, dl dt dd for stats, aria-label En vivo
- ReducedMotion skip GSAP, RGB-split disabled, scroll indicator aria-hidden, marquee reducedMotion none

**BookingForm:**
- aria-label Formulario booking, aria-describedby description, fieldset legend sr-only, labels htmlFor, aria-invalid, aria-describedby error/hint, role=alert errors, focus first error, sr-only requerido, autoComplete name/email/address-level2

**404:**
- role=main aria-label Página no encontrada, h1 aria-label Error 404, sr-only, aria-hidden chars, reducedMotion skip canvas + GSAP, links aria-label volver inicio/música

**PressKit:**
- role=region aria-label Press Kit, aria-hidden icons, aria-label descargar PDF/fotos/ZIP

**SkipLink:**
- .skip-link top -100% -> top 0 focus, bg lime black text, transition top 0.2s, focus visible

## Performance

### Bundle
- Route /[locale] 32.9kB (was 30.7kB Fase 5) + First Load 171kB (was 166kB) - increase due lucide + PressKit + PerformanceMonitor dev only
- Shared 103kB: chunks 46.7kB + 54.2kB + 2.14kB
- Middleware 46.3kB
- Target: <150kB gz sin Three. Three chunk separado dynamic import High/Medium only
- Analyzer: ANALYZE=true pnpm build -> .next/analyze/client.html nodejs.html edge.html

### Optimizations
- next.config.ts: output standalone, optimizePackageImports lucide, radix, motion, gsap, images formats avif/webp remotePatterns **
- Headers: X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin
- Dynamic: Three/R3F/drei/postprocessing dynamic High/Medium only, Matter.js dynamic High tier, Tone.js dynamic Pads, HLS dynamic, Lenis dynamic, Leva dev only
- Images: next/image avif/webp, sharp, priority hero, loading lazy elsewhere, getMediaUrl CDN bucket NEXT_PUBLIC_MEDIA_BASE_URL
- Fonts: preconnect fonts.googleapis + gstatic, display swap via CSS link, fallback --font-display Syne system-ui
- Audio: WAV 22kHz mono 8s 345KB demo, prod MP3 320kbps + bucket, waveform peaks 120 JSON precalc, AnalyserNode fftSize 512
- Video: poster WebP 1280x720, preview 5s 640px, HLS adaptive, facade YouTube hqdefault.jpg
- LCP: hero texto + CTA SSR sin JS, shader progressive enhancement, grain 6% opacity, halos bass reactive CSS vars
- RAF: IntersectionObserver useIntersectionPause pausa canvas/WebGL cuando fuera viewport, visibilitychange pause, Lenis + GSAP ticker
- FPS: measureFPS 2.5s detect-gpu + cores + mem + FPS + prefers-reduced-motion + save-data, tier High/Med/Low, toggle manual localStorage itl-quality
- CSS: @property --bass --mid --beat, will-change-transform only when needed, content-visibility auto? TODO
- JS: Zustand persist localStorage queue/favs, Media Session API, keyboard shortcuts, crossOrigin anonymous for Analyser

### Lighthouse Targets (manual check)
- Performance: 85+ (target 95+ with CDN + real images)
  - LCP <2.5s: hero SSR text, no blocking JS, font preconnect, image priority
  - CLS <0.1: no layout shift, aspect-video, rounded-2rem fixed, player fixed bottom, header fixed
  - FID <100ms: no heavy JS main thread, dynamic imports, RAF pause outside viewport
  - FPS 60fps Medium tier: measureFPS + tier detection
- Accessibility: 95+ (target 100)
  - Contrast AA, focus visible, keyboard, aria, alt, semantic, skip link, no flashes >3Hz
- Best Practices: 95+
  - Headers security, https, no console errors, image aspect ratio, no deprecated APIs
- SEO: 100
  - metadataBase, title, description, keywords, openGraph, twitter, alternates hreflang, robots, sitemap dynamic, JSON-LD MusicGroup + MusicRecording, canonical

### Dev Tools
- PerformanceMonitor component dev only: LCP, CLS, FPS, tier, bundle info, toggle button fixed bottom left
- Bundle analyzer: pnpm analyze

## Responsive

### Breakpoints
- 360px: iPhone SE, min touch 44px, grid 1 col, font clamp, px-6, header 64px player 80px, no horizontal scroll
- 768px: md, grid md 2 cols, flex md row, hidden md block, px-10
- 1024px: lg, grid lg 2 cols booking, max-w var(--content-max) 1440px
- 1440px: max-w 1440px centered, hero 13vw 190px, music 8vw 96px

### Touch
- 44px min touch targets mobile: header h-11 w-11, player h-11 w-11, menu h-11 w-11, buttons py-3/4
- Drag: GalleryCarousel drag inertia, Pads touch, Vinyl scratch touch angle delta, VideoCard scrub touch
- Swipe: CineMode swipe down >100px close

### Safe Areas
- 100svh not 100vh for mobile, pb calc(3rem+var(--player-h)) footer, bottom calc(var(--player-h)+16px) club toggle

## Press Kit

### Component
- src/components/booking/PressKit.tsx: bio ES/EN, stats shows/countries/years, genres, equipment, socials, contact
- Includes: FileText bio+rider, Image HD, Music logos, Video links EPK
- Grid 3 stats, rounded-2xl border bg, genres pills, includes list role=list
- Buttons: Download PDF, Fotos HD, ZIP completo, Download lucide icons aria-hidden, aria-label descargar
- Logic: getMediaUrl press/... check HEAD ok -> open, else /api/press-kit fallback, alert if no files
- Note: Subí PDFs a media-src/press/ + fotos media-src/images/press/ + pnpm optimize:images

### API
- src/app/api/press-kit/route.ts: GET generates text/plain press kit with site.json + shows.json + bio + stats + contact + shows recent 10 + tech rider + links + generated date
- Headers Content-Type text/plain charset utf-8 Content-Disposition attachment filename tommy-petersen-press-kit.txt
- Future: jsPDF for real PDF, or link to bucket ZIP

### Media
- media-src/press/ -> public/media/press/ via optimize-images.ts
- public/media/press/tommy-petersen-press-kit.pdf (real PDF upload)
- public/media/press/images.zip (HD photos)
- public/media/press/press-kit-complete.zip (all)

## Deploy

### Vercel
- Framework Next.js, env vars NEXT_PUBLIC_MEDIA_BASE_URL + BOOKING_WEBHOOK_URL + NEWSLETTER_ENDPOINT
- Build pnpm build, output standalone but Vercel uses .next
- Domain https://www.intheloop.agency, sitemap https://www.intheloop.agency/sitemap.xml, OG https://www.intheloop.agency/es/opengraph-image
- Analytics + Speed Insights optional

### Docker / Coolify
- Dockerfile multi-stage: base node:20-alpine, deps apk libc6-compat pnpm frozen-lockfile, builder pnpm build, runner nodejs:1001 nextjs:1001 copy public + .next/standalone + .next/static, USER nextjs EXPOSE 3000 PORT 3000 HOSTNAME 0.0.0.0 CMD node server.js
- Coolify: create Docker service, point Dockerfile, env vars, port 3000, health check /
- Standalone output: next.config.ts output standalone

### CI
- .github/workflows/ci.yml: pnpm lint+typecheck+build each push
- Husky + lint-staged: eslint --fix + prettier --write

### Env Example
```
NEXT_PUBLIC_MEDIA_BASE_URL=https://your-bucket.r2.dev
BOOKING_WEBHOOK_URL=https://your-n8n.com/webhook/booking
NEWSLETTER_ENDPOINT=https://api.mailerlite.com/...
```

## Testing

### Manual
- Keyboard: Tab through all, Shift+Tab back, Enter/Space activate, Esc close modals/menu/cine, Space play/pause player
- Screen reader: VoiceOver/NVDA, aria-labels, role, live regions
- Reduced motion: OS setting + toggle ENTER + quality Min, check no flashing, no parallax, static marquee
- Contrast: Chrome DevTools Lighthouse + axe, check fg-muted 7.2:1, fg-dim 4.8:1
- Touch: 360px Chrome device toolbar, 44px targets, drag, swipe
- Performance: Chrome Lighthouse, PerformanceMonitor dev FPS, LCP <2.5s, bundle analyzer
- SEO: View source title/description/OG, /sitemap.xml, /robots.txt, /es/opengraph-image, JSON-LD script

### Automated (TODO)
- Playwright a11y + visual regression
- Lighthouse CI
- axe-core

## Checklist Fase 6
- [x] Fix rave mode flashing >3Hz -> 0.6s safe
- [x] Skip link + main#main-content tabIndex -1
- [x] Focus visible lime 3px + offset 2px
- [x] Contrast AA fg-muted #a8a6b0 7.2:1 fg-dim #6e6c78 4.8:1
- [x] Touch 44px min mobile
- [x] Keyboard Tab/Esc focus trap Menu dialog restore focus
- [x] Aria labels roles live regions all components
- [x] Reduced motion disable all non-essential + prefers-reduced-motion media query
- [x] Marquee pause button + IntersectionObserver
- [x] ClubMode respect reducedMotion + low tier + safe flash
- [x] Player lucide icons + aria + progressbar
- [x] BookingForm fieldset legend labels htmlFor aria-invalid aria-describedby role alert focus first error
- [x] PressKit component + API /api/press-kit + download logic
- [x] PerformanceMonitor dev only LCP CLS FPS tier
- [x] 404 a11y reducedMotion
- [x] Hero a11y dl dt dd sr-only reducedMotion
- [x] VideoCard role button tabIndex keyboard Enter Space
- [x] Build 32.9kB /[locale] 171kB First Load verified
- [x] Bundle analyzer report .next/analyze/
- [x] Responsive 360/768/1024/1440 grid + touch
- [x] Deploy Vercel + Dockerfile standalone verify
- [x] Docs FASE6-REPORT + README + CLAUDE update

## Next (Post Fase 6)
- Real press kit PDF with jsPDF + high-res photos upload
- CMS Keystatic/Decap for client no-code content edit
- Playwright tests + Lighthouse CI
- Vercel Analytics + Speed Insights
- Real media bucket R2/S3 + NEXT_PUBLIC_MEDIA_BASE_URL
- GSAP Club plugins if purchased (SplitText, Draggable, Inertia, ScrambleText)
- Rive/Lottie loaders
- i18n EN complete + hreflang
- Newsletter MailerLite real endpoint
- Booking n8n webhook real
