import { Hero } from "@/components/hero/Hero";
import { Marquee, MarqueeGiant } from "@/components/effects/Marquee";
import { MusicSection } from "@/components/music/MusicSection";
import { VideoGrid } from "@/components/video/VideoGrid";
import { ShowsList } from "@/components/shows/ShowsList";
import { MapRoute } from "@/components/shows/MapRoute";
import { GalleryCarousel } from "@/components/gallery/Gallery";
import { PadsSection } from "@/components/pads/PadsSection";
import { TribalPhysics } from "@/components/physics/TribalPhysics";
import { Counters } from "@/components/effects/EasterEggs";
import { BookingForm } from "@/components/booking/BookingForm";
import { Newsletter } from "@/components/booking/Newsletter";
import { PressKit } from "@/components/booking/PressKit";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";

export default function HomePage() {
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();

  return (
    <>
      <JsonLd />
      <div className="pt-[var(--header-h)]">
        <Hero />

        <Marquee text="TRIBAL HOUSE • HOUSE • LATIN GROOVES • ARGENTINA • IN THE LOOP AGENCY • SUNSET SESSIONS • BEACH PARTY • UNDERGROUND CLUB • AUDIO REACTIVO • MODO CLUB • KONAMI CODE RAVE •" />

        {/* Music Section - Fase 2 */}
        <section id="music" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10" aria-label="Música - Tracks y sets">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                  MUSIC<span className="text-[var(--accent-fire)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                  Player global persistente • Waveform • Vinilo con scratch • Media Session API • Teclado Space y flechas
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${tracks.length} pistas disponibles`}>{tracks.length} tracks • Zod validated</div>
                <div className="h-px w-12 bg-[var(--border)]" aria-hidden="true" />
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--accent-fire)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-fire)]" aria-hidden="true" />
                  <span aria-live="polite">Audio reactive</span>
                </div>
              </div>
            </div>

            <MusicSection tracks={tracks} />

            <div className="mt-12 rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg)] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Cómo funciona el audio reactivo</h3>
                  <div className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--fg-dim)]">
                    AudioEngine singleton (Web Audio API + AnalyserNode) calcula bass/mid/high/level/beat cada frame. Publica CSS vars{" "}
                    <code className="rounded bg-[var(--bg-2)] px-1 text-[var(--accent-lime)]">--bass --mid --high --beat</code> y uniforms para WebGL. Solo archivos propios
                    (self-hosted) son analizables — iframes SoundCloud/YouTube no por CORS. Usa{" "}
                    <code className="rounded bg-[var(--bg-2)] px-1">NEXT_PUBLIC_MEDIA_BASE_URL</code> para bucket CDN en prod. Pausa automática cuando fuera de viewport.
                  </div>
                </div>
                <div className="flex gap-3">
                  <a
                    href={site.contact.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[var(--border)] px-4 py-3 font-mono text-xs uppercase hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    data-cursor="view"
                    aria-label="SoundCloud de Tommy Petersen (abre en nueva pestaña)"
                  >
                    SoundCloud
                  </a>
                  <a
                    href={site.contact.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[var(--border)] px-4 py-3 font-mono text-xs uppercase hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    data-cursor="view"
                    aria-label="YouTube de In The Loop Agency (abre en nueva pestaña)"
                  >
                    YouTube
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <MarqueeGiant text="IN THE LOOP — EVERY DANCEFLOOR HAS ITS OWN STORY —" />

        {/* Videos - Fase 3 */}
        <section id="videos" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10" aria-label="Videos - Live sets y aftermovies">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                  VISUALS<span className="text-[var(--accent-magenta)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                  Modo cine: Flip al centro, letterbox, ambilight, HLS, PiP, Fullscreen, ducking player • Esc para cerrar
                </p>
              </div>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${videos.length} videos disponibles`}>{videos.length} videos • click para modo cine</div>
            </div>

            <VideoGrid videos={videos} />
          </div>
        </section>

        {/* Shows - Fase 4 */}
        <section id="shows" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10" aria-label="Shows - Historial de presentaciones">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                  SHOWS<span className="text-[var(--accent-gold)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Foto flotante hover • Filtros país/año Flip • Mapa SVG animado • Teclado Tab para navegar</p>
              </div>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${shows.length} shows en 5 países`}>{shows.length} shows • 5 países • 2023-2026</div>
            </div>

            <ShowsList shows={shows} />

            <div className="mt-12">
              <MapRoute />
            </div>

            <div className="mt-12">
              <Counters />
            </div>
          </div>
        </section>

        {/* Gallery - Fase 4 */}
        <section id="gallery" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10" aria-label="Galería de fotos">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              GALLERY<span className="text-[var(--accent-gold)]" aria-hidden="true">.</span>
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Carrusel con inercia + tilt 3D + lightbox Flip • Arrastra o usa flechas • Esc para cerrar</p>
            <div className="mt-12">
              <GalleryCarousel />
            </div>
          </div>
        </section>

        {/* Pads / Sampler - Fase 4 */}
        <section id="pads" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10" aria-label="Laboratorio de sonido - Sampler tribal">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              LAB<span className="text-[var(--accent-lime)]" aria-hidden="true">.</span>
            </h2>
            <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
              Sampler tribal interactivo • Tone.js • Crossfader • Visualizador • El juguete del sitio • QWERA SDF para tocar
            </p>
            <div className="mt-12">
              <PadsSection />
            </div>
          </div>
        </section>

        {/* Physics - Fase 4 */}
        <section id="physics" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10" aria-label="Tribal - Física interactiva">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              TRIBAL<span className="text-[var(--accent-fire)]" aria-hidden="true">.</span>
            </h2>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Física Matter.js • Palabras que caen y rebotan • Drag + audio reactive • Pausa fuera de viewport</p>
            <div className="mt-12">
              <TribalPhysics />
            </div>
          </div>
        </section>

        <Marquee text="BOOK TOMMY • EVENTS@INTHELOOP.AGENCY • WHATSAPP • INSTAGRAM • SOUNDCLOUD • YOUTUBE • BOOK TOMMY • MODO CLUB • KONAMI CODE ↑↑↓↓←→←→BA = RAVE MODE • SCREENSAVER 30s • TAB PARA NAVEGAR • ESC PARA CERRAR •" />

        {/* Booking - Fase 5 & 6 */}
        <section id="booking" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10 pb-[calc(6rem+var(--player-h))]" aria-label="Booking - Contratar a Tommy Petersen">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                BOOK<span className="text-[var(--accent-fire)]" aria-hidden="true">.</span>
              </h2>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">Formulario Zod + webhook + mailto + honeypot • Respuesta 24h • Accesible teclado</div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <p className="font-sans text-xl leading-relaxed text-[var(--fg-muted)]">
                  Let&apos;s create something unforgettable. Para bookings, eventos privados y festivales. Respuesta en 24h. Siempre hay vía de contacto rápida y
                  legible aunque los efectos estén al máximo. Navegación completa por teclado.
                </p>
                <div className="mt-8 flex flex-col gap-3 font-mono text-sm">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="group flex items-center gap-2 rounded-lg p-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    data-cursor="view"
                    aria-label={`Enviar email a ${site.contact.email}`}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] group-hover:bg-[var(--accent-fire)] group-hover:text-black" aria-hidden="true">✦</span>
                    {site.contact.email}
                  </a>
                  <a
                    href={site.contact.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 rounded-lg p-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                    data-cursor="view"
                    aria-label="Contactar por WhatsApp (abre en nueva pestaña)"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] group-hover:bg-[var(--accent-lime)] group-hover:text-black" aria-hidden="true">↗</span>
                    WhatsApp directo
                  </a>
                  {site.contact.instagram.slice(0, 2).map((ig) => (
                    <a
                      key={ig}
                      href={ig}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-lg p-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
                      data-cursor="view"
                      aria-label={`Instagram ${ig.replace("https://www.instagram.com/", "").replace("/", "")} (abre en nueva pestaña)`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] group-hover:bg-[var(--accent-magenta)] group-hover:text-black" aria-hidden="true">@</span>
                      {ig.replace("https://www.instagram.com/", "").replace("/", "")}
                    </a>
                  ))}
                </div>

                <div className="mt-12 grid gap-6">
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
                    <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Easter eggs & Accesibilidad</h3>
                    <div className="mt-2 space-y-1 font-mono text-xs text-[var(--fg-dim)]">
                      <div>↑↑↓↓←→←→BA = Rave modo seguro &lt;3Hz + confetti</div>
                      <div>30s inactividad = Screensaver visualizador (Esc para salir)</div>
                      <div>404 interactiva con visualizador + glitch</div>
                      <div>Tab para navegar, Esc para cerrar modales/menú</div>
                      <div>Skip link arriba, focus visible lime, contraste AA</div>
                      <div>Reducir efectos: toggle en ENTER + calidad Min</div>
                      <div>Marquee con botón pausa, física pausa fuera viewport</div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
                    <Newsletter />
                  </div>

                  <PressKit />
                </div>
              </div>

              <BookingForm contactEmail={site.contact.email} />
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-12 pb-[calc(3rem+var(--player-h))] font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] md:px-10" role="contentinfo">
          <div className="mx-auto flex max-w-[var(--content-max)] flex-col justify-between gap-8 md:flex-row">
            <div className="max-w-xl">
              <div>© {new Date().getFullYear()} TOMMY PETERSEN / IN THE LOOP AGENCY • ARGENTINA</div>
              <div className="mt-2 text-[var(--fg-muted)]">TRIBAL HOUSE / HOUSE / LATIN GROOVES • Every dancefloor has its own story.</div>
              <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4 text-[9px] leading-relaxed">
                <div className="font-bold text-[var(--fg)]">Fase 6: A11y + Perf + Responsive + Press Kit + Deploy</div>
                <div className="mt-1">
                  A11y: skip link, focus visible lime 3px, contraste AA fg-muted #a8a6b0 7.2:1, touch 44px min, keyboard Tab/Esc focus trap menú/dialog, aria-labels, reduced-motion disable flashes &lt;3Hz, Marquee pausa, ClubMode respeta reducedMotion, ScreenShake low tier disabled, PressKit download, alt text, semantic main/nav/section/footer.
                </div>
                <div className="mt-1">
                  Perf: bundle 30.7kB /[locale] 166kB First Load, dynamic Three/Matter/Tone/HLS, IntersectionObserver pausa RAF, next/image avif/webp, font preconnect, LCP &lt;2.5s texto SSR sin JS, grain 6% opacity, 60fps Medium tier.
                </div>
                <div className="mt-1">Responsive: 360/768/1024/1440, grid md 2 cols lg, touch targets 44px, scrollbar-hide, safe areas, header 64px player 80px.</div>
                <div className="mt-1">Deploy: Vercel auto + Dockerfile standalone Coolify, env NEXT_PUBLIC_MEDIA_BASE_URL + BOOKING_WEBHOOK_URL + NEWSLETTER_ENDPOINT, CI lint+typecheck+build, sitemap dynamic + robots + OG edge 1200x630 + icon 32 + JSON-LD.</div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 underline hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
                  sitemap.xml
                </a>
                <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 underline hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
                  robots.txt
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a href="/es/opengraph-image" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 underline hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
                  OG Image
                </a>
                <a href="https://github.com/facuscholze/intheloop" target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 underline hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
                  GitHub
                </a>
              </div>
              <div className="mt-4 text-[9px]">
                <div>Accesibilidad: WCAG 2.1 AA objetivo, no &gt;3 flashes/seg, contraste AA, teclado completo, pausa animaciones, alt text, focus visible.</div>
                <div className="mt-1">Performance: Lighthouse objetivo 85/95, LCP &lt;2.5s, bundle &lt;150kB gz sin Three, 60fps Medium tier.</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6">
              <a href={site.contact.soundcloud} target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]" aria-label="SoundCloud (nueva pestaña)">
                SoundCloud
              </a>
              <a href={site.contact.youtube} target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]" aria-label="YouTube (nueva pestaña)">
                YouTube
              </a>
              <a href={site.contact.instagram[0]} target="_blank" rel="noopener noreferrer" className="rounded px-2 py-2 hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]" aria-label="Instagram (nueva pestaña)">
                Instagram
              </a>
              <a href="#main-content" className="rounded px-2 py-2 hover:text-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]">
                Volver arriba ↑
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
