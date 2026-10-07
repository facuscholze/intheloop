interface CountryStat {
  code: string;
  name: string;
  flag: string;
  shows: number;
  cities: string[];
}

/**
 * Mapa de países sin mapa: grilla directa y legible con bandera, país,
 * cantidad de shows y ciudades donde Tommy tocó. Reemplaza la ruta animada.
 */
export function CountriesGrid({ stats }: { stats: CountryStat[] }) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-2xl uppercase md:text-3xl">
          Dónde toqué
          <span className="text-[var(--accent-gold)]" aria-hidden="true">
            .
          </span>
        </h3>
        <div className="font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
          {stats.length} países
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3">
        {stats.map((c) => (
          <li
            key={c.code}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition-colors duration-300 hover:border-[var(--accent-gold)] md:p-5"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,_rgba(255,214,10,0.08),_transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
            <div className="relative flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-3xl leading-none md:text-4xl" aria-hidden="true">
                    {c.flag}
                  </span>
                  <span className="font-display text-lg leading-tight uppercase md:text-xl">
                    {c.name}
                  </span>
                </div>
                <div className="mt-2 font-mono text-[11px] tracking-wider text-[var(--fg-muted)] uppercase">
                  {c.shows} {c.shows === 1 ? "show" : "shows"}
                </div>
              </div>
              <div
                className="font-display text-3xl leading-none text-[var(--accent-gold)]/80 md:text-4xl"
                aria-hidden="true"
              >
                {String(c.shows).padStart(2, "0")}
              </div>
            </div>

            {c.cities.length > 0 && (
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {c.cities.slice(0, 4).map((city) => (
                  <span
                    key={city}
                    className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] uppercase"
                  >
                    {city}
                  </span>
                ))}
                {c.cities.length > 4 && (
                  <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 font-mono text-[10px] text-[var(--fg-muted)] uppercase">
                    +{c.cities.length - 4}
                  </span>
                )}
              </div>
            )}
            <span className="sr-only">{c.cities.join(", ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
