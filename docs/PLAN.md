# PLAN MAESTRO — Tommy Petersen / In The Loop Agency
**Fecha:** 2026-10-06 | **Branch:** arena/e4a8c9ef-intheloop
**Objetivo:** sitio "bien loco, flashero" con player global + audio reactivo + modo cine + calidad adaptativa.

---

## 1) Estructura de secciones (experiencia lineal + navegación)

**Orden narrativo pensado para booker en móvil (5 seg rule):**

0. **ENTER Screen** `/enter` overlay (no ruta separada, estado global `hasEntered`). Canvas con ecualizador + nombre gigante con SplitText + grain + 2 CTAs: `ENTRAR CON SONIDO` (desbloquea AudioContext + intro loop opcional) y `ENTRAR SIN SONIDO`. Toggle `Reducir efectos intensos` -> guarda en localStorage y fuerza Low tier. Keyboard: Enter / Space.

1. **Header sticky** siempre visible: logo (mini), `BOOK TOMMY` (primary CTA magnético), toggle `Efectos: Max/Normal/Min`, mute global, menú hamburger que abre fullscreen curtain con tipografía gigante (Syne 120px) + links con scramble.

2. **Hero** (100vh, pinned un momento con ScrollTrigger): 
   - Fondo: shader fluido (Three.js `ShaderMaterial` con noise + mouse + `--bass`) en High/Medium, fallback gradient animado CSS en Low.
   - Nombre `TOMMY PETERSEN` en Syne variable 800, `clamp(48px, 14vw, 200px)`, SplitText staggered + variable font anim (wght 400->800 con `--bass`).
   - Sub: `TRIBAL HOUSE / HOUSE / LATIN GROOVES — ARGENTINA` mono.
   - Foto hero con máscara `clip-path` orgánica + duotono + RGB-split en beat.
   - CTA duplicado BOOK + Scroll indicator con Lottie arrow.

3. **Marquee infinito** (Framer Motion + Lenis velocity): `IN THE LOOP — EVERY DANCEFLOOR HAS ITS OWN STORY —` velocidad ligada a scroll velocity y BPM (cuando suena).

4. **Music / Player showcase**: 
   - Lista de tracks (de `content/tracks`). Cada card con cover, waveform peaks precalculada (canvas), BPM/key.
   - Click -> carga en player global (no corta).
   - Si es SoundCloud/Spotify link -> facade embed, avisa "sin reactivo".

5. **Video Grid + Modo Cine**:
   - Grid masonry 2/3 cols, cada card con preview loop (IntersectionObserver + scrub X).
   - Hover shader distortion (GLSL displacement con `feDisplacementMap` fallback CSS).
   - Click -> GSAP Flip a fullscreen, letterbox bars, ambilight canvas, ducking del player global.

6. **Shows / Donde toqué**:
   - Lista filas gigantes `VENUE — CITY — DATE` con hover: foto flotante que sigue cursor (GSAP quickTo), distorsión.
   - Filtros por país/año con Flip animation.
   - Mapa SVG ruta animada (MotionPath) Argentina → España → Brasil → Francia → CZ → Alemania → Japón "soon". DrawSVG.
   - CTA galerías (links OneDrive actuales, se mantienen).

7. **Gallery / VJ Wall**:
   - Carrusel horizontal con inercia (Draggable + Inertia), tilt 3D (use-gesture), lightbox Flip.

8. **Pads / Sampler Juguete** (Tone.js, dynamic import):
   - 8 pads con samples tribales (kick, shaker, vocal chop, etc), crossfader entre 2 tracks, visualizador central.
   - Solo High/Medium, en Low muestra mensaje "disponible en modo efectos".

9. **Física Tribal**:
   - Matter.js palabras `TRIBAL HOUSE LATIN` que caen, rebotan, draggeables. Canvas ocupa sección.

10. **About / Bio**:
    - Texto EN (y ES placeholder), reveal con mask scroll-driven.
    - Contadores solo si hay datos reales (ej: países tocados = 5).

11. **Booking**:
    - Mail, WhatsApp, IG, formulario Zod -> Web3Forms + hCaptcha + honeypot (ver `docs/CONTACT-FORM.md`), sin backend propio.
    - Press kit placeholder disabled.

12. **Footer**: links, newsletter (MailerLite endpoint env), créditos, favicon.

13. **Player Global Persistente** (fuera del scroll, fixed bottom):
    - Mini: vinilo girando (CSS rotate ligado a currentTime, Draggable para scratch), waveform progreso, título, play/pause, next/prev, volumen, expandir.
    - Expandido: cola, favoritos (localStorage), shuffle/repeat, Media Session API.

**Transiciones:** entre secciones con ScrollTrigger pin + clip-path curtain. Page transitions con View Transitions API progressive.

---

## 2) Sistema visual

### Paleta (CSS variables + shader uniforms sync)
```css
:root {
  --bg: #07070A;
  --bg-2: #12101A; /* para secciones */
  --fg: #F5F3EF; /* off-white */
  --accent-fire: #FF5A1F; /* sunset naranja */
  --accent-magenta: #FF2E93; /* electric */
  --accent-lime: #C8FF00; /* acid / dorado alt */
  --accent-gold: #FFD60A; /* alternativa a lime según feedback */
  --muted: #8A8890;
  --tribal-line: rgba(255,90,31,0.2);
}
```
Uso: fire para CTA booking, magenta para hover/selección, lime/gold para highlights de beat. Fondos casi negro, no puro. Gradientes: `radial-gradient(fire, transparent)` para halos que laten con `--bass`.

Shaders leen mismas vars via uniforms: `uColor1 = fire, uColor2 = magenta, uColor3 = lime`.

### Tipografías (next/font, variable fonts para audio-reactive)
- **Display:** **Syne** (Google, variable 400-800) — geométrica, rave elegante, soporta wght anim. Alternativa premium: Clash Display (si cliente tiene licencia). Para hero gigante.
- **Sans legible:** **Space Grotesk** (variable 300-700) — no genérica, techno-humanista, buena para UI.
- **Mono detalle:** **JetBrains Mono** o **Space Mono** — para BPM, fechas, labels tipo `// SHOWS 2025`.

Por qué no Inter/Roboto: demasiado neutro, no aporta energía tribal/futurista. Syne tiene ligaduras únicas y peso variable perfecto para modular con audio.

- Hero: `font-variation-settings: "wght" var(--bass-wght, 700)` donde `--bass-wght = 400 + bass*400`.
- Tamaños con `clamp()` fluido.

### Motion tokens (CustomEase)
```js
// easings
--ease-club: CustomEase.create("club", "0.76, 0, 0.24, 1"); // para cortinas
--ease-bounce-tribal: CustomEase.create("tribal", "0.34, 1.56, 0.64, 1"); // para botones magnéticos
--ease-smooth: "power3.out" (GSAP) / [0.16,1,0.3,1] (Motion)

Duraciones:
--dur-micro: 150ms (hover, ripple)
--dur-ui: 300ms (botones, reveals)
--dur-section: 700ms (cortinas, Flip)
--dur-hero: 1200ms (SplitText stagger)

Curvas:
- Entrada hero: power4.out + stagger 0.04s
- Scroll reveals: power3.out
- Botón magnético: elastic.out(1, 0.6)
- Modo Cine Flip: club (0.76,0,0.24,1) 0.7s
```

Grain global: SVG `feTurbulence` animado (baseFrequency 0.8, 0.1 opacity), sube con `--high`.

### Efectos clave
- Grain/noise canvas overlay `mix-blend-mode: soft-light`
- Halos: `backdrop-filter: blur(40px)` + `box-shadow` con accent que pulsa
- RGB-split: shader en High, CSS `text-shadow` + `filter` en Low
- Patrones tribales: SVG line pattern con `mask` y `feDisplacementMap` líquido

---

## 3) Arquitectura técnica

### Carpetas
```
/src
  /app
    /(site) -> layout.tsx (Lenis, providers, header, player, enter)
             page.tsx (compone secciones)
    /api/booking/route.ts (webhook proxy)
    /api/newsletter/route.ts
    globals.css (Tailwind v4 + @property + variables)
  /components
    /ui (Radix wrappers: dialog, tooltip, etc + magnetic-button, scramble-link)
    /enter (EnterScreen, EQVisual)
    /hero (Hero, HeroShader -> dynamic)
    /player (PlayerBar, PlayerExpanded, Vinyl, Waveform, usePlayerStore)
    /audio (AudioEngine.ts singleton, useAudioReactive)
    /video (VideoCard, VideoGrid, CineMode, Ambilight)
    /shows (ShowsList, ShowRow, MapRoute SVG)
    /gallery (Carousel, Lightbox)
    /pads (PadsSection dynamic -> Tone.js)
    /physics (TribalPhysics dynamic -> Matter.js)
    /effects (CursorBlob, Grain, Halos, Marquee)
  /lib
    audio-engine.ts (singleton AudioContext, Analyser, beat detection)
    quality.ts (detect-gpu + fps measurement + tier store)
    content.ts (Zod schemas, loaders para tracks/videos/shows)
    media.ts (getMediaUrl -> usa NEXT_PUBLIC_MEDIA_BASE_URL)
    motion.ts (GSAP registro plugins, CustomEase tokens)
    utils.ts
  /stores
    playerStore (Zustand)
    qualityStore (tier, manual override)
    uiStore (enter, clubMode, reducedMotion)
  /hooks (useLenis, useIntersectionPause, useAudioAnalyser)
  /shaders (glsl files: fluid.frag, displacement.frag, particles.vert)
  /styles (tokens.css)
/content (JSON + Zod)
  tracks/*.json, videos/*.json, shows.json, site.json
/public/media (generado, git-lfs)
/scripts (add:track, add:video, gen:waveform, optimize:images)
/docs (BRIEF, PLAN, CHECKLIST)
```

### Estado global (Zustand)
- `playerStore`: queue, currentTrack, isPlaying, volume, progress, shuffle, repeat, favorites (persist localStorage)
- `qualityStore`: tier (high/medium/low), fps, gpuTier, manualOverride, setTier
- `uiStore`: hasEntered, isClubMode, isCineMode, reducedMotion (from media query + toggle), cursorType

### AudioEngine (singleton)
```ts
class AudioEngine {
  context: AudioContext | null
  analyser: AnalyserNode
  gain: GainNode
  source: MediaElementAudioSourceNode | null
  dataArray: Uint8Array
  // public reactive values
  bass, mid, high, level, beat (boolean), bpm
  // methods
  init() // crea context en gesto ENTER
  connectMediaElement(audioEl: HTMLAudioElement)
  startAnalysing() // requestAnimationFrame loop
  detectBeat() // simple: energy threshold en low freq + BPM del track JSON
  setCssVars() // document.documentElement.style.setProperty('--bass', bass)
  duck(volume) / unduck()
}
```
- Loop pausado cuando `document.hidden` o player no visible (IntersectionObserver).
- Cuando no suena: idle pulse a 124 BPM (sinusoidal) -> sigue vivo.
- Media Session API en `playerStore` effect.

### Sistema de calidad adaptativa
```ts
// lib/quality.ts
async function detectTier() {
  const gpu = await getGPUTier() // detect-gpu
  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as any).deviceMemory || 4
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = (navigator as any).connection?.saveData

  if (reduced || saveData) return 'low'
  if (gpu.tier < 2 || cores <=4 || mem <=4) return 'medium'
  return 'high'
}
// + FPS meter primeros 3s: si <45fps baja a medium, <30 a low
```
- Componentes WebGL usan `tier` para: resolution, particleCount, postprocessing enabled.
- Toggle UI: `[Max | Normal | Mínimo]` guarda en localStorage.
- `useIntersectionPause` hook: pausa RAF cuando fuera de viewport.
- `visibilitychange` listener global pausa todo.

### Performance rules (en CLAUDE.md)
- Three, Tone, Matter, hls.js, Lenis, GSAP plugins -> dynamic import + `ssr: false` donde aplique.
- Bundle inicial < 150kb gz (sin Three). Three chunk separado.
- `next/image` + `sharp`, `priority` solo hero.
- LCP: hero texto + CTA deben render sin JS (SSR), shader es progressive enhancement.
- `loading="lazy"` para videos/galería, facade para YouTube/SoundCloud.
- No audio/video en repo, solo placeholders.

---

## 4) Librerías con propósito y carga

| Librería | Propósito | Carga |
|---|---|---|
| **Next.js App Router** | Base SSR/SSG, routing, API routes | core |
| **Tailwind CSS v4** | Utility styling, CSS vars | core |
| **next-intl** | i18n ES/EN, hreflang | core (middleware) |
| **next/font** | Fonts optimizadas variable | core |
| **Zustand** | Estado global player/quality/ui (ligero, no context re-renders) | core |
| **Lenis** | Smooth scroll, sync con GSAP ScrollTrigger | dynamic, client only, en layout |
| **GSAP + ScrollTrigger** | Scroll pin, reveals, parallax, cortinas | core (pero plugins lazy) |
| **GSAP Flip** | Video modo cine vuelo al centro | dynamic import en VideoGrid |
| **GSAP SplitText** | Hero letras escalonadas | dynamic en Hero (si Club GSAP, si no fallback SplitType) |
| **GSAP Draggable + Inertia** | Vinilo scratch, carrusel drag | dynamic en Player + Gallery |
| **GSAP CustomEase** | Motion tokens custom | core con GSAP |
| **GSAP ScrambleText** | Links nav scramble | dynamic en nav |
| **Motion (framer-motion)** | Layout transitions, gestures React (magnetic button, menu) | core para UI components |
| **@use-gesture/react** | Gestos avanzados (tilt 3D gallery, scrub video preview) | dynamic en gallery/video |
| **Three.js** | WebGL base | dynamic, solo en High/Medium |
| **@react-three/fiber** | React renderer para Three | dynamic |
| **@react-three/drei** | Helpers (shaderMaterial, etc) | dynamic |
| **@react-three/postprocessing** | Bloom, chromatic, noise, vignette | dynamic, solo High |
| **Matter.js** | Física palabras tribal | dynamic en Physics section |
| **lottie-react** | Loaders, micro iconos | dynamic |
| **Web Audio API nativa** | Analyser, audio reactive base | nativa, en AudioEngine |
| **WaveSurfer.js** o peaks precalc | Waveform visual | dynamic, o canvas custom con peaks JSON |
| **Tone.js** | Sampler pads interactivos | dynamic en PadsSection |
| **hls.js** | HLS adaptive video | dynamic en Video player |
| **Radix UI** | Dialog, tooltip accesibles (CineMode) | core (pequeño) |
| **Lucide** | Iconos | core |
| **Zod** | Validación content JSON | core (build time + runtime) |
| **detect-gpu** | Tier detection | dynamic en quality init |
| **sharp** | Optimización imágenes (Node) | dev/build script |
| **@next/bundle-analyzer** | Analizar bundle | dev only |
| **Leva** | Tweak shaders en dev | dev only, dynamic |
| **ffmpeg (wasm o CLI)** | Generar previews, waveform | script only |

**Justificación de no usar alternativas:**
- Zustand vs Redux: más ligero, no necesita provider, perfecto para player.
- GSAP vs solo Motion: GSAP tiene ScrollTrigger/Flip/Draggable que Motion no cubre con misma performance; Motion para layout React.
- Three vs tsParticles: Three permite shaders custom + partículas GPU + postprocessing en un solo renderer.

**Regla de oro:** si una librería solo sirve en una sección, `next/dynamic` + `import()` y no va al bundle inicial. Se documenta en CLAUDE.md y se elimina si no se usa.

---

## 5) Fases de implementación (resumen)

**Fase 0 (scaffold):** pnpm init, Next 15 + TS strict, Tailwind v4, ESLint+Prettier, Husky opt, next-intl, Zustand, GSAP base, Zod schemas, content seed, CI (lint+typecheck+build), Dockerfile standalone, Vercel config, README+CLAUDE.

**Fase 1 (visual + layout):** tokens CSS, Syne+Space Grotesk, Lenis, cursor blob, ENTER screen, header sticky, hero con shader fallback, marquee, grain.

**Fase 2 (audio):** AudioEngine singleton, player global mini+expandido, waveform peaks, Media Session, audio reactive vars CSS + uniforms, Modo Club toggle.

**Fase 3 (video):** VideoGrid, preview scrub, CineMode Flip + letterbox + ambilight + HLS + PiP/Fullscreen, ducking player.

**Fase 4 (shows/galerías/juguetes):** ShowsList con foto flotante + filtros Flip, MapRoute SVG MotionPath, Gallery carousel, Pads Tone.js, Physics Matter.js, easter eggs (Konami -> rave total, 404 interactiva, screensaver).

**Fase 5 (booking/SEO):** Form Zod + mailto + webhook, newsletter endpoint, sitemap, robots, OG 1200x630 dinámico, JSON-LD MusicGroup, hreflang, favicon.

**Fase 6 (pulido):** Accesibilidad (reduced-motion, focus, aria), performance (Lighthouse móvil ≥85 Perf, ≥95 A11y/SEO), test 360/768/1440, bundle analyzer, docs finales.

---

## 6) Preguntas (máx 3)

1. **GSAP Club:** ¿Tenés licencia Club GreenSock (SplitText, DrawSVG, MorphSVG, Inertia son de pago)? Si no, uso SplitType + framer-motion para SplitText y omito DrawSVG/MorphSVG o uso alternativas free. ¿Lo confirmás?
2. **Media bucket:** ¿Ya tenés Cloudflare R2 / S3 o querés que por ahora todo sea `/public/media` local y dejamos `NEXT_PUBLIC_MEDIA_BASE_URL` listo? ¿Tenés audios/videos propios listos para `media-src/` o arrancamos con placeholders + SoundCloud embeds?
3. **Idioma default:** ¿ES o EN como default? El seed actual está en EN, pero Tommy es AR. Propongo default ES con toggle EN, pero puedo invertir si preferís.

Si no hay bloqueos, asumo: GSAP free (sin Club, usaré alternativas), media local + placeholders, default ES.

---

## 7) Entregables por fase

- Build verde, lint, typecheck, test móvil, commit convencional, resumen.
- CLAUDE.md actualizado.
- Después de Fase 6: guía "cómo agregar canción/video/show en 2 min", deploy Vercel+Coolify, lista correcciones contenido, checklist cliente.

---

**¿Te va este plan?** Si das OK, arranco Fase 0 scaffold completo (pnpm, Next, Tailwind, tooling, CI, Dockerfile, content Zod, i18n).
