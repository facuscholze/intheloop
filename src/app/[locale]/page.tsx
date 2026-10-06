import { Hero } from "@/components/hero/Hero";
import { Marquee, MarqueeGiant } from "@/components/effects/Marquee";
import { MusicSection } from "@/components/music/MusicSection";
import { VideoGrid } from "@/components/video/VideoGrid";
import { loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";

export default function HomePage() {
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();

  return (
    <main className="pt-[var(--header-h)]">
      <Hero />

      <Marquee text="TRIBAL HOUSE • HOUSE • LATIN GROOVES • ARGENTINA • IN THE LOOP AGENCY • SUNSET SESSIONS • BEACH PARTY • UNDERGROUND CLUB • AUDIO REACTIVO • MODO CLUB" />

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

          <div className="mt-8 rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-2)] p-6">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Cómo funciona Modo Cine</div>
            <div className="mt-2 text-sm leading-relaxed text-[var(--fg-dim)]">
              Cada card tiene preview loop mudo (IntersectionObserver) + scrub X del mouse. Al click, GSAP anima con Flip (o custom x/y/width/height) desde su
              posición exacta al centro fullscreen, mientras fondo se oscurece con blur, aparecen barras letterbox, hay distorsión chromatic aberration tipo
              portal, y el player global hace ducking (<code className="rounded bg-[var(--bg)] px-1">audioEngine.duck(0.12)</code>). Cierre con X, Esc, click afuera o swipe down
              invierte animación. Ambilight canvas proyecta colores del video al fondo. Controles custom con PiP y Fullscreen API. Soporta MP4/WebM/HLS (hls.js) y
              YouTube facade.
            </div>
          </div>
        </div>
      </section>

      {/* Shows */}
      <section id="shows" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
        <div className="mx-auto max-w-[var(--content-max)]">
          <div className="mb-12 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              SHOWS<span className="text-[var(--accent-gold)]">.</span>
            </h2>
            <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{shows.length} shows • mapa animado Fase 4 • foto flotante hover</div>
          </div>
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {shows.map((s) => (
              <div
                key={s.id}
                className="group flex items-center justify-between py-6 transition-all hover:bg-[var(--bg)] hover:px-4"
                data-cursor="view"
              >
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
                  <div className="font-display text-2xl font-bold uppercase tracking-tight group-hover:text-[var(--accent-fire)]">{s.venue}</div>
                  <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                    {s.city} {s.country} • {s.date} {s.needsReview ? `⚠️ ${s.needsReview}` : ""}
                  </div>
                </div>
                <div className="font-mono text-xs uppercase text-[var(--fg-dim)] group-hover:text-[var(--accent-fire)]">{s.instagram ? "IG →" : ""}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-8">
            <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Ruta animada — Fase 4</div>
            <div className="mt-6 flex flex-wrap gap-3 font-display text-2xl font-bold uppercase">
              {["AR", "→", "ES", "→", "BR", "→", "FR", "→", "CZ", "→", "DE", "→", "JP SOON"].map((c, i) => (
                <span key={i} className={c === "→" ? "text-[var(--fg-dim)]" : "text-[var(--accent-gold)]"}>
                  {c}
                </span>
              ))}
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded bg-[var(--border)]">
              <div className="h-full w-2/3 bg-gradient-to-r from-[var(--accent-fire)] to-[var(--accent-gold)]" />
            </div>
          </div>
        </div>
      </section>

      <Marquee text="BOOK TOMMY • EVENTS@INTHELOOP.AGENCY • WHATSAPP • INSTAGRAM • SOUNDCLOUD • YOUTUBE • BOOK TOMMY • MODO CLUB • AUDIO REACTIVO •" />

      {/* Booking */}
      <section id="booking" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10 pb-[calc(6rem+var(--player-h))]">
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
            </div>
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8">
              <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Formulario booking — Fase 5</div>
              <div className="mt-4 text-sm leading-relaxed text-[var(--fg-dim)]">
                Form Zod + mailto + webhook <code className="rounded bg-[var(--bg)] px-1">BOOKING_WEBHOOK_URL</code>. Honeypot anti-spam.
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

      <footer className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-12 pb-[calc(3rem+var(--player-h))] font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] md:px-10">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col justify-between gap-6 md:flex-row">
          <div>
            <div>© {new Date().getFullYear()} TOMMY PETERSEN / IN THE LOOP AGENCY • ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-muted)]">TRIBAL HOUSE / HOUSE / LATIN GROOVES • Every dancefloor has its own story.</div>
            <div className="mt-2 text-[9px]">Fase 2: Player global + audio reactivo + Modo Club • Atajos: Space, Cmd+→, Cmd+← • Media Session API</div>
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
