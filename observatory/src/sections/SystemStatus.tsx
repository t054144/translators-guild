/**
 * 10 — SYSTEM STATUS
 *
 * Source health, honestly reported. The state a source is in is whatever the
 * last ingest actually observed — this page never shows ONLINE because a
 * connector exists, and never shows LIVE for cached data.
 *
 * The r/SpaceX API appears here permanently as OFFLINE with its reason. It was
 * the source nearly every SpaceX project was built on until it was archived in
 * June 2026, and a user who expects to see it deserves an explanation rather
 * than its silent absence.
 */

import { useMemo } from 'react';
import { Panel } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import { NOT_PROVIDED, fmtDateTime } from '../lib/analytics.ts';
import { SOURCE_STATE_LABEL, type SourceState } from '../lib/types.ts';
import { CONNECTORS } from '../lib/connectors.ts';

const STATE_CLASS: Record<SourceState, string> = {
  online: 'b-ok',
  degraded: 'b-warn',
  stale: 'b-warn',
  offline: 'b-fail',
  never_fetched: 'b-mute',
};

export default function SystemStatus() {
  const { snapshot } = useStore();
  const meta = snapshot.meta;

  const ageHours = useMemo(() => {
    if (!meta.generated_at) return null;
    return (Date.now() - new Date(meta.generated_at).getTime()) / 3_600_000;
  }, [meta.generated_at]);

  const freshness: { label: string; cls: string; detail: string } = useMemo(() => {
    if (ageHours === null) return { label: 'UNKNOWN', cls: 'b-mute', detail: 'No generation timestamp in snapshot.' };
    if (ageHours < 6) return { label: 'FRESH', cls: 'b-ok', detail: 'Within the 6-hour budget for launch data.' };
    if (ageHours < 48) return { label: 'AGEING', cls: 'b-warn', detail: 'Past the 6-hour budget. Figures remain valid; the manifest may not.' };
    return { label: 'STALE', cls: 'b-fail', detail: 'Older than 48 hours. Re-run the ingest CLI before relying on upcoming launches.' };
  }, [ageHours]);

  const bytes = useMemo(() => {
    try { return new Blob([JSON.stringify(snapshot)]).size; } catch { return null; }
  }, [snapshot]);

  const totalRecords = Object.values(meta.counts).reduce((s, n) => s + n, 0);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">10 — System Status</span>
          <h1 className="view-title">System Status</h1>
          <p className="view-sub">
            Data source health as observed at the last ingest. Nothing on this page is inferred from a
            connector merely existing.
          </p>
        </div>
        <div className="row">
          <span className={`badge ${meta.is_live ? 'b-ok' : 'b-warn'}`}>
            {meta.is_live ? 'LIVE DATA' : 'FIXTURE DATA'}
          </span>
          <span className={`badge ${freshness.cls}`}>{freshness.label}</span>
        </div>
      </div>

      <div className="stack">
        <div className={`prov-banner${meta.is_live ? ' live' : ''}`}>
          <strong>{meta.is_live ? 'Provenance' : 'Not real data'}</strong>
          <span>{meta.provenance_note}</span>
        </div>

        <div className="metrics">
          <div className="metric">
            <span className="lbl">Cache status</span>
            <span className="metric-val small accent">LOADED</span>
            <span className="metric-unit">in-memory, read once at boot</span>
          </div>
          <div className="metric">
            <span className="lbl">Data freshness</span>
            <span className="metric-val small">{freshness.label}</span>
            <span className="metric-unit">
              {ageHours === null ? NOT_PROVIDED : `${ageHours.toFixed(1)}h since ingest`}
            </span>
          </div>
          <div className="metric">
            <span className="lbl">Total records</span>
            <span className="metric-val">{totalRecords.toLocaleString()}</span>
          </div>
          <div className="metric">
            <span className="lbl">Snapshot size</span>
            <span className="metric-val small">{bytes === null ? NOT_PROVIDED : `${(bytes / 1_048_576).toFixed(2)} MB`}</span>
          </div>
          <div className="metric">
            <span className="lbl">Schema version</span>
            <span className="metric-val small">v{meta.schema_version}</span>
          </div>
          <div className="metric">
            <span className="lbl">Runtime requests</span>
            <span className="metric-val">0</span>
            <span className="metric-unit">UI never calls an API</span>
          </div>
        </div>

        <Panel title="Data sources" basis={`${meta.sources.length} registered`} flush>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Source</th><th>State</th><th>Last success</th><th>Response</th><th>Records</th><th>Detail</th>
                </tr>
              </thead>
              <tbody>
                {meta.sources.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div>{s.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>{s.endpoint}</div>
                    </td>
                    <td><span className={`badge ${STATE_CLASS[s.state]}`}>{SOURCE_STATE_LABEL[s.state]}</span></td>
                    <td className="n">{s.last_success ? fmtDateTime(s.last_success) : <span className="na">NEVER</span>}</td>
                    <td className="n">{s.response_ms === null ? <span className="na">—</span> : `${s.response_ms} ms`}</td>
                    <td className="n">{s.record_count.toLocaleString()}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12, maxWidth: 420, lineHeight: 1.55 }}>{s.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Connector registry" basis={`${CONNECTORS.length} connectors compiled in`} flush>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Connector</th><th>State</th><th>Provides</th><th>Docs</th></tr></thead>
              <tbody>
                {CONNECTORS.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div>{c.name}</div>
                      <div className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 2 }}>{c.id}</div>
                    </td>
                    <td>
                      <span className={`badge ${c.decommissioned ? 'b-fail' : 'b-ok'}`}>
                        {c.decommissioned ? 'DECOMMISSIONED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td style={{ fontSize: 11.5, color: 'var(--text-2)' }}>{c.provides.join(', ')}</td>
                    <td><a href={c.docs_url} target="_blank" rel="noreferrer noopener">docs ↗</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {CONNECTORS.filter((c) => c.decommissioned).map((c) => (
            <div key={c.id} style={{ padding: 14, borderTop: '1px solid var(--line)' }}>
              <span className="badge b-fail">{c.name}</span>
              <p style={{ margin: '8px 0 0', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65, maxWidth: '78ch' }}>
                {c.decommission_note}
              </p>
            </div>
          ))}
        </Panel>

        <div className="grid-2">
          <Panel title="Record counts" basis="Populated from the snapshot, not hard-coded">
            <div className="stack" style={{ gap: 0 }}>
              {Object.entries(meta.counts).map(([k, v]) => (
                <div key={k} className="row" style={{ justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
                  <span className="lbl">{k} records</span>
                  <span className="mono" style={{ fontSize: 16 }}>{v.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Degradation policy">
            <div className="lineage">
              {[
                ['SOURCE FAILS', 'Ingest exits non-zero and leaves the previous snapshot untouched. A failed fetch never produces a partial cache.'],
                ['RATE LIMITED', 'A 429 is never retried — retrying a rate limit digs in. The CLI reports the window and suggests the dev mirror.'],
                ['DATA STALE', 'The UI keeps serving cached data and labels its age. It does not blank the interface or pretend to be live.'],
                ['FIELD MISSING', 'Rendered as NOT PROVIDED. Never 0, never an empty cell, never an inferred value.'],
                ['OUTCOME UNKNOWN', 'Counted separately and excluded from success-rate denominators rather than assumed successful.'],
              ].map(([k, v]) => (
                <div className="lin-step" key={k}>
                  <span className="lin-stage">{k}</span>
                  <div><div className="lin-detail" style={{ marginTop: 0 }}>{v}</div></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <Panel title="Ingest window">
          <div className="grid-3">
            <div><span className="lbl">From</span><div className="ro-val mono">{meta.window.from?.slice(0, 10) ?? NOT_PROVIDED}</div></div>
            <div><span className="lbl">To</span><div className="ro-val mono">{meta.window.to?.slice(0, 10) ?? NOT_PROVIDED}</div></div>
            <div><span className="lbl">Generated</span><div className="ro-val mono">{fmtDateTime(meta.generated_at)}</div></div>
          </div>
          <p style={{ margin: '14px 0 0', fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.65, maxWidth: '78ch' }}>
            {freshness.detail} Counts scoped to this window — booster flight totals in particular — describe
            what the snapshot holds, not a vehicle's complete service history.
          </p>
          <pre className="json" style={{ marginTop: 12 }}>npm run ingest -- --days 2920</pre>
        </Panel>
      </div>
    </div>
  );
}
