import { EnterScreen } from "@/components/enter/EnterScreen";
import { Hero } from "@/components/hero/Hero";
import { CursorBlob } from "@/components/effects/CursorBlob";
import { Grain } from "@/components/effects/Grain";
import { Marquee, MarqueeGiant } from "@/components/effects/Marquee";
import { Header } from "@/components/ui/Header";
import { Menu } from "@/components/ui/Menu";
import { loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";
import { getMediaUrl } from "@/lib/media";

export default function HomePage() {
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();

  return (
    <>
      <Grain />
      <CursorBlob />
      <EnterScreen />
      <Header />
      <Menu />

      <main>
        <Hero />

        <Marquee text="TRIBAL HOUSE • HOUSE • LATIN GROOVES • ARGENTINA • IN THE LOOP AGENCY • SUNSET SESSIONS • BEACH PARTY • UNDERGROUND CLUB" />

        {/* Music Section */}
        <section id="music" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                MUSIC<span className="text-[var(--accent-fire)]">.</span>
              </h2>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{tracks.length} tracks • Zod validated</div>
                <div className="h-px w-12 bg-[var(--border)]" />
                <div className="font-mono text-[10px] uppercase text-[var(--accent-fire)]">● Audio reactive</div>
              </div>
            </div>

            {tracks.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-[var(--border)] bg-[var(--bg)] p-12 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-[var(--fg-muted)]">
                  No hay tracks aún. Agregá JSONs en <code className="rounded bg-[var(--bg-2)] px-1">content/tracks/</code> + audios en{" "}
                  <code className="rounded bg-[var(--bg-2)] px-1">media-src/audio/tracks/</code>
                </p>
                <p className="mt-2 text-xs text-[var(--fg-dim)]">
                  Template: <code>content/tracks/_TEMPLATE.json</code> • Script: <code>pnpm add:track</code>
                </p>
                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  {[
                    { title: "Sunset Tribal Mix", bpm: 124, key: "Am" },
                    { title: "Beach Party Groove", bpm: 126, key: "Fm" },
                    { title: "Underground House", bpm: 122, key: "Gm" },
                  ].map((t) => (
                    <div
                      key={t.title}
                      className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6 text-left transition-colors hover:border-[var(--accent-fire)]"
                      data-cursor="play"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-display text-lg font-bold">{t.title}</div>
                          <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                            {t.bpm} BPM • {t.key} • Tribal House
                          </div>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-fire)]/20 text-[var(--accent-fire)]">
                          ▶
                        </div>
                      </div>
                      <div className="mt-4 h-8 w-full rounded bg-[var(--bg)]">
                        <div className="flex h-full items-end gap-[2px] p-2">
                          {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-[var(--accent-fire)]/40" style={{ height: `${20 + Math.random() * 80}%` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 transition-colors hover:border-[var(--accent-fire)]"
                    data-cursor="play"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-display text-xl font-bold">{t.title}</div>
                        <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                          {t.bpm ? `${t.bpm} BPM` : ""} {t.key ? `• ${t.key}` : ""} • {t.genres.join(", ")}
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[var(--accent-fire)]/20" />
                    </div>
                    <div className="mt-4 text-xs text-[var(--fg-dim)]">{getMediaUrl(t.audioSrc) || "Sin audio (embed externo)"}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <a href={site.contact.soundcloud} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase underline hover:text-[var(--accent-fire)]">
                SoundCloud
              </a>
              <a href={site.contact.youtube} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase underline hover:text-[var(--accent-fire)]">
                YouTube
              </a>
            </div>
          </div>
        </section>

        <MarqueeGiant text="IN THE LOOP — EVERY DANCEFLOOR HAS ITS OWN STORY —" />

        {/* Videos */}
        <section id="videos" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              VISUALS<span className="text-[var(--accent-magenta)]">.</span>
            </h2>
            <p className="mt-4 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
              Modo cine con Flip animation, letterbox, ambilight y HLS — Fase 3
            </p>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {videos.length === 0 ? (
                <div className="col-span-2 grid gap-4 md:grid-cols-2">
                  {[
                    { title: "Live @ Le Fleurus Paris", venue: "Le Fleurus", date: "2025-09-12" },
                    { title: "Sundowner Session", venue: "Sundowner", date: "2026-01-31" },
                    { title: "Pirata Berlin", venue: "Pirata", date: "2025-08-08" },
                    { title: "Temple CABA", venue: "Temple", date: "2026-06-27" },
                  ].map((v) => (
                    <div
                      key={v.title}
                      className="group relative aspect-video overflow-hidden rounded-[1.5rem] border border-[var(--border)] bg-[var(--bg-2)] p-6 transition-all hover:border-[var(--accent-magenta)]"
                      data-cursor="view"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-magenta)]/20 to-[var(--bg-2)]" />
                      <div className="relative flex h-full flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div className="rounded-full bg-[var(--bg)] px-3 py-1 font-mono text-[10px] uppercase">▶ Preview</div>
                          <div className="h-8 w-8 rounded-full bg-[var(--accent-magenta)]/20" />
                        </div>
                        <div>
                          <div className="font-display text-xl font-bold">{v.title}</div>
                          <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                            {v.venue} • {v.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6" data-cursor="view">
                    <div className="font-display text-lg">{v.title}</div>
                    <div className="font-mono text-xs text-[var(--fg-muted)]">
                      {v.venue} • {v.date}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Shows */}
        <section id="shows" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                SHOWS<span className="text-[var(--accent-gold)]">.</span>
              </h2>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{shows.length} shows • mapa animado Fase 4</div>
            </div>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {shows.map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between py-6 transition-colors hover:bg-[var(--bg)] hover:px-4"
                  data-cursor="view"
                >
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
                    <div className="font-display text-2xl font-bold uppercase tracking-tight group-hover:text-[var(--accent-fire)]">
                      {s.venue}
                    </div>
                    <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">
                      {s.city} {s.country} • {s.date} {s.needsReview ? `⚠️ ${s.needsReview}` : ""}
                    </div>
                  </div>
                  <div className="font-mono text-xs uppercase text-[var(--fg-dim)] group-hover:text-[var(--accent-fire)]">
                    {s.instagram ? "IG →" : ""}
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
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

        <Marquee text="BOOK TOMMY • EVENTS@INTHELOOP.AGENCY • WHATSAPP • INSTAGRAM • SOUNDCLOUD • YOUTUBE • BOOK TOMMY •" />

        {/* Booking */}
        <section id="booking" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10">
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

                <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
                  <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Press kit / Rider</div>
                  <div className="mt-2 text-sm text-[var(--fg-dim)]">Placeholder deshabilitado — Fase 5. No inventar archivos.</div>
                </div>
              </div>
              <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8">
                <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Formulario booking — Fase 5</div>
                <div className="mt-4 text-sm leading-relaxed text-[var(--fg-dim)]">
                  Form Zod + mailto + webhook <code className="rounded bg-[var(--bg)] px-1">BOOKING_WEBHOOK_URL</code>. Honeypot anti-spam. Por ahora usa mailto directo.
                </div>
                <div className="mt-8 grid gap-4">
                  <div className="h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 font-mono text-xs uppercase leading-[48px] text-[var(--fg-dim)]">
                    Nombre del evento
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 font-mono text-xs uppercase leading-[48px] text-[var(--fg-dim)]">Fecha</div>
                    <div className="h-12 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 font-mono text-xs uppercase leading-[48px] text-[var(--fg-dim)]">Ciudad</div>
                  </div>
                  <div className="h-24 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 font-mono text-xs uppercase text-[var(--fg-dim)]">Mensaje</div>
                </div>
                <a
                  href={`mailto:${site.contact.email}?subject=Booking%20Tommy%20Petersen`}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[var(--accent-fire)] px-6 py-4 text-sm font-bold uppercase tracking-widest text-black transition-transform hover:scale-[1.02]"
                  data-cursor="view"
                >
                  Enviar mail directo
                </a>
                <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
                  Respuesta garantizada en 24h • No spam
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-12 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] md:px-10">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col justify-between gap-6 md:flex-row">
          <div>
            <div>© {new Date().getFullYear()} TOMMY PETERSEN / IN THE LOOP AGENCY • ARGENTINA</div>
            <div className="mt-2 text-[var(--fg-muted)]">TRIBAL HOUSE / HOUSE / LATIN GROOVES • Every dancefloor has its own story.</div>
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
            <a href={`mailto:${site.contact.email}`} className="hover:text-[var(--accent-fire)]">
              events@intheloop.agency
            </a>
          </div>
        </div>
      </footer>

      {/* Player placeholder Fase 2 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full">
            <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]" />
            <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
          </div>
          <div>
            <div className="font-display text-sm font-bold">PLAYER GLOBAL — Fase 2</div>
            <div className="font-mono text-[10px] uppercase text-[var(--fg-muted)]">Audio reactive • Waveform • Media Session API</div>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="h-1 w-24 overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full w-1/2 bg-[var(--accent-fire)]" />
          </div>
          <div className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">Persistente</div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
