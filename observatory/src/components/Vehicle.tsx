/**
 * The vehicle.
 *
 * A technical cutaway of a Falcon-class launcher, drawn to real proportions
 * (70 m × 3.7 m, so roughly 19:1) rather than the stubby cartoon proportions
 * most rocket illustrations use. Drag rotates it; the annotation set changes
 * with the face you are looking at, which is the point — rotation is a way of
 * asking a different question about the vehicle, not a toy.
 *
 * Specifications shown in the annotations come from the rocket record. Where
 * the source has no value the label says NOT PROVIDED. Nothing here is filled
 * in from general knowledge, however well known the number might be.
 */

import { memo } from 'react';
import type { Rocket } from '../lib/types.ts';
import { NOT_PROVIDED, fmtNum } from '../lib/analytics.ts';

export type VehiclePhase = 'idle' | 'igniting' | 'ascent';

/** Which annotations a given rotation reveals. */
export type Face = 'overview' | 'stages' | 'engines' | 'booster';

export function faceFor(rot: number): Face {
  const r = ((rot % 360) + 360) % 360;
  if (r < 45 || r >= 315) return 'overview';
  if (r < 135) return 'stages';
  if (r < 225) return 'engines';
  return 'booster';
}

export const FACE_LABEL: Record<Face, string> = {
  overview: 'VEHICLE OVERVIEW',
  stages: 'STAGE LAYOUT',
  engines: 'ENGINE SECTION',
  booster: 'BOOSTER / RECOVERY',
};

interface Props {
  height?: number;
  rot?: number;
  phase?: VehiclePhase;
  /** Hide the first stage after separation, so the payload continues alone. */
  separated?: boolean;
  plume?: boolean;
  id?: string;
}

const VB_W = 96;
const VB_H = 520;

function VehicleImpl({
  height = 360,
  rot = 0,
  phase = 'idle',
  separated = false,
  plume = false,
  id = 'v',
}: Props) {
  const width = (height * VB_W) / VB_H;
  const r = ((rot % 360) + 360) % 360;
  const rad = (r * Math.PI) / 180;

  // Cylindrical shading: the specular band tracks the rotation, which reads as
  // a solid body turning rather than a flat shape sliding.
  const spec = 50 + Math.sin(rad) * 26;
  // Radial features (fins, legs) foreshorten as they rotate away from us.
  const depth = Math.abs(Math.cos(rad));
  const sideDepth = Math.abs(Math.sin(rad));

  const gid = (n: string) => `${id}-${n}`;

  return (
    <svg
      className="vehicle-svg"
      width={width}
      height={height}
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      aria-label="Launch vehicle technical illustration"
      role="img"
    >
      <defs>
        <linearGradient id={gid('body')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4c5766" />
          <stop offset={`${Math.max(spec - 26, 2)}%`} stopColor="#8e9bac" />
          <stop offset={`${spec}%`} stopColor="#e4eaf2" />
          <stop offset={`${Math.min(spec + 26, 98)}%`} stopColor="#8e9bac" />
          <stop offset="100%" stopColor="#3f4956" />
        </linearGradient>
        <linearGradient id={gid('dark')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#141a22" />
          <stop offset={`${spec}%`} stopColor="#39424f" />
          <stop offset="100%" stopColor="#10151b" />
        </linearGradient>
        <linearGradient id={gid('bell')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a323d" />
          <stop offset="100%" stopColor="#59636f" />
        </linearGradient>
        <radialGradient id={gid('glow')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#ff8a3c" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#ff6a1f" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── second stage + fairing: continues after separation ── */}
      <g opacity={1}>
        {/* payload fairing, ogive profile */}
        <path
          d="M48 2 C40 26 36 52 36 78 L60 78 C60 52 56 26 48 2 Z"
          fill={`url(#${gid('body')})`}
          stroke="#222b36"
          strokeWidth="0.6"
        />
        {/* fairing split line — only visible when facing us */}
        <line
          x1="48" y1="6" x2="48" y2="78"
          stroke="#2b3542" strokeWidth="0.7" opacity={depth * 0.85}
        />
        {/* second stage */}
        <rect x="36" y="78" width="24" height="92" fill={`url(#${gid('body')})`} stroke="#222b36" strokeWidth="0.6" />
        {/* second-stage engine skirt */}
        <path d="M40 170 L56 170 L54 182 L42 182 Z" fill={`url(#${gid('dark')})`} stroke="#1b232c" strokeWidth="0.5" />
      </g>

      {/* ── first stage: falls away at separation ── */}
      <g
        className={separated ? 'sep-stage gone' : 'sep-stage'}
        style={{ transformOrigin: '48px 340px' }}
      >
        {/* interstage — the black composite band */}
        <rect x="36" y="182" width="24" height="34" fill={`url(#${gid('dark')})`} stroke="#1b232c" strokeWidth="0.6" />

        {/* grid fins, stowed against the interstage */}
        <g opacity={0.35 + depth * 0.65}>
          <rect x={36 - 7 * depth} y="188" width={7 * depth} height="16" fill="#5b6673" stroke="#1b232c" strokeWidth="0.5" />
          <rect x="60" y="188" width={7 * depth} height="16" fill="#3e4753" stroke="#1b232c" strokeWidth="0.5" />
        </g>
        {/* the other fin pair, seen edge-on when rotated 90° */}
        <g opacity={0.25 + sideDepth * 0.6}>
          <rect x={44} y="186" width={8 * sideDepth} height="3" fill="#6b7684" />
        </g>

        {/* first stage tank */}
        <rect x="36" y="216" width="24" height="246" fill={`url(#${gid('body')})`} stroke="#222b36" strokeWidth="0.6" />

        {/* weld lines — the detail that makes it read as hardware */}
        {[248, 286, 324, 362, 400, 438].map((y) => (
          <line key={y} x1="36" y1={y} x2="60" y2={y} stroke="#6f7c8b" strokeWidth="0.35" opacity="0.5" />
        ))}

        {/* raceway conduit, offset so it tracks rotation */}
        <rect
          x={42 + Math.sin(rad) * 8} y="220" width="2.4" height="238"
          fill="#2f3845" opacity={depth * 0.8 + 0.2}
        />

        {/* landing legs, stowed */}
        <g opacity={0.4 + depth * 0.6}>
          <path d={`M${36 - 3 * depth} 442 L36 442 L38 478 L${36 - 2 * depth} 478 Z`} fill="#49525f" stroke="#1b232c" strokeWidth="0.4" />
          <path d={`M60 442 L${60 + 3 * depth} 442 L${60 + 2 * depth} 478 L58 478 Z`} fill="#39424e" stroke="#1b232c" strokeWidth="0.4" />
        </g>

        {/* octaweb + engine bells */}
        <rect x="35" y="462" width="26" height="14" fill={`url(#${gid('dark')})`} stroke="#1b232c" strokeWidth="0.6" />
        <g>
          {/* outer ring of eight, foreshortened into an ellipse as it rotates */}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2 + rad;
            const cx = 48 + Math.cos(a) * 9;
            const cy = 486 + Math.sin(a) * 2.6;
            const front = Math.sin(a) > 0;
            return (
              <ellipse
                key={i}
                cx={cx}
                cy={cy}
                rx="3.1"
                ry="3.6"
                fill={`url(#${gid('bell')})`}
                stroke="#141a21"
                strokeWidth="0.45"
                opacity={front ? 1 : 0.55}
              />
            );
          })}
          {/* centre engine */}
          <ellipse cx="48" cy="486" rx="3.1" ry="3.6" fill={`url(#${gid('bell')})`} stroke="#141a21" strokeWidth="0.45" />
        </g>

        {/* ignition glow under the octaweb */}
        {(phase === 'igniting' || phase === 'ascent') && (
          <ellipse cx="48" cy="496" rx="26" ry="14" fill={`url(#${gid('glow')})`} />
        )}
      </g>

      {/* second-stage ignition after separation */}
      {separated && plume && <ellipse cx="48" cy="188" rx="14" ry="9" fill={`url(#${gid('glow')})`} />}
    </svg>
  );
}

export const Vehicle = memo(VehicleImpl);

/* ── annotation sets ─────────────────────────────────────────────────────── */

export interface Annotation {
  /** Vertical position as a fraction of vehicle height, 0 = nose. */
  at: number;
  side: 'left' | 'right';
  label: string;
  value: string;
}

/**
 * Annotations are built from the rocket record only. A missing specification
 * shows as NOT PROVIDED rather than being quietly filled in — an aerospace
 * audience will check, and a confident wrong number costs more than a gap.
 */
export function annotationsFor(face: Face, rocket: Rocket | null): Annotation[] {
  const v = (n: number | null, unit: string): string =>
    n === null ? NOT_PROVIDED : `${fmtNum(n, n % 1 === 0 ? 0 : 1)} ${unit}`;

  if (!rocket) {
    return [
      { at: 0.08, side: 'right', label: 'VEHICLE', value: NOT_PROVIDED },
      { at: 0.5, side: 'left', label: 'RECORD', value: 'NO ROCKET SELECTED' },
    ];
  }

  switch (face) {
    case 'stages':
      return [
        { at: 0.07, side: 'right', label: 'FAIRING', value: 'PAYLOAD ENCLOSURE' },
        { at: 0.24, side: 'left', label: 'STAGE 2', value: 'UPPER STAGE' },
        { at: 0.38, side: 'right', label: 'INTERSTAGE', value: 'SEPARATION' },
        { at: 0.62, side: 'left', label: 'STAGES', value: rocket.stages === null ? NOT_PROVIDED : String(rocket.stages) },
        { at: 0.82, side: 'right', label: 'STAGE 1', value: 'BOOSTER' },
      ];
    case 'engines':
      return [
        { at: 0.36, side: 'right', label: 'INTERSTAGE', value: 'COMPOSITE' },
        { at: 0.72, side: 'left', label: 'MASS', value: v(rocket.mass_kg, 'kg') },
        { at: 0.9, side: 'right', label: 'OCTAWEB', value: 'ENGINE MOUNT' },
        { at: 0.96, side: 'left', label: 'THRUST STRUCTURE', value: 'STAGE 1 BASE' },
      ];
    case 'booster':
      return [
        { at: 0.38, side: 'left', label: 'GRID FINS', value: 'CONTROL SURFACE' },
        { at: 0.6, side: 'right', label: 'REUSABLE', value: rocket.reusable === null ? NOT_PROVIDED : rocket.reusable ? 'YES' : 'NO' },
        { at: 0.85, side: 'left', label: 'LANDING LEGS', value: 'STOWED' },
        { at: 0.95, side: 'right', label: 'FIRST FLIGHT', value: rocket.first_flight ?? NOT_PROVIDED },
      ];
    default:
      return [
        { at: 0.06, side: 'right', label: 'VEHICLE', value: rocket.name },
        { at: 0.2, side: 'left', label: 'HEIGHT', value: v(rocket.height_m, 'm') },
        { at: 0.42, side: 'right', label: 'DIAMETER', value: v(rocket.diameter_m, 'm') },
        { at: 0.66, side: 'left', label: 'LEO', value: v(rocket.payload_leo_kg, 'kg') },
        { at: 0.88, side: 'right', label: 'GTO', value: v(rocket.payload_gto_kg, 'kg') },
      ];
  }
}
