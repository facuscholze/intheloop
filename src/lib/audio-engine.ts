"use client";

/**
 * AudioEngine singleton - Web Audio API base for reactive visuals.
 * - Creates AudioContext on user gesture (ENTER screen)
 * - Connects to HTMLAudioElement via MediaElementSource
 * - AnalyserNode -> bass/mid/high/level/beat
 * - Publishes CSS vars --bass --mid --high --beat --level
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

type Listener = (analysis: AudioAnalysis) => void;

class AudioEngine {
  context: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  gain: GainNode | null = null;
  source: MediaElementAudioSourceNode | null = null;
  dataArray: Uint8Array | null = null;
  audioEl: HTMLAudioElement | null = null;

  private rafId: number | null = null;
  private listeners: Set<Listener> = new Set();
  private pausedByVisibility = false;
  private isRunning = false;

  // Smoothed values
  private smoothBass = 0;
  private smoothMid = 0;
  private smoothHigh = 0;
  private smoothLevel = 0;
  private beatThreshold = 0.35;
  private lastBeatTime = 0;
  private bpm: number = 124;
  private idlePhase = 0;

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
      await this.context.resume();
    }
  }

  connectMediaElement(el: HTMLAudioElement, bpm = 124) {
    if (!this.context || !this.analyser || !this.gain) this.init();
    if (!this.context || !this.analyser || !this.gain) return;

    // Disconnect previous
    if (this.source) {
      try { this.source.disconnect(); } catch {}
    }

    this.audioEl = el;
    this.bpm = bpm;
    this.analysis.bpm = bpm;

    // Avoid double connect if already connected
    try {
      this.source = this.context.createMediaElementSource(el);
      this.source.connect(this.gain);
    } catch (e) {
      // Already connected or CORS issue - fallback to idle
      console.warn("[AudioEngine] MediaElementSource failed (CORS?), using idle mode", e);
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

    const isPlaying = this.audioEl && !this.audioEl.paused && !this.audioEl.ended;

    if (!isPlaying) {
      this.idleTick();
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray as Uint8Array<ArrayBuffer>);

    // Frequency bands: bass 0-10%, mid 10-50%, high 50-100%
    const len = this.dataArray.length;
    const bassEnd = Math.floor(len * 0.08);
    const midEnd = Math.floor(len * 0.4);

    let bass = 0, mid = 0, high = 0, total = 0;
    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      total += v;
      if (i < bassEnd) bass += v;
      else if (i < midEnd) mid += v;
      else high += v;
    }
    bass /= bassEnd;
    mid /= (midEnd - bassEnd);
    high /= (len - midEnd);
    total /= len;

    // Smooth
    this.smoothBass += (bass - this.smoothBass) * 0.3;
    this.smoothMid += (mid - this.smoothMid) * 0.25;
    this.smoothHigh += (high - this.smoothHigh) * 0.2;
    this.smoothLevel += (total - this.smoothLevel) * 0.2;

    // Beat detection simple: bass energy spike
    const now = performance.now();
    const timeSinceLastBeat = now - this.lastBeatTime;
    const minBeatInterval = (60 / this.bpm) * 1000 * 0.6; // allow 60% of beat interval
    let beat = 0;
    if (this.smoothBass > this.beatThreshold && this.smoothBass > this.smoothMid * 1.2 && timeSinceLastBeat > minBeatInterval) {
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
    // Idle pulse at 124 BPM
    this.idlePhase += 0.016 * (this.bpm / 60);
    const pulse = (Math.sin(this.idlePhase * Math.PI * 2) + 1) / 2;
    const bass = pulse * 0.15;
    this.smoothBass += (bass - this.smoothBass) * 0.05;
    this.smoothMid += (pulse * 0.08 - this.smoothMid) * 0.05;
    this.smoothHigh += (0.02 - this.smoothHigh) * 0.05;
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
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.style.setProperty("--bass", this.analysis.bass.toFixed(3));
      root.style.setProperty("--mid", this.analysis.mid.toFixed(3));
      root.style.setProperty("--high", this.analysis.high.toFixed(3));
      root.style.setProperty("--level", this.analysis.level.toFixed(3));
      root.style.setProperty("--beat", this.analysis.beat.toFixed(3));
      root.style.setProperty("--bass-wght", String(400 + this.analysis.bass * 400));
    }
    this.listeners.forEach((cb) => cb(this.analysis));
  }

  subscribe(cb: Listener) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  setVolume(v: number) {
    if (this.gain) this.gain.gain.value = v;
    if (this.audioEl) this.audioEl.volume = v;
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
    if (this.source) try { this.source.disconnect(); } catch {}
    if (this.context) try { this.context.close(); } catch {}
    this.context = null;
  }
}

// Singleton
export const audioEngine = typeof window !== "undefined" ? new AudioEngine() : null as unknown as AudioEngine;
export default AudioEngine;
