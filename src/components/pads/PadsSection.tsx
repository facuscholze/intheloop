"use client";

import { useEffect, useRef, useState } from "react";
import { useAudioReactive } from "@/hooks/useAudioReactive";
import { useQualityStore } from "@/stores/qualityStore";
import { usePlayerStore } from "@/stores/playerStore";

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
  const { bass, beat } = useAudioReactive();
  const [activePads, setActivePads] = useState<Set<string>>(new Set());
  const [crossfader, setCrossfader] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isToneLoaded, setIsToneLoaded] = useState(false);

  // Init AudioContext for pads
  useEffect(() => {
    if (typeof window === "undefined") return;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new Ctx();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Keyboard handling for pads
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const pad = pads.find((p) => p.key.toLowerCase() === e.key.toLowerCase());
      if (pad) {
        triggerPad(pad.id);
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
    const ctx = audioContextRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") await ctx.resume();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    // Different sounds per pad
    switch (padId) {
      case "kick":
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.type = "sine";
        break;
      case "shaker":
        // Noise
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gain);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        filter.type = "highpass";
        filter.frequency.value = 5000;
        noise.start(now);
        return;
      case "conga":
        osc.frequency.value = 180;
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        filter.type = "bandpass";
        filter.frequency.value = 300;
        break;
      case "vocal":
        osc.frequency.value = 300 + Math.random() * 200;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.type = "sawtooth";
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        break;
      default:
        osc.frequency.value = 100 + Math.random() * 400;
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    }

    osc.start(now);
    osc.stop(now + 0.5);
  };

  if (tier === "low") {
    return (
      <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg-2)] p-8 text-center font-mono text-xs uppercase text-[var(--fg-muted)]">
        Pads sampler disponible en modo efectos Normal/Max (Tone.js) — Fase 4
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--bg)] p-6 md:p-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="font-display text-3xl font-bold">SAMPLER TRIBAL</h3>
          <p className="mt-2 font-mono text-xs uppercase tracking-widest text-[var(--fg-muted)]">
            Toca los pads • QWERTY • Crossfader entre tracks • Tone.js
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase text-[var(--fg-dim)]">Crossfader</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={crossfader}
            onChange={(e) => setCrossfader(parseFloat(e.target.value))}
            className="h-1 w-32 accent-[var(--accent-fire)]"
          />
          <span className="font-mono text-[10px] uppercase text-[var(--fg-muted)]">
            {crossfader < 0.4 ? "Track A" : crossfader > 0.6 ? "Track B" : "Mix"}
          </span>
        </div>
      </div>

      {/* Visualizer central */}
      <div className="mb-8 flex h-24 items-center justify-center rounded-xl bg-[var(--bg-2)]">
        <div className="flex items-end gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full bg-[var(--accent-fire)] transition-all duration-100"
              style={{
                height: `${10 + bass * 60 + (activePads.size > 0 ? 20 : 0) + Math.sin(i * 0.5 + Date.now() * 0.005) * 10}px`,
                opacity: 0.5 + bass * 0.5,
                transform: `scaleY(${1 + beat * 0.5})`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {pads.map((pad) => {
          const isActive = activePads.has(pad.id);
          return (
            <button
              key={pad.id}
              onClick={() => triggerPad(pad.id)}
              className={`group relative flex h-28 flex-col items-center justify-center rounded-2xl border-2 font-bold uppercase tracking-widest transition-all active:scale-95 md:h-32 ${
                isActive ? "scale-105 text-black" : "bg-[var(--bg-2)] text-[var(--fg)] hover:border-[var(--fg)]"
              }`}
              style={{
                background: isActive ? pad.color : undefined,
                borderColor: isActive ? pad.color : "var(--border)",
                boxShadow: isActive ? `0 0 20px ${pad.color}80` : `0 0 ${bass * 10}px ${pad.color}20`,
                transform: isActive ? `scale(1.05)` : `scale(${1 + bass * 0.02})`,
              }}
              data-cursor="play"
            >
              <div className="font-display text-lg">{pad.label}</div>
              <div className="mt-1 font-mono text-[10px] opacity-60">{pad.key}</div>
              {isActive && <div className="absolute inset-0 animate-ping rounded-2xl border-2" style={{ borderColor: pad.color }} />}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Track A</div>
          <div className="mt-1 font-display text-sm font-bold">Tribal Sunset 124 BPM</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--border)]">
            <div className="h-full bg-[var(--accent-fire)]" style={{ width: `${(1 - crossfader) * 100}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">Track B</div>
          <div className="mt-1 font-display text-sm font-bold">Beach Groove 126 BPM</div>
          <div className="mt-2 h-1 w-full overflow-hidden rounded bg-[var(--border)]">
            <div className="h-full bg-[var(--accent-magenta)]" style={{ width: `${crossfader * 100}%` }} />
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--fg-muted)]">BPM Sync</div>
          <div className="mt-1 font-mono text-xs">124 → 126 • {(crossfader * 2).toFixed(1)}% mix</div>
          <div className="mt-2 font-mono text-[9px] uppercase text-[var(--fg-dim)]">Juguete del sitio • Tone.js en Fase 4 completo con samples reales</div>
        </div>
      </div>
    </div>
  );
}
