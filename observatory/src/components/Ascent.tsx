/**
 * Mission ascent — the traversal.
 *
 * The vehicle climbs a trajectory rail, and its altitude *is* the selected data
 * layer: LIFTOFF → MISSION → BOOSTER → PAYLOAD → ORBIT → OUTCOME. Stopping the
 * ascent stops on a layer; stepping is navigation. Stage separation fires when
 * the vehicle reaches the BOOSTER layer, because that is the moment the view
 * hands over from the vehicle to the core.
 *
 * Every cell is read from the mission record. Where the source has nothing, the
 * cell says NOT PROVIDED — the sequence never invents a telemetry event, and a
 * failed mission never gets a cause it was not given.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Particles } from './Particles.tsx';
import { Vehicle } from './Vehicle.tsx';
import { NOT_PROVIDED, fmtDate, fmtDateTime, fmtMass } from '../lib/analytics.ts';
import { OUTCOME_LABEL, type Booster, type Launch, type Payload, type Rocket } from '../lib/types.ts';

export interface AscentStage {
  id: string;
  label: string;
  /** Position along the rail, 0 = pad, 1 = apogee. */
  at: number;
}

const STAGES: AscentStage[] = [
  { id: 'liftoff', label: 'LIFTOFF', at: 0.04 },
  { id: 'mission', label: 'MISSION', at: 0.22 },
  { id: 'booster', label: 'BOOSTER', at: 0.4 },
  { id: 'payload', label: 'PAYLOAD', at: 0.58 },
  { id: 'orbit', label: 'ORBIT', at: 0.76 },
  { id: 'outcome', label: 'OUTCOME', at: 0.93 },
];

interface Cell { label: string; value: string | null; accent?: boolean }

interface Props {
  launch: Launch;
  rocket: Rocket | null;
  boosters: Booster[];
  payloads: Payload[];
  onExit: () => void;
  onOpenDossier: () => void;
}

export function Ascent({ launch, rocket, boosters, payloads, onExit, onOpenDossier }: Props) {
  const [stage, setStage] = useState(0);
  const [running, setRunning] = useState(true);

  const failed = launch.outcome === 'failure' || launch.outcome === 'partial_failure';
  const current = STAGES[stage] ?? STAGES[0]!;
  const separated = stage >= 2;

  /* auto-advance; any manual step pauses it so the user keeps control */
  useEffect(() => {
    if (!running) return;
    if (stage >= STAGES.length - 1) { setRunning(false); return; }
    const t = setTimeout(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), stage === 0 ? 1500 : 2300);
    return () => clearTimeout(t);
  }, [running, stage]);

  const step = useCallback((d: number) => {
    setRunning(false);
    setStage((s) => Math.max(0, Math.min(s + d, STAGES.length - 1)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onExit(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); step(-1); }
      else if (e.key === ' ') { e.preventDefault(); setRunning((r) => !r); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onExit, step]);

  const cells = useMemo<Cell[]>(() => {
    switch (current.id) {
      case 'liftoff':
        return [
          { label: 'NET (UTC)', value: fmtDateTime(launch.net), accent: true },
          { label: 'LAUNCH SITE', value: launch.launchpad_name },
          { label: 'WINDOW OPEN', value: launch.window_start ? fmtDateTime(launch.window_start) : null },
          { label: 'WINDOW CLOSE', value: launch.window_end ? fmtDateTime(launch.window_end) : null },
        ];
      case 'mission':
        return [
          { label: 'MISSION', value: launch.name, accent: true },
          { label: 'FLIGHT NO. (SNAPSHOT)', value: launch.flight_number ? `#${launch.flight_number}` : null },
          { label: 'VEHICLE', value: launch.rocket_name },
          { label: 'DESCRIPTION', value: launch.description },
        ];
      case 'booster':
        return boosters.length === 0
          ? [{ label: 'BOOSTER', value: null }, { label: 'NOTE', value: 'No core serial in the source record for this launch.' }]
          : boosters.flatMap((b) => [
              { label: 'CORE SERIAL', value: b.serial, accent: true },
              { label: 'FLIGHTS IN WINDOW', value: String(b.flight_count) },
              { label: 'LANDINGS', value: `${b.landing_successes} / ${b.landing_attempts} attempts` },
              { label: 'FIRST SEEN', value: fmtDate(b.first_flight) },
            ]);
      case 'payload':
        return payloads.length === 0
          ? [{ label: 'PAYLOAD', value: null }, { label: 'NOTE', value: 'Source exposes no payload record for this mission.' }]
          : payloads.flatMap((p) => [
              { label: 'PAYLOAD', value: p.name, accent: true },
              { label: 'TYPE', value: p.type },
              { label: 'MASS', value: p.mass_kg === null ? null : fmtMass(p.mass_kg) },
              { label: 'CUSTOMER', value: p.customers[0] ?? null },
            ]);
      case 'orbit':
        return [
          { label: 'TARGET ORBIT', value: launch.orbit, accent: true },
          { label: 'VEHICLE', value: rocket?.name ?? null },
          { label: 'LEO CAPACITY', value: rocket?.payload_leo_kg ? fmtMass(rocket.payload_leo_kg) : null },
          { label: 'GTO CAPACITY', value: rocket?.payload_gto_kg ? fmtMass(rocket.payload_gto_kg) : null },
        ];
      default:
        return [
          { label: 'MISSION OUTCOME', value: OUTCOME_LABEL[launch.outcome], accent: true },
          { label: 'SOURCE STATUS STRING', value: launch.outcome_raw },
          { label: 'LANDING', value: launch.landing_outcome.replace('_', ' ').toUpperCase() },
          { label: 'LANDING ZONE', value: launch.landing_zone },
          ...(failed ? [{ label: launch.failure_time_s !== null ? `CAUSE (T+${launch.failure_time_s}s)` : 'CAUSE', value: launch.failure_reason }] : []),
        ];
    }
  }, [current.id, launch, rocket, boosters, payloads, failed]);

  const railPct = (v: number) => `${v * 100}%`;
  const showFail = failed && stage === STAGES.length - 1;

  /**
   * Rendered into document.body rather than in place. The section wrapper runs
   * an entry animation, and an animated ancestor becomes the containing block
   * for `position: fixed` — which would trap this overlay inside the content
   * column instead of covering the viewport.
   */
  return createPortal(
    <div className="ascent" role="dialog" aria-label={`Mission ascent: ${launch.name}`}>
      <Particles mode="field" intensity={running ? 1 + stage * 0.5 : 0.25} className="ascent-canvas" />

      <header className="ascent-hd">
        <span className="eyebrow">Mission Trajectory Visualization</span>
        <span className="ttl">{launch.name}</span>
        <span className={`badge ${showFail ? 'b-fail' : 'b-info'}`}>{OUTCOME_LABEL[launch.outcome]}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmtDate(launch.net)}</span>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)' }}>
          LAYER {stage + 1} / {STAGES.length}
        </span>
        <button className="btn" type="button" onClick={onExit}>EXIT · ESC</button>
      </header>

      <div className="ascent-body">
        {/* trajectory rail */}
        <div className={`traj${showFail ? ' failed' : ''}`} style={{ left: '30%' }}>
          <div className="traj-done" style={{ height: railPct(current.at) }} />
        </div>

        {/* nodes */}
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className={[
              'node',
              i <= stage ? 'reached' : '',
              i === stage ? 'current' : '',
              showFail && i === STAGES.length - 1 ? 'failed' : '',
            ].join(' ')}
            style={{ left: '30%', bottom: railPct(s.at) }}
          >
            <span className="node-dot" />
            <button
              className="node-label"
              type="button"
              onClick={() => { setRunning(false); setStage(i); }}
              style={{ background: 'none', border: 0, padding: 0, font: 'inherit' }}
            >
              {s.label}
            </button>
          </div>
        ))}

        {/* the vehicle, riding the rail */}
        <div className="ascent-vehicle" style={{ left: '30%', bottom: railPct(current.at) }}>
          <Vehicle
            id="ascent"
            height={190}
            phase="ascent"
            separated={separated}
            plume
          />
          <div className="plume on" style={{ height: 70 }}>
            <div className="plume-core" />
          </div>
        </div>

        {/* the data layer for the current altitude */}
        <div
          className="layer show"
          style={{
            left: 'calc(30% + 190px)',
            bottom: railPct(current.at),
            transform: 'translateY(50%)',
            width: 'min(620px, calc(70% - 220px))',
          }}
        >
          <div className="layer-card">
            <div className="hd">
              <h4>{current.label}</h4>
              <span className="lbl">{launch.id}</span>
            </div>
            <div className="layer-grid">
              {cells.map((c, i) => (
                <div className="layer-cell" key={`${c.label}-${i}`}>
                  <span className="lbl">{c.label}</span>
                  {c.value === null || c.value === NOT_PROVIDED ? (
                    <span className="v na">{NOT_PROVIDED}</span>
                  ) : (
                    <span className={`v${c.accent ? ' accent' : ''}`}>{c.value}</span>
                  )}
                </div>
              ))}
            </div>
            {showFail && (
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line-2)' }}>
                <span className="badge b-fail">TRAJECTORY TERMINATED</span>
                <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
                  {launch.failure_reason
                    ? `Cause as recorded by the source: “${launch.failure_reason}”. Nothing beyond that is inferred.`
                    : 'The source records the outcome but no cause. No explanation is generated here.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="ascent-ft">
        <button className="btn" type="button" onClick={() => step(-1)} disabled={stage === 0}>◀ DESCEND</button>
        <button className="btn" type="button" onClick={() => setRunning((r) => !r)}>
          {running ? '❙❙ HOLD' : '▶ RESUME'}
        </button>
        <button className="btn" type="button" onClick={() => step(1)} disabled={stage === STAGES.length - 1}>ASCEND ▶</button>
        <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', marginInline: 10 }}>
          ↑ ↓ step · space hold · esc exit
        </span>
        <button className="btn primary" type="button" onClick={onOpenDossier}>EXPLORE MISSION →</button>
      </footer>
    </div>,
    document.body,
  );
}
