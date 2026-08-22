import { Canvas, useFrame } from "@react-three/fiber";
import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const routePoints = [
  new THREE.Vector3(-4.8, -0.7, 0.8),
  new THREE.Vector3(-2.4, 0.35, 0.2),
  new THREE.Vector3(-0.6, -0.15, -0.5),
  new THREE.Vector3(1.5, 0.75, 0),
  new THREE.Vector3(4.4, 1.35, -0.7),
] as const;

function RouteWorld({ paused, reduced }: { paused: boolean; reduced: boolean }) {
  const world = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const curve = useMemo(
    () => new THREE.CatmullRomCurve3([...routePoints], false, "catmullrom", 0.35),
    [],
  );
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 120, 0.045, 10, false), [curve]);
  const dust = useMemo(() => {
    const values = new Float32Array(84 * 3);
    for (let index = 0; index < 84; index += 1) {
      const seed = index * 12.9898;
      values[index * 3] = Math.sin(seed) * 5.8;
      values[index * 3 + 1] = Math.sin(seed * 0.71) * 2.5 + 0.4;
      values[index * 3 + 2] = Math.cos(seed * 1.17) * 2.4 - 0.8;
    }
    return values;
  }, []);

  useFrame(({ clock, pointer }, delta) => {
    if (paused || reduced) return;
    const elapsed = clock.getElapsedTime();
    const progress = (elapsed * 0.07) % 1;
    beacon.current?.position.copy(curve.getPointAt(progress));
    if (halo.current) {
      halo.current.position.copy(curve.getPointAt(progress));
      halo.current.scale.setScalar(1 + Math.sin(elapsed * 4) * 0.16);
    }
    if (world.current) {
      world.current.rotation.y = THREE.MathUtils.damp(
        world.current.rotation.y,
        pointer.x * 0.08,
        3,
        delta,
      );
      world.current.rotation.x = THREE.MathUtils.damp(
        world.current.rotation.x,
        -0.12 + pointer.y * 0.035,
        3,
        delta,
      );
    }
  });

  return (
    <>
      <fog attach="fog" args={["#171713", 7, 18]} />
      <group ref={world} rotation={[-0.12, 0, -0.05]}>
        <ambientLight intensity={0.58} />
        <directionalLight position={[3, 6, 4]} intensity={2.2} color="#fff3c2" />
        <pointLight position={[2, 2, 2]} intensity={18} distance={8} color="#bafc70" />

        <gridHelper
          args={[15, 30, "#3f4834", "#292d25"]}
          position={[0, -1.4, 0]}
          rotation={[0, 0, 0]}
        />
        <mesh position={[0, -1.47, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[15, 10]} />
          <meshStandardMaterial color="#191914" roughness={0.92} metalness={0.08} />
        </mesh>

        <mesh geometry={tube}>
          <meshStandardMaterial
            color="#bafc70"
            emissive="#66c04a"
            emissiveIntensity={2.4}
            roughness={0.28}
          />
        </mesh>

        {routePoints.map((point, index) => (
          <group key={index} position={[point.x, point.y, point.z]}>
            <mesh>
              <icosahedronGeometry args={[index === routePoints.length - 1 ? 0.27 : 0.18, 1]} />
              <meshStandardMaterial
                color={index === routePoints.length - 1 ? "#f5ca64" : "#dfffc0"}
                emissive={index === routePoints.length - 1 ? "#df8c27" : "#71d84e"}
                emissiveIntensity={1.8}
                roughness={0.24}
              />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.36, 0.018, 8, 48]} />
              <meshBasicMaterial
                color={index === routePoints.length - 1 ? "#f5ca64" : "#bafc70"}
                transparent
                opacity={0.42}
              />
            </mesh>
          </group>
        ))}

        <mesh ref={beacon} position={[routePoints[0].x, routePoints[0].y, routePoints[0].z]}>
          <sphereGeometry args={[0.11, 20, 20]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh ref={halo} position={[routePoints[0].x, routePoints[0].y, routePoints[0].z]}>
          <sphereGeometry args={[0.28, 16, 16]} />
          <meshBasicMaterial color="#bafc70" transparent opacity={0.14} />
        </mesh>

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[dust, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#dfffc0" size={0.025} transparent opacity={0.42} />
        </points>
      </group>
    </>
  );
}

function StaticRoute() {
  return (
    <div className="scene-static" aria-hidden="true">
      <div className="scene-static__line" />
      {["Cidade", "Edital", "Plano", "Missão", "Prova"].map((label, index) => (
        <div key={label} className={`scene-static__node scene-static__node--${index + 1}`}>
          <span />
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

export default function ApprovalPathScene() {
  const container = useRef<HTMLDivElement>(null);
  const inView = useInView(container, { margin: "160px", amount: 0.08 });
  const reduced = Boolean(useReducedMotion());
  const [webgl, setWebgl] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      setWebgl(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  return (
    <div ref={container} className="relative h-full min-h-[420px] w-full overflow-hidden">
      {webgl === true && !reduced ? (
        <Canvas
          camera={{ position: [0, 2.7, 9.4], fov: 42 }}
          dpr={[1, 1.5]}
          frameloop={!inView || reduced ? "demand" : "always"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        >
          <RouteWorld paused={!inView} reduced={reduced} />
        </Canvas>
      ) : (
        <StaticRoute />
      )}
      <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between font-mono text-[0.56rem] uppercase tracking-[0.16em] text-muted-foreground/80 sm:inset-x-8">
        <span>ponto de partida</span>
        <span className="text-accent">dia da prova</span>
      </div>
    </div>
  );
}
