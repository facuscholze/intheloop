import { Hero } from "@/components/hero/Hero";
import { Marquee, MarqueeGiant } from "@/components/effects/Marquee";
import { MusicSection } from "@/components/music/MusicSection";
import { VideoGrid } from "@/components/video/VideoGrid";
import { ShowsList } from "@/components/shows/ShowsList";
import { CountriesGrid } from "@/components/shows/CountriesGrid";
import { GalleryCarousel } from "@/components/gallery/Gallery";
import { Counters } from "@/components/effects/EasterEggs";
import { BookingForm } from "@/components/booking/BookingForm";
import { PressKit } from "@/components/booking/PressKit";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadGalleries, loadShows, loadSite, loadTracks, loadVideos } from "@/lib/content";

export default function HomePage() {
  const site = loadSite();
  const shows = loadShows();
  const tracks = loadTracks();
  const videos = loadVideos();
  // Galerías: una carpeta por ciudad en content/gallery/ (las fotos se listan solas)
  const galleries = loadGalleries();
  // Stats calculadas desde content/shows/<show>/show.json (nada hardcodeado)
  const countries = Array.from(new Set(shows.map((s) => s.country))).sort();

  const COUNTRY_META: Record<string, { name: string }> = {
    AR: { name: "Argentina" },
    BR: { name: "Brasil" },
    CZ: { name: "Chequia" },
    DE: { name: "Alemania" },
    ES: { name: "España" },
    FR: { name: "Francia" },
  };

  // Grilla de países: legible al primer vistazo (reemplaza la ruta animada)
  const countryStats = countries.map((code) => {
    const list = shows.filter((s) => s.country === code);
    return {
      code,
      name: COUNTRY_META[code]?.name ?? code,
      shows: list.length,
      cities: Array.from(
        new Set(list.map((s) => s.city).filter((c): c is string => Boolean(c)))
      ).sort(),
    };
  });
  const years = shows.map((s) => s.date.slice(0, 4)).sort();
  const yearsRange = `${years[0]}–${years[years.length - 1]}`;

  return (
    <>
      <JsonLd />
      <div className="pt-[var(--header-h)]">
        <Hero countries={countries} />

        <Marquee text="TRIBAL HOUSE • HOUSE • LATIN GROOVES • ARGENTINA • IN THE LOOP AGENCY • SUNSET SESSIONS • BEACH PARTY • UNDERGROUND CLUB •" />

        {/* Music Section - Fase 2 */}
        <section id="music" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10" aria-label="Música - Tracks y sets">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
                  MUSIC<span className="text-[var(--accent-fire)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                  Tracks, sets y remixes para escuchar mientras navegás
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${tracks.length} pistas disponibles`}>{tracks.length} tracks</div>
                <div className="h-px w-12 bg-[var(--border)]" aria-hidden="true" />
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[var(--accent-fire)]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent-fire)]" aria-hidden="true" />
                  <span aria-live="polite">Audio reactive</span>
                </div>
              </div>
            </div>

            <MusicSection tracks={tracks} />

          </div>
        </section>

        <MarqueeGiant text="IN THE LOOP — EVERY DANCEFLOOR HAS ITS OWN STORY —" />

        {/* Videos - Fase 3 */}
        <section id="videos" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10" aria-label="Videos - Live sets y aftermovies">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
                  VISUALS<span className="text-[var(--accent-magenta)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 max-w-xl font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
                  Live sets y aftermovies • Tocá un video para verlo en grande
                </p>
              </div>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${videos.length} videos disponibles`}>{videos.length} videos</div>
            </div>

            <VideoGrid videos={videos} />
          </div>
        </section>

        {/* Shows - Fase 4 */}
        <section id="shows" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10" aria-label="Shows - Historial de presentaciones">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
                  SHOWS<span className="text-[var(--accent-gold)]" aria-hidden="true">.</span>
                </h2>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">Historial de presentaciones • Filtrá por país y año</p>
              </div>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]" aria-label={`${shows.length} shows en ${countries.length} países`}>{shows.length} shows • {countries.length} países • {yearsRange}</div>
            </div>

            <ShowsList shows={shows} />

            <div className="mt-12">
              <CountriesGrid stats={countryStats} />
            </div>

            <div className="mt-12">
              <Counters shows={shows.length} countries={countries} yearsRange={yearsRange} />
            </div>
          </div>
        </section>

        {/* Gallery - Fase 4 */}
        <section id="gallery" className="border-t border-[var(--border)] bg-[var(--bg)] px-6 py-24 md:px-10" aria-label="Galería de fotos">
          <div className="mx-auto max-w-[var(--content-max)]">
            <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
              GALLERY<span className="text-[var(--accent-gold)]" aria-hidden="true">.</span>
            </h2>
            <div className="mt-8">
              <GalleryCarousel galleries={galleries} />
            </div>
          </div>
        </section>

        <Marquee text="BOOK TOMMY • EVENTS@INTHELOOP.AGENCY • WHATSAPP • INSTAGRAM • SOUNDCLOUD • YOUTUBE • BOOK TOMMY • EVERY DANCEFLOOR HAS ITS OWN STORY •" />

        {/* Booking - Fase 5 & 6 */}
        <section id="booking" className="border-t border-[var(--border)] bg-[var(--bg-2)] px-6 py-24 md:px-10 pb-[calc(6rem+var(--player-h))]" aria-label="Booking - Contratar a Tommy Petersen">
          <div className="mx-auto max-w-[var(--content-max)]">
            <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-[clamp(44px,11vw,132px)] font-bold leading-none tracking-tight">
                BOOK<span className="text-[var(--accent-fire)]" aria-hidden="true">.</span>
              </h2>
              <div className="font-mono text-xs uppercase text-[var(--fg-muted)]">Respuesta en 24h • Eventos, festivales y privados</div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <p className="font-sans text-xl leading-relaxed text-[var(--fg-muted)]">
                  Let&apos;s create something unforgettable. Para bookings, eventos privados y
                  festivales. Respuesta en 24h.
                </p>
                <div className="mt-8 flex flex-col gap-3 font-mono text-sm">
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="group flex items-center gap-2 rounded-lg p-2 hover:text-[var(--accent-fire)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)]"
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
                      aria-label={`Instagram ${ig.replace("https://www.instagram.com/", "").replace("/", "")} (abre en nueva pestaña)`}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg)] group-hover:bg-[var(--accent-magenta)] group-hover:text-black" aria-hidden="true">@</span>
                      {ig.replace("https://www.instagram.com/", "").replace("/", "")}
                    </a>
                  ))}
                </div>

                <div className="mt-12">
                  <PressKit showsCount={shows.length} countriesCount={countries.length} />
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
