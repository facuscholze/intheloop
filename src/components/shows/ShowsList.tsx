"use client";

import { useState, useEffect } from "react";
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const countries = Array.from(new Set(shows.map((s) => s.country))).sort();
  const years = Array.from(new Set(shows.map((s) => s.date.slice(0, 4)))).sort().reverse();

  const filtered = shows.filter((s) => {
    if (filterCountry !== "all" && s.country !== filterCountry) return false;
    if (filterYear !== "all" && !s.date.startsWith(filterYear)) return false;
    return true;
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Flip animation for filters
  useEffect(() => {
    const rows = document.querySelectorAll(".show-row");
    gsap.fromTo(
      rows,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.03, ease: "power3.out", overwrite: "auto" }
    );
  }, [filterCountry, filterYear]);

  const handleHover = (show: Show | null) => {
    setHoveredShow(show);
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] p-1">
          <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">País:</span>
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

        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] p-1">
          <span className="px-3 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Año:</span>
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

        <div className="flex items-center gap-2 px-3 font-mono text-xs uppercase text-[var(--fg-dim)]">
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

      <FloatingPhoto show={hoveredShow} mousePos={mousePos} />
    </div>
  );
}
