/**
 * 01 — MISSION CONTROL
 *
 * The vehicle is the primary control on this page. Hovering arms it and wakes
 * the telemetry; dragging rotates it and changes which annotations are legible;
 * clicking ignites and hands the user to the ascent traversal. The metric grid
 * below is a second entry point into the same data — click any tile to open its
 * lineage and see the path from source payload to displayed figure.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Ascent } from '../components/Ascent.tsx';
import { Particles } from '../components/Particles.tsx';
import { Vehicle, annotationsFor, faceFor, FACE_LABEL, type VehiclePhase } from '../components/Vehicle.tsx';
import { Counter, LineagePanel, Panel, StatusBadge } from '../components/ui.tsx';
import { Proportion } from '../components/charts.tsx';
import { useStore } from '../lib/store.tsx';
import {
  NOT_PROVIDED, dataKind, dataKindLabel, fmtDate, fmtDateTime, headlineMetrics, indexById, type Metric,
} from '../lib/analytics.ts';
import { OUTCOME_LABEL, type Launch } from '../lib/types.ts';

/* ── background telemetry stream ─────────────────────────────────────────── */

/** Hero vehicle height. The annotation anchors are fractions of this, so the
 *  two can never drift apart. */
const VEHICLE_H = 392;

const STREAM_KEYS = [
  'MISSION_ID', 'FLIGHT_NUMBER', 'NET_UTC', 'BOOSTER_SERIAL', 'LAUNCHPAD',
  'PAYLOAD_REF', 'ORBIT', 'STATUS', 'LANDING_ATTEMPT', 'LANDING_ZONE',
  'RETRIEVED_AT', 'RECORD_ID', 'SOURCE', 'QUALITY',
];

function DataStream({ launches }: { launches: Launch[] }) {
  const cols = useMemo(() => {
    const sample = launches.slice(-40);
    return Array.from({ length: 7 }, (_, c) => {
      const lines = Array.from({ length: 26 }, (_, i) => {
        const l = sample[(i * 3 + c * 5) % Math.max(sample.length, 1)];
        const k = STREAM_KEYS[(i + c) % STREAM_KEYS.length]!;
        if (!l) return `${k}  —`;
        const v =
          k === 'MISSION_ID' ? l.id.slice(0, 8)
          : k === 'FLIGHT_NUMBER' ? `#${l.flight_number ?? '—'}`
          : k === 'NET_UTC' ? (l.net ?? '—').slice(0, 10)
          : k === 'BOOSTER_SERIAL' ? (l.booster_ids[0] ?? 'NULL')
          : k === 'LAUNCHPAD' ? (l.launchpad_name ?? 'NULL')
          : k === 'ORBIT' ? (l.orbit ?? 'NULL')
          : k === 'STATUS' ? l.outcome.toUpperCase()
          : k === 'LANDING_ZONE' ? (l.landing_zone ?? 'NULL')
          : 'OK';
        return `${k.padEnd(16)}${v}`;
      });
      return { lines: lines.join('\n'), left: `${4 + c * 14.5}%`, dur: 26 + c * 7 };
    });
  }, [launches]);

  return (
    <div className="stream" aria-hidden="true">
      {cols.map((c, i) => (
        <div key={i} className="stream-col" style={{ left: c.left, animationDuration: `${c.dur}s` }}>
          {c.lines}
        </div>
      ))}
    </div>
  );
}

/* ── countdown ───────────────────────────────────────────────────────────── */

function useCountdown(iso: string | null): string | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!iso) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [iso]);

  if (!iso) return null;
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) return null;
  const delta = target - now;
  if (delta <= 0) return null;

  const d = Math.floor(delta / 86_400_000);
  const h = Math.floor((delta % 86_400_000) / 3_600_000);
  const m = Math.floor((delta % 3_600_000) / 60_000);
  const s = Math.floor((delta % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `T−${d}d ${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* ── section ─────────────────────────────────────────────────────────────── */

export default function MissionControl() {
  const store = useStore();
  const nav = useNavigate();
  const { snapshot, launches, all } = store;

  const [rot, setRot] = useState(18);
  const [hover, setHover] = useState(false);
  const [phase, setPhase] = useState<VehiclePhase>('idle');
  const [ascent, setAscent] = useState<Launch | null>(null);
  const [openMetric, setOpenMetric] = useState<Metric | null>(null);

  const dragRef = useRef<{ x: number; rot: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const rockets = useMemo(() => indexById(snapshot.rockets), [snapshot.rockets]);
  const boosterIdx = useMemo(() => indexById(snapshot.boosters), [snapshot.boosters]);
  const payloadIdx = useMemo(() => indexById(snapshot.payloads), [snapshot.payloads]);

  const metrics = useMemo(() => headlineMetrics(snapshot, launches), [snapshot, launches]);

  /** The mission the vehicle represents: next upcoming, else most recent. */
  const focus = useMemo<Launch | null>(() => {
    const up = all.filter((l) => l.upcoming).sort((a, b) => (a.net ?? '') < (b.net ?? '') ? -1 : 1);
    if (up[0]) return up[0];
    const past = all.filter((l) => !l.upcoming);
    return past[past.length - 1] ?? null;
  }, [all]);

  const focusRocket = focus?.rocket_id ? rockets.get(focus.rocket_id) ?? null : null;
  const countdown = useCountdown(focus?.upcoming ? focus.net : null);
  const face = faceFor(rot);
  const annotations = useMemo(() => annotationsFor(face, focusRocket), [face, focusRocket]);

  /* ── drag to rotate ── */
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { x: e.clientX, rot };
    setDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [rot]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    setRot(d.rot + (e.clientX - d.x) * 0.55);
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    const moved = d ? Math.abs(e.clientX - d.x) : 0;
    dragRef.current = null;
    setDragging(false);
    // A drag rotates; a click ignites. 4px separates the two intents.
    if (moved < 4 && focus) ignite(focus);
  }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps

  const ignite = useCallback((l: Launch) => {
    setPhase('igniting');
    window.setTimeout(() => {
      setAscent(l);
      setPhase('idle');
    }, 900);
  }, []);

  const live = snapshot.meta.is_live;
  const kind = dataKind(snapshot.meta);
  const recent = useMemo(() => [...launches].reverse().slice(0, 7), [launches]);

  const outcomeParts = useMemo(() => {
    const c = (o: Launch['outcome']) => launches.filter((l) => l.outcome === o).length;
    return [
      { key: 'ok', label: 'SUCCESS', value: c('success'), color: '#3dd68c' },
      { key: 'pf', label: 'PARTIAL FAILURE', value: c('partial_failure'), color: '#f0a93b' },
      { key: 'f', label: 'FAILURE', value: c('failure'), color: '#e5484d' },
      { key: 'sch', label: 'SCHEDULED', value: c('scheduled'), color: '#4dd4e8' },
      { key: 'unk', label: 'UNKNOWN', value: c('unknown'), color: '#36414f' },
    ];
  }, [launches]);

  if (snapshot.launches.length === 0) {
    return (
      <div className="view">
        <div className="view-head">
          <div>
            <h1 className="view-title">Mission Intelligence</h1>
            <p className="view-sub">No records have been ingested yet.</p>
          </div>
        </div>
        <Panel title="Awaiting ingest">
          <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.7 }}>
            The data layer is wired but the cache is empty. Run the ingest CLI to populate it:
          </p>
          <pre className="json" style={{ marginTop: 12 }}>npm run ingest{'\n'}npm run ingest -- --fixture   # synthetic, for interface work</pre>
        </Panel>
      </div>
    );
  }

  return (
    <div className="view">
      <header className="masthead-hero">
        <div className="hero-kicker">
          <span className="eyebrow">01 — Mission Control</span>
          <span className={`badge ${kind === 'fixture' ? 'b-warn' : kind === 'archive' ? 'b-info' : 'b-ok'}`}>{dataKindLabel(snapshot.meta)}</span>
          <span className="lbl">
            {snapshot.meta.window.from?.slice(0, 4) ?? '—'} – {snapshot.meta.window.to?.slice(0, 4) ?? '—'}
          </span>
        </div>

        <h1 className="hero-title">
          Mission <span className="b">Intelligence</span>
        </h1>

        <div className="hero-rule">
          <span className="lbl">SpaceX Data Observatory</span>
        </div>

        <p className="hero-sub">
          Explore the operational history, engineering patterns, and launch data behind SpaceX missions.
        </p>

        <div className="hero-actions">
          {focus && (
            <button className="btn primary" type="button" onClick={() => ignite(focus)}>
              ENTER MISSION MODE
            </button>
          )}
          <button className="btn" type="button" onClick={() => nav('/explorer')}>DATA LINEAGE</button>
          <button className="btn" type="button" onClick={() => nav('/launches')}>LAUNCH DATABASE</button>
          <span className="spacer" />
          <span className="lbl">
            {Object.values(snapshot.meta.counts).reduce((a, b) => a + b, 0).toLocaleString()} records collected
          </span>
        </div>
      </header>

      <div className="stack">
        <div className={`prov-banner${live ? ' live' : ''}`}>
          <strong>{live ? 'Live data' : 'Fixture data'}</strong>
          <span>{snapshot.meta.provenance_note}</span>
        </div>

        {/* ── the launch complex ── */}
        <div className="complex">
          <Particles mode="field" intensity={phase === 'igniting' ? 2.4 : 0.55} className="complex-canvas" />
          <DataStream launches={all} />

          <div className="readout left">
            <div className="ro-block" style={{ animationDelay: '60ms' }}>
              <span className="lbl">{focus?.upcoming ? 'Next launch' : 'Most recent launch'}</span>
              <div className="ro-val accent">{focus?.name ?? NOT_PROVIDED}</div>
            </div>
            <div className="ro-block" style={{ animationDelay: '120ms' }}>
              <span className="lbl">Vehicle</span>
              <div className="ro-val">{focus?.rocket_name ?? NOT_PROVIDED}</div>
            </div>
            <div className="ro-block" style={{ animationDelay: '180ms' }}>
              <span className="lbl">Launch site</span>
              <div className="ro-val">{focus?.launchpad_name ?? NOT_PROVIDED}</div>
            </div>
            <div className="ro-block" style={{ animationDelay: '240ms' }}>
              <span className="lbl">Net (utc)</span>
              <div className="ro-val">{fmtDateTime(focus?.net ?? null)}</div>
            </div>
          </div>

          {/* ── vehicle ── */}
          <div
            className={`vehicle-stage${dragging ? ' dragging' : ''}${hover ? ' armed' : ''}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => { dragRef.current = null; setDragging(false); }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            role="button"
            tabIndex={0}
            aria-label={focus ? `Ignite and explore ${focus.name}` : 'Launch vehicle'}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (focus) ignite(focus); }
              if (e.key === 'ArrowLeft') setRot((r) => r - 15);
              if (e.key === 'ArrowRight') setRot((r) => r + 15);
            }}
          >
            <div className={`vehicle ${phase === 'igniting' ? 'igniting' : 'idle'}`}>
              <Vehicle id="hero" height={VEHICLE_H} rot={rot} phase={phase} />

              <div className={`plume${phase === 'igniting' ? ' on' : ''}`} style={{ height: 88 }}>
                <div className="plume-core" />
              </div>

              <div className={`reticle${hover ? ' on' : ''}`}>
                <span /><span /><span /><span />
              </div>

              {/* telemetry annotations, drawn from the rocket record */}
              <div className={`telemetry${hover ? ' on' : ''}`}>
                {annotations.map((a, i) => (
                  <div
                    key={`t${i}`}
                    className={`tl-tag ${a.side}`}
                    style={{ top: 26 + a.at * VEHICLE_H - 9, transitionDelay: `${i * 45}ms` }}
                  >
                    {a.label} <span className="v">{a.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pad-deck" />

          <div className="readout right">
            <div className="ro-block" style={{ animationDelay: '90ms' }}>
              <span className="lbl">Countdown</span>
              {countdown ? (
                <div className="ro-val big accent">{countdown}</div>
              ) : (
                <>
                  <div className="ro-val na">COUNTDOWN DATA UNAVAILABLE</div>
                  <div className="lbl" style={{ marginTop: 4, color: 'var(--text-4)' }}>
                    {focus?.upcoming ? 'NO NET TIME IN RECORD' : 'NO UPCOMING LAUNCH IN SNAPSHOT'}
                  </div>
                </>
              )}
            </div>
            <div className="ro-block" style={{ animationDelay: '150ms' }}>
              <span className="lbl">Mission status</span>
              <div className="ro-val">{focus ? OUTCOME_LABEL[focus.outcome] : NOT_PROVIDED}</div>
            </div>
            <div className="ro-block" style={{ animationDelay: '210ms' }}>
              <span className="lbl">Inspection face</span>
              <div className="ro-val accent" style={{ fontSize: 13 }}>{FACE_LABEL[face]}</div>
              <div className="lbl" style={{ marginTop: 4, color: 'var(--text-4)' }}>DRAG TO ROTATE · {Math.round(((rot % 360) + 360) % 360)}°</div>
            </div>
            <div className="ro-block" style={{ animationDelay: '270ms' }}>
              <span className="lbl">Records in view</span>
              <div className="ro-val"><Counter value={launches.length} /> / {all.length}</div>
            </div>
          </div>

          <div className={`arm-hint${hover ? ' hot' : ''}`}>
            {phase === 'igniting' ? 'IGNITION SEQUENCE' : hover ? 'CLICK TO LAUNCH · DRAG TO ROTATE' : 'VEHICLE ARMED'}
          </div>
        </div>

        {/* ── metric grid ── */}
        <div className="metrics">
          {metrics.map((m) => (
            <button
              key={m.key}
              className="metric"
              type="button"
              onClick={() => setOpenMetric(openMetric?.key === m.key ? null : m)}
              style={{ textAlign: 'left', border: 0, font: 'inherit', color: 'inherit' }}
            >
              <span className="lbl">{m.label}</span>
              <span className={`metric-val${m.key === 'total' ? ' accent' : ''}${m.value === null || typeof m.value !== 'number' || m.display.match(/[A-Za-z]/) ? ' small' : ''}`}>
                {m.value !== null && !m.display.match(/[A-Za-z]/)
                  ? <Counter value={m.value} digits={m.key === 'rate' ? 1 : 0} />
                  : m.display}
                {m.key === 'rate' && m.value !== null && '%'}
              </span>
              {m.unit && <span className="metric-unit">{m.unit}</span>}
              <span className="metric-trace">TRACE →</span>
            </button>
          ))}
        </div>

        {openMetric && (
          <Panel
            title={`Lineage — ${openMetric.label}`}
            actions={<button className="btn" type="button" onClick={() => setOpenMetric(null)}>CLOSE</button>}
          >
            <LineagePanel lineage={openMetric.lineage} />
          </Panel>
        )}

        <div className="grid-2">
          <Panel title="Outcome distribution" basis={`Built from ${launches.length} launches`}>
            <Proportion parts={outcomeParts} total={launches.length} />
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              Scheduled and unknown outcomes are shown separately and are excluded from the success-rate
              denominator, rather than being counted as either result.
            </p>
          </Panel>

          <Panel title="Recent missions" basis="Newest first" flush>
            <div className="tbl-wrap" style={{ maxHeight: 280 }}>
              <table>
                <thead>
                  <tr><th>Date</th><th>Mission</th><th>Vehicle</th><th>Outcome</th></tr>
                </thead>
                <tbody>
                  {recent.map((l) => (
                    <tr key={l.id} onClick={() => setAscent(l)}>
                      <td className="n">{fmtDate(l.net)}</td>
                      <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</td>
                      <td>{l.rocket_name ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                      <td>
                        <span className={`badge ${l.outcome === 'success' ? 'b-ok' : l.outcome === 'failure' ? 'b-fail' : l.outcome === 'partial_failure' ? 'b-warn' : 'b-mute'}`}>
                          {OUTCOME_LABEL[l.outcome]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <Panel title="Collected data" basis={`Snapshot generated ${fmtDate(snapshot.meta.generated_at)}`}>
          <div className="grid-3">
            {Object.entries(snapshot.meta.counts).map(([k, v]) => (
              <div key={k} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--line)', padding: '7px 0' }}>
                <span className="lbl">{k} records</span>
                <span className="mono" style={{ fontSize: 15 }}>{v.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <StatusBadge status={live ? 'source_provided' : 'fixture'} />
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {snapshot.meta.window.from?.slice(0, 10)} → {snapshot.meta.window.to?.slice(0, 10)}
            </span>
          </div>
        </Panel>
      </div>

      {ascent && (
        <Ascent
          launch={ascent}
          rocket={ascent.rocket_id ? rockets.get(ascent.rocket_id) ?? null : null}
          boosters={ascent.booster_ids.map((b) => boosterIdx.get(b)).filter((b): b is NonNullable<typeof b> => !!b)}
          payloads={ascent.payload_ids.map((p) => payloadIdx.get(p)).filter((p): p is NonNullable<typeof p> => !!p)}
          onExit={() => setAscent(null)}
          onOpenDossier={() => { store.select(ascent); setAscent(null); nav('/launches'); }}
        />
      )}
    </div>
  );
}
