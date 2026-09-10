"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Lightformer, ContactShadows, AdaptiveDpr, Float } from "@react-three/drei";
import TumblerModel from "./TumblerModel";
import type { ShellSpec } from "@/lib/shellTexture";
import type { PartId, SizeDef, Texture } from "@/lib/config";

export type ViewPreset = "free" | "front" | "back" | "side" | "top" | "bottom";

type Props = {
  size: SizeDef;
  shell: ShellSpec;
  texture: Texture;
  exploded?: boolean;
  showLabels?: boolean;
  autoSpin?: boolean;
  cinematic?: boolean;
  preset?: ViewPreset;
  activePart?: PartId | null;
  onPickPart?: (p: PartId | null) => void;
  className?: string;
  /** dark studio (hero) or light studio (customiser) */
  mood?: "dark" | "light";
  interactive?: boolean;
  zoom?: number;
};

/* ─────────────────── camera choreography ─────────────────── */

const FOV = 34;

/**
 * How far back the camera has to sit for a tumbler of this height to sit in
 * frame with a little air around it. Without this the 1-litre crops and the
 * 450 ml floats in the middle of an empty stage.
 */
function fitDistance(heightMm: number, headroom = 1.5) {
  const h = heightMm / 80; // world units, matching TumblerModel
  return (h * headroom) / (2 * Math.tan((FOV * Math.PI) / 360));
}

/** unit directions; multiplied by the fitted distance */
const PRESET_DIRS: Record<Exclude<ViewPreset, "free">, [number, number, number]> = {
  front: [0, 0.03, 1],
  back: [0, 0.03, -1],
  side: [1, 0.03, 0],
  top: [0.0001, 0.96, 0.28],
  bottom: [0.0001, -0.94, 0.34],
};

function Rig({
  preset,
  cinematic,
  distance,
}: {
  preset: ViewPreset;
  cinematic: boolean;
  distance: number;
}) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0.1, distance));
  const settled = useRef(true);
  const t = useRef(0);

  useEffect(() => {
    if (preset === "free") {
      settled.current = true;
      return;
    }
    const d = PRESET_DIRS[preset];
    const len = Math.hypot(d[0], d[1], d[2]);
    target.current.set((d[0] / len) * distance, (d[1] / len) * distance, (d[2] / len) * distance);
    settled.current = false;
  }, [preset, distance]);

  useFrame((_, dt) => {
    t.current += dt;
    if (!settled.current) {
      camera.position.lerp(target.current, 1 - Math.pow(0.002, Math.min(dt, 0.05) * 3));
      camera.lookAt(0, 0.1, 0);
      if (camera.position.distanceTo(target.current) < 0.02) settled.current = true;
    }
    if (cinematic) {
      // slow breathing dolly — the camera is never quite still
      const cam = camera as THREE.PerspectiveCamera;
      cam.fov = FOV + Math.sin(t.current * 0.28) * 1.8;
      cam.updateProjectionMatrix();
    }
  });

  return null;
}

/* ─────────────────── studio lighting ─────────────────── */

function Studio({ mood }: { mood: "dark" | "light" }) {
  const dark = mood === "dark";
  return (
    <>
      <ambientLight intensity={dark ? 0.28 : 0.7} />
      <directionalLight position={[4, 6, 4]} intensity={dark ? 1.7 : 1.25} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 2, -3]} intensity={dark ? 0.9 : 0.6} color={dark ? "#9fc4ff" : "#ffffff"} />
      <spotLight position={[0, 7, 2]} angle={0.6} penumbra={1} intensity={dark ? 1.8 : 1.0} />

      {/* a fully local environment rig — no external HDR to fetch */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={dark ? 3.6 : 2.4} position={[0, 3.5, 2.5]} scale={[6, 3, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={dark ? 3.2 : 2} position={[-3.5, 1, 1.5]} scale={[3, 5, 1]} rotation={[0, Math.PI / 3, 0]} color={dark ? "#cfe0ff" : "#ffffff"} />
        <Lightformer form="rect" intensity={dark ? 3.6 : 2.2} position={[3.5, 1, 1.5]} scale={[3, 5, 1]} rotation={[0, -Math.PI / 3, 0]} color={dark ? "#ffe9d4" : "#ffffff"} />
        <Lightformer form="ring" intensity={dark ? 1.6 : 0.9} position={[0, -2.5, 1]} scale={[4, 4, 1]} color={dark ? "#7fa8ff" : "#ffffff"} />
        <Lightformer form="rect" intensity={dark ? 1.6 : 1} position={[0, 0.5, -4]} scale={[6, 4, 1]} rotation={[0, Math.PI, 0]} color={dark ? "#4a5c8a" : "#f2f2f2"} />
      </Environment>
    </>
  );
}

/* ─────────────────── main ─────────────────── */

export default function TumblerScene({
  size,
  shell,
  texture,
  exploded = false,
  showLabels = false,
  autoSpin = true,
  cinematic = false,
  preset = "free",
  activePart = null,
  onPickPart,
  className,
  mood = "dark",
  interactive = true,
  zoom = 1,
}: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const dpr = useMemo<[number, number]>(() => [1, 1.8], []);

  // exploded parts spread vertically, so they need extra headroom
  const distance = useMemo(
    () => fitDistance(size.heightMm, exploded ? 1.95 : 1.3) / zoom,
    [size.heightMm, exploded, zoom]
  );

  if (!ready) {
    return <div className={className} aria-hidden />;
  }

  return (
    <div className={className}>
      <Canvas
        // three 0.186 removed PCFSoftShadowMap, which is what bare `shadows`
        // asks for — it warned on every mount and fell back to hard shadows.
        shadows="percentage"
        dpr={dpr}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        camera={{ position: [0, 0.1, distance], fov: FOV, near: 0.1, far: 100 }}
        onPointerMissed={() => onPickPart?.(null)}
      >
        <AdaptiveDpr pixelated={false} />
        <Studio mood={mood} />

        <Suspense fallback={null}>
          <group>
            {cinematic ? (
              <Float speed={1.1} rotationIntensity={0.12} floatIntensity={0.35} floatingRange={[-0.05, 0.08]}>
                <TumblerModel
                  size={size}
                  shell={shell}
                  texture={texture}
                  exploded={exploded}
                  showLabels={showLabels}
                  activePart={activePart}
                  onPickPart={onPickPart}
                />
              </Float>
            ) : (
              <TumblerModel
                size={size}
                shell={shell}
                texture={texture}
                exploded={exploded}
                showLabels={showLabels}
                activePart={activePart}
                onPickPart={onPickPart}
              />
            )}
          </group>

          <ContactShadows
            position={[0, -(size.heightMm / 80) / 2 - 0.02, 0]}
            opacity={mood === "dark" ? 0.6 : 0.35}
            scale={5}
            blur={2.6}
            far={3}
            resolution={512}
            color="#000000"
          />
        </Suspense>

        <Rig preset={preset} cinematic={cinematic} distance={distance} />

        <OrbitControls
          enabled={interactive}
          enablePan={false}
          autoRotate={autoSpin && preset === "free"}
          autoRotateSpeed={cinematic ? 0.9 : 1.6}
          minDistance={distance * 0.5}
          maxDistance={distance * 1.9}
          minPolarAngle={0.05}
          maxPolarAngle={Math.PI - 0.05}
          target={[0, 0.1, 0]}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
