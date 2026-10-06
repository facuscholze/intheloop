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
import { loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";

export default function HomePage() {
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();

  return (
    <main className="pt-[var(--header-h)]">
      <Hero />

      <Marquee text="TRIBAL HOUSE • HOUSE • LATIN GROOVES • ARGENTINA • IN THE LOOP AGENCY • SUNSET SESSIONS • BEACH PARTY • UNDERGROUND CLUB • AUDIO REACTIVO • MODO CLUB • KONAMI CODE RAVE •" />

      {/* Music Section - Fase 2 */}
      <section id="music" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                MUSIC<span className="text-[var(--accent-fire)]">.</span>
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                Player global persistente • Waveform • Vinilo con scratch • Media Session API
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{tracks.length} tracks • Zod validated</div>
              <div className="h-px w-12 bg-[var(--border)]" />
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--accent-fire)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-fire)]" />
                Audio reactive
              </div>
            </div>
          </div>

          <MusicSection tracks={tracks} />

          <div className="mt-12 rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg)] p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Cómo funciona el audio reactivo</div>
                <div className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--fg-dim)]">
                  AudioEngine singleton (Web Audio API + AnalyserNode) calcula bass/mid/high/level/beat cada frame. Publica CSS vars{" "}
                  <code className="rounded bg-[var(--bg-2)] px-1 text-[var(--accent-lime)]">--bass --mid --high --beat</code> y uniforms para WebGL. Solo archivos propios
                  (self-hosted) son analizables — iframes SoundCloud/YouTube no por CORS. Usa{" "}
                  <code className="rounded bg-[var(--bg-2)] px-1">NEXT_PUBLIC_MEDIA_BASE_URL</code> para bucket CDN en prod.
                </div>
              </div>
              <div className="flex gap-3">
                <a
                  href={site.contact.soundcloud}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs uppercase hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"
                  data-cursor="view"
                >
                  SoundCloud
                </a>
                <a
                  href={site.contact.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[var(--border)] px-4 py-2 font-mono text-xs uppercase hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-black"
                  data-cursor="view"
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
      <section id="videos" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                VISUALS<span className="text-[var(--accent-magenta)]">.</span>
              </h2>
              <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                Modo cine: Flip al centro, letterbox, ambilight, HLS, PiP, Fullscreen, ducking player
              </p>
            </div>
            <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{videos.length} videos • click para modo cine</div>
          </div>

          <VideoGrid videos={videos} />
        </div>
      </section>

      {/* Shows - Fase 4 */}
      <section id="shows" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                SHOWS<span className="text-[var(--accent-gold)]">.</span>
              </h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Foto flotante hover • Filtros país/año Flip • Mapa SVG animado</p>
            </div>
            <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{shows.length} shows • 5 países • 2023-2026</div>
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
      <section id="gallery" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
            GALLERY<span className="text-[var(--accent-gold)]">.</span>
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Carrusel con inercia + tilt 3D + lightbox Flip</p>
          <div className="mt-12">
            <GalleryCarousel />
          </div>
        </div>
      </section>

      {/* Pads / Sampler - Fase 4 */}
      <section id="pads" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
            LAB<span className="text-[var(--accent-lime)]">.</span>
          </h2>
          <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
            Sampler tribal interactivo • Tone.js • Crossfader • Visualizador • El juguete del sitio
          </p>
          <div className="mt-12">
            <PadsSection />
          </div>
        </div>
      </section>

      {/* Physics - Fase 4 */}
      <section id="physics" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
            TRIBAL<span className="text-[var(--accent-fire)]">.</span>
          </h2>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Física Matter.js • Palabras que caen y rebotan • Drag + audio reactive</p>
          <div className="mt-12">
            <TribalPhysics />
          </div>
        </div>
      </section>

      <Marquee text="BOOK TOMMY • EVENTS@INTHELOOP.AGENCY • WHATSAPP • INSTAGRAM • SOUNDCLOUD • YOUTUBE • BOOK TOMMY • MODO CLUB • KONAMI CODE ↑↑↓↓←→←→BA = RAVE MODE • SCREENSAVER 30s •" />

      {/* Booking */}
      <section id="booking" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10 pb-[calc(6rem+var(--player-h))]">
        <div className="mx-auto max-w-[var(--content-max)]">
          <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
            BOOK<span className="text-[var(--accent-fire)]">.</span>
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-2">
            <div>
              <p className="font-sans text-xl leading-relaxed text-[var(--fg-muted)]">
                Let&apos;s create something unforgettable. Para bookings, eventos privados y festivales. Respuesta en 24h.
              </p>
              <div className="mt-8 flex flex-col gap-3 font-mono text-sm">
                <a href={`mailto:${site.contact.email}`} className="group flex items-center gap-2 hover:text-[var(--accent-fire)]" data-cursor="view">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-2)] group-hover:bg-[var(--accent-fire)] group-hover:text-black">✦</span>
                  {site.contact.email}
                </a>
                <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--accent-fire)]" data-cursor="view">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-2)] group-hover:bg-[var(--accent-lime)] group-hover:text-black">↗</span>
                  WhatsApp
                </a>
                {site.contact.instagram.slice(0, 2).map((ig) => (
                  <a key={ig} href={ig} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 hover:text-[var(--accent-fire)]" data-cursor="view">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-2)] group-hover:bg-[var(--accent-magenta)] group-hover:text-black">@</span>
                    {ig.replace("https://www.instagram.com/", "").replace("/", "")}
                  </a>
                ))}
              </div>

              <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6">
                <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Easter eggs</div>
                <div className="mt-2 space-y-1 font-mono text-xs text-[var(--fg-dim)]">
                  <div>↑↑↓↓←→←→BA = Rave total + confetti (Konami code)</div>
                  <div>30s sin mover mouse = Screensaver visualizador</div>
                  <div>404 interactiva con visualizador (Fase 4)</div>
                  <div>Cursor custom con estela + audio reactive</div>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Formulario booking — Fase 5</div>
              <div className="mt-4 text-sm leading-relaxed text-[var(--fg-dim)]">
                Form Zod + mailto + webhook <code className="rounded bg-[var(--bg-2)] px-1">BOOKING_WEBHOOK_URL</code>. Honeypot anti-spam.
              </div>
              <a
                href={`mailto:${site.contact.email}?subject=Booking%20Tommy%20Petersen`}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-fire)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
                data-cursor="view"
              >
                Enviar mail directo
              </a>
              <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">Respuesta garantizada en 24h • No spam</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-12 pb-[calc(3rem+var(--player-h))] font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] md:px-10">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col justify-between gap-6 md:flex-row">
          <div>
            <div>© {new Date().getFullYear()} TOMMY PETERSEN / IN THE LOOP AGENCY • ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-muted)]">TRIBAL HOUSE / HOUSE / LATIN GROOVES • Every dancefloor has its own story.</div>
            <div className="mt-2 text-[9px]">Fase 4: Shows foto flotante + mapa SVG + galería inercia + pads Tone.js + física Matter.js + Konami + screensaver</div>
          </div>
          <div className="flex flex-wrap gap-6">
            <a href={site.contact.soundcloud} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
              SoundCloud
            </a>
            <a href={site.contact.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
              YouTube
            </a>
            <a href={site.contact.instagram[0]} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
