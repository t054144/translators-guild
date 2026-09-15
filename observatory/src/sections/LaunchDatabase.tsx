/**
 * 02 — LAUNCH DATABASE
 *
 * Filtering is synchronous against the in-memory snapshot, so there is no
 * debounce, no request, and no stale-result race: what you type is what the
 * table already shows. Selecting a mission opens the dossier, which reads only
 * from that mission's record and says NOT PROVIDED wherever the source is silent.
 */

import { useMemo, useState } from 'react';
import { DataTable, Panel, StatusBadge, type Column } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import {
  NOT_PROVIDED, distinct, fmtDate, fmtDateTime, fmtMass, indexById,
} from '../lib/analytics.ts';
import { OUTCOME_LABEL, type Launch } from '../lib/types.ts';

const outcomeBadge = (l: Launch) => (
  <span className={`badge ${
    l.outcome === 'success' ? 'b-ok'
    : l.outcome === 'failure' ? 'b-fail'
    : l.outcome === 'partial_failure' ? 'b-warn'
    : l.outcome === 'scheduled' ? 'b-info' : 'b-mute'}`}>
    {OUTCOME_LABEL[l.outcome]}
  </span>
);

const landingBadge = (l: Launch) => {
  if (l.landing_outcome === 'success') return <span className="badge b-ok">LANDED</span>;
  if (l.landing_outcome === 'failure') return <span className="badge b-fail">LOST</span>;
  if (l.landing_outcome === 'not_attempted') return <span className="badge b-mute">EXPENDED</span>;
  return <span className="badge b-mute">UNKNOWN</span>;
};

/* ── mission dossier ─────────────────────────────────────────────────────── */

function Dossier({ launch, onClose }: { launch: Launch; onClose: () => void }) {
  const { snapshot } = useStore();
  const rockets = useMemo(() => indexById(snapshot.rockets), [snapshot.rockets]);
  const boosters = useMemo(() => indexById(snapshot.boosters), [snapshot.boosters]);
  const payloads = useMemo(() => indexById(snapshot.payloads), [snapshot.payloads]);

  const env = snapshot.launches.find((e) => e.record_id === launch.id) ?? null;
  const rocket = launch.rocket_id ? rockets.get(launch.rocket_id) ?? null : null;
  const cores = launch.booster_ids.map((b) => boosters.get(b)).filter((b): b is NonNullable<typeof b> => !!b);
  const pays = launch.payload_ids.map((p) => payloads.get(p)).filter((p): p is NonNullable<typeof p> => !!p);

  /**
   * Timeline events. Only events the record actually supports are listed — no
   * MAX-Q, no stage-two cutoff, because the source carries no event telemetry.
   */
  const events: { t: string; label: string; detail: string; state: 'ok' | 'fail' | 'none' }[] = [];
  if (launch.window_start) events.push({ t: 'WINDOW OPEN', label: fmtDateTime(launch.window_start), detail: 'Source: window_start', state: 'none' });
  if (launch.net) events.push({ t: 'NET', label: fmtDateTime(launch.net), detail: 'No earlier than — source: net', state: 'none' });
  if (launch.window_end) events.push({ t: 'WINDOW CLOSE', label: fmtDateTime(launch.window_end), detail: 'Source: window_end', state: 'none' });
  if (launch.landing_attempt !== null) {
    events.push({
      t: 'LANDING',
      label: launch.landing_attempt ? (launch.landing_outcome === 'success' ? 'RECOVERED' : launch.landing_outcome === 'failure' ? 'NOT RECOVERED' : 'ATTEMPTED — RESULT UNKNOWN') : 'NOT ATTEMPTED',
      detail: launch.landing_zone ? `Zone: ${launch.landing_zone}` : 'No zone in record',
      state: launch.landing_outcome === 'success' ? 'ok' : launch.landing_outcome === 'failure' ? 'fail' : 'none',
    });
  }
  events.push({
    t: 'OUTCOME',
    label: OUTCOME_LABEL[launch.outcome],
    detail: launch.outcome_raw ? `Source status: “${launch.outcome_raw}”` : 'No status string in record',
    state: launch.outcome === 'success' ? 'ok' : launch.outcome === 'failure' || launch.outcome === 'partial_failure' ? 'fail' : 'none',
  });

  const field = (label: string, value: string | null) => (
    <div className="layer-cell" key={label}>
      <span className="lbl">{label}</span>
      <span className={value ? 'v' : 'v na'}>{value ?? NOT_PROVIDED}</span>
    </div>
  );

  return (
    <div className="stack">
      <Panel
        title={`Mission dossier — ${launch.name}`}
        actions={<button className="btn" type="button" onClick={onClose}>CLOSE · ESC</button>}
        flush
      >
        <div className="layer-grid" style={{ borderBottom: '1px solid var(--line)' }}>
          {field('FLIGHT NO. (SNAPSHOT)', launch.flight_number ? `#${launch.flight_number}` : null)}
          {field('NET (UTC)', fmtDateTime(launch.net))}
          {field('VEHICLE', launch.rocket_name)}
          {field('LAUNCH SITE', launch.launchpad_name)}
          {field('ORBIT', launch.orbit)}
          {field('RECORD ID', launch.id)}
        </div>
        <div style={{ padding: 14 }}>
          <div className="row" style={{ gap: 8, marginBottom: 12 }}>
            {outcomeBadge(launch)}
            {landingBadge(launch)}
            {env && <StatusBadge status={env.data_quality.outcome ?? 'source_provided'} />}
          </div>
          {launch.description ? (
            <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '72ch' }}>{launch.description}</p>
          ) : (
            <p className="na" style={{ margin: 0 }}>NO MISSION DESCRIPTION IN SOURCE RECORD</p>
          )}
        </div>
      </Panel>

      <div className="grid-2">
        <Panel title="Mission timeline" basis="Only events present in the record">
          <div className="lineage">
            {events.map((e, i) => (
              <div className="lin-step" key={i}>
                <span className="lin-stage" style={{
                  color: e.state === 'ok' ? 'var(--ok)' : e.state === 'fail' ? 'var(--fail)' : 'var(--cyan)',
                }}>{e.t}</span>
                <div>
                  <div className="lin-label">{e.label}</div>
                  <div className="lin-detail">{e.detail}</div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            The source publishes no in-flight event telemetry, so no MAX-Q, staging or deployment
            times are shown. Fabricating a plausible sequence would be the easiest thing on this page
            to get wrong and the hardest to notice.
          </p>
        </Panel>

        <div className="stack">
          <Panel title="Booster" basis={`${cores.length} core record(s)`} flush>
            {cores.length === 0 ? (
              <div className="empty">NO CORE SERIAL IN THIS RECORD</div>
            ) : (
              <div className="layer-grid">
                {cores.flatMap((b) => [
                  field(`${b.serial} — FLIGHTS IN WINDOW`, String(b.flight_count)),
                  field(`${b.serial} — LANDINGS`, `${b.landing_successes} / ${b.landing_attempts}`),
                ])}
              </div>
            )}
          </Panel>

          <Panel title="Payload" basis={`${pays.length} record(s)`} flush>
            {pays.length === 0 ? (
              <div className="empty">NO PAYLOAD RECORD</div>
            ) : (
              <div className="layer-grid">
                {pays.flatMap((p) => [
                  field('NAME', p.name),
                  field('TYPE', p.type),
                  field('MASS', p.mass_kg === null ? null : fmtMass(p.mass_kg)),
                  field('CUSTOMER', p.customers[0] ?? null),
                ])}
              </div>
            )}
          </Panel>

          <Panel title="Vehicle" flush>
            {!rocket ? <div className="empty">NO ROCKET RECORD</div> : (
              <div className="layer-grid">
                {field('NAME', rocket.name)}
                {field('FAMILY', rocket.family)}
                {field('HEIGHT', rocket.height_m === null ? null : `${rocket.height_m} m`)}
                {field('LEO', rocket.payload_leo_kg === null ? null : fmtMass(rocket.payload_leo_kg))}
              </div>
            )}
          </Panel>
        </div>
      </div>

      <Panel
        title="Raw source record"
        basis={env ? `${env.source} · retrieved ${fmtDate(env.retrieved_at)}` : ''}
      >
        <pre className="json" style={{ maxHeight: 320 }}>{JSON.stringify(env?.raw_payload ?? null, null, 2)}</pre>
      </Panel>
    </div>
  );
}

/* ── section ─────────────────────────────────────────────────────────────── */

export default function LaunchDatabase() {
  const store = useStore();
  const { launches, all, filters, setFilter, resetFilters, activeFilterCount, selected } = store;
  const [showFilters, setShowFilters] = useState(true);

  const rockets = useMemo(() => distinct(all, (l) => l.rocket_name), [all]);
  const pads = useMemo(() => distinct(all, (l) => l.launchpad_name), [all]);
  const orbits = useMemo(() => distinct(all, (l) => l.orbit), [all]);

  const rocketIdByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of all) if (l.rocket_name && l.rocket_id) m.set(l.rocket_name, l.rocket_id);
    return m;
  }, [all]);
  const padIdByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of all) if (l.launchpad_name && l.launchpad_id) m.set(l.launchpad_name, l.launchpad_id);
    return m;
  }, [all]);

  const columns = useMemo<Column<Launch>[]>(() => [
    { key: 'flight_number', head: '#', num: true, get: (l) => l.flight_number, width: 56 },
    { key: 'net', head: 'Date (UTC)', num: true, get: (l) => l.net, cell: (l) => <span className="mono">{fmtDate(l.net)}</span> },
    { key: 'name', head: 'Mission', get: (l) => l.name,
      cell: (l) => <span style={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</span> },
    { key: 'rocket_name', head: 'Vehicle', get: (l) => l.rocket_name },
    { key: 'booster', head: 'Booster', get: (l) => l.booster_ids[0] ?? null,
      cell: (l) => l.booster_ids.length ? <span className="mono">{l.booster_ids.join(', ')}</span> : <span className="na">{NOT_PROVIDED}</span> },
    { key: 'launchpad_name', head: 'Pad', get: (l) => l.launchpad_name },
    { key: 'orbit', head: 'Orbit', get: (l) => l.orbit },
    { key: 'outcome', head: 'Outcome', get: (l) => l.outcome, cell: outcomeBadge },
    { key: 'landing_outcome', head: 'Landing', get: (l) => l.landing_outcome, cell: landingBadge },
  ], []);

  if (selected) return <div className="view"><Dossier launch={selected} onClose={() => store.select(null)} /></div>;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">02 — Launch Database</span>
          <h1 className="view-title">Launch Database</h1>
          <p className="view-sub">
            {launches.length.toLocaleString()} of {all.length.toLocaleString()} records match.
            Filtering runs against the in-memory snapshot, so results are synchronous.
          </p>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={() => setShowFilters((v) => !v)}>
            FILTERS {activeFilterCount > 0 && `· ${activeFilterCount}`}
          </button>
          <button className="btn" type="button" onClick={resetFilters} disabled={activeFilterCount === 0}>RESET</button>
        </div>
      </div>

      <div className="stack">
        {showFilters && (
          <div className="filters">
            <div className="fld" style={{ flex: '1 1 220px' }}>
              <label className="lbl" htmlFor="q">Search</label>
              <input id="q" type="search" data-search value={filters.search}
                     onChange={(e) => setFilter('search', e.target.value)}
                     placeholder="mission, booster, pad, orbit…" />
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-rocket">Vehicle</label>
              <select id="f-rocket" data-filter value={filters.rocketId}
                      onChange={(e) => setFilter('rocketId', e.target.value)}>
                <option value="">All vehicles</option>
                {rockets.map((r) => <option key={r} value={rocketIdByName.get(r) ?? ''}>{r}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-pad">Launch site</label>
              <select id="f-pad" value={filters.padId} onChange={(e) => setFilter('padId', e.target.value)}>
                <option value="">All sites</option>
                {pads.map((p) => <option key={p} value={padIdByName.get(p) ?? ''}>{p}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-outcome">Outcome</label>
              <select id="f-outcome" value={filters.outcome} onChange={(e) => setFilter('outcome', e.target.value)}>
                <option value="">All outcomes</option>
                {['success', 'failure', 'partial_failure', 'scheduled', 'unknown'].map((o) => (
                  <option key={o} value={o}>{OUTCOME_LABEL[o as Launch['outcome']]}</option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-landing">Landing</label>
              <select id="f-landing" value={filters.landing} onChange={(e) => setFilter('landing', e.target.value)}>
                <option value="">All landings</option>
                <option value="success">Recovered</option>
                <option value="failure">Lost</option>
                <option value="not_attempted">Expended</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-orbit">Orbit</label>
              <select id="f-orbit" value={filters.orbit} onChange={(e) => setFilter('orbit', e.target.value)}>
                <option value="">All orbits</option>
                {orbits.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-from">From</label>
              <input id="f-from" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
            </div>
            <div className="fld">
              <label className="lbl" htmlFor="f-to">To</label>
              <input id="f-to" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
            </div>
          </div>
        )}

        <Panel title="Records" basis={`${launches.length} rows · click a row for the mission dossier`} flush>
          <DataTable
            rows={launches}
            columns={columns}
            initialSort={['net', 'desc']}
            rowId={(l) => l.id}
            onRowClick={(l) => store.select(l)}
          />
        </Panel>
      </div>
    </div>
  );
}
