import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const vertexShader = `
  attribute vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragmentShader = `
  precision highp float;
  uniform vec2 resolution;
  uniform vec2 pointer;
  uniform float time;
  uniform float energy;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.82, -0.57, 0.57, 0.82);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 0.13;
      amplitude *= 0.48;
    }
    return value;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec2 mouse = (pointer * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float t = time * 0.16;

    vec2 q = vec2(fbm(uv * 1.15 + vec2(t, -t * 0.6)),
                  fbm(uv * 1.28 + vec2(-t * 0.45, t * 0.8)));
    vec2 r = vec2(fbm(uv * 1.9 + q * 2.4 + vec2(t * 0.7, 0.0)),
                  fbm(uv * 1.55 + q * 2.0 + vec2(0.0, -t * 0.85)));
    float cloud = fbm(uv * 1.45 + r * 2.65);
    float vein = smoothstep(0.28, 0.9, 1.0 - abs(sin((uv.x + r.x * 0.9) * 7.0 + t * 4.0)));
    float cursor = exp(-3.3 * length(uv - mouse));
    float spark = pow(max(0.0, 1.0 - length(uv * vec2(0.72, 1.0) + vec2(-0.32, 0.08))), 3.0);

    vec3 charcoal = vec3(0.018, 0.024, 0.055);
    vec3 cobalt = vec3(0.07, 0.28, 1.0);
    vec3 iris = vec3(0.48, 0.18, 1.0);
    vec3 gold = vec3(1.0, 0.64, 0.12);
    vec3 ember = vec3(1.0, 0.20, 0.12);
    vec3 color = charcoal;
    color = mix(color, cobalt, smoothstep(0.15, 0.88, cloud) * 0.72);
    color += iris * pow(cloud, 3.0) * (0.4 + energy * 0.46);
    color += gold * vein * cloud * 0.16;
    color += mix(gold, ember, 0.52) * spark * (0.32 + 0.24 * sin(time * 0.7));
    color += cobalt * cursor * 0.22;
    color *= 0.88 + 0.12 * noise(gl_FragCoord.xy * 0.42 + time);

    float vignette = smoothstep(1.55, 0.24, length(uv * vec2(0.72, 0.9)));
    color *= 0.48 + vignette * 0.76;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function LivingShader({
  className,
  energy = 0.75,
}: {
  className?: string;
  energy?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const energyRef = useRef(energy);
  const reduced = Boolean(useReducedMotion());

  useEffect(() => {
    energyRef.current = energy;
  }, [energy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reduced) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "resolution");
    const pointer = gl.getUniformLocation(program, "pointer");
    const time = gl.getUniformLocation(program, "time");
    const energyUniform = gl.getUniformLocation(program, "energy");
    let pointerX = canvas.clientWidth * 0.55;
    let pointerY = canvas.clientHeight * 0.45;
    let targetX = pointerX;
    let targetY = pointerY;
    let frame = 0;
    let visible = true;
    let disposed = false;

    const resize = () => {
      const dpr = Math.min(1.45, Math.max(0.8, window.devicePixelRatio || 1));
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const move = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      const dprX = canvas.width / Math.max(1, bounds.width);
      const dprY = canvas.height / Math.max(1, bounds.height);
      targetX = (event.clientX - bounds.left) * dprX;
      targetY = canvas.height - (event.clientY - bounds.top) * dprY;
    };

    const render = (now: number) => {
      if (disposed) return;
      if (visible && document.visibilityState === "visible") {
        resize();
        pointerX += (targetX - pointerX) * 0.055;
        pointerY += (targetY - pointerY) * 0.055;
        gl.useProgram(program);
        gl.uniform2f(resolution, canvas.width, canvas.height);
        gl.uniform2f(pointer, pointerX, pointerY);
        gl.uniform1f(time, now * 0.001);
        gl.uniform1f(energyUniform, energyRef.current);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      frame = window.requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    const viewObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "180px" },
    );
    resizeObserver.observe(canvas);
    viewObserver.observe(canvas);
    canvas.addEventListener("pointermove", move, { passive: true });
    resize();
    frame = window.requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      viewObserver.disconnect();
      canvas.removeEventListener("pointermove", move);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, [reduced]);

  return (
    <div className={cn("living-shader", reduced && "living-shader--static", className)}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="living-shader__grain" aria-hidden="true" />
    </div>
  );
}

