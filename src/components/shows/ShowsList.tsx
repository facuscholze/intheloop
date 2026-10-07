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
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] p-1">
          <span className="px-3 font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
            País:
          </span>
          <button
            onClick={() => setFilterCountry("all")}
            className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${filterCountry === "all" ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
          >
            Todos
          </button>
          {countries.map((c) => (
            <button
              key={c}
              onClick={() => setFilterCountry(c)}
              className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${filterCountry === c ? "bg-[var(--accent-fire)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] p-1">
          <span className="px-3 font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
            Año:
          </span>
          <button
            onClick={() => setFilterYear("all")}
            className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${filterYear === "all" ? "bg-[var(--fg)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
          >
            Todos
          </button>
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setFilterYear(y)}
              className={`rounded-full px-3 py-1 font-mono text-xs uppercase ${filterYear === y ? "bg-[var(--accent-gold)] text-black" : "text-[var(--fg-muted)] hover:text-[var(--fg)]"}`}
            >
              {y}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-3 font-mono text-xs text-[var(--fg-dim)] uppercase">
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
