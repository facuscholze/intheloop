"use client";

import { useEffect, useState } from "react";
import { audioEngine, type AudioAnalysis } from "@/lib/audio-engine";

export function useAudioReactive() {
  const [analysis, setAnalysis] = useState<AudioAnalysis>({
    bass: 0,
    mid: 0,
    high: 0,
    level: 0,
    beat: 0,
    bpm: 124,
  });

  useEffect(() => {
    if (!audioEngine) return;
    const unsub = audioEngine.subscribe((a) => setAnalysis({ ...a }));
    // initial
    setAnalysis({ ...audioEngine.analysis });
    return () => {
      unsub();
    };
  }, []);

  return analysis;
}
