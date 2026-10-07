"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useQualityStore } from "@/stores/qualityStore";

/**
 * Si WebGL no está disponible (o el contexto falla), R3F lanza y sin este
 * boundary se llevaría puesta toda la página. El Hero ya tiene su capa 2D
 * de blobs reactiva al audio abajo del shader, así que degradar a null es
 * invisible en la práctica.
 */
class ShaderBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[HeroShaderR3F] shader desactivado:", error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Lazy R3F shader - only loaded in High tier
const R3FShaderInner = dynamic(() => import("./HeroShaderR3FInner"), {
  ssr: false,
  loading: () => null,
});

export function HeroShaderR3F() {
  const tier = useQualityStore((s) => s.tier);
  if (tier !== "high") return null;
  return (
    <ShaderBoundary>
      <R3FShaderInner />
    </ShaderBoundary>
  );
}
