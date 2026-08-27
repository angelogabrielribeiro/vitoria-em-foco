import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

export type RadialHeroPalette = "cobalt" | "amber" | "coral" | "iris";

export type RadialHeroShaderProps = {
  className?: string;
  energy?: number;
  palette?: RadialHeroPalette;
};

type PaletteDefinition = {
  background: [number, number, number];
  primary: [number, number, number];
  secondary: [number, number, number];
  accent: [number, number, number];
  fallback: string;
};

const PALETTES: Record<RadialHeroPalette, PaletteDefinition> = {
  cobalt: {
    background: [0.015, 0.022, 0.055],
    primary: [0.08, 0.26, 1],
    secondary: [0.88, 0.94, 1],
    accent: [1, 0.58, 0.18],
    fallback:
      "radial-gradient(circle at 52% 48%, rgba(49,92,255,.42), transparent 20%), radial-gradient(circle at 72% 28%, rgba(255,181,71,.2), transparent 30%), #050711",
  },
  amber: {
    background: [0.05, 0.032, 0.012],
    primary: [1, 0.46, 0.035],
    secondary: [1, 0.9, 0.66],
    accent: [0.14, 0.34, 1],
    fallback:
      "radial-gradient(circle at 52% 48%, rgba(255,151,26,.46), transparent 21%), radial-gradient(circle at 72% 28%, rgba(70,112,255,.18), transparent 30%), #0b0804",
  },
  coral: {
    background: [0.055, 0.014, 0.02],
    primary: [1, 0.13, 0.1],
    secondary: [1, 0.7, 0.52],
    accent: [0.48, 0.2, 1],
    fallback:
      "radial-gradient(circle at 52% 48%, rgba(255,93,82,.45), transparent 21%), radial-gradient(circle at 72% 28%, rgba(138,99,255,.2), transparent 30%), #100607",
  },
  iris: {
    background: [0.028, 0.014, 0.064],
    primary: [0.46, 0.18, 1],
    secondary: [0.96, 0.68, 1],
    accent: [0.08, 0.62, 1],
    fallback:
      "radial-gradient(circle at 52% 48%, rgba(138,99,255,.48), transparent 21%), radial-gradient(circle at 72% 28%, rgba(61,215,231,.18), transparent 30%), #080510",
  },
};

const VERTEX_SHADER = `
  attribute vec2 position;

  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
  #else
    precision mediump float;
  #endif

  uniform vec2 resolution;
  uniform vec3 pointer;
  uniform float time;
  uniform float energy;
  uniform vec3 backgroundColor;
  uniform vec3 primaryColor;
  uniform vec3 secondaryColor;
  uniform vec3 accentColor;

  #define PI 3.14159265359

  float softSaturate(float value) {
    return value / (1.0 + abs(value));
  }

  void main() {
    float shortSide = max(1.0, min(resolution.x, resolution.y));
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution.xy) / shortSide;
    vec2 cursor = (pointer.xy * resolution.xy * 2.0 - resolution.xy) / shortSide;

    float radius = length(p);
    float cursorField = exp(-3.4 * length(p - cursor)) * pointer.z;
    float angle = atan(p.y, p.x) + cursorField * 0.16;
    float speed = 0.18 + clamp(energy, 0.0, 1.5) * 0.22;
    float t = time * speed;

    vec3 light = vec3(0.0);
    float structure = 0.0;

    for (int layer = 1; layer <= 7; layer++) {
      float i = float(layer);
      float ringRadius = 0.045 + i * i * 0.032;
      float signedBand = radius - ringRadius;
      float asymmetricBand = max(signedBand, -signedBand * 3.6);
      float phase = angle * 3.0 + t * sin(i * i) + i * i * 0.92;
      phase += cursorField * (0.8 + i * 0.06);

      float petal = smoothstep(-0.08, 0.66, cos(phase));
      petal *= petal;
      float edge = 0.0055 / (abs(asymmetricBand) + 0.0085);
      float halo = 0.018 / (abs(signedBand) * 2.6 + 0.042);
      float pulse = 0.78 + 0.22 * sin(t * 1.8 + i * 1.37);
      float intensity = (edge * 0.7 + halo * 0.24) * petal * pulse;

      float colorTurn = 0.5 + 0.5 * sin(phase - i * 0.72);
      vec3 layerColor = mix(primaryColor, secondaryColor, colorTurn * 0.72);
      layerColor = mix(layerColor, accentColor, 0.18 + 0.12 * sin(i * 2.1));
      light += layerColor * intensity;
      structure += intensity;
    }

    float core = exp(-8.0 * radius) * (0.72 + 0.28 * sin(t * 4.0));
    light += mix(secondaryColor, accentColor, 0.28) * core;
    light += primaryColor * cursorField * (0.08 + energy * 0.08);

    vec3 color = backgroundColor;
    color += light * (0.72 + clamp(energy, 0.0, 1.5) * 0.28);
    color = vec3(
      softSaturate(color.r * 1.22),
      softSaturate(color.g * 1.22),
      softSaturate(color.b * 1.22)
    );

    float vignette = smoothstep(1.78, 0.2, length(p * vec2(0.74, 0.9)));
    float radialShade = 0.82 + 0.18 * cos(min(radius, 1.7) * PI);
    color *= (0.42 + vignette * 0.78) * radialShade;
    color += secondaryColor * min(structure, 1.0) * 0.035;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type ShaderResources = {
  buffer: WebGLBuffer;
  program: WebGLProgram;
  position: number;
  uniforms: {
    resolution: WebGLUniformLocation | null;
    pointer: WebGLUniformLocation | null;
    time: WebGLUniformLocation | null;
    energy: WebGLUniformLocation | null;
    background: WebGLUniformLocation | null;
    primary: WebGLUniformLocation | null;
    secondary: WebGLUniformLocation | null;
    accent: WebGLUniformLocation | null;
  };
};

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (import.meta.env.DEV) {
      console.warn("RadialHeroShader could not compile:", gl.getShaderInfoLog(shader));
    }
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createResources(gl: WebGLRenderingContext): ShaderResources | null {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (import.meta.env.DEV) {
      console.warn("RadialHeroShader could not link:", gl.getProgramInfoLog(program));
    }
    gl.deleteProgram(program);
    return null;
  }

  const buffer = gl.createBuffer();
  if (!buffer) {
    gl.deleteProgram(program);
    return null;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  return {
    buffer,
    program,
    position: gl.getAttribLocation(program, "position"),
    uniforms: {
      resolution: gl.getUniformLocation(program, "resolution"),
      pointer: gl.getUniformLocation(program, "pointer"),
      time: gl.getUniformLocation(program, "time"),
      energy: gl.getUniformLocation(program, "energy"),
      background: gl.getUniformLocation(program, "backgroundColor"),
      primary: gl.getUniformLocation(program, "primaryColor"),
      secondary: gl.getUniformLocation(program, "secondaryColor"),
      accent: gl.getUniformLocation(program, "accentColor"),
    },
  };
}

function destroyResources(gl: WebGLRenderingContext, resources: ShaderResources | null) {
  if (!resources || gl.isContextLost()) return;
  gl.deleteBuffer(resources.buffer);
  gl.deleteProgram(resources.program);
}

export function RadialHeroShader({
  className,
  energy = 0.82,
  palette = "cobalt",
}: RadialHeroShaderProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef(energy);
  const paletteRef = useRef(PALETTES[palette]);
  const reducedMotion = Boolean(useReducedMotion());
  const paletteDefinition = PALETTES[palette];

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    paletteRef.current = PALETTES[palette];
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    let resources = createResources(gl);
    if (!resources) return;

    let animationFrame = 0;
    let resizeFrame = 0;
    let needsResize = true;
    let disposed = false;
    let contextLost = false;
    let inViewport = true;
    let pageVisible = document.visibilityState === "visible";
    let startTime = performance.now();

    let pointerX = 0.54;
    let pointerY = 0.48;
    let pointerStrength = 0;
    let targetX = pointerX;
    let targetY = pointerY;
    let targetStrength = 0;

    const shouldRender = () => !disposed && !contextLost && inViewport && pageVisible;

    const resize = () => {
      needsResize = false;
      const bounds = canvas.getBoundingClientRect();
      const dpr = Math.min(1.4, Math.max(0.75, window.devicePixelRatio || 1));
      const width = Math.max(1, Math.round(bounds.width * dpr));
      const height = Math.max(1, Math.round(bounds.height * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const scheduleRender = () => {
      if (!animationFrame && shouldRender()) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const scheduleResize = () => {
      needsResize = true;
      if (!resizeFrame) {
        resizeFrame = window.requestAnimationFrame(() => {
          resizeFrame = 0;
          if (!disposed && !contextLost) resize();
          scheduleRender();
        });
      }
    };

    const stopRender = () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    };

    function render(now: number) {
      animationFrame = 0;
      if (!shouldRender() || !resources) return;
      if (needsResize) resize();

      pointerX += (targetX - pointerX) * 0.065;
      pointerY += (targetY - pointerY) * 0.065;
      pointerStrength += (targetStrength - pointerStrength) * 0.075;
      targetStrength *= 0.992;

      const activePalette = paletteRef.current;
      const { uniforms } = resources;
      gl.useProgram(resources.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, resources.buffer);
      if (resources.position >= 0) {
        gl.enableVertexAttribArray(resources.position);
        gl.vertexAttribPointer(resources.position, 2, gl.FLOAT, false, 0, 0);
      }

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform3f(uniforms.pointer, pointerX, pointerY, pointerStrength);
      gl.uniform1f(uniforms.time, (now - startTime) * 0.001);
      gl.uniform1f(uniforms.energy, Math.max(0, Math.min(1.5, energyRef.current)));
      gl.uniform3fv(uniforms.background, activePalette.background);
      gl.uniform3fv(uniforms.primary, activePalette.primary);
      gl.uniform3fv(uniforms.secondary, activePalette.secondary);
      gl.uniform3fv(uniforms.accent, activePalette.accent);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      scheduleRender();
    }

    const updatePointer = (event: PointerEvent, strength: number) => {
      const bounds = canvas.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        targetStrength = 0;
        return;
      }

      targetX = (event.clientX - bounds.left) / Math.max(1, bounds.width);
      targetY = 1 - (event.clientY - bounds.top) / Math.max(1, bounds.height);
      targetStrength = strength;
      scheduleRender();
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event, event.pointerType === "touch" ? 1.05 : 0.72);
    };
    const onPointerDown = (event: PointerEvent) => updatePointer(event, 1.35);
    const onPointerUp = (event: PointerEvent) => updatePointer(event, 0.58);
    const onPointerCancel = () => {
      targetStrength = 0;
    };
    const onVisibilityChange = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) scheduleRender();
      else stopRender();
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      resources = null;
      stopRender();
    };
    const onContextRestored = () => {
      contextLost = false;
      startTime = performance.now();
      resources = createResources(gl);
      needsResize = true;
      scheduleRender();
    };

    const resizeObserver = new ResizeObserver(scheduleResize);
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        if (inViewport) scheduleRender();
        else stopRender();
      },
      { rootMargin: "160px" },
    );

    resizeObserver.observe(canvas);
    intersectionObserver.observe(canvas);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    resize();
    scheduleRender();

    return () => {
      disposed = true;
      stopRender();
      if (resizeFrame) window.cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      destroyResources(gl, resources);
      resources = null;
    };
  }, [reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={cn("radial-hero-shader", reducedMotion && "radial-hero-shader--static", className)}
      data-palette={palette}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      style={{
        position: "absolute",
        inset: 0,
        minWidth: 0,
        overflow: "hidden",
        background: paletteDefinition.fallback,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: reducedMotion ? "none" : "block",
          width: "100%",
          height: "100%",
          maxWidth: "100%",
          pointerEvents: "none",
          touchAction: "pan-y",
        }}
      />
    </div>
  );
}

