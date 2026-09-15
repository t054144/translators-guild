/**
 * 06 — PAYLOAD INTELLIGENCE
 *
 * A node-link view of the relationship the data actually encodes:
 *   VEHICLE → MISSION → PAYLOAD → ORBIT
 * Clicking any node filters the graph to what connects to it, so the structure
 * is explorable rather than decorative.
 *
 * Stated plainly on the page: Launch Library 2 has no per-payload collection.
 * A payload record here is a projection of the mission, and payload mass is
 * absent for nearly every row. That is a limitation of the source, and hiding
 * it behind an empty column would be the dishonest option.
 */

import { useMemo, useState } from 'react';
import { DataTable, Panel, type Column } from '../components/ui.tsx';
import { HBars } from '../components/charts.tsx';
import { useTip } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import { NOT_PROVIDED, fmtDate, fmtMass, rankBy } from '../lib/analytics.ts';
import type { Payload } from '../lib/types.ts';

type Layer = 'vehicle' | 'mission' | 'payload' | 'orbit';

interface Node {
  id: string;
  label: string;
  layer: Layer;
  x: number;
  y: number;
  count: number;
}

const LAYERS: { key: Layer; label: string; x: number }[] = [
  { key: 'vehicle', label: 'VEHICLE', x: 0.08 },
  { key: 'mission', label: 'MISSION', x: 0.36 },
  { key: 'payload', label: 'PAYLOAD', x: 0.64 },
  { key: 'orbit', label: 'ORBIT', x: 0.92 },
];

export default function PayloadIntel() {
  const { snapshot, launches } = useStore();
  const tip = useTip();
  const [focus, setFocus] = useState<string | null>(null);

  const payloads = useMemo(() => snapshot.payloads.map((p) => p.normalized_payload), [snapshot.payloads]);
  const launchById = useMemo(() => new Map(launches.map((l) => [l.id, l])), [launches]);

  const visible = useMemo(
    () => payloads.filter((p) => p.launch_id && launchById.has(p.launch_id)),
    [payloads, launchById],
  );

  const withMass = visible.filter((p) => p.mass_kg !== null).length;

  /* ── graph, capped so the layout stays readable ── */
  const W = 1000;
  const H = 440;

  const graph = useMemo(() => {
    const sample = visible.slice(-14);
    const nodes: Node[] = [];
    const links: { from: string; to: string }[] = [];

    const add = (layer: Layer, id: string, label: string) => {
      const key = `${layer}:${id}`;
      const found = nodes.find((n) => n.id === key);
      if (found) { found.count += 1; return key; }
      nodes.push({ id: key, label, layer, x: 0, y: 0, count: 1 });
      return key;
    };

    for (const p of sample) {
      const l = launchById.get(p.launch_id!);
      if (!l) continue;
      const v = add('vehicle', l.rocket_name ?? 'unknown', l.rocket_name ?? 'NOT PROVIDED');
      const m = add('mission', l.id, l.name);
      const pay = add('payload', p.id, p.name);
      const o = add('orbit', l.orbit ?? 'unknown', l.orbit ?? 'NOT PROVIDED');
      links.push({ from: v, to: m }, { from: m, to: pay }, { from: pay, to: o });
    }

    for (const layer of LAYERS) {
      const inLayer = nodes.filter((n) => n.layer === layer.key);
      inLayer.forEach((n, i) => {
        n.x = layer.x * W;
        n.y = ((i + 1) / (inLayer.length + 1)) * H;
      });
    }
    return { nodes, links };
  }, [visible, launchById]);

  const connected = useMemo(() => {
    if (!focus) return null;
    const keep = new Set<string>([focus]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const l of graph.links) {
        if (keep.has(l.from) && !keep.has(l.to)) { keep.add(l.to); grew = true; }
        if (keep.has(l.to) && !keep.has(l.from)) { keep.add(l.from); grew = true; }
      }
    }
    return keep;
  }, [focus, graph.links]);

  const byType = useMemo(
    () => rankBy(launches, (l) => {
      const p = visible.find((x) => x.launch_id === l.id);
      return p?.type ?? null;
    }),
    [launches, visible],
  );

  const columns = useMemo<Column<Payload>[]>(() => [
    { key: 'name', head: 'Payload', get: (p) => p.name },
    { key: 'type', head: 'Type', get: (p) => p.type },
    { key: 'mass_kg', head: 'Mass', num: true, get: (p) => p.mass_kg,
      cell: (p) => p.mass_kg === null ? <span className="na">{NOT_PROVIDED}</span> : <span className="mono">{fmtMass(p.mass_kg)}</span> },
    { key: 'orbit', head: 'Orbit', get: (p) => p.orbit },
    { key: 'customer', head: 'Customer', get: (p) => p.customers[0] ?? null },
    { key: 'launch', head: 'Mission', get: (p) => (p.launch_id ? launchById.get(p.launch_id)?.name ?? null : null) },
    { key: 'date', head: 'Date', num: true,
      get: (p) => (p.launch_id ? launchById.get(p.launch_id)?.net ?? null : null),
      cell: (p) => <span className="mono">{fmtDate(p.launch_id ? launchById.get(p.launch_id)?.net ?? null : null)}</span> },
  ], [launchById]);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">06 — Payload Intelligence</span>
          <h1 className="view-title">Payload Intelligence</h1>
          <p className="view-sub">
            {visible.length} payload records across {launches.length} launches.
            Click any node to isolate what connects to it.
          </p>
        </div>
      </div>

      <div className="stack">
        <div className="prov-banner">
          <strong>Source limitation</strong>
          <span>
            Launch Library 2 exposes no per-payload collection. These records are projected from each
            mission, and payload mass is present for {withMass} of {visible.length} rows — the rest read
            NOT PROVIDED rather than 0.
          </span>
        </div>

        <Panel title="Relationship graph" basis={`Most recent ${Math.min(visible.length, 14)} missions${focus ? ' · isolated' : ''}`}
               actions={focus ? <button className="btn" type="button" onClick={() => setFocus(null)}>CLEAR ISOLATION</button> : undefined}>
          <div className="chart">
            <svg width={W} height={H + 40} viewBox={`0 0 ${W} ${H + 40}`} role="img" aria-label="Payload relationship graph">
              {LAYERS.map((l) => (
                <text key={l.key} x={l.x * W} y={14} className="ax-title" textAnchor="middle">{l.label}</text>
              ))}

              {graph.links.map((lk, i) => {
                const a = graph.nodes.find((n) => n.id === lk.from);
                const b = graph.nodes.find((n) => n.id === lk.to);
                if (!a || !b) return null;
                const dim = connected ? !(connected.has(a.id) && connected.has(b.id)) : false;
                const mx = (a.x + b.x) / 2;
                return (
                  <path
                    key={i}
                    d={`M${a.x + 5},${a.y + 24} C${mx},${a.y + 24} ${mx},${b.y + 24} ${b.x - 5},${b.y + 24}`}
                    fill="none"
                    stroke={dim ? '#1a222d' : '#2f6b78'}
                    strokeWidth="1"
                    opacity={dim ? 0.35 : 0.85}
                  />
                );
              })}

              {graph.nodes.map((n) => {
                const dim = connected ? !connected.has(n.id) : false;
                const isFocus = focus === n.id;
                return (
                  <g key={n.id}
                     style={{ cursor: 'pointer' }}
                     onClick={() => setFocus(isFocus ? null : n.id)}
                     onMouseEnter={(e) => tip.show(e, n.label, `${n.layer.toUpperCase()} · ${n.count} link${n.count === 1 ? '' : 's'}`)}
                     onMouseMove={tip.move}
                     onMouseLeave={tip.hide}>
                    <circle
                      cx={n.x} cy={n.y + 24} r={isFocus ? 7 : 5}
                      fill={dim ? '#1a222d' : isFocus ? '#4dd4e8' : '#0a0e14'}
                      stroke={dim ? '#26313f' : '#4dd4e8'}
                      strokeWidth="1.4"
                    />
                    <text
                      x={n.layer === 'orbit' ? n.x - 12 : n.x + 12}
                      y={n.y + 27.5}
                      textAnchor={n.layer === 'orbit' ? 'end' : 'start'}
                      className="lbl-txt"
                      style={{ fill: dim ? '#3d4856' : isFocus ? '#4dd4e8' : '#8d9bad', fontSize: 10.5 }}
                    >
                      {n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </Panel>

        <div className="grid-2">
          <Panel title="Mission type distribution" basis={`Built from ${launches.length} launches`}>
            {byType.length === 0 ? <div className="empty">NO MISSION TYPE IN SOURCE RECORDS</div> : (
              <HBars data={byType.map((t) => ({
                key: t.key, label: t.label, value: t.count,
                note: `${t.count} missions · ${t.share.toFixed(1)}%`,
              }))} unit="missions" labelWidth={160} />
            )}
          </Panel>

          <Panel title="Mass coverage" basis={`${withMass} of ${visible.length} records carry a mass`}>
            <div className="metrics" style={{ border: 0 }}>
              <div className="metric">
                <span className="lbl">With mass</span>
                <span className="metric-val accent">{withMass}</span>
              </div>
              <div className="metric">
                <span className="lbl">Mass not provided</span>
                <span className="metric-val">{visible.length - withMass}</span>
              </div>
              <div className="metric">
                <span className="lbl">Coverage</span>
                <span className="metric-val small">
                  {visible.length ? `${((withMass / visible.length) * 100).toFixed(1)}%` : NOT_PROVIDED}
                </span>
              </div>
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
              No aggregate mass figure is published on this page. Summing a column that is mostly absent
              would produce a confident number describing a small, unrepresentative subset.
            </p>
          </Panel>
        </div>

        <Panel title="Payload records" basis={`${visible.length} records`} flush>
          <DataTable rows={visible} columns={columns} initialSort={['date', 'desc']} rowId={(p) => p.id} />
        </Panel>
      </div>
    </div>
  );
}
