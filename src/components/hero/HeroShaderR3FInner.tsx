"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ShaderMaterial } from "three";
import { audioEngine } from "@/lib/audio-engine";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uBass;
  uniform float uMid;
  uniform float uHigh;
  uniform float uBeat;
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 mouse = uMouse;
    
    float t = uTime * 0.3;
    
    // Fluid noise layers
    float n1 = snoise(uv * 2.5 + t * 0.5 + mouse * 0.5) * 0.5 + 0.5;
    float n2 = snoise(uv * 4.0 - t * 0.7 + vec2(n1 * 0.5)) * 0.5 + 0.5;
    float n3 = snoise(uv * 8.0 + t * 0.3 + mouse * 0.3) * 0.5 + 0.5;
    
    float fluid = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
    fluid += uBass * 0.4 + uBeat * 0.3;
    
    // Colors
    vec3 c1 = uColor1; // fire #FF5A1F
    vec3 c2 = uColor2; // magenta #FF2E93
    vec3 c3 = uColor3; // lime #C8FF00
    
    vec3 color = mix(c1, c2, fluid);
    color = mix(color, c3, n2 * 0.3 + uHigh * 0.2);
    
    // Vignette
    float vignette = 1.0 - length(uv - 0.5) * 1.2;
    vignette = smoothstep(0.0, 1.0, vignette);
    
    // Beat pulse
    float pulse = 1.0 + uBeat * 0.3 + uBass * 0.5;
    
    float alpha = (0.15 + fluid * 0.25) * vignette * pulse;
    
    // Add grain based on high
    float grain = fract(sin(dot(uv, vec2(12.9898,78.233))) * 43758.5453) * uHigh * 0.05;
    
    gl_FragColor = vec4(color + grain, alpha);
  }
`;

function ShaderPlane() {
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uHigh: { value: 0 },
      uBeat: { value: 0 },
      uMouse: { value: [0.5, 0.5] as [number, number] },
      uColor1: { value: [1, 0.35, 0.12] }, // #FF5A1F
      uColor2: { value: [1, 0.18, 0.58] }, // #FF2E93
      uColor3: { value: [0.78, 1, 0] }, // #C8FF00
    }),
    []
  );

  useFrame((state) => {
    if (!materialRef.current) return;
    const mat = materialRef.current;
    // Read the audio engine directly — no React re-renders at audio rate
    const a = audioEngine?.analysis;
    const bass = a?.bass ?? 0;
    const mid = a?.mid ?? 0;
    const high = a?.high ?? 0;
    const beat = a?.beat ?? 0;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uBass.value += (bass - mat.uniforms.uBass.value) * 0.1;
    mat.uniforms.uMid.value += (mid - mat.uniforms.uMid.value) * 0.1;
    mat.uniforms.uHigh.value += (high - mat.uniforms.uHigh.value) * 0.1;
    mat.uniforms.uBeat.value += (beat - mat.uniforms.uBeat.value) * 0.2;

    // Mouse lerp
    const mouse = state.pointer;
    mat.uniforms.uMouse.value[0] += (mouse.x * 0.5 + 0.5 - mat.uniforms.uMouse.value[0]) * 0.05;
    mat.uniforms.uMouse.value[1] += (mouse.y * 0.5 + 0.5 - mat.uniforms.uMouse.value[1]) * 0.05;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export default function HeroShaderR3FInner() {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
      >
        <ShaderPlane />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,_transparent_40%,_rgba(7,7,10,0.7)_85%)]" />
    </div>
  );
}
