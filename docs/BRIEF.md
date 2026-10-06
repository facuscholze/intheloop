# Rol

Sos un Creative Developer senior / Technical Artist especializado en sitios de música electrónica y cultura club: motion design, WebGL y shaders, audio reactivo, tipografía cinética y performance web. Vas a construir **desde cero, en un repositorio nuevo**, el sitio del DJ y productor **Tommy Petersen** (In The Loop Agency, Tribal House / House / Latin grooves, Argentina). Reemplaza a https://www.intheloop.agency/ (hoy hecho con un builder tipo MailerLite, plano y poco estético).

La consigna del cliente: **una página "bien loca", flashera, donde cada elemento tenga una interacción increíble.** El techo creativo es altísimo. Los únicos techos reales son rendimiento en celulares, accesibilidad y que el booker pueda contactar sin fricción.

# Objetivo del sitio

1. Que un booker/promotor lo vea y quiera contratarlo (CTA principal: Booking).
2. Que se pueda **escuchar** su música y **ver** sus videos en una experiencia inmersiva.
3. Que el artista pueda **agregar canciones, sets, videos y shows nuevos fácilmente**, sin tocar el diseño ni el código de animaciones.

# Setup del repo (primer paso)

- Carpeta vacía → `git init`, rama `main`, commits convencionales (`feat:`, `fix:`, `chore:`), una rama por fase.
- Gestor: **pnpm**. TypeScript estricto. ESLint + Prettier. Husky + lint-staged (opcional).
- Creá un **`CLAUDE.md`** en la raíz con: resumen del proyecto, stack, comandos, estructura de carpetas, convenciones de animación, reglas de performance y cómo agregar contenido. Mantenelo actualizado en cada fase.
- `README.md` claro: cómo correr, buildear, deployar y agregar contenido.
- GitHub Actions: lint + typecheck + build en cada push.
- Deploy: dejá listo para **Vercel** y también un **Dockerfile** (Next.js `output: "standalone"`) para deployar en mi VPS con **Coolify**.

# Stack (elegí lo máximo, con criterio de rendimiento)

Base recomendada (si proponés otra, justificalo en una línea):

- **Next.js (App Router) + React + TypeScript**, Tailwind CSS v4, `next-intl` (ES/EN), `next/font`.
- **Estado global:** Zustand (player, modo club, calidad de efectos, idioma).
- **Smooth scroll:** Lenis.
- **Animación DOM/UI:** **GSAP** con todos los plugins disponibles (ScrollTrigger, Flip, SplitText, Draggable, InertiaPlugin, MotionPath, ScrambleText, CustomEase, Observer, DrawSVG, MorphSVG) + **Motion** (ex Framer Motion) para transiciones de layout/gestos de componentes React + `@use-gesture/react`. Definí claramente cuál se usa para qué para no pisarlos.
- **WebGL / 3D:** Three.js + **React Three Fiber** + `@react-three/drei` + `@react-three/postprocessing` (bloom, chromatic aberration, glitch, noise, vignette, god rays), shaders GLSL propios (ruido fluido, distorsión de imagen con hover, ondas, displacement).
- **Física y partículas:** Matter.js (letras/objetos con gravedad en secciones puntuales), partículas GPU (instancing / `Points` con shader) o tsParticles para efectos 2D.
- **Animación vectorial:** Lottie (`lottie-react`) y/o Rive para loaders, íconos y microinteracciones; SVG filters (`feTurbulence`, `feDisplacementMap`) para efectos líquidos/glitch; Canvas 2D para visualizadores.
- **Audio:** **Web Audio API nativa** (`AudioContext` + `AnalyserNode`) como base del audio reactivo; **WaveSurfer.js** (o waveform precalculada con peaks) para la forma de onda; detección de beat/BPM (`web-audio-beat-detector` o implementación propia); **Tone.js** para el sampler/pads interactivos; Media Session API para controles de pantalla de bloqueo.
- **Video:** `<video>` nativo + **hls.js** para streaming adaptativo, Picture-in-Picture y Fullscreen API.
- **CSS moderno:** `@property`, scroll-driven animations (`animation-timeline`), **View Transitions API** (como mejora progresiva), `mix-blend-mode`, `backdrop-filter`, `clip-path`, `mask`, variables CSS dinámicas.
- **UI primitives accesibles:** Radix UI (diálogos, tabs, tooltips), iconos con Lucide.
- **Contenido y validación:** Zod. Opcional: **Keystatic** o Decap CMS (basados en git) para que el cliente edite contenido desde una UI sin base de datos (ver "Gestión de contenido").
- **Optimización:** `sharp`, `next/image`, `detect-gpu` (tiers de calidad), `@next/bundle-analyzer`, Lighthouse CI.
- Dev tools: Leva/Tweakpane **solo en desarrollo** para ajustar shaders y parámetros en vivo. Opcional: Theatre.js para coreografiar secuencias complejas.

**Regla de oro del "sin techo":** el límite no es la cantidad de librerías sino el costo. Cada librería tiene un propósito documentado en `CLAUDE.md`, se carga con `dynamic import` / code splitting cuando solo sirve en una sección (Three, Tone, Matter, hls.js nunca van en el bundle inicial) y se elimina si no se usa.

# Sistema de calidad adaptativa (para poder ir al máximo)

Implementá tiers **High / Medium / Low** detectados con `detect-gpu` + `navigator.hardwareConcurrency` + `deviceMemory` + FPS real medido en los primeros segundos:

- **High:** todo (shaders full-res, postprocesado, partículas masivas, física).
- **Medium:** resolución de render reducida, menos partículas, postprocesado liviano.
- **Low / `prefers-reduced-motion` / ahorro de datos:** versión CSS/GSAP simple, sin WebGL ni parallax pesado, pero igual de linda.
- Toggle manual visible: "Efectos: Max / Normal / Mínimo".
- Pausá WebGL, canvas y loops cuando la sección no está visible (`IntersectionObserver`) o la pestaña está en segundo plano (`visibilitychange`).
- Objetivo: 60 fps en móvil medio en tier Medium; LCP < 2.5 s; el contenido principal (nombre, booking, contacto) visible aunque falle JS/WebGL.

# Dirección creativa

Mezcla de **tribal/orgánico/latino + rave futurista**: sunset sessions, beach party, underground club, patrones tribales, visuales de VJ, cartelería de festival.

- Fondo casi negro (#07070A) con paleta de 3-4 acentos de alto impacto (fuego/naranja atardecer, magenta eléctrico, verde ácido o dorado). Todo en variables CSS (y uniforms de shader sincronizados) para cambiar el look en un solo lugar.
- Tipografía display gigante y expresiva (preferí **variable fonts** para animar peso/ancho/inclinación con el audio) + una sans legible. Evitá Inter/Roboto genéricos. Hero a pantalla completa con `clamp()`.
- Grain/noise animado global, patrones tribales en SVG, glow de luces de pista, duotono/RGB-split en fotos.
- Debe sentirse una **experiencia**, no una plantilla.
- Proponé el sistema visual (paleta, tipografías, motion tokens: curvas, duraciones, easings con CustomEase) y mostramelo antes de implementar.

# Arquitectura de experiencia

## 1. Pantalla de entrada ("ENTER")
Splash flashero con el nombre y un ecualizador animado y un botón **ENTRAR / TAP TO ENTER**. Sirve para (a) impacto, (b) **desbloquear el `AudioContext`** (los navegadores bloquean audio sin gesto del usuario). Si el usuario entra, arranca el sonido ambiente/intro opcional (opt-in, volumen bajo, con mute visible). Nunca autoplay de audio sin gesto. Botón "Entrar sin sonido".

## 2. Player global persistente (la pieza central)
- Mini-player fijo (abajo) que **nunca se corta al navegar** entre secciones/páginas. Expandible a vista completa.
- Controles: play/pause, siguiente/anterior, seek, volumen, cola, shuffle/repeat, favoritos locales. Atajos de teclado y **Media Session API**.
- Visual: **vinilo / jog wheel de CDJ** que gira según reproducción (scratch al arrastrar con Draggable/Inertia), waveform en vivo con progreso, y título/BPM/tonalidad del track.
- Fuente de audio: **archivos propios** (mp3/aac/ogg) servidos desde `/public/media` en dev y desde un bucket/CDN (ej. Cloudflare R2) en producción vía variable de entorno (`NEXT_PUBLIC_MEDIA_BASE_URL`). No commitear audios/videos pesados al repo (usar Git LFS o el bucket).
- Soporte secundario para **embeds de SoundCloud/YouTube** (lazy/facade) para contenido que no se puede self-hostear. **Importante:** el audio de iframes NO se puede analizar (CORS), así que el audio reactivo real solo funciona con archivos propios. Documentalo.

## 3. Audio reactivo en TODO el sitio ("Modo Club")
Cuando suena un track, un **`AudioEngine`** (singleton) calcula en cada frame: energía de **graves / medios / agudos**, nivel general y **beat/kick** (con BPM detectado o configurado en el JSON del track). Publica eso como **variables CSS** (`--bass`, `--mid`, `--high`, `--beat`) y como uniforms/valores compartidos para WebGL. Con eso:

- El **fondo shader** (ondas/ruido fluido/partículas) pulsa y cambia de color con el beat.
- La **tipografía** del hero y títulos modula peso/ancho/skew con los graves (variable font) y hace glitch en los drops.
- El **cursor** brilla y se expande con la energía; las **luces/halos** de las secciones laten.
- Las **fotos** hacen RGB-split / zoom-pulse al kick; el **grain** sube con los agudos.
- **Partículas** explotan en cada beat fuerte; **screen shake** leve en los drops (configurable, desactivable).
- Cuando NO suena nada: animación "idle" con un pulso a ~124 BPM para que el sitio siempre se sienta vivo.
- Toggle "Modo Club (luces apagadas)" que oscurece todo y deja solo la reacción de luz/sonido.
- Todo esto respeta calidad adaptativa y `prefers-reduced-motion` (versión sin flashes: ver Accesibilidad).

## 4. Videos con "Modo Cine" (animación al agrandar/centrar)
- Cada video es una **card con preview**: loop mudo en hover/viewport (IntersectionObserver), scrub del preview según la posición X del mouse, distorsión por shader en hover.
- Al hacer click: la card **se transforma y vuela al centro** hasta pantalla completa usando **GSAP Flip** (o View Transitions API como mejora progresiva), mientras: el fondo se oscurece con blur, aparecen **barras letterbox** cinematográficas, hay una breve distorsión/chromatic aberration tipo "portal", el audio del player global **hace ducking o se pausa** (con crossfade) y se restaura al cerrar.
- Al cerrar (X, Esc, click afuera, swipe down en móvil): la animación se **invierte** y el video vuelve a su lugar exacto en la grilla.
- Controles personalizados con estética del sitio: play, seek con miniaturas, volumen, calidad (HLS), **Picture-in-Picture** y **Fullscreen real** (Fullscreen API) además del modo cine.
- Mientras se ve en grande, el fondo del modo cine puede mostrar un **ambilight** (colores del video proyectados en el fondo vía canvas) y reaccionar al audio del video.
- Soporte de video self-hosted (mp4/webm/HLS) y YouTube (facade con click).
- Accesible: foco atrapado en el diálogo (Radix), cierre con Esc, `aria-label`s, subtítulos si están disponibles.

## 5. Cada elemento con interacción "loca"
Inventario mínimo (inventá más y proponelas en el plan, que sean coherentes entre sí):

- **Cursor custom** (desktop): blob que se deforma, cambia de forma según contexto (play, ver, arrastrar, cerrar), deja estela y reacciona al audio.
- **Botones:** magnéticos, relleno líquido, ripple, sonido sutil de UI (opt-in).
- **Links/nav:** scramble de texto, subrayado animado, menú fullscreen con transición tipo "cortina" / clip-path y tipografía gigante.
- **Hero:** nombre en tipografía cinética gigante con letras que entran escalonadas (SplitText), glitch al hover, foto con máscara/duotono, shader de fondo reactivo al mouse y al audio.
- **Marquee** infinito gigante cuya velocidad/dirección cambia con el scroll y con el BPM.
- **Scroll:** parallax, secciones pinneadas, reveals con máscara, texto que se llena al scrollear, transiciones entre secciones (ScrollTrigger + Lenis).
- **Shows / "Dónde toqué":** lista de filas gigantes; al hover, la foto del venue flota siguiendo el cursor con distorsión; click abre detalle con galería. Filtros por país/año con animación Flip. Mapa/ruta SVG animada Argentina → España → Brasil → Francia → Rep. Checa → Alemania (Japón "próximamente").
- **Galería:** carrusel horizontal con inercia, tilt 3D, lightbox con transiciones (Flip).
- **Pads / Sampler:** sección interactiva donde el visitante toca pads (Tone.js) con visuales y puede mezclar con un crossfader entre dos tracks. Es el "juguete" del sitio.
- **Física:** una sección donde las palabras/géneros ("TRIBAL", "HOUSE", "LATIN") caen y rebotan con Matter.js y se pueden arrastrar.
- **Contadores animados** solo con datos respaldables (no inventar cifras).
- **Easter eggs:** Konami code que activa modo "rave total", pantalla 404 interactiva, screensaver de visualizador tras inactividad.
- **Transiciones de página:** shader wipe / cortina / View Transitions.
- **Loader/intro:** corto (≤ 1.5 s si es un loader real) y nunca bloquear el contenido si algo falla.

# Gestión de contenido (que el cliente pueda sumar cosas)

Todo el contenido en una carpeta `content/` validada con **Zod**, separada del código de UI:

- `tracks/*.json` (o MDX): `id`, `title`, `artist`, `type` (track | set | mix), `audioSrc`, `cover`, `bpm`, `key`, `duration`, `date`, `genres`, `colorAccent`, `links` (SoundCloud/Spotify/Beatport), `waveformPeaks` (se genera con script).
- `videos/*.json`: `id`, `title`, `src` (mp4/HLS/YouTube id), `poster`, `previewSrc` (loop corto), `date`, `venue`, `colorAccent`.
- `shows.json`: `venue`, `city`, `country`, `date`, `instagram`, `galleryUrl`, `photo`, `featured`.
- `site.json`: textos ES/EN, links de contacto, SEO.
- **Scripts CLI** (`pnpm add:track`, `pnpm add:video`, `pnpm add:show`) que piden los datos, validan, copian/optimizan el archivo, generan waveform peaks, poster y thumbnail (ffmpeg/sharp) y escriben el JSON. Documentá el flujo para que agregar una canción nueva sea de 2 minutos.
- **Opcional (fase final):** Keystatic o Decap CMS (git-based, sin base de datos) para que el cliente suba contenido desde una UI y se haga commit/deploy automático.
- Si falta una cover/poster, generá un fallback visual (gradiente/shader) en vez de un hueco.

# Contenido inicial (seed)

Traé el contenido real desde https://www.intheloop.agency/ (descargá las imágenes de `storage.mlcdn.com` a `/public/img` y optimizalas; no hotlinkees al CDN del builder; extraé también los links de galería de OneDrive de cada show). Si no tenés acceso web, pedime el HTML.

**Artista:** Tommy Petersen, DJ y productor de Argentina. House, Tribal House y grooves latinos con texturas melódicas. Desde los 14 años. Tocó en Argentina, España y Brasil; se expande por Japón, República Checa y Francia.
**Bio (EN):** *"Every dancefloor has its own story. I'm here to tell mine."* … *"Let's create something unforgettable."* (texto completo en el sitio actual).
**Contacto:** `events@intheloop.agency` · WhatsApp `https://wa.link/p31ap5` · Instagram `instagram.com/tommypetersen`, `instagram.com/tommypetersendj`, `instagram.com/intheloop.agency` · YouTube `youtube.com/@InTheLoopAgency` · SoundCloud `soundcloud.com/tommypetersendj`.
**Shows actuales (nombre / lugar / fecha / IG del venue):**
- Sundowner, Colonia San Miguel (itl) — 31 ene 2026
- Club Araoz, CABA (Silver Panda) — 29 jul 2026
- Después, Cosmosolar y Vicky Jauregui (itl) — 21 dic 2025
- Le Fleurus, París — 12 sep 2025 — @lefleurus
- City Lounge, República Checa — 23 ago 2025 — @citylounge_music_club
- Pirata, Berlín — 8 ago 2025 — @pirateofficial
- Temple, CABA — 27 jun 2026 — @club.temple
- "Nombre", Recoleta (probablemente Nane Recoleta) — 23 may 2025 — @nanerecoleta
- La Sodería, Azul — 20 jun 2025 — @la_soderia
- KUK, Olavarría — 4 abr 2025 — @kuk.olavarria
- Eventos privados — 13 jul 2025 — @tommy.p_dj
- Oasis (Azotea), Tandil — 21 ene 2024 — @oasis.skybar
- ¡Llámame! (probablemente Call Me Fest), Azul — 1 ene 2024 — @callmefest.eventos
- Discoteca Fomento, Olavarría — 2 jun 2024 — @fomentodisco
- "Brilla" (probablemente Glow Bar), Tandil — 18 ene 2024 — @glowbardisco
- "Hermanos" (probablemente Brothers Bar), Tandil — 19 feb 2024 — @brothersbartandil
- Nakala, Vitoria-Gasteiz (España) — 4 ene 2023 — @nakalagasteiz
- Mole, Bolívar — 24 mar 2024 — @mole.bar
- Club Camboriú, Brasil — 3 feb 2024 — @clubcamboriubrasil
**Otros:** carpetas de sets externos ("Random Sets", "beginning of career as a DJ"), galerías por ciudad (París, Český Krumlov, Berlín, Recoleta, Paseo de la Plaza BA, MSC Fantasía, Tandil, Vitoria-Gasteiz, Azul, Olavarría, Bolívar, Camboriú), embed de SoundCloud, newsletter (hoy MailerLite).

**Errores del sitio actual (traducción automática / datos):** corregilos y dejame una lista para confirmar con el cliente, sin inventar: "Martillo de Tomas Petersen" y "Tomas" vs "Tommy"; nombres de venues traducidos ("Brilla", "Hermanos", "Nombre"); "Camboriú, Carolina del Sur" (es Brasil); "Conjuntos de contextos externos" (= Random Sets); rótulos dudosos como "Recoleta, Licenciada en Artes" y "MSC, Fantasía"; Club Araoz enlazado al IG de City Lounge (probable error); fechas desordenadas; `alt` en `undefined`. Ordená los shows cronológicamente (más reciente primero).

# Conversión y booking

- Botón **BOOK TOMMY** siempre visible (header sticky), repetido en el hero y al final.
- Sección de booking con mail, WhatsApp e Instagram. Formulario simple (nombre, evento, fecha, ciudad, mensaje) que por ahora haga `mailto:` y quede listo para enviar a un webhook (n8n) vía variable de entorno `BOOKING_WEBHOOK_URL`; validación con Zod, honeypot anti-spam.
- Newsletter con endpoint por variable de entorno (hoy es MailerLite; no inventes credenciales).
- "Press kit / Rider": placeholder deshabilitado, no inventes archivos.
- Siempre debe haber una **vía de contacto rápida y legible** aunque estén activos los efectos al máximo.

# Accesibilidad y seguridad (no negociables)

- **Flashes/epilepsia:** nada que parpadee más de 3 veces por segundo en áreas grandes. El modo "reduced motion" y el tier Low eliminan strobes, shake y parpadeos; incluí un aviso/toggle "Reducir efectos intensos" en la pantalla de entrada.
- Contraste suficiente (cuidado con neón sobre fondo), foco visible, navegación completa por teclado, `alt` reales, jerarquía de headings, controles para pausar animaciones/loops, `aria-live` para estados del player.
- Audio siempre opt-in; botón de mute global siempre accesible.
- Seguridad: headers (CSP razonable, `X-Content-Type-Options`, etc.), links externos con `rel="noopener noreferrer"`, sin secretos en el repo (`.env.example`).

# SEO y compartidos

`<title>` y meta description con "Tommy Petersen DJ Tribal House Argentina", Open Graph/Twitter Card con imagen 1200×630 (idealmente generada dinámicamente), JSON-LD `MusicGroup`/`Person` y `MusicRecording`, `sitemap.xml`, `robots.txt`, favicon animado/estático, idiomas con `hreflang`.

# Cómo trabajar (fases)

1. **Plan primero.** Leé el brief completo y mostrame: estructura de secciones, sistema visual (paleta, tipografías, motion tokens), arquitectura (carpetas, estado global, AudioEngine, sistema de calidad) y la lista de librerías con su propósito. Máximo 3 preguntas si algo bloquea; si no, asumí y avisá. Esperá mi OK.
2. **Fase 0:** scaffold, tooling, CLAUDE.md, CI, seed de contenido con Zod, i18n.
3. **Fase 1:** sistema visual, layout, hero, smooth scroll, cursor, ENTER screen.
4. **Fase 2:** AudioEngine + player global + audio reactivo + Modo Club.
5. **Fase 3:** videos con Modo Cine (Flip, letterbox, ambilight, HLS, PiP/Fullscreen).
6. **Fase 4:** shows/mapa/galerías, pads/sampler, física, easter eggs, transiciones de página.
7. **Fase 5:** booking, newsletter, SEO, scripts CLI de contenido, (opcional) CMS.
8. **Fase 6:** pulido: accesibilidad, performance (Lighthouse móvil ≥ 85 Performance, ≥ 95 Accessibility/SEO/Best Practices), pruebas en 360/768/1440 px, reduced-motion, bundle analyzer.
9. Después de cada fase: build sin errores, lint, typecheck, probar en móvil, commit y resumen corto de lo hecho y lo pendiente.

# Entregables finales

Repo funcionando; `README.md` y `CLAUDE.md` completos; guía de "cómo agregar una canción / video / show"; guía de deploy (Vercel y Docker/Coolify); lista de correcciones de contenido a confirmar con el cliente; lista de decisiones de diseño y qué librería hace qué; y un checklist de lo que **me falta conseguir del cliente** (audios/stems con derechos, videos, covers, press kit, paleta/logo si tiene).

# Restricciones

- No inventes información del artista (fechas, venues, premios, números, citas).
- No uses audio, video o imágenes con copyright de terceros. Para self-hostear música, solo producciones propias de Tommy o material con permiso; los sets con tracks de otros artistas mejor como embed (SoundCloud/YouTube). Dejalo señalado en el README.
- No autoplay de audio sin gesto del usuario.
- No rompas los links existentes (redes, SoundCloud, YouTube, WhatsApp, mail).
- Si una idea visual compromete la legibilidad del contacto/booking o la accesibilidad, priorizá lo segundo.

# Criterio de éxito

Un booker abre el sitio en el celular, toca ENTRAR y en 5 segundos siente "este tipo tiene energía y estilo". Le da play a un track y **todo el sitio late con la música**. Abre un video y lo ve volar al centro en modo cine. Ve que ya tocó en Europa y Sudamérica y le escribe por WhatsApp sin fricción. Y el artista puede sumar un tema nuevo en 2 minutos.
