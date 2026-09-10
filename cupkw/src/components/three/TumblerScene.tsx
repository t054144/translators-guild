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
  /** fires once, on the first frame actually drawn */
  onFirstFrame?: () => void;
};

/* ─────────────────── camera choreography ─────────────────── */

const FOV = 34;

/** Click the tumbler to walk up the ladder, then back to the start. */
const ZOOM_STEPS = [1, 1.5, 2.05];

/** reused every frame so the rig allocates nothing */
const ORBIT_TARGET = new THREE.Vector3(0, 0.1, 0);
const SCRATCH = new THREE.Vector3();

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
    } else {
      // Ease the orbit radius toward the requested distance while leaving the
      // direction alone, so a click-zoom keeps whatever angle you rotated to.
      SCRATCH.copy(camera.position).sub(ORBIT_TARGET);
      const cur = SCRATCH.length();
      if (cur > 1e-4 && Math.abs(cur - distance) > 0.004) {
        const k = 1 - Math.pow(0.004, Math.min(dt, 0.05) * 3);
        const next = cur + (distance - cur) * k;
        camera.position.copy(ORBIT_TARGET).addScaledVector(SCRATCH, next / cur);
      }
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

/** Calls back on the first drawn frame, so callers can wait for pixels. */
function FirstFrame({ onDone }: { onDone: () => void }) {
  const fired = useRef(false);
  useFrame(() => {
    if (fired.current) return;
    fired.current = true;
    onDone();
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
  onFirstFrame,
}: Props) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  /* ── click to zoom ──────────────────────────────────────────────
     A press that does not travel is a click, so orbit-drag still works.
     A press that landed on a labelled part is a pick, not a zoom.      */
  const [zoomStep, setZoomStep] = useState(0);
  const press = useRef<{ x: number; y: number; t: number } | null>(null);
  const pickedAt = useRef(0);

  const handlePick = useMemo(
    () =>
      onPickPart
        ? (part: PartId | null) => {
            pickedAt.current = performance.now();
            onPickPart(part);
          }
        : undefined,
    [onPickPart]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    press.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const p = press.current;
    press.current = null;
    if (!p || !interactive) return;
    // Distance is the only reliable test for drag-vs-tap: a single heavy
    // WebGL frame can stall the main thread long enough that a real tap
    // measures as a multi-second press.
    const moved = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    if (moved > 6) return; // that was an orbit drag
    if (performance.now() - pickedAt.current < 200) return; // that was a part pick
    setZoomStep((z) => (z + 1) % ZOOM_STEPS.length);
  };

  const dpr = useMemo<[number, number]>(() => [1, 1.8], []);

  // exploded parts spread vertically, so they need extra headroom
  const baseDistance = useMemo(
    () => fitDistance(size.heightMm, exploded ? 1.95 : 1.3) / zoom,
    [size.heightMm, exploded, zoom]
  );
  const distance = baseDistance / ZOOM_STEPS[zoomStep];

  // going back to a wide shot should also drop the zoom, or the next
  // exploded view opens already pushed in
  useEffect(() => setZoomStep(0), [exploded, size.heightMm]);

  if (!ready) {
    return <div className={className} aria-hidden />;
  }

  return (
    <div className={className} data-zoom-step={zoomStep} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <Canvas
        // three 0.186 removed PCFSoftShadowMap, which is what bare `shadows`
        // asks for — it warned on every mount and fell back to hard shadows.
        shadows="percentage"
        dpr={dpr}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
        camera={{ position: [0, 0.1, distance], fov: FOV, near: 0.1, far: 100 }}
        onPointerMissed={() => handlePick?.(null)}
      >
        <AdaptiveDpr pixelated={false} />
        {onFirstFrame && <FirstFrame onDone={onFirstFrame} />}
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
                  onPickPart={handlePick}
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
                onPickPart={handlePick}
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
          enableZoom={interactive && !cinematic}
          minDistance={baseDistance / (ZOOM_STEPS[ZOOM_STEPS.length - 1] * 1.15)}
          maxDistance={baseDistance * 1.9}
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
