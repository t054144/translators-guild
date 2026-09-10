"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  buildShellCanvas, buildRoughnessCanvas, buildDecalCanvas, buildPedazlCanvas,
  thermalColor, shade, luminance, type ShellSpec,
} from "@/lib/shellTexture";
import { PARTS, type PartId, type SizeDef, type Texture } from "@/lib/config";
import { useI18n } from "@/lib/i18n";

const MM = 1 / 80; // 80 mm to a world unit

/** Arc the front graphic panel wraps through, in radians. */
const FRONT_ARC = 0.86;
/** Arc the Pedazl panel wraps through, on the back. */
const BACK_ARC = 1.35;

export type TumblerProps = {
  size: SizeDef;
  shell: ShellSpec;
  texture: Texture;
  exploded: boolean;
  showLabels: boolean;
  activePart: PartId | null;
  onPickPart?: (p: PartId | null) => void;
};

/* ─────────────────────────── geometry ─────────────────────────── */

function useProfiles(size: SizeDef) {
  return useMemo(() => {
    const h = size.heightMm * MM;
    const r = (size.diameterMm / 2) * MM;

    const bodyH = h * 0.868; // steel cylinder; the lid takes the rest
    const wall = r * 0.115; // outer wall + vacuum gap + inner wall

    // ── outer shell: flat foot, rounded edge, dead-straight wall ──
    const outer: THREE.Vector2[] = [];
    outer.push(new THREE.Vector2(0.0001, 0));
    outer.push(new THREE.Vector2(r * 0.84, 0));
    for (let i = 1; i <= 7; i++) {
      const a = (i / 7) * (Math.PI / 2);
      outer.push(new THREE.Vector2(r * (0.84 + 0.16 * Math.sin(a)), h * 0.026 * (1 - Math.cos(a))));
    }
    outer.push(new THREE.Vector2(r, bodyH - h * 0.014));
    outer.push(new THREE.Vector2(r * 0.972, bodyH)); // small chamfer under the lid

    // ── inner cavity ──
    const inner: THREE.Vector2[] = [];
    inner.push(new THREE.Vector2(0.0001, wall * 0.95));
    inner.push(new THREE.Vector2(r - wall - r * 0.14, wall * 0.95));
    for (let i = 1; i <= 6; i++) {
      const a = (i / 6) * (Math.PI / 2);
      inner.push(
        new THREE.Vector2(r - wall - r * 0.14 + r * 0.14 * Math.sin(a), wall * 0.95 + h * 0.022 * (1 - Math.cos(a)))
      );
    }
    inner.push(new THREE.Vector2(r - wall, bodyH + h * 0.004));

    // ── the vacuum gap between the walls ──
    const vac: THREE.Vector2[] = [
      new THREE.Vector2(r - wall * 0.5, h * 0.055),
      new THREE.Vector2(r - wall * 0.5, bodyH - h * 0.02),
    ];

    return { h, r, bodyH, wall, outer, inner, vac };
  }, [size]);
}

/* ─────────────────────────── textures ─────────────────────────── */

function useTextures(shell: ShellSpec, texture: Texture) {
  const [maps, setMaps] = useState<{
    shell: THREE.CanvasTexture;
    rough: THREE.CanvasTexture;
    decal: THREE.CanvasTexture;
    pedazl: THREE.CanvasTexture | null;
  } | null>(null);

  const shellKey = [shell.base, shell.cold, shell.hot, shell.thermal].join("|");
  const decalKey = [
    shell.dotColor, shell.plate, shell.field?.rows ?? 0,
    shell.field ? shell.field.cells.join("") : "none",
    shell.base, shell.cold, shell.hot, shell.thermal,
  ].join("|");
  const pedazlKey = [
    shell.pedazlMode, shell.pedazlText, shell.stoneHex, shell.stoneSpec,
    Math.round(shell.density * 20), shell.pedazlImage?.src?.slice(-48) ?? "",
  ].join("|");

  useEffect(() => {
    const s = new THREE.CanvasTexture(buildShellCanvas(shell));
    s.colorSpace = THREE.SRGBColorSpace;
    s.wrapS = THREE.RepeatWrapping;
    s.anisotropy = 4;

    const rough = new THREE.CanvasTexture(buildRoughnessCanvas(texture));
    rough.wrapS = THREE.RepeatWrapping;
    rough.wrapT = THREE.RepeatWrapping;

    const d = new THREE.CanvasTexture(buildDecalCanvas(shell));
    d.colorSpace = THREE.SRGBColorSpace;
    d.anisotropy = 8;

    const pzCanvas = buildPedazlCanvas(shell);
    let pz: THREE.CanvasTexture | null = null;
    if (pzCanvas) {
      pz = new THREE.CanvasTexture(pzCanvas);
      pz.colorSpace = THREE.SRGBColorSpace;
      pz.anisotropy = 8;
    }

    setMaps({ shell: s, rough, decal: d, pedazl: pz });
    return () => {
      s.dispose();
      rough.dispose();
      d.dispose();
      pz?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shellKey, decalKey, pedazlKey, texture]);

  return maps;
}

/* ─────────────────────────── animated group ─────────────────────────── */

function Drift({ target, children, speed = 4 }: { target: [number, number, number]; children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = 1 - Math.pow(0.0016, Math.min(dt, 0.05) * speed);
    g.position.x += (target[0] - g.position.x) * k;
    g.position.y += (target[1] - g.position.y) * k;
    g.position.z += (target[2] - g.position.z) * k;
  });
  return <group ref={ref}>{children}</group>;
}

/* ─────────────────────────── labels ─────────────────────────── */

function PartLabel({
  id, position, angle, active, onPick, reach,
}: {
  id: PartId;
  position: [number, number, number];
  angle: number;
  active: boolean;
  onPick?: (p: PartId | null) => void;
  reach: number;
}) {
  const { pick, lang } = useI18n();
  const part = PARTS.find((p) => p.id === id);
  if (!part) return null;

  const anchor: [number, number, number] = [
    position[0] + Math.cos(angle) * reach,
    position[1],
    position[2] + Math.sin(angle) * reach,
  ];
  const left = Math.cos(angle) < 0;

  return (
    <group position={anchor}>
      <Html center distanceFactor={7} zIndexRange={[20, 0]}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPick?.(active ? null : id);
          }}
          dir={lang === "ar" ? "rtl" : "ltr"}
          className={[
            "group pointer-events-auto flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-left backdrop-blur-md transition-all duration-300",
            left ? "flex-row-reverse" : "flex-row",
            active
              ? "border-white/70 bg-white text-neutral-900 shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
              : "border-white/25 bg-black/45 text-white/90 hover:border-white/60 hover:bg-black/65",
          ].join(" ")}
          style={{ fontSize: 11, letterSpacing: "0.02em" }}
        >
          <span className={["h-1.5 w-1.5 shrink-0 rounded-full transition-colors", active ? "bg-neutral-900" : "bg-white/80"].join(" ")} />
          <span className="font-medium">{pick(part)}</span>
        </button>
        {active && (
          <div
            dir={lang === "ar" ? "rtl" : "ltr"}
            className="pointer-events-none absolute top-full left-1/2 mt-2 w-[212px] -translate-x-1/2 rounded-xl border border-white/15 bg-neutral-950/92 p-3 text-white/80 shadow-2xl backdrop-blur-md"
            style={{ fontSize: 10.5, lineHeight: 1.55 }}
          >
            {pick({ en: part.enDesc, ar: part.arDesc })}
          </div>
        )}
      </Html>
    </group>
  );
}

/* ─────────────────────────── the model ─────────────────────────── */

export default function TumblerModel({
  size, shell, texture, exploded, showLabels, activePart, onPickPart,
}: TumblerProps) {
  const { h, r, bodyH, wall, outer, inner, vac } = useProfiles(size);
  const maps = useTextures(shell, texture);

  const bodyColor = thermalColor(shell);
  const isDark = luminance(bodyColor) < 0.5;
  const lidColor = shade(bodyColor, isDark ? 0.06 : -0.1);

  const roughness = texture === "glossy" ? 0.07 : texture === "matte" ? 0.86 : 0.34;
  const clearcoat = texture === "glossy" ? 1 : texture === "matte" ? 0 : 0.45;

  const e = exploded ? 1 : 0;

  const lidBottom = bodyH - h * 0.012;
  const lidSkirtH = h * 0.125;
  const strawR = r * 0.082;
  // The straw has to clear the moulded lid face and stand proud of it. Sized to
  // the body it finished 2mm above the lid, which read as no straw at all.
  const lidTopY = lidBottom + lidSkirtH + h * 0.01;
  const strawH = lidTopY - wall + h * 0.1;

  const off = {
    lid: [0, lidBottom + e * h * 0.42, 0] as [number, number, number],
    strawPort: [0, lidBottom + e * h * 0.72, 0] as [number, number, number],
    straw: [0, e * h * 0.1, e * r * 2.6] as [number, number, number],
    gasket: [0, bodyH + e * h * 0.24, 0] as [number, number, number],
    inner: [0, 0, e * -r * 2.7] as [number, number, number],
    vacuum: [0, 0, e * r * 1.35] as [number, number, number],
    outer: [0, 0, 0] as [number, number, number],
    base: [0, -e * h * 0.26, 0] as [number, number, number],
  };

  const reach = r * 2.35;

  // front graphic panel spans from just under the lid down to the foot
  const panelTop = bodyH * 0.955;
  const panelBottom = bodyH * 0.075;
  const panelH = panelTop - panelBottom;

  // pedazl panel sits on the back, square-ish
  const pzArcLen = BACK_ARC * r;
  const pzH = pzArcLen;
  const pzCentre = bodyH * 0.5;

  return (
    <group position={[0, -h / 2, 0]}>
      {/* ── outer thermochromic shell ── */}
      <Drift target={off.outer}>
        <mesh
          castShadow
          receiveShadow
          onClick={(ev) => {
            ev.stopPropagation();
            onPickPart?.(activePart === "outerWall" ? null : "outerWall");
          }}
        >
          <latheGeometry args={[outer, 128]} />
          {maps ? (
            <meshPhysicalMaterial
              map={maps.shell}
              roughnessMap={maps.rough}
              roughness={roughness}
              metalness={texture === "glossy" ? 0.12 : 0.04}
              clearcoat={clearcoat}
              clearcoatRoughness={texture === "glossy" ? 0.03 : 0.4}
              sheen={texture === "matte" ? 0.55 : 0.12}
              sheenColor={shade(bodyColor, 0.45)}
              envMapIntensity={texture === "glossy" ? 1.45 : 0.8}
              side={THREE.DoubleSide}
            />
          ) : (
            <meshStandardMaterial color={bodyColor} roughness={roughness} side={THREE.DoubleSide} />
          )}
        </mesh>

        {/* ── front graphic: CODED mark, punchcard field, [ NAME ] plate ── */}
        {maps && (
          <mesh
            position={[0, panelBottom + panelH / 2, 0]}
            onClick={(ev) => {
              ev.stopPropagation();
              onPickPart?.(activePart === "punchcard" ? null : "punchcard");
            }}
          >
            <cylinderGeometry args={[r * 1.004, r * 1.004, panelH, 96, 1, true, -FRONT_ARC / 2, FRONT_ARC]} />
            <meshPhysicalMaterial
              map={maps.decal}
              transparent
              alphaTest={0.02}
              roughness={texture === "glossy" ? 0.16 : 0.52}
              metalness={0}
              clearcoat={texture === "glossy" ? 0.8 : 0.2}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-2}
            />
          </mesh>
        )}

        {/* ── pedazl crystals, on the back panel ── */}
        {maps?.pedazl && (
          <mesh position={[0, pzCentre, 0]}>
            <cylinderGeometry args={[r * 1.012, r * 1.012, pzH, 96, 1, true, Math.PI - BACK_ARC / 2, BACK_ARC]} />
            <meshPhysicalMaterial
              map={maps.pedazl}
              transparent
              alphaTest={0.04}
              roughness={0.04}
              metalness={0.35}
              clearcoat={1}
              clearcoatRoughness={0.02}
              envMapIntensity={2.4}
              side={THREE.FrontSide}
              polygonOffset
              polygonOffsetFactor={-3}
            />
          </mesh>
        )}
      </Drift>

      {/* ── the vacuum gap ── */}
      <Drift target={off.vacuum}>
        <mesh visible={exploded}>
          <latheGeometry args={[vac, 96]} />
          <meshPhysicalMaterial
            color="#9ad8ff"
            transparent
            opacity={0.15}
            roughness={0.05}
            metalness={0}
            transmission={0.85}
            thickness={0.4}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </Drift>

      {/* ── 18/8 stainless inner wall ── */}
      <Drift target={off.inner}>
        <mesh castShadow>
          <latheGeometry args={[inner, 96]} />
          <meshStandardMaterial color="#D5DAE0" metalness={0.93} roughness={0.2} side={THREE.DoubleSide} envMapIntensity={1.35} />
        </mesh>
      </Drift>

      {/* ── no-slip silicone base ── */}
      <Drift target={off.base}>
        <group position={[0, h * 0.004, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[r * 0.9, r * 0.87, h * 0.016, 80]} />
            <meshStandardMaterial color={isDark ? "#22232A" : "#34353C"} roughness={0.95} metalness={0.02} />
          </mesh>
          <mesh position={[0, -h * 0.007, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * 0.76, r * 0.045, 14, 72]} />
            <meshStandardMaterial color="#191A1F" roughness={0.98} />
          </mesh>
        </group>
      </Drift>

      {/* ── silicone gasket ── */}
      <Drift target={off.gasket}>
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 0.9, r * 0.05, 18, 80]} />
          <meshStandardMaterial color="#26272E" roughness={0.92} metalness={0.02} />
        </mesh>
      </Drift>

      {/* ── threaded lid ── */}
      <Drift target={off.lid}>
        <group
          onClick={(ev) => {
            ev.stopPropagation();
            onPickPart?.(activePart === "lid" ? null : "lid");
          }}
        >
          {/* skirt, flush with the body */}
          <mesh position={[0, lidSkirtH / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[r * 1.004, r * 1.004, lidSkirtH, 96, 1, true]} />
            <meshPhysicalMaterial
              color={lidColor}
              roughness={roughness * 0.85 + 0.08}
              clearcoat={clearcoat}
              metalness={0.05}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* thread rings, only visible once it's off */}
          {exploded &&
            [0.14, 0.27, 0.4].map((f) => (
              <mesh key={f} position={[0, lidSkirtH * f, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[r * 0.945, r * 0.022, 10, 72]} />
                <meshStandardMaterial color={shade(lidColor, -0.32)} roughness={0.55} metalness={0.1} />
              </mesh>
            ))}

          {/* flat top with a small radius on the edge, as moulded */}
          <mesh position={[0, lidSkirtH - h * 0.004, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <torusGeometry args={[r * 0.978, r * 0.028, 12, 96]} />
            <meshPhysicalMaterial color={lidColor} roughness={roughness * 0.85 + 0.08} clearcoat={clearcoat} metalness={0.05} />
          </mesh>
          <mesh position={[0, lidSkirtH - h * 0.004, 0]} castShadow>
            <cylinderGeometry args={[r * 0.978, r * 1.006, h * 0.03, 96]} />
            <meshPhysicalMaterial color={lidColor} roughness={roughness * 0.85 + 0.08} clearcoat={clearcoat} metalness={0.05} />
          </mesh>
          <mesh position={[0, lidSkirtH + h * 0.008, 0]} castShadow>
            <cylinderGeometry args={[r * 0.978, r * 0.978, h * 0.004, 96]} />
            <meshPhysicalMaterial color={lidColor} roughness={roughness * 0.85 + 0.08} clearcoat={clearcoat} metalness={0.05} />
          </mesh>
          {/* the concentric ring pressed into the lid face */}
          <mesh position={[0, lidSkirtH + h * 0.0095, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * 0.86, r * 0.007, 8, 80]} />
            <meshStandardMaterial color={shade(lidColor, -0.22)} roughness={0.75} />
          </mesh>
        </group>
      </Drift>

      {/* ── centre straw port ── */}
      <Drift target={off.strawPort}>
        <group
          position={[0, lidSkirtH + h * 0.011, 0]}
          onClick={(ev) => {
            ev.stopPropagation();
            onPickPart?.(activePart === "strawPort" ? null : "strawPort");
          }}
        >
          {/* the low, wide boss */}
          <mesh castShadow>
            <cylinderGeometry args={[r * 0.32, r * 0.34, h * 0.008, 64]} />
            <meshPhysicalMaterial color={shade(lidColor, isDark ? 0.1 : -0.06)} roughness={roughness * 0.8 + 0.1} clearcoat={clearcoat} />
          </mesh>
          <mesh position={[0, h * 0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * 0.315, r * 0.012, 10, 56]} />
            <meshStandardMaterial color={shade(lidColor, -0.16)} roughness={0.6} />
          </mesh>
          {/* the short nozzle the straw passes through */}
          <mesh position={[0, h * 0.017, 0]} castShadow>
            <cylinderGeometry args={[strawR * 1.5, strawR * 1.95, h * 0.024, 32]} />
            <meshPhysicalMaterial color={shade(lidColor, isDark ? 0.14 : -0.1)} roughness={roughness * 0.8 + 0.1} clearcoat={clearcoat} />
          </mesh>
          <mesh position={[0, h * 0.029, 0]}>
            <cylinderGeometry args={[strawR * 1.15, strawR * 1.15, h * 0.006, 24]} />
            <meshStandardMaterial color="#0A0B0F" roughness={0.9} />
          </mesh>
        </group>
      </Drift>

      {/* ── reusable straw ── */}
      <Drift target={off.straw}>
        <group
          position={[0, wall + strawH / 2, 0]}
          onClick={(ev) => {
            ev.stopPropagation();
            onPickPart?.(activePart === "straw" ? null : "straw");
          }}
        >
          <mesh castShadow>
            <cylinderGeometry args={[strawR, strawR, strawH, 28, 1, true]} />
            <meshPhysicalMaterial
              color={shade(bodyColor, isDark ? 0.1 : -0.16)}
              roughness={texture === "matte" ? 0.72 : 0.24}
              metalness={0.03}
              clearcoat={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh position={[0, strawH / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[strawR, strawR * 0.26, 10, 28]} />
            <meshStandardMaterial color={shade(bodyColor, isDark ? 0.2 : -0.28)} roughness={0.45} />
          </mesh>
        </group>
      </Drift>

      {/* ── labels ── */}
      {showLabels && (
        <>
          {/* angles are spread right around the circle so the callouts fan out
              instead of stacking on one side as the model turns */}
          <PartLabel id="strawPort" position={[0, off.strawPort[1] + lidSkirtH + h * 0.03, 0]} angle={-0.40}      active={activePart === "strawPort"} onPick={onPickPart} reach={reach * 1.05} />
          <PartLabel id="lid"       position={[0, off.lid[1] + lidSkirtH * 0.5, 0]}            angle={3.62}       active={activePart === "lid"}       onPick={onPickPart} reach={reach * 1.25} />
          <PartLabel id="straw"     position={[0, bodyH * 0.92 + off.straw[1], off.straw[2]]}  angle={0.92}       active={activePart === "straw"}     onPick={onPickPart} reach={reach * 0.85} />
          <PartLabel id="gasket"    position={[0, off.gasket[1], 0]}                           angle={2.48}       active={activePart === "gasket"}    onPick={onPickPart} reach={reach * 1.3} />
          <PartLabel id="outerWall" position={[0, bodyH * 0.84, 0]}                            angle={5.62}       active={activePart === "outerWall"} onPick={onPickPart} reach={reach * 1.15} />
          <PartLabel id="punchcard" position={[0, bodyH * 0.55, 0]}                            angle={0.06}       active={activePart === "punchcard"} onPick={onPickPart} reach={reach * 1.3} />
          <PartLabel id="vacuum"    position={[0, bodyH * 0.3, off.vacuum[2]]}                 angle={1.38}       active={activePart === "vacuum"}    onPick={onPickPart} reach={reach * 0.95} />
          <PartLabel id="innerWall" position={[0, bodyH * 0.62, off.inner[2]]}                 angle={4.12}       active={activePart === "innerWall"} onPick={onPickPart} reach={reach * 0.9} />
          <PartLabel id="base"      position={[0, off.base[1] + h * 0.01, 0]}                  angle={3.02}       active={activePart === "base"}      onPick={onPickPart} reach={reach * 1.2} />
        </>
      )}
    </group>
  );
}
