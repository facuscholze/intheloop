"use client";

import { useEffect, useRef, useState } from "react";
import { useQualityStore } from "@/stores/qualityStore";
import { usePlayerStore } from "@/stores/playerStore";
import { useUIStore } from "@/stores/uiStore";

interface Pad {
  id: string;
  label: string;
  color: string;
  key: string;
}

const pads: Pad[] = [
  { id: "kick", label: "KICK", color: "#FF5A1F", key: "Q" },
  { id: "shaker", label: "SHAKER", color: "#FF2E93", key: "W" },
  { id: "conga", label: "CONGA", color: "#C8FF00", key: "E" },
  { id: "vocal", label: "VOCAL CHOP", color: "#8B5CF6", key: "R" },
  { id: "bass", label: "BASS", color: "#FFD60A", key: "A" },
  { id: "clap", label: "CLAP", color: "#FF5A1F", key: "S" },
  { id: "hat", label: "HAT", color: "#FF2E93", key: "D" },
  { id: "fx", label: "FX", color: "#C8FF00", key: "F" },
];

export function PadsSection() {
  const tier = useQualityStore((s) => s.tier);
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [crossfader, setCrossfader] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const triggerRef = useRef<(padId: string) => void>(() => {});

  // Init AudioContext for pads
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new Ctx();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Keyboard handling for pads — never fire while the user is typing
  // (the old check missed textareas, so booking/newsletter inputs triggered
  // sounds on every "asdf" keystroke)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      if (!useUIStore.getState().hasEntered) return;
      const t = e.target;
      if (
        t instanceof HTMLInputElement ||
        t instanceof HTMLTextAreaElement ||
        t instanceof HTMLSelectElement
      )
        return;
      if (t instanceof HTMLElement && t.isContentEditable) return;
      const pad = pads.find((p) => p.key.toLowerCase() === e.key.toLowerCase());
      if (pad) {
        e.preventDefault();
        triggerRef.current(pad.id);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const triggerPad = async (padId: string) => {
    setActivePads((prev) => {
      const next = new Set(prev);
      next.add(padId);
      setTimeout(() => {
        setActivePads((p) => {
          const n = new Set(p);
          n.delete(padId);
          return n;
        });
      }, 200);
      return next;
    });

    // Play sound via Web Audio API
    try {
      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") await ctx.resume();
      if (ctx.state !== "running") return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      // Global mute (header button) silences the pads too
      const muted = usePlayerStore.getState().muted;
      const out = muted ? 0 : 1;

      // Different sounds per pad
      switch (padId) {
        case "kick":
          osc.frequency.setValueAtTime(120, now);
          osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
          gain.gain.setValueAtTime(0.8 * out, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.type = "sine";
          break;
        case "shaker": {
          // Noise
          const bufferSize = ctx.sampleRate * 0.2;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          noise.connect(gain);
          gain.gain.setValueAtTime(0.3 * out, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          filter.type = "highpass";
          filter.frequency.value = 5000;
          noise.start(now);
          osc.disconnect();
          filter.disconnect();
          return;
        }
        case "conga":
          osc.frequency.value = 180;
          gain.gain.setValueAtTime(0.5 * out, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          filter.type = "bandpass";
          filter.frequency.value = 300;
          break;
        case "vocal":
          osc.frequency.value = 300 + Math.random() * 200;
          gain.gain.setValueAtTime(0.4 * out, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
          osc.type = "sawtooth";
          filter.type = "lowpass";
          filter.frequency.value = 1200;
          break;
        default:
          osc.frequency.value = 100 + Math.random() * 400;
          gain.gain.setValueAtTime(0.3 * out, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      }

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Pad trigger failed", e);
    }
  };

  triggerRef.current = triggerPad;

  if (tier === "low") {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8 text-center font-mono text-xs text-[var(--fg-muted)] uppercase">
        Pads sampler disponible en modo efectos Normal/Max (Tone.js) — Fase 4
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-display text-3xl font-bold">SAMPLER TRIBAL</h3>
          <p className="mt-2 font-mono text-xs tracking-widest text-[var(--fg-muted)] uppercase">
            Toca los pads • QWERTY • Crossfader entre tracks • Tone.js
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-[var(--fg-dim)] uppercase">Crossfader</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crossfader}
            onChange={(e) => setCrossfader(parseFloat(e.target.value))}
            className="h-1 w-32 accent-[var(--accent-fire)]"
            aria-label="Crossfader entre tracks"
          />
          <span className="font-mono text-[10px] text-[var(--fg-muted)] uppercase">
            {crossfader < 0.4 ? "Track A" : crossfader > 0.6 ? "Track B" : "Mix"}
          </span>
        </div>
      </div>

      {/* Visualizer central — driven by CSS vars, no re-renders per frame */}
      <div className="mb-8 flex h-24 items-center justify-center gap-1 rounded-xl bg-[var(--bg-2)]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-[var(--accent-fire)] transition-[height] duration-100"
            style={{
              height: `calc(10px + var(--bass) * 60px + ${activePads.size > 0 ? 20 : 0}px + ${Math.sin(i * 0.5) * 6 + 6}px)`,
              opacity: "calc(0.5 + var(--bass) * 0.5)",
              transform: "scaleY(calc(1 + var(--beat) * 0.5))",
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {pads.map((pad) => {
          const isActive = activePads.has(pad.id);
          return (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad.id)}
              className={`group relative flex h-28 flex-col items-center justify-center rounded-2xl border-2 font-bold tracking-widest uppercase transition-all active:scale-95 md:h-32 ${
                isActive
                  ? "scale-105 text-black"
                  : "bg-[var(--bg-2)] text-[var(--fg)] hover:border-[var(--fg)]"
              }`}
              style={{
                background: isActive ? pad.color : undefined,
                borderColor: isActive ? pad.color : "var(--border)",
                boxShadow: isActive
                  ? `0 0 20px ${pad.color}80`
                  : `0 0 calc(var(--bass) * 10px) ${pad.color}20`,
                transform: isActive ? `scale(1.05)` : `scale(calc(1 + var(--bass) * 0.02))`,
              }}
              data-cursor="play"
              aria-label={`Pad ${pad.label} (tecla ${pad.key})`}
            >
              <div className="font-display text-lg">{pad.label}</div>
              <div className="mt-1 font-mono text-[10px] opacity-60">{pad.key}</div>
              {isActive && (
                <div
                  className="absolute inset-0 animate-ping rounded-2xl border-2"
                  style={{ borderColor: pad.color }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
            Track A
          </div>
          <div className="font-display mt-1 text-sm font-bold">Tribal Sunset 124 BPM</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--border)]">
            <div
              className="h-full bg-[var(--accent-fire)]"
              style={{ width: `${(1 - crossfader) * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
            Track B
          </div>
          <div className="font-display mt-1 text-sm font-bold">Beach Groove 126 BPM</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--border)]">
            <div
              className="h-full bg-[var(--accent-magenta)]"
              style={{ width: `${crossfader * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] tracking-widest text-[var(--fg-muted)] uppercase">
            BPM Sync
          </div>
          <div className="mt-1 font-mono text-xs">
            124 → 126 • {(crossfader * 2).toFixed(1)}% mix
          </div>
          <div className="mt-2 font-mono text-[9px] text-[var(--fg-dim)] uppercase">
            Juguete del sitio • Tone.js en Fase 4 completo con samples reales
          </div>
        </div>
      </div>
    </div>
  );
}
