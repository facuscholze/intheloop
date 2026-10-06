import { EnterScreen } from "@/components/enter/EnterScreen";
import { Hero } from "@/components/hero/Hero";
import { CursorBlob } from "@/components/effects/CursorBlob";
import { loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";
import { getMediaUrl } from "@/lib/media";

export default function HomePage() {
  // Server: load content (validated with Zod)
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();

  return (
    <>
      <div className="grain" />
      <CursorBlob />
      <EnterScreen />

      <header className="fixed top-0 z-40 flex h-[var(--header-h)] w-full items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-6 backdrop-blur-xl md:px-10">
        <div className="font-display text-lg font-bold tracking-tight">
          IN THE LOOP<span className="text-[var(--accent-fire)]">.</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1 font-mono text-[10px] uppercase md:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-lime)]" />
            {site.genres.join(" / ")}
          </div>
          <a
            href={`mailto:${site.contact.email}`}
            className="rounded-full bg-[var(--accent-fire)] px-5 py-2 font-bold text-xs uppercase tracking-widest text-black transition-transform hover:scale-105"
          >
            BOOK TOMMY
          </a>
        </div>
      </header>

      <main className="pt-[var(--header-h)]">
        <Hero />

        {/* Music Section - placeholder for Phase 2 */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
                MUSIC<span className="text-[var(--accent-fire)]">.</span>
              </h2>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">{tracks.length} tracks • Zod validated</div>
            </div>

            {tracks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center">
                <p className="font-mono text-sm uppercase tracking-widest text-[var(--fg-muted)]">
                  No hay tracks aún. Agregá JSONs en <code>content/tracks/</code> + audios en <code>media-src/audio/tracks/</code>
                </p>
                <p className="mt-2 text-xs text-[var(--fg-dim)]">
                  Template: <code>content/tracks/_TEMPLATE.json</code> • Script: <code>pnpm add:track</code>
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tracks.map((t) => (
                  <div key={t.id} className="group rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-6 transition-colors hover:border-[var(--accent-fire)]">
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
              <a href={site.contact.soundcloud} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase underline">
                SoundCloud
              </a>
              <a href={site.contact.youtube} target="_blank" rel="noopener noreferrer" className="font-mono text-xs uppercase underline">
                YouTube
              </a>
            </div>
          </div>
        </section>

        {/* Videos Section - placeholder Phase 3 */}
        <section className="border-t border-[var(--border)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              VISUALS<span className="text-[var(--accent-magenta)]">.</span>
            </h2>
            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {videos.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-dashed border-[var(--border)] p-12 text-center font-mono text-sm uppercase text-[var(--fg-muted)]">
                  No hay videos aún. <code>content/videos/</code> + <code>media-src/video/</code>
                </div>
              ) : (
                videos.map((v) => (
                  <div key={v.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
                    <div className="font-display text-lg">{v.title}</div>
                    <div className="font-mono text-xs text-[var(--fg-muted)]">{v.venue} • {v.date}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Shows Section - Phase 4 */}
        <section className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              SHOWS<span className="text-[var(--accent-gold)]">.</span>
            </h2>
            <div className="mt-12 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {shows.map((s) => (
                <div key={s.id} className="group flex items-center justify-between py-6 transition-colors hover:bg-[var(--bg)]">
                  <div className="flex flex-col md:flex-row md:items-baseline md:gap-6">
                    <div className="font-display text-2xl font-bold uppercase tracking-tight">{s.venue}</div>
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
          </div>
        </section>

        {/* Booking Section - Phase 5 */}
        <section className="border-t border-[var(--border)] px-6 py-24 md:px-10">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(32px,8vw,96px)] font-bold leading-none tracking-tight">
              BOOK<span className="text-[var(--accent-fire)]">.</span>
            </h2>
            <div className="mt-12 grid gap-12 md:grid-cols-2">
              <div>
                <p className="font-sans text-xl leading-relaxed text-[var(--fg-muted)]">
                  Let&apos;s create something unforgettable. Para bookings, eventos privados y festivales.
                </p>
                <div className="mt-8 flex flex-col gap-3 font-mono text-sm">
                  <a href={`mailto:${site.contact.email}`} className="hover:text-[var(--accent-fire)]">
                    ✦ {site.contact.email}
                  </a>
                  <a href={site.contact.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-fire)]">
                    ✦ WhatsApp
                  </a>
                  {site.contact.instagram.map((ig) => (
                    <a key={ig} href={ig} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent-fire)]">
                      ✦ {ig.replace("https://www.instagram.com/", "@").replace("/", "")}
                    </a>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-2)] p-6">
                <div className="font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Formulario (Phase 5)</div>
                <div className="mt-4 text-sm text-[var(--fg-dim)]">
                  Form Zod + mailto + webhook <code>BOOKING_WEBHOOK_URL</code>. Honeypot anti-spam. Por ahora usa mailto.
                </div>
                <a href={`mailto:${site.contact.email}?subject=Booking%20Tommy%20Petersen`} className="mt-6 inline-block rounded-full bg-[var(--fg)] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black">
                  Enviar mail
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] px-6 py-12 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)] md:px-10">
        <div className="mx-auto flex max-w-[var(--content-max)] flex-col justify-between gap-4 md:flex-row">
          <div>© {new Date().getFullYear()} TOMMY PETERSEN / IN THE LOOP AGENCY • ARGENTINA</div>
          <div className="flex gap-6">
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

      {/* Player placeholder - Phase 2 */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex h-[var(--player-h)] items-center justify-between border-t border-[var(--border)] bg-[var(--bg)]/90 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 animate-[spin_3s_linear_infinite] rounded-full bg-gradient-to-br from-[var(--accent-fire)] to-[var(--accent-magenta)]" />
          <div>
            <div className="font-display text-sm font-bold">PLAYER GLOBAL (Phase 2)</div>
            <div className="font-mono text-[10px] uppercase text-[var(--fg-muted)]">Audio reactive • Waveform • Media Session</div>
          </div>
        </div>
        <div className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">Persistente • No se corta al navegar</div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
