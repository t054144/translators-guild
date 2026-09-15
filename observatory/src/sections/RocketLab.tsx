/**
 * 04 — ROCKET LAB
 *
 * Selecting a vehicle animates into a technical inspection view: the rocket is
 * drawn at scale with a HUD of annotations pulled from its record. Drag to
 * rotate — each face exposes a different annotation set, which is the point of
 * rotating rather than a flourish.
 *
 * No specification is filled in from general knowledge. If the source has no
 * height for a vehicle, the HUD says NOT PROVIDED, even for a rocket whose
 * dimensions are famous.
 */

import { useMemo, useState } from 'react';
import { Vehicle, annotationsFor, faceFor, FACE_LABEL } from '../components/Vehicle.tsx';
import { Panel, StatusBadge, type Column, DataTable } from '../components/ui.tsx';
import { HBars } from '../components/charts.tsx';
import { useStore } from '../lib/store.tsx';
import { NOT_PROVIDED, fmtDate, fmtMass, rankBy } from '../lib/analytics.ts';
import type { Rocket } from '../lib/types.ts';

/** Inspection vehicle height; annotation anchors are fractions of it. */
const LAB_H = 400;

export default function RocketLab() {
  const { snapshot, launches } = useStore();
  const rockets = useMemo(() => snapshot.rockets.map((r) => r.normalized_payload), [snapshot.rockets]);
  const [selId, setSelId] = useState<string | null>(null);
  const [rot, setRot] = useState(22);
  const [drag, setDrag] = useState<{ x: number; rot: number } | null>(null);

  const sel = useMemo(() => rockets.find((r) => r.id === selId) ?? rockets[0] ?? null, [rockets, selId]);
  const env = useMemo(() => snapshot.rockets.find((e) => e.record_id === sel?.id) ?? null, [snapshot.rockets, sel]);

  const usage = useMemo(() => rankBy(launches, (l) => l.rocket_name), [launches]);
  const forSel = useMemo(
    () => launches.filter((l) => l.rocket_id === sel?.id),
    [launches, sel],
  );
  const selSuccess = forSel.filter((l) => l.outcome === 'success').length;
  const resolved = forSel.filter((l) => l.outcome !== 'unknown' && l.outcome !== 'scheduled').length;

  const face = faceFor(rot);
  const annotations = useMemo(() => annotationsFor(face, sel), [face, sel]);

  const columns = useMemo<Column<Rocket>[]>(() => [
    { key: 'name', head: 'Vehicle', get: (r) => r.name,
      cell: (r) => <span style={{ color: r.id === sel?.id ? 'var(--cyan)' : undefined }}>{r.name}</span> },
    { key: 'family', head: 'Family', get: (r) => r.family },
    { key: 'variant', head: 'Variant', get: (r) => r.variant },
    { key: 'launches', head: 'Launches', num: true,
      get: (r) => launches.filter((l) => l.rocket_id === r.id).length },
    { key: 'height_m', head: 'Height', num: true, get: (r) => r.height_m,
      cell: (r) => r.height_m === null ? <span className="na">{NOT_PROVIDED}</span> : <span className="mono">{r.height_m} m</span> },
    { key: 'leo', head: 'LEO', num: true, get: (r) => r.payload_leo_kg,
      cell: (r) => r.payload_leo_kg === null ? <span className="na">{NOT_PROVIDED}</span> : <span className="mono">{fmtMass(r.payload_leo_kg)}</span> },
    { key: 'reusable', head: 'Reusable', get: (r) => (r.reusable === null ? null : r.reusable ? 'YES' : 'NO'),
      cell: (r) => r.reusable === null
        ? <span className="na">{NOT_PROVIDED}</span>
        : <span className={`badge ${r.reusable ? 'b-ok' : 'b-mute'}`}>{r.reusable ? 'YES' : 'NO'}</span> },
  ], [launches, sel]);

  if (rockets.length === 0) {
    return <div className="view"><div className="empty">NO ROCKET RECORDS IN SNAPSHOT</div></div>;
  }

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">04 — Rocket Lab</span>
          <h1 className="view-title">Rocket Lab</h1>
          <p className="view-sub">
            {rockets.length} vehicle records. Specifications are shown only where the source provides
            them — nothing is completed from outside the dataset.
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="grid-2">
          <Panel title={sel ? `Technical inspection — ${sel.name}` : 'Inspection'} basis={`${FACE_LABEL[face]} · ${Math.round(((rot % 360) + 360) % 360)}°`}>
            <div
              style={{
                position: 'relative', display: 'grid', placeItems: 'center',
                minHeight: 420, cursor: drag ? 'grabbing' : 'grab', userSelect: 'none',
              }}
              onPointerDown={(e) => { setDrag({ x: e.clientX, rot }); (e.target as Element).setPointerCapture?.(e.pointerId); }}
              onPointerMove={(e) => { if (drag) setRot(drag.rot + (e.clientX - drag.x) * 0.55); }}
              onPointerUp={() => setDrag(null)}
              onPointerCancel={() => setDrag(null)}
              role="img"
              aria-label={`${sel?.name ?? 'Vehicle'} technical view`}
            >
              <div style={{ position: 'relative' }}>
                <Vehicle id="lab" height={LAB_H} rot={rot} phase="idle" />
                <div className="telemetry on">
                  {annotations.map((a, i) => (
                    <div key={i} className={`tl-tag ${a.side}`} style={{ top: 20 + a.at * LAB_H - 9 }}>
                      {a.label} <span className="v">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="row" style={{ justifyContent: 'center', gap: 6, marginTop: 8 }}>
              {(['overview', 'stages', 'engines', 'booster'] as const).map((f, i) => (
                <button key={f} className={`chip${face === f ? ' on' : ''}`} type="button"
                        onClick={() => setRot(i * 90)}>
                  {FACE_LABEL[f]}
                </button>
              ))}
            </div>
          </Panel>

          <div className="stack">
            <Panel title="Vehicle record" basis={env ? env.source : ''} flush>
              {!sel ? <div className="empty">NO VEHICLE SELECTED</div> : (
                <div className="layer-grid">
                  {([
                    ['NAME', sel.name],
                    ['FULL NAME', sel.full_name],
                    ['FAMILY', sel.family],
                    ['VARIANT', sel.variant],
                    ['STAGES', sel.stages === null ? null : String(sel.stages)],
                    ['HEIGHT', sel.height_m === null ? null : `${sel.height_m} m`],
                    ['DIAMETER', sel.diameter_m === null ? null : `${sel.diameter_m} m`],
                    ['LAUNCH MASS', sel.mass_kg === null ? null : fmtMass(sel.mass_kg)],
                    ['LEO CAPACITY', sel.payload_leo_kg === null ? null : fmtMass(sel.payload_leo_kg)],
                    ['GTO CAPACITY', sel.payload_gto_kg === null ? null : fmtMass(sel.payload_gto_kg)],
                    ['REUSABLE', sel.reusable === null ? null : sel.reusable ? 'YES' : 'NO'],
                    ['MAIDEN FLIGHT', sel.first_flight ? fmtDate(sel.first_flight) : null],
                  ] as [string, string | null][]).map(([k, v]) => (
                    <div className="layer-cell" key={k}>
                      <span className="lbl">{k}</span>
                      <span className={v ? 'v' : 'v na'}>{v ?? NOT_PROVIDED}</span>
                      {env?.data_quality[k.toLowerCase().replace(/ /g, '_')] && (
                        <StatusBadge status={env.data_quality[k.toLowerCase().replace(/ /g, '_')]!} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Performance in window" basis={`${forSel.length} launches`}>
              <div className="metrics" style={{ border: 0 }}>
                <div className="metric">
                  <span className="lbl">Launches</span>
                  <span className="metric-val accent">{forSel.length}</span>
                </div>
                <div className="metric">
                  <span className="lbl">Successful</span>
                  <span className="metric-val">{selSuccess}</span>
                </div>
                <div className="metric">
                  <span className="lbl">Success rate</span>
                  <span className="metric-val">
                    {resolved ? `${((selSuccess / resolved) * 100).toFixed(1)}%` : <span className="na">{NOT_PROVIDED}</span>}
                  </span>
                  <span className="metric-unit">of {resolved} resolved</span>
                </div>
              </div>
              {sel?.description && (
                <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                  {sel.description}
                </p>
              )}
            </Panel>
          </div>
        </div>

        <Panel title="Vehicle usage" basis={`Built from ${launches.length} launches`}>
          <HBars data={usage.map((u) => ({ key: u.key, label: u.label, value: u.count,
            note: `${u.count} launches · ${u.share.toFixed(1)}% of window` }))} unit="launches" />
        </Panel>

        <Panel title="All vehicles" basis={`${rockets.length} records`} flush>
          <DataTable rows={rockets} columns={columns} initialSort={['launches', 'desc']}
                     rowId={(r) => r.id} selectedId={sel?.id ?? null}
                     onRowClick={(r) => setSelId(r.id)} />
        </Panel>
      </div>
    </div>
  );
}
