/**
 * 05 — BOOSTER REUSE INTELLIGENCE
 *
 * A booster is treated as an engineering asset with a service history rather
 * than a row in a table. The lifecycle view puts the core at the centre and
 * each flight on its own ring, ordered outward by flight number — selecting a
 * ring rotates the asset toward that mission and opens it.
 *
 * Counts are explicitly scoped to the ingest window. A core that flew before
 * the window opened shows the flights we actually hold, and the page says so
 * rather than implying it has the booster's whole life.
 */

import { useMemo, useState } from 'react';
import { DataTable, Panel, type Column } from '../components/ui.tsx';
import { HBars } from '../components/charts.tsx';
import { useStore } from '../lib/store.tsx';
import {
  NOT_PROVIDED, boosterProfiles, fmtDate, fmtNum, type BoosterProfile,
} from '../lib/analytics.ts';
import { OUTCOME_LABEL, type Launch } from '../lib/types.ts';

/* ── lifecycle rings ─────────────────────────────────────────────────────── */

function Lifecycle({ booster, onPick, picked }: {
  booster: BoosterProfile;
  onPick: (l: Launch) => void;
  picked: Launch | null;
}) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const core = 34;
  const flights = booster.missions;
  const gap = flights.length > 0 ? (cx - core - 26) / flights.length : 0;

  // The selected flight is brought to the 12-o'clock position, so the asset
  // visibly turns toward the mission being inspected.
  const pickedIdx = picked ? flights.findIndex((f) => f.id === picked.id) : -1;
  const baseAngle = pickedIdx >= 0 ? -90 - (pickedIdx / Math.max(flights.length, 1)) * 360 : -90;

  return (
    <div className="lifecycle">
      <svg className="lc-svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img"
           aria-label={`Lifecycle of booster ${booster.serial}, ${flights.length} flights`}>
        <g style={{ transform: `rotate(${baseAngle + 90}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.7s cubic-bezier(0.22,0.7,0.28,1)' }}>
          {flights.map((f, i) => {
            const r = core + 22 + i * gap;
            const angle = ((i / Math.max(flights.length, 1)) * 360 - 90) * (Math.PI / 180);
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            const isPicked = picked?.id === f.id;
            const landed = f.landing_outcome === 'success';
            const lost = f.landing_outcome === 'failure';

            return (
              <g key={f.id}>
                <circle cx={cx} cy={cy} r={r} className={`lc-ring${isPicked ? ' active' : ''}`} />
                <g className="lc-flight" onClick={() => onPick(f)} role="button" tabIndex={0}
                   onKeyDown={(e) => { if (e.key === 'Enter') onPick(f); }}>
                  <circle
                    cx={x} cy={y} r={isPicked ? 9 : 6}
                    fill={lost ? '#e5484d' : landed ? '#3dd68c' : '#36414f'}
                    stroke={isPicked ? '#4dd4e8' : '#0a0e14'}
                    strokeWidth={isPicked ? 2 : 1.5}
                  />
                  <title>{`Flight ${i + 1} — ${f.name} — ${fmtDate(f.net)}`}</title>
                </g>
              </g>
            );
          })}
        </g>

        {/* the core itself */}
        <circle cx={cx} cy={cy} r={core} className="lc-core" />
        <text x={cx} y={cy - 4} textAnchor="middle" className="mono"
              style={{ fill: '#4dd4e8', fontSize: 14, fontFamily: 'var(--mono)' }}>{booster.serial}</text>
        <text x={cx} y={cy + 12} textAnchor="middle"
              style={{ fill: '#5b6878', fontSize: 9, fontFamily: 'var(--mono)', letterSpacing: '0.12em' }}>
          {flights.length} FLIGHTS
        </text>
      </svg>
    </div>
  );
}

/* ── comparison ──────────────────────────────────────────────────────────── */

function Compare({ a, b }: { a: BoosterProfile; b: BoosterProfile }) {
  const rows: { label: string; a: string; b: string; better?: 'a' | 'b' | null }[] = [
    { label: 'FLIGHTS IN WINDOW', a: String(a.flight_count), b: String(b.flight_count),
      better: a.flight_count === b.flight_count ? null : a.flight_count > b.flight_count ? 'a' : 'b' },
    { label: 'LANDING ATTEMPTS', a: String(a.landing_attempts), b: String(b.landing_attempts), better: null },
    { label: 'LANDINGS', a: String(a.landing_successes), b: String(b.landing_successes),
      better: a.landing_successes === b.landing_successes ? null : a.landing_successes > b.landing_successes ? 'a' : 'b' },
    { label: 'LANDING RATE',
      a: a.landing_attempts ? `${((a.landing_successes / a.landing_attempts) * 100).toFixed(0)}%` : NOT_PROVIDED,
      b: b.landing_attempts ? `${((b.landing_successes / b.landing_attempts) * 100).toFixed(0)}%` : NOT_PROVIDED,
      better: null },
    { label: 'AVG TURNAROUND',
      a: a.avg_turnaround_days === null ? NOT_PROVIDED : `${fmtNum(a.avg_turnaround_days, 0)} d`,
      b: b.avg_turnaround_days === null ? NOT_PROVIDED : `${fmtNum(b.avg_turnaround_days, 0)} d`,
      better: a.avg_turnaround_days === null || b.avg_turnaround_days === null ? null
              : a.avg_turnaround_days < b.avg_turnaround_days ? 'a' : 'b' },
    { label: 'FIRST FLIGHT', a: fmtDate(a.first_flight), b: fmtDate(b.first_flight), better: null },
    { label: 'LAST FLIGHT', a: fmtDate(a.last_flight), b: fmtDate(b.last_flight), better: null },
    { label: 'SITES USED',
      a: String(new Set(a.missions.map((m) => m.launchpad_name)).size),
      b: String(new Set(b.missions.map((m) => m.launchpad_name)).size), better: null },
  ];

  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 17, color: 'var(--cyan)' }}>{a.serial}</span>
        <span className="lbl">versus</span>
        <span className="mono" style={{ fontSize: 17, color: 'var(--cyan)' }}>{b.serial}</span>
      </div>
      {rows.map((r) => (
        <div key={r.label} style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12,
          alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--line)',
        }}>
          <span className="mono" style={{ textAlign: 'right', fontSize: 14, color: r.better === 'a' ? 'var(--cyan)' : 'var(--text)' }}>
            {r.a === NOT_PROVIDED ? <span className="na">{NOT_PROVIDED}</span> : r.a}
          </span>
          <span className="lbl" style={{ minWidth: 150, textAlign: 'center' }}>{r.label}</span>
          <span className="mono" style={{ fontSize: 14, color: r.better === 'b' ? 'var(--cyan)' : 'var(--text)' }}>
            {r.b === NOT_PROVIDED ? <span className="na">{NOT_PROVIDED}</span> : r.b}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */

export default function BoosterReuse() {
  const store = useStore();
  const { snapshot, launches } = store;

  const profiles = useMemo(() => boosterProfiles(snapshot, launches), [snapshot, launches]);
  const [sel, setSel] = useState<string | null>(null);
  const [pickedFlight, setPickedFlight] = useState<Launch | null>(null);
  const [cmp, setCmp] = useState<[string | null, string | null]>([null, null]);

  const current = useMemo(
    () => profiles.find((p) => p.serial === sel) ?? profiles[0] ?? null,
    [profiles, sel],
  );

  const a = profiles.find((p) => p.serial === cmp[0]) ?? null;
  const b = profiles.find((p) => p.serial === cmp[1]) ?? null;

  const columns = useMemo<Column<BoosterProfile>[]>(() => [
    { key: 'serial', head: 'Core', get: (p) => p.serial,
      cell: (p) => <span className="mono" style={{ color: 'var(--cyan)' }}>{p.serial}</span> },
    { key: 'flight_count', head: 'Flights', num: true, get: (p) => p.flight_count },
    { key: 'landing_attempts', head: 'Attempts', num: true, get: (p) => p.landing_attempts },
    { key: 'landing_successes', head: 'Landings', num: true, get: (p) => p.landing_successes },
    { key: 'rate', head: 'Landing rate', num: true,
      get: (p) => (p.landing_attempts ? (p.landing_successes / p.landing_attempts) * 100 : null),
      cell: (p) => p.landing_attempts
        ? <span className="mono">{((p.landing_successes / p.landing_attempts) * 100).toFixed(0)}%</span>
        : <span className="na">{NOT_PROVIDED}</span> },
    { key: 'turn', head: 'Avg turnaround', num: true, get: (p) => p.avg_turnaround_days,
      cell: (p) => p.avg_turnaround_days === null
        ? <span className="na">{NOT_PROVIDED}</span>
        : <span className="mono">{fmtNum(p.avg_turnaround_days, 0)} d</span> },
    { key: 'first_flight', head: 'First', num: true, get: (p) => p.first_flight, cell: (p) => <span className="mono">{fmtDate(p.first_flight)}</span> },
    { key: 'last_flight', head: 'Last', num: true, get: (p) => p.last_flight, cell: (p) => <span className="mono">{fmtDate(p.last_flight)}</span> },
  ], []);

  if (profiles.length === 0) {
    return (
      <div className="view">
        <div className="view-head">
          <div><span className="eyebrow">05 — Booster Reuse</span><h1 className="view-title">Booster Reuse</h1></div>
        </div>
        <div className="empty">NO CORE SERIALS IN THE CURRENT SELECTION</div>
      </div>
    );
  }

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">05 — Booster Reuse Intelligence</span>
          <h1 className="view-title">Booster Reuse</h1>
          <p className="view-sub">
            {profiles.length} cores across {launches.length} launches. Flight counts are scoped to the
            ingest window — a core that flew before the window opened shows only the flights held here.
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="grid-2">
          <Panel
            title={current ? `Lifecycle — ${current.serial}` : 'Lifecycle'}
            basis="Each ring is one flight, ordered outward"
          >
            {current && (
              <Lifecycle
                booster={current}
                picked={pickedFlight}
                onPick={(l) => setPickedFlight(pickedFlight?.id === l.id ? null : l)}
              />
            )}
            <div className="row" style={{ gap: 14, justifyContent: 'center', marginTop: 4 }}>
              {[['#3dd68c', 'RECOVERED'], ['#e5484d', 'LOST'], ['#36414f', 'NOT ATTEMPTED / UNKNOWN']].map(([c, l]) => (
                <span key={l} className="row" style={{ gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
                </span>
              ))}
            </div>
          </Panel>

          <div className="stack">
            <Panel title="Selected flight" basis={pickedFlight ? 'From the lifecycle rings' : 'Click a ring node'}>
              {!pickedFlight ? (
                <div className="empty">SELECT A FLIGHT ON THE LIFECYCLE</div>
              ) : (
                <div className="layer-grid" style={{ margin: -14 }}>
                  {[
                    ['MISSION', pickedFlight.name],
                    ['DATE', fmtDate(pickedFlight.net)],
                    ['LAUNCH SITE', pickedFlight.launchpad_name],
                    ['ORBIT', pickedFlight.orbit],
                    ['OUTCOME', OUTCOME_LABEL[pickedFlight.outcome]],
                    ['LANDING', pickedFlight.landing_outcome.replace('_', ' ').toUpperCase()],
                    ['LANDING ZONE', pickedFlight.landing_zone],
                  ].map(([k, v]) => (
                    <div className="layer-cell" key={k}>
                      <span className="lbl">{k}</span>
                      <span className={v ? 'v' : 'v na'}>{v ?? NOT_PROVIDED}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Most flown cores" basis={`Top ${Math.min(profiles.length, 10)} by flights in window`}>
              <HBars
                data={profiles.slice(0, 10).map((p) => ({
                  key: p.serial, label: p.serial, value: p.flight_count,
                  note: `${p.flight_count} flights · ${p.landing_successes}/${p.landing_attempts} landings`,
                }))}
                unit="flights"
                labelWidth={90}
              />
            </Panel>
          </div>
        </div>

        <Panel title="Compare cores" basis="Select two serials">
          <div className="row" style={{ marginBottom: 14 }}>
            <select value={cmp[0] ?? ''} onChange={(e) => setCmp([e.target.value || null, cmp[1]])} aria-label="Core A">
              <option value="">Core A…</option>
              {profiles.map((p) => <option key={p.serial} value={p.serial}>{p.serial} ({p.flight_count})</option>)}
            </select>
            <select value={cmp[1] ?? ''} onChange={(e) => setCmp([cmp[0], e.target.value || null])} aria-label="Core B">
              <option value="">Core B…</option>
              {profiles.map((p) => <option key={p.serial} value={p.serial}>{p.serial} ({p.flight_count})</option>)}
            </select>
            {(a || b) && <button className="btn" type="button" onClick={() => setCmp([null, null])}>CLEAR</button>}
          </div>
          {a && b ? <Compare a={a} b={b} /> : <div className="empty">SELECT TWO CORES TO COMPARE</div>}
        </Panel>

        <Panel title="All cores" basis={`${profiles.length} records · click to inspect`} flush>
          <DataTable
            rows={profiles}
            columns={columns}
            initialSort={['flight_count', 'desc']}
            rowId={(p) => p.serial}
            selectedId={current?.serial ?? null}
            onRowClick={(p) => { setSel(p.serial); setPickedFlight(null); }}
          />
        </Panel>
      </div>
    </div>
  );
}
