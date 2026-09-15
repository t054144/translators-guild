/**
 * 09 — DATA EXPLORER
 *
 * The audit surface. Pick any record and see the raw payload the connector
 * received, the normalized entity the pipeline produced, the per-field quality
 * map, and the lineage from source to displayed metric.
 *
 * This section exists because "every metric is traceable" is only a claim until
 * someone can actually click through and check it.
 */

import { useMemo, useState } from 'react';
import { CopyButton, DownloadButton, JsonView, LineagePanel, Panel, StatusBadge } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import { fmtDateTime, headlineMetrics } from '../lib/analytics.ts';
import { DATA_STATUS_LABEL, type EntityType, type RecordEnvelope } from '../lib/types.ts';

type AnyEnvelope = RecordEnvelope<{ id: string; name?: string; serial?: string }>;

const KINDS: { key: EntityType; label: string }[] = [
  { key: 'launch', label: 'LAUNCHES' },
  { key: 'rocket', label: 'ROCKETS' },
  { key: 'booster', label: 'BOOSTERS' },
  { key: 'payload', label: 'PAYLOADS' },
  { key: 'launchpad', label: 'LAUNCHPADS' },
];

export default function DataExplorer() {
  const { snapshot, launches } = useStore();
  const [kind, setKind] = useState<EntityType>('launch');
  const [recordId, setRecordId] = useState<string | null>(null);
  const [view, setView] = useState<'raw' | 'normalized' | 'quality' | 'schema'>('raw');
  const [keyFilter, setKeyFilter] = useState('');
  const [rowFilter, setRowFilter] = useState('');

  const pool = useMemo<AnyEnvelope[]>(() => {
    switch (kind) {
      case 'rocket': return snapshot.rockets as unknown as AnyEnvelope[];
      case 'booster': return snapshot.boosters as unknown as AnyEnvelope[];
      case 'payload': return snapshot.payloads as unknown as AnyEnvelope[];
      case 'launchpad': return snapshot.launchpads as unknown as AnyEnvelope[];
      default: return snapshot.launches as unknown as AnyEnvelope[];
    }
  }, [kind, snapshot]);

  const filtered = useMemo(() => {
    const q = rowFilter.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter((e) =>
      e.record_id.toLowerCase().includes(q) ||
      JSON.stringify(e.normalized_payload).toLowerCase().includes(q));
  }, [pool, rowFilter]);

  const record = useMemo(
    () => filtered.find((e) => e.record_id === recordId) ?? filtered[0] ?? null,
    [filtered, recordId],
  );

  const metrics = useMemo(() => headlineMetrics(snapshot, launches), [snapshot, launches]);
  const [lineageKey, setLineageKey] = useState<string>('total');
  const lineage = metrics.find((m) => m.key === lineageKey) ?? metrics[0] ?? null;

  /** Inferred schema of the normalized entity — types, not values. */
  const schema = useMemo(() => {
    if (!record) return null;
    const shape: Record<string, string> = {};
    for (const [k, v] of Object.entries(record.normalized_payload as Record<string, unknown>)) {
      shape[k] = v === null ? 'null'
        : Array.isArray(v) ? `array<${v.length ? typeof v[0] : 'unknown'}>[${v.length}]`
        : typeof v;
    }
    return shape;
  }, [record]);

  const payload =
    view === 'raw' ? record?.raw_payload
    : view === 'normalized' ? record?.normalized_payload
    : view === 'quality' ? record?.data_quality
    : schema;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">09 — Data Explorer</span>
          <h1 className="view-title">Data Explorer</h1>
          <p className="view-sub">
            Raw payloads, normalized entities, per-field quality and metric lineage.
            Everything the interface renders can be traced from here.
          </p>
        </div>
        <div className="row">
          <DownloadButton data={snapshot} filename="spacex-snapshot.json" label="DOWNLOAD SNAPSHOT" />
        </div>
      </div>

      <div className="stack">
        <div className="filters">
          <div className="fld">
            <span className="lbl">Entity</span>
            <div className="row" style={{ gap: 6 }}>
              {KINDS.map((k) => (
                <button key={k.key} className={`chip${kind === k.key ? ' on' : ''}`} type="button"
                        onClick={() => { setKind(k.key); setRecordId(null); }}>
                  {k.label} {snapshot.meta.counts[k.key] ?? 0}
                </button>
              ))}
            </div>
          </div>
          <div className="fld" style={{ flex: '1 1 200px' }}>
            <label className="lbl" htmlFor="rowq">Filter records</label>
            <input id="rowq" type="search" data-search value={rowFilter}
                   onChange={(e) => setRowFilter(e.target.value)} placeholder="id or any value…" />
          </div>
          <div className="fld" style={{ flex: '1 1 200px' }}>
            <label className="lbl" htmlFor="keyq">Filter keys in payload</label>
            <input id="keyq" type="search" value={keyFilter}
                   onChange={(e) => setKeyFilter(e.target.value)} placeholder="e.g. landing" />
          </div>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: 'minmax(260px, 340px) 1fr' }}>
          <Panel title="Records" basis={`${filtered.length} of ${pool.length}`} flush>
            <div className="tbl-wrap" style={{ maxHeight: 560 }}>
              <table>
                <thead><tr><th>Record id</th><th>Label</th></tr></thead>
                <tbody>
                  {filtered.slice(0, 400).map((e) => {
                    const p = e.normalized_payload;
                    return (
                      <tr key={e.record_id}
                          className={record?.record_id === e.record_id ? 'sel' : undefined}
                          onClick={() => setRecordId(e.record_id)}>
                        <td className="n" style={{ fontSize: 11 }}>{e.record_id}</td>
                        <td style={{ maxWidth: 170, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.name ?? p.serial ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <div className="stack">
            <Panel
              title="Record envelope"
              actions={record ? (
                <div className="row" style={{ gap: 6 }}>
                  <CopyButton text={JSON.stringify(payload, null, 2)} />
                  <DownloadButton data={record} filename={`${record.record_id}.json`} />
                </div>
              ) : undefined}
            >
              {!record ? <div className="empty">NO RECORD SELECTED</div> : (
                <>
                  <div className="layer-grid" style={{ margin: -14, marginBottom: 14 }}>
                    {([
                      ['RECORD ID', record.record_id],
                      ['ENTITY TYPE', record.entity_type],
                      ['SOURCE', record.source],
                      ['SOURCE URL', record.source_url],
                      ['RETRIEVED AT', fmtDateTime(record.retrieved_at)],
                      ['LAST UPDATED', record.last_updated ? fmtDateTime(record.last_updated) : null],
                    ] as [string, string | null][]).map(([k, v]) => (
                      <div className="layer-cell" key={k}>
                        <span className="lbl">{k}</span>
                        <span className={v ? 'v' : 'v na'} style={{ fontSize: 11.5 }}>{v ?? 'NOT PROVIDED'}</span>
                      </div>
                    ))}
                  </div>

                  <div className="row" style={{ gap: 6, marginBottom: 12 }}>
                    {(['raw', 'normalized', 'quality', 'schema'] as const).map((v) => (
                      <button key={v} className={`chip${view === v ? ' on' : ''}`} type="button" onClick={() => setView(v)}>
                        {v === 'raw' ? 'RAW PAYLOAD' : v === 'normalized' ? 'NORMALIZED' : v === 'quality' ? 'FIELD QUALITY' : 'SCHEMA'}
                      </button>
                    ))}
                  </div>

                  {view === 'quality' ? (
                    <div className="tbl-wrap" style={{ maxHeight: 420 }}>
                      <table>
                        <thead><tr><th>Field</th><th>Status</th><th>Meaning</th></tr></thead>
                        <tbody>
                          {Object.entries(record.data_quality)
                            .filter(([k]) => !keyFilter || k.toLowerCase().includes(keyFilter.toLowerCase()))
                            .map(([k, v]) => (
                              <tr key={k}>
                                <td className="n">{k}</td>
                                <td><StatusBadge status={v} /></td>
                                <td style={{ color: 'var(--text-3)', fontSize: 12 }}>
                                  {v === 'missing' ? 'Source had no value. Not zero.'
                                    : v === 'derived' ? 'Computed by the pipeline.'
                                    : v === 'fixture' ? 'Synthetic — not real data.'
                                    : v === 'source_provided' ? 'Passed through unchanged.'
                                    : DATA_STATUS_LABEL[v]}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <JsonView data={payload} filter={keyFilter} />
                  )}
                </>
              )}
            </Panel>
          </div>
        </div>

        <Panel
          title="Data lineage"
          basis="Source → raw → transformation → metric"
          actions={
            <select value={lineageKey} onChange={(e) => setLineageKey(e.target.value)} aria-label="Metric">
              {metrics.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </select>
          }
        >
          {lineage ? <LineagePanel lineage={lineage.lineage} /> : <div className="empty">NO METRICS</div>}
        </Panel>

        <Panel title="Pipeline report" basis={`${snapshot.meta.pipeline.length} steps recorded at ingest`} flush>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Step</th><th>In</th><th>Out</th><th>Dropped</th><th>Detail</th></tr></thead>
              <tbody>
                {snapshot.meta.pipeline.map((p, i) => (
                  <tr key={i}>
                    <td className="n" style={{ color: 'var(--cyan)' }}>{p.step}</td>
                    <td className="n">{p.in_count}</td>
                    <td className="n">{p.out_count}</td>
                    <td className="n" style={{ color: p.dropped > 0 ? 'var(--warn)' : undefined }}>{p.dropped}</td>
                    <td style={{ color: 'var(--text-3)', fontSize: 12 }}>{p.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
