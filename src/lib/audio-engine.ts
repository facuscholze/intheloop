"use client";

/**
 * AudioEngine singleton - Web Audio API base for reactive visuals.
 * - Creates AudioContext on user gesture (ENTER screen)
 * - Connects to HTMLAudioElement via MediaElementSource (ONCE per element)
 * - AnalyserNode -> bass/mid/high/level/beat
 * - Publishes CSS vars --bass --mid --high --beat --level (throttled ~30fps)
 * - Notifies React subscribers throttled + with change detection (perf)
 * - Pauses when tab hidden or out of viewport
 */

export type AudioAnalysis = {
  bass: number; // 0-1
  mid: number;
  high: number;
  level: number;
  beat: number; // 0 or 1, or intensity
  bpm: number;
};

type Listener = (analysis: AudioAnalysis) => null | undefined | void;

/** Publish interval for CSS vars + React listeners (~30fps). */
const PUBLISH_INTERVAL_MS = 33;

class AudioEngine {
  context: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  /** Reserved for ducking only (cine mode). Volume lives on the media element. */
  gain: GainNode | null = null;
  source: MediaElementAudioSourceNode | null = null;
  /** The element already attached to the graph (createMediaElementSource is once-per-element). */
  sourceEl: HTMLAudioElement | null = null;
  dataArray: Uint8Array | null = null;
  audioEl: HTMLAudioElement | null = null;

  private rafId: number | null = null;
  private listeners: Set<Listener> = new Set();
  private pausedByVisibility = false;
  private isRunning = false;

  // Throttle
  private lastPublish = 0;

  // Smoothed values
  private smoothBass = 0;
  private smoothMid = 0;
  private smoothHigh = 0;
  private smoothLevel = 0;
  private beatThreshold = 0.35;
  private lastBeatTime = 0;
  private bpm: number = 124;
  private idlePhase = 0;

  // Last published snapshot (for change detection)
  private lastPublished = "";

  analysis: AudioAnalysis = {
    bass: 0,
    mid: 0,
    high: 0,
    level: 0,
    beat: 0,
    bpm: 124,
  };

  init() {
    if (this.context) return this.context;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new Ctx();
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.8;
    this.gain = this.context.createGain();
    this.gain.gain.value = 1; // duck only — volume is applied on the element
    this.gain.connect(this.analyser);
    this.analyser.connect(this.context.destination);
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    // Visibility handling
    document.addEventListener("visibilitychange", this.handleVisibility);

    return this.context;
  }

  async resume() {
    if (!this.context) this.init();
    if (this.context?.state === "suspended") {
      try {
        await this.context.resume();
      } catch (e) {
        console.warn("[AudioContext] resume failed", e);
      }
    }
  }

  connectMediaElement(el: HTMLAudioElement, bpm = 124) {
    if (!this.context || !this.analyser || !this.gain) this.init();
    if (!this.context || !this.analyser || !this.gain) return;

    this.bpm = bpm;
    this.analysis.bpm = bpm;

    // Already connected to this element: never disconnect/re-create.
    // createMediaElementSource() can only be called ONCE per element, ever.
    if (this.source && this.sourceEl === el) {
      if (!this.isRunning) this.start();
      return;
    }

    this.audioEl = el;

    // First time only: attach the element to the graph.
    if (!this.source) {
      try {
        this.source = this.context.createMediaElementSource(el);
        this.source.connect(this.gain);
        this.sourceEl = el;
      } catch (e) {
        // CORS issue - fallback to element-direct output
        console.warn("[AudioEngine] MediaElementSource failed (CORS?), using idle mode", e);
        this.source = null;
        this.sourceEl = null;
      }
    }

    if (!this.isRunning) this.start();
  }

  private handleVisibility = () => {
    if (document.hidden) {
      this.pausedByVisibility = true;
      this.stop();
    } else if (this.pausedByVisibility) {
      this.pausedByVisibility = false;
      this.start();
    }
  };

  start() {
    if (this.rafId) return;
    this.isRunning = true;
    const loop = () => {
      this.rafId = requestAnimationFrame(loop);
      this.tick();
    };
    loop();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.isRunning = false;
  }

  private tick() {
    if (!this.analyser || !this.dataArray) {
      this.idleTick();
      return;
    }

    // Throttle heavy analysis to ~30fps (visuals don't need more, main thread does)
    const now = performance.now();
    if (now - this.lastPublish < PUBLISH_INTERVAL_MS) return;

    const isPlaying = this.audioEl && !this.audioEl.paused && !this.audioEl.ended;

    if (!isPlaying) {
      this.idleTick();
      return;
    }

    this.lastPublish = now;

    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);

    // Frequency bands: bass 0-10%, mid 10-50%, high 50-100%
    const len = this.dataArray.length;
    const bassEnd = Math.floor(len * 0.08);
    const midEnd = Math.floor(len * 0.4);

    let bass = 0,
      mid = 0,
      high = 0,
      total = 0;
    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      total += v;
      if (i < bassEnd) bass += v;
      else if (i < midEnd) mid += v;
      else high += v;
    }
    bass /= bassEnd;
    mid /= midEnd - bassEnd;
    high /= len - midEnd;
    total /= len;

    // Smooth
    this.smoothBass += (bass - this.smoothBass) * 0.3;
    this.smoothMid += (mid - this.smoothMid) * 0.25;
    this.smoothHigh += (high - this.smoothHigh) * 0.2;
    this.smoothLevel += (total - this.smoothLevel) * 0.2;

    // Beat detection simple: bass energy spike
    const timeSinceLastBeat = now - this.lastBeatTime;
    const minBeatInterval = (60 / this.bpm) * 1000 * 0.6; // allow 60% of beat interval
    let beat = 0;
    if (
      this.smoothBass > this.beatThreshold &&
      this.smoothBass > this.smoothMid * 1.2 &&
      timeSinceLastBeat > minBeatInterval
    ) {
      beat = 1;
      this.lastBeatTime = now;
      // adaptive threshold
      this.beatThreshold = this.smoothBass * 0.9;
    } else {
      // decay threshold
      this.beatThreshold += (0.2 - this.beatThreshold) * 0.01;
      beat = Math.max(0, 1 - timeSinceLastBeat / 200); // decay 200ms
    }

    this.analysis = {
      bass: this.smoothBass,
      mid: this.smoothMid,
      high: this.smoothHigh,
      level: this.smoothLevel,
      beat,
      bpm: this.bpm,
    };

    this.publish();
  }

  private idleTick() {
    // Idle pulse at 124 BPM (throttled by lastPublish in tick())
    this.lastPublish = performance.now();

    this.idlePhase += 0.033 * (this.bpm / 60);
    const pulse = (Math.sin(this.idlePhase * Math.PI * 2) + 1) / 2;
    const bass = pulse * 0.15;
    this.smoothBass += (bass - this.smoothBass) * 0.1;
    this.smoothMid += (pulse * 0.08 - this.smoothMid) * 0.1;
    this.smoothHigh += (0.02 - this.smoothHigh) * 0.1;
    this.smoothLevel = (this.smoothBass + this.smoothMid + this.smoothHigh) / 3;

    const beat = pulse > 0.9 ? 1 : pulse * 0.2;

    this.analysis = {
      bass: this.smoothBass,
      mid: this.smoothMid,
      high: this.smoothHigh,
      level: this.smoothLevel,
      beat,
      bpm: this.bpm,
    };

    this.publish();
  }

  private publish() {
    // Quantize: skip DOM writes + React notifications when nothing changed.
    const a = this.analysis;
    const q = (n: number) => Math.round(n * 100);
    const key = `${q(a.bass)}|${q(a.mid)}|${q(a.high)}|${q(a.level)}|${q(a.beat)}|${a.bpm}`;
    if (key === this.lastPublished) return;
    this.lastPublished = key;

    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--bass", a.bass.toFixed(3));
      root.style.setProperty("--mid", a.mid.toFixed(3));
      root.style.setProperty("--high", a.high.toFixed(3));
      root.style.setProperty("--level", a.level.toFixed(3));
      root.style.setProperty("--beat", a.beat.toFixed(3));
      root.style.setProperty("--bass-wght", String(400 + a.bass * 400));
    }
    this.listeners.forEach((cb) => cb(a));
  }

  subscribe(cb: Listener) {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  /**
   * Player volume. Applies ONLY to the media element — the graph gain is
   * reserved for ducking so both don't multiply each other (old bug: volume
   * was squared, and unduck after cine mode restored a wrong level).
   */
  setVolume(v: number) {
    if (this.audioEl) this.audioEl.volume = v;
  }

  /** Seek absoluto en segundos sobre el elemento de audio activo. */
  seek(seconds: number) {
    if (this.audioEl && Number.isFinite(seconds) && seconds >= 0) {
      try {
        this.audioEl.currentTime = seconds;
      } catch {
        /* seek antes de metadata — ignorar */
      }
    }
  }

  duck(to = 0.15, duration = 0.5) {
    if (!this.gain || !this.context) return;
    const now = this.context.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.linearRampToValueAtTime(to, now + duration);
  }

  unduck(to = 1, duration = 0.6) {
    if (!this.gain || !this.context) return;
    const now = this.context.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.linearRampToValueAtTime(to, now + duration);
  }

  destroy() {
    this.stop();
    document.removeEventListener("visibilitychange", this.handleVisibility);
    if (this.source)
      try {
        this.source.disconnect();
      } catch {}
    if (this.context)
      try {
        this.context.close();
      } catch {}
    this.context = null;
    this.source = null;
    this.sourceEl = null;
    this.audioEl = null;
  }
}

// Singleton
export const audioEngine =
  typeof window !== "undefined" ? new AudioEngine() : (null as unknown as AudioEngine);
export default AudioEngine;
