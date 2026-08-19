"use client";

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { Mesh } from "three";
import { SculptureMaterial } from "./sculptureMaterial";

type PointerState = { x: number; y: number };
type SculptureMaterialInstance = InstanceType<typeof SculptureMaterial>;

function Sculpture({
  pointerRef,
  velocityRef,
}: {
  pointerRef: RefObject<PointerState>;
  velocityRef: RefObject<number>;
}) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<SculptureMaterialInstance | null>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const pointer = pointerRef.current;
    const velocity = Math.min(Math.abs(velocityRef.current ?? 0), 1);

    mesh.rotation.y += delta * 0.12;
    mesh.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.15 + pointer.y * 0.3;
    mesh.rotation.z = pointer.x * 0.2;
    mesh.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;

    material.uTime = state.clock.elapsedTime;
    material.uWarp += (velocity - material.uWarp) * 0.08;
  });

  return (
    <mesh ref={meshRef} scale={1.4}>
      <icosahedronGeometry args={[1, 16]} />
      <sculptureMaterial ref={materialRef} wireframe={false} />
    </mesh>
  );
}

export default function SceneCanvas({
  pointerRef,
  velocityRef,
}: {
  pointerRef: RefObject<PointerState>;
  velocityRef: RefObject<number>;
}) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      <Suspense fallback={null}>
        <Sculpture pointerRef={pointerRef} velocityRef={velocityRef} />
        <Sparkles count={70} scale={4} size={2} speed={0.25} noise={1} color="#caa15d" />
      </Suspense>
    </Canvas>
  );
}
