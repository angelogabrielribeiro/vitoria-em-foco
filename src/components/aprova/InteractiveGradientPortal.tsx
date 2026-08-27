"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

import { cn } from "@/lib/utils";

const MAX_RIPPLES = 6;

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec4 uRipples[${MAX_RIPPLES}];
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.54;
    mat2 rotation = mat2(0.84, -0.54, 0.54, 0.84);

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.02 + 0.17;
      amplitude *= 0.48;
    }

    return value;
  }

  vec3 gradientPalette(float t) {
    vec3 blush = vec3(0.98, 0.79, 0.91);
    vec3 pink = vec3(0.98, 0.42, 0.61);
    vec3 amber = vec3(1.0, 0.69, 0.17);
    vec3 coral = vec3(1.0, 0.25, 0.15);
    vec3 cobalt = vec3(0.07, 0.29, 0.96);
    vec3 navy = vec3(0.015, 0.025, 0.09);

    vec3 color = mix(blush, pink, smoothstep(0.0, 0.19, t));
    color = mix(color, amber, smoothstep(0.16, 0.38, t));
    color = mix(color, coral, smoothstep(0.34, 0.54, t));
    color = mix(color, cobalt, smoothstep(0.50, 0.72, t));
    return mix(color, navy, smoothstep(0.69, 1.0, t));
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 scaledUv = (vUv - 0.5) * vec2(aspect, 1.0);
    float slowTime = uTime * 0.11;

    float broadNoise = fbm(scaledUv * 1.85 + vec2(slowTime, -slowTime * 0.62));
    float fineNoise = fbm(scaledUv * 3.25 + vec2(-slowTime * 0.72, slowTime));
    float arch = -0.12 * scaledUv.x * scaledUv.x;
    float wave = sin(scaledUv.x * 3.35 + broadNoise * 4.2 + slowTime * 3.0) * 0.085;
    wave += sin(scaledUv.x * 6.1 - fineNoise * 2.8 - slowTime * 2.2) * 0.035;

    float rippleLight = 0.0;
    float rippleWarp = 0.0;

    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 ripple = uRipples[i];
      float age = uTime - ripple.z;
      float active = ripple.w * step(0.0, age) * (1.0 - step(2.35, age));
      vec2 delta = (vUv - ripple.xy) * vec2(aspect, 1.0);
      float distanceFromRipple = length(delta);
      float radius = age * 0.54;
      float ring = 1.0 - smoothstep(0.0, 0.035, abs(distanceFromRipple - radius));
      float echo = 1.0 - smoothstep(0.0, 0.025, abs(distanceFromRipple - radius * 0.64));
      float fade = 1.0 - smoothstep(0.18, 2.35, age);

      rippleLight += (ring + echo * 0.34) * fade * active;
      rippleWarp += sin(distanceFromRipple * 34.0 - age * 10.0) *
        exp(-distanceFromRipple * 2.6) * fade * active;
    }

    float gradientPosition = clamp(
      1.0 - vUv.y + wave + arch + (broadNoise - 0.5) * 0.13 + rippleWarp * 0.018,
      0.0,
      1.0
    );
    vec3 color = gradientPalette(gradientPosition);

    float horizon = exp(-11.0 * abs(gradientPosition - 0.49));
    color += vec3(1.0, 0.46, 0.13) * horizon * 0.16;
    color += mix(vec3(1.0, 0.72, 0.31), vec3(0.50, 0.72, 1.0), vUv.y) * rippleLight * 0.55;

    float grain = hash(gl_FragCoord.xy + floor(uTime * 12.0)) - 0.5;
    color += grain * 0.055;

    float vignette = smoothstep(0.92, 0.16, length(scaledUv * vec2(0.62, 0.92)));
    color *= 0.77 + vignette * 0.28;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type GradientPlaneProps = {
  rippleSlots: THREE.Vector4[];
  animate: boolean;
  version: number;
};

function GradientPlane({ rippleSlots, animate, version }: GradientPlaneProps) {
  const { invalidate, size, viewport } = useThree();
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const uniforms = useMemo(
    () => ({
      uTime: { value: performance.now() * 0.001 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uRipples: { value: rippleSlots },
    }),
    [rippleSlots],
  );
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms,
        depthTest: false,
        depthWrite: false,
      }),
    [uniforms],
  );

  useEffect(() => {
    invalidate();
  }, [invalidate, version]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(() => {
    uniforms.uResolution.value.set(size.width, size.height);
    if (animate) uniforms.uTime.value = performance.now() * 0.001;
  });

  return (
    <mesh geometry={geometry} material={material} scale={[viewport.width, viewport.height, 1]} />
  );
}

export type InteractiveGradientPortalProps = {
  title?: string;
  subtitle?: string;
  onActivate?: () => void;
  className?: string;
};

export function InteractiveGradientPortal({
  title = "Escolha como você quer avançar hoje.",
  subtitle = "Toque no campo para criar uma onda e abrir sua próxima sessão de estudo.",
  onActivate,
  className,
}: InteractiveGradientPortalProps) {
  const portalRef = useRef<HTMLButtonElement>(null);
  const nextRippleRef = useRef(0);
  const rippleSlots = useMemo(
    () => Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4(0.5, 0.5, -100, 0)),
    [],
  );
  const [rippleVersion, setRippleVersion] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const reducedMotion = Boolean(useReducedMotion());
  const titleId = useId();
  const subtitleId = useId();
  const animate = !reducedMotion && isVisible && pageVisible;

  useEffect(() => {
    const portal = portalRef.current;
    if (!portal || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry?.isIntersecting ?? true),
      { rootMargin: "160px" },
    );
    observer.observe(portal);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncVisibility = () => setPageVisible(document.visibilityState === "visible");
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    return () => document.removeEventListener("visibilitychange", syncVisibility);
  }, []);

  const createRipple = useCallback(
    (x: number, y: number) => {
      const slot = rippleSlots[nextRippleRef.current % MAX_RIPPLES];
      slot.set(
        Math.min(1, Math.max(0, x)),
        Math.min(1, Math.max(0, y)),
        performance.now() * 0.001,
        1,
      );
      nextRippleRef.current += 1;
      setRippleVersion((current) => current + 1);
    },
    [rippleSlots],
  );

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return;
    createRipple(
      (event.clientX - bounds.left) / bounds.width,
      1 - (event.clientY - bounds.top) / bounds.height,
    );
  };

  const handleClick = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail === 0) createRipple(0.5, 0.5);
    onActivate?.();
  };

  return (
    <button
      ref={portalRef}
      type="button"
      className={cn(
        "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb547] focus-visible:ring-offset-4 focus-visible:ring-offset-[#070910] motion-safe:transition-transform motion-safe:duration-500 motion-safe:hover:-translate-y-1 motion-reduce:transition-none",
        className,
      )}
      aria-labelledby={titleId}
      aria-describedby={subtitleId}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        minWidth: 0,
        minHeight: "clamp(22rem, 58vw, 38rem)",
        overflow: "hidden",
        isolation: "isolate",
        padding: 0,
        border: "1px solid rgba(255, 255, 255, 0.18)",
        borderRadius: "clamp(1.5rem, 4vw, 3rem)",
        color: "#fffaf2",
        textAlign: "left",
        cursor: "pointer",
        background:
          "linear-gradient(155deg, #f8c8e2 0%, #ffb547 31%, #ff5348 49%, #315cff 70%, #050817 100%)",
        boxShadow:
          "0 4rem 8rem -4rem rgba(0, 0, 0, 0.72), 0 1.5rem 4rem -2.2rem rgba(49, 92, 255, 0.52)",
      }}
    >
      <Canvas
        aria-hidden="true"
        camera={{ position: [0, 0, 1] }}
        dpr={[1, 1.5]}
        frameloop={animate ? "always" : "demand"}
        fallback={<span aria-hidden="true" />}
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <GradientPlane rippleSlots={rippleSlots} animate={animate} version={rippleVersion} />
      </Canvas>

      <span
        aria-hidden="true"
        className="interactive-gradient-portal__wash"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(248,200,226,.66) 0%, rgba(255,181,71,.54) 31%, rgba(255,83,72,.48) 49%, rgba(49,92,255,.48) 71%, rgba(5,8,23,.08) 100%)",
          mixBlendMode: "screen",
        }}
      />

      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, rgba(5, 8, 23, 0.08), rgba(5, 8, 23, 0.04) 36%, rgba(5, 8, 23, 0.86) 100%)",
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.2,
          mixBlendMode: "soft-light",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.88' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.42'/%3E%3C/svg%3E\")",
        }}
      />

      <span
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          minHeight: "clamp(22rem, 58vw, 38rem)",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: "2rem",
          padding: "clamp(1.25rem, 4.2vw, 3.5rem)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
            fontSize: "clamp(0.64rem, 1.4vw, 0.78rem)",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span>Portal de estudo · sessão viva</span>
          <span style={{ opacity: 0.78 }}>Toque para criar ondas</span>
        </span>

        <span style={{ display: "grid", maxWidth: "48rem", gap: "clamp(0.8rem, 2vw, 1.25rem)" }}>
          <span
            id={titleId}
            style={{
              maxWidth: "13ch",
              fontSize: "clamp(2.35rem, 7.5vw, 6.4rem)",
              fontWeight: 900,
              letterSpacing: "-0.065em",
              lineHeight: 0.9,
              textWrap: "balance",
            }}
          >
            {title}
          </span>
          <span
            id={subtitleId}
            style={{
              maxWidth: "42rem",
              color: "rgba(255, 250, 242, 0.78)",
              fontSize: "clamp(0.94rem, 2.2vw, 1.2rem)",
              lineHeight: 1.55,
              textWrap: "pretty",
            }}
          >
            {subtitle}
          </span>
          <span
            aria-hidden="true"
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              gap: "0.75rem",
              marginTop: "0.25rem",
              padding: "0.78rem 1rem",
              border: "1px solid rgba(255, 255, 255, 0.28)",
              borderRadius: "999px",
              background: "rgba(5, 8, 23, 0.46)",
              boxShadow: "inset 0 1px rgba(255, 255, 255, 0.12)",
              fontSize: "0.78rem",
              fontWeight: 850,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              backdropFilter: "blur(14px)",
            }}
          >
            Abrir próxima missão <span style={{ fontSize: "1.1rem" }}>↗</span>
          </span>
        </span>
      </span>
    </button>
  );
}

