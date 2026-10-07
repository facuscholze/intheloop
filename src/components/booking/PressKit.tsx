"use client";

import { useState } from "react";
import { Download, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { getMediaUrl } from "@/lib/media";

interface PressKitProps {
  className?: string;
  showsCount: number;
  countriesCount: number;
}

export function PressKit({ className = "", showsCount, countriesCount }: PressKitProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Bio y stats: los totales llegan calculados desde content/shows/<show>/show.json
  const pressKitData = {
    bio: {
      es: `Tommy Petersen es DJ y productor de Buenos Aires, Argentina, especializado en Tribal House, House y Latin grooves con texturas melódicas. Con 3 años de carrera desde los 14, ha tocado en ${showsCount} shows en ${countriesCount} países.`,
      en: `Tommy Petersen is a DJ and producer from Buenos Aires, Argentina, specializing in Tribal House, House and Latin grooves with melodic textures. With 3 years career since age 14, he has played ${showsCount} shows in ${countriesCount} countries.`,
    },
    stats: {
      shows: showsCount,
      countries: countriesCount,
      years: 3,
    },
    genres: ["Tribal House", "House", "Latin Grooves", "Melodic House"],
    equipment: ["Pioneer CDJ-3000", "DJM-A9", "Ableton Live", "Push 2"],
    socials: {
      instagram: "https://www.instagram.com/tommypetersen/",
      soundcloud: "https://soundcloud.com/tommypetersendj",
      youtube: "https://www.youtube.com/@InTheLoopAgency",
    },
    contact: "events@intheloop.agency",
  };

  // Sitio estático (GitHub Pages): sin API routes, el press kit txt se
  // genera en el cliente a partir de los datos de arriba.
  const downloadPressKitTxt = () => {
    const d = pressKitData;
    const text = `
TOMMY PETERSEN - PRESS KIT
IN THE LOOP AGENCY

BIO (ES):
${d.bio.es}

BIO (EN):
${d.bio.en}

STATS:
- Shows: ${d.stats.shows}+
- Countries: ${d.stats.countries}
- Years: ${d.stats.years}

GENRES:
${d.genres.join(", ")}

EQUIPMENT:
${d.equipment.join(", ")}

CONTACT:
- Email: ${d.contact}

SOCIALS:
- Instagram: ${d.socials.instagram}
- SoundCloud: ${d.socials.soundcloud}
- YouTube: ${d.socials.youtube}

LINKS:
- Website: https://www.intheloop.agency

Generated: ${new Date().toISOString()}
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tommy-petersen-press-kit.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownload = async (type: "pdf" | "images" | "all") => {
    setIsGenerating(true);

    try {
      if (type === "pdf") {
        // Try real PDF first, fallback to generated txt
        const realPdf = getMediaUrl("press/tommy-petersen-press-kit.pdf");
        if (realPdf) {
          // Check if file exists by fetching head
          try {
            const res = await fetch(realPdf, { method: "HEAD" });
            if (res.ok) {
              window.open(realPdf, "_blank");
              setIsGenerating(false);
              return;
            }
          } catch {}
        }
        // Fallback: txt generado en el cliente
        downloadPressKitTxt();
      } else if (type === "images") {
        const imagesUrl = getMediaUrl("press/images.zip");
        if (imagesUrl) {
          window.open(imagesUrl, "_blank");
        } else {
          downloadPressKitTxt();
        }
      } else {
        const allUrl = getMediaUrl("press/press-kit-complete.zip");
        if (allUrl) {
          window.open(allUrl, "_blank");
        } else {
          downloadPressKitTxt();
        }
      }
    } catch (e) {
      console.warn("Download failed", e);
      alert("El PDF todavía no está disponible. Contactanos en events@intheloop.agency o descargá la info en texto.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-6 md:p-8 ${className}`} role="region" aria-label="Press Kit">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-xl font-bold tracking-tight">PRESS KIT</h3>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Material para promoters & bookers</p>
        </div>
        <FileText className="h-6 w-6 text-[var(--fg-dim)]" aria-hidden="true" />
      </div>

      <div className="mb-6 grid gap-4 text-sm leading-relaxed text-[var(--fg-muted)]">
        <p>{pressKitData.bio.es}</p>
        <div className="flex flex-wrap gap-2">
          {pressKitData.genres.map((genre) => (
            <span key={genre} className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-[var(--accent-fire)]">{pressKitData.stats.shows}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--fg-dim)]">Shows</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-[var(--accent-fire)]">{pressKitData.stats.countries}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--fg-dim)]">Países</div>
        </div>
        <div className="text-center">
          <div className="font-display text-2xl font-bold text-[var(--accent-fire)]">{pressKitData.stats.years}</div>
          <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--fg-dim)]">Años</div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Incluye</h4>
        <ul className="mt-2 grid gap-2 font-mono text-xs text-[var(--fg-dim)]" role="list">
          <li className="flex items-center gap-2">
            <FileText className="h-3 w-3" aria-hidden="true" /> Bio ES/EN + rider técnico
          </li>
          <li className="flex items-center gap-2">
            <ImageIcon className="h-3 w-3" aria-hidden="true" /> Fotos alta resolución (hero, shows)
          </li>
          <li className="flex items-center gap-2">
            <Music className="h-3 w-3" aria-hidden="true" /> Logos + press release
          </li>
          <li className="flex items-center gap-2">
            <Video className="h-3 w-3" aria-hidden="true" /> Links videos + EPK
          </li>
        </ul>
      </div>

      <div className="grid gap-3">
        <button
          onClick={() => handleDownload("pdf")}
          disabled={isGenerating}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--fg)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50"
          aria-label="Descargar press kit PDF"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          {isGenerating ? "Generando..." : "Descargar PDF Press Kit"}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleDownload("images")}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--fg)] transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50"
            aria-label="Descargar fotos alta resolución"
          >
            <ImageIcon className="h-3 w-3" aria-hidden="true" /> Fotos HD
          </button>
          <button
            onClick={() => handleDownload("all")}
            disabled={isGenerating}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[var(--fg)] transition-colors hover:border-[var(--fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-lime)] disabled:opacity-50"
            aria-label="Descargar press kit completo ZIP"
          >
            <Download className="h-3 w-3" aria-hidden="true" /> ZIP Completo
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[var(--bg)] p-3 font-mono text-[10px] uppercase tracking-widest text-[var(--fg-dim)]">
        <p>¿Necesitás el rider técnico o fotos en alta? Escribinos a events@intheloop.agency</p>
      </div>
    </div>
  );
}
