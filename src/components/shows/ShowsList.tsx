"use client";

import { useState, useEffect, useCallback } from "react";
import { ShowRow, FloatingPhoto } from "./ShowRow";
import { gsap } from "@/lib/motion";
import type { Show } from "@/lib/content";

interface ShowsListProps {
  shows: Show[];
}

export function ShowsList({ shows }: ShowsListProps) {
  const [filterCountry, setFilterCountry] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [hoveredShow, setHoveredShow] = useState<Show | null>(null);

  const countries = Array.from(new Set(shows.map((s) => s.country))).sort();
  const years = Array.from(new Set(shows.map((s) => s.date.slice(0, 4))))
    .sort()
    .reverse();

  const filtered = shows.filter((s) => {
    if (filterCountry !== "all" && s.country !== filterCountry) return false;
    if (filterYear !== "all" && !s.date.startsWith(filterYear)) return false;
    return true;
  });

  // Flip animation for filters
  useEffect(() => {
    const rows = document.querySelectorAll(".show-row");
    gsap.fromTo(
      rows,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power3.out", overwrite: "auto" }
    );
  }, [filterCountry, filterYear]);

  // Stable identity so memoized rows don't re-render on every list render
  const handleHover = useCallback((show: Show | null) => {
    setHoveredShow(show);
  }, []);

  return (
    <div>
      {/* Filters — Mobile: cada grupo apilado (etiqueta arriba + chips en una
          sola fila con scroll horizontal). Desktop (md:): idéntico a antes
          (cápsulas con wrap). La lógica de filtrado no cambia. */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:flex-wrap md:items-center md:gap-3">
        <div className="flex flex-col gap-2 md:max-w-full md:flex-row md:items-center md:gap-2 md:rounded-full md:border md:border-[var(--border)] md:bg-[var(--bg)] md:p-1">
          <span className="px-1 font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase md:px-3">
            País:
          </span>
          <div className="shows-filter-chips flex flex-nowrap items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
            <button
              onClick={() => setFilterCountry("all")}
              data-active={filterCountry === "all"}
              aria-pressed={filterCountry === "all"}
              className={`shrink-0 rounded-full px-4 py-1 font-mono text-xs whitespace-nowrap uppercase md:px-3 ${filterCountry === "all" ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
            >
              Todos
            </button>
            {countries.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCountry(c)}
                data-active={filterCountry === c}
                aria-pressed={filterCountry === c}
                className={`shrink-0 rounded-full px-4 py-1 font-mono text-xs whitespace-nowrap uppercase md:px-3 ${filterCountry === c ? "bg-[var(--accent-fire)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:max-w-full md:flex-row md:items-center md:gap-2 md:rounded-full md:border md:border-[var(--border)] md:bg-[var(--bg)] md:p-1">
          <span className="px-1 font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase md:px-3">
            Año:
          </span>
          <div className="shows-filter-chips flex flex-nowrap items-center gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
            <button
              onClick={() => setFilterYear("all")}
              data-active={filterYear === "all"}
              aria-pressed={filterYear === "all"}
              className={`shrink-0 rounded-full px-4 py-1 font-mono text-xs whitespace-nowrap uppercase md:px-3 ${filterYear === "all" ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
            >
              Todos
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setFilterYear(y)}
                data-active={filterYear === y}
                aria-pressed={filterYear === y}
                className={`shrink-0 rounded-full px-4 py-1 font-mono text-xs whitespace-nowrap uppercase md:px-3 ${filterYear === y ? "bg-[var(--accent-gold)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 font-mono text-xs text-[var(--fg-dim)] uppercase md:px-3">
          {filtered.length} / {shows.length} shows
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {filtered.map((show) => (
          <div key={show.id} className="show-row">
            <ShowRow show={show} onHover={handleHover} />
          </div>
        ))}
      </div>

      <FloatingPhoto show={hoveredShow} />
    </div>
  );
}
