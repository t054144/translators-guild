/**
 * 07 — LAUNCH SITE INTELLIGENCE
 *
 * The plot is a graticule, not a map. Pads sit at their true latitude and
 * longitude on an equirectangular grid, but there are no coastlines, because
 * the dataset contains none and drawing invented ones would make the graphic
 * look like authority it does not have. Latitude bands that matter to launch
 * — the equator, and the inclination each site can reach cheaply — are marked,
 * since those come from the coordinates themselves.
 */

import { useMemo, useState } from 'react';
import { Panel, useTip } from '../components/ui.tsx';
import { HBars } from '../components/charts.tsx';
import { useStore } from '../lib/store.tsx';
import { NOT_PROVIDED, fmtDate, rankBy } from '../lib/analytics.ts';
import { OUTCOME_LABEL } from '../lib/types.ts';

const W = 980;
const H = 420;

export default function LaunchSites() {
  const { snapshot, launches } = useStore();
  const tip = useTip();
  const [sel, setSel] = useState<string | null>(null);

  const pads = useMemo(() => snapshot.launchpads.map((p) => p.normalized_payload), [snapshot.launchpads]);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; success: number; last: string | null; rockets: Set<string> }>();
    for (const l of launches) {
      if (!l.launchpad_id) continue;
      if (!m.has(l.launchpad_id)) m.set(l.launchpad_id, { count: 0, success: 0, last: null, rockets: new Set() });
      const e = m.get(l.launchpad_id)!;
      e.count += 1;
      if (l.outcome === 'success') e.success += 1;
      if (l.rocket_name) e.rockets.add(l.rocket_name);
      if (l.net && (!e.last || l.net > e.last)) e.last = l.net;
    }
    return m;
  }, [launches]);

  const plotted = useMemo(
    () => pads.filter((p) => p.latitude !== null && p.longitude !== null),
    [pads],
  );

  const current = useMemo(() => pads.find((p) => p.id === sel) ?? null, [pads, sel]);
  const currentLaunches = useMemo(
    () => (current ? launches.filter((l) => l.launchpad_id === current.id) : []),
    [launches, current],
  );

  const x = (lon: number) => ((lon + 180) / 360) * W;
  const y = (lat: number) => ((90 - lat) / 180) * H;

  const usage = useMemo(() => rankBy(launches, (l) => l.launchpad_name), [launches]);
  const maxCount = Math.max(...[...stats.values()].map((s) => s.count), 1);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">07 — Launch Site Intelligence</span>
          <h1 className="view-title">Launch Sites</h1>
          <p className="view-sub">
            {pads.length} pad records, {plotted.length} with coordinates.
            Positions are plotted on a coordinate graticule — this is not a map and has no coastlines.
          </p>
        </div>
      </div>

      <div className="stack">
        <Panel title="Pad coordinate plot" basis="Equirectangular graticule · WGS84 degrees from source records">
          <div className="chart">
            <svg width={W} height={H + 26} viewBox={`0 0 ${W} ${H + 26}`} role="img" aria-label="Launch pad coordinate plot">
              {/* graticule */}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => (
                <g key={`lon${lon}`}>
                  <line x1={x(lon)} y1={0} x2={x(lon)} y2={H} className={lon === 0 ? 'ax-zero' : 'ax-line'} />
                  <text x={x(lon)} y={H + 14} className="ax-txt" textAnchor="middle">{lon}°</text>
                </g>
              ))}
              {[-60, -30, 0, 30, 60].map((lat) => (
                <g key={`lat${lat}`}>
                  <line x1={0} y1={y(lat)} x2={W} y2={y(lat)}
                        className={lat === 0 ? 'ax-zero' : 'ax-line'}
                        strokeDasharray={lat === 0 ? undefined : '3 4'} />
                  <text x={4} y={y(lat) - 4} className="ax-txt">{lat}°</text>
                </g>
              ))}
              <text x={W - 4} y={y(0) - 5} className="ax-title" textAnchor="end">EQUATOR — 0° INCLINATION FLOOR</text>

              {/* pads */}
              {plotted.map((p) => {
                const s = stats.get(p.id);
                const n = s?.count ?? 0;
                const r = 4 + (n / maxCount) * 13;
                const isSel = sel === p.id;
                return (
                  <g key={p.id} style={{ cursor: 'pointer' }}
                     onClick={() => setSel(isSel ? null : p.id)}
                     onMouseEnter={(e) => tip.show(e, p.name, `${n} launches · ${p.latitude!.toFixed(3)}°, ${p.longitude!.toFixed(3)}°`)}
                     onMouseMove={tip.move}
                     onMouseLeave={tip.hide}>
                    {/* inclination band reachable from this latitude */}
                    {isSel && (
                      <line x1={0} y1={y(p.latitude!)} x2={W} y2={y(p.latitude!)}
                            stroke="#4dd4e8" strokeWidth="1" strokeDasharray="2 4" opacity="0.6" />
                    )}
                    <circle cx={x(p.longitude!)} cy={y(p.latitude!)} r={r}
                            fill="rgba(77,212,232,0.14)" stroke="#4dd4e8" strokeWidth={isSel ? 2 : 1} />
                    <circle cx={x(p.longitude!)} cy={y(p.latitude!)} r="2" fill="#4dd4e8" />
                    <text x={x(p.longitude!) + r + 5} y={y(p.latitude!) + 3.5}
                          className="lbl-txt" style={{ fill: isSel ? '#4dd4e8' : '#8d9bad', fontSize: 10.5 }}>
                      {p.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
            Marker area scales with launch count in the current selection. Selecting a pad draws its
            latitude line — the minimum orbital inclination reachable without a costly plane change.
          </p>
        </Panel>

        <div className="grid-2">
          <Panel title={current ? `Site — ${current.name}` : 'Site detail'} basis={current ? `${currentLaunches.length} launches` : 'Select a pad'}>
            {!current ? (
              <div className="empty">SELECT A PAD ON THE PLOT OR IN THE TABLE</div>
            ) : (
              <>
                <div className="layer-grid" style={{ margin: -14, marginBottom: 14 }}>
                  {([
                    ['NAME', current.name],
                    ['LOCALITY', current.locality],
                    ['COUNTRY', current.country],
                    ['LATITUDE', current.latitude === null ? null : `${current.latitude.toFixed(4)}°`],
                    ['LONGITUDE', current.longitude === null ? null : `${current.longitude.toFixed(4)}°`],
                    ['LAUNCHES IN WINDOW', String(currentLaunches.length)],
                    ['SUCCESSFUL', String(currentLaunches.filter((l) => l.outcome === 'success').length)],
                    ['VEHICLES', [...new Set(currentLaunches.map((l) => l.rocket_name).filter(Boolean))].join(', ') || null],
                    ['MOST RECENT', fmtDate(stats.get(current.id)?.last ?? null)],
                    ['SOURCE TOTAL', current.launch_attempts === null ? null : String(current.launch_attempts)],
                  ] as [string, string | null][]).map(([k, v]) => (
                    <div className="layer-cell" key={k}>
                      <span className="lbl">{k}</span>
                      <span className={v ? 'v' : 'v na'}>{v ?? NOT_PROVIDED}</span>
                    </div>
                  ))}
                </div>
                {current.launch_attempts !== null && current.launch_attempts !== currentLaunches.length && (
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                    The source reports {current.launch_attempts} total launches from this pad across all
                    operators and all time; {currentLaunches.length} fall inside this snapshot's window and
                    current filters. Both numbers are shown rather than reconciled into one.
                  </p>
                )}
              </>
            )}
          </Panel>

          <Panel title="Pad utilisation" basis={`Built from ${launches.length} launches`}>
            <HBars data={usage.map((u) => ({
              key: u.key, label: u.label, value: u.count,
              note: `${u.count} launches · ${u.share.toFixed(1)}% of window`,
            }))} unit="launches" labelWidth={150} />
          </Panel>
        </div>

        <Panel title="Pad records" basis={`${pads.length} records`} flush>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Pad</th><th>Locality</th><th>Lat</th><th>Lon</th><th>Launches</th><th>Successful</th><th>Most recent</th></tr>
              </thead>
              <tbody>
                {pads.map((p) => {
                  const s = stats.get(p.id);
                  return (
                    <tr key={p.id} className={sel === p.id ? 'sel' : undefined} onClick={() => setSel(p.id)}>
                      <td>{p.name}</td>
                      <td>{p.locality ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                      <td className="n">{p.latitude === null ? <span className="na">—</span> : p.latitude.toFixed(3)}</td>
                      <td className="n">{p.longitude === null ? <span className="na">—</span> : p.longitude.toFixed(3)}</td>
                      <td className="n">{s?.count ?? 0}</td>
                      <td className="n">{s?.success ?? 0}</td>
                      <td className="n">{fmtDate(s?.last ?? null)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {current && currentLaunches.length > 0 && (
          <Panel title={`Mission history — ${current.name}`} basis={`${currentLaunches.length} launches`} flush>
            <div className="tbl-wrap" style={{ maxHeight: 320 }}>
              <table>
                <thead><tr><th>Date</th><th>Mission</th><th>Vehicle</th><th>Outcome</th></tr></thead>
                <tbody>
                  {[...currentLaunches].reverse().map((l) => (
                    <tr key={l.id}>
                      <td className="n">{fmtDate(l.net)}</td>
                      <td>{l.name}</td>
                      <td>{l.rocket_name ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                      <td>
                        <span className={`badge ${l.outcome === 'success' ? 'b-ok' : l.outcome === 'failure' ? 'b-fail' : 'b-mute'}`}>
                          {OUTCOME_LABEL[l.outcome]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
