"use client";

import dynamic from "next/dynamic";
import { useQualityStore } from "@/stores/qualityStore";

// Lazy R3F shader - only loaded in High tier
const R3FShaderInner = dynamic(() => import("./HeroShaderR3FInner"), {
  ssr: false,
  loading: () => null,
});

export function HeroShaderR3F() {
  const tier = useQualityStore((s) => s.tier);
  if (tier !== "high") return null;
  return <R3FShaderInner />;
}
