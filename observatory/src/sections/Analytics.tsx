/**
 * 08 — MISSION ANALYTICS
 *
 * Every chart here states the row count it was built from and keeps its value
 * axis anchored at zero. Controls narrow the same filtered set the rest of the
 * application uses, so a figure on this page and the same figure in the Launch
 * Database can never disagree.
 */

import { useMemo } from 'react';
import { Columns, HBars, LineChart, Proportion, CHART_COLORS } from '../components/charts.tsx';
import { Panel } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import {
  NOT_PROVIDED, boosterProfiles, byMonth, byYear, distinct, fmtNum, rankBy,
} from '../lib/analytics.ts';

export default function Analytics() {
  const store = useStore();
  const { snapshot, launches, all, filters, setFilter, resetFilters, activeFilterCount } = store;

  const years = useMemo(() => byYear(launches), [launches]);
  const months = useMemo(() => byMonth(launches), [launches]);
  const byRocket = useMemo(() => rankBy(launches, (l) => l.rocket_name), [launches]);
  const byPad = useMemo(() => rankBy(launches, (l) => l.launchpad_name), [launches]);
  const byOrbit = useMemo(() => rankBy(launches, (l) => l.orbit), [launches]);
  const profiles = useMemo(() => boosterProfiles(snapshot, launches), [snapshot, launches]);

  const rocketNames = useMemo(() => distinct(all, (l) => l.rocket_name), [all]);
  const padNames = useMemo(() => distinct(all, (l) => l.launchpad_name), [all]);
  const rocketIdBy = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of all) if (l.rocket_name && l.rocket_id) m.set(l.rocket_name, l.rocket_id);
    return m;
  }, [all]);
  const padIdBy = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of all) if (l.launchpad_name && l.launchpad_id) m.set(l.launchpad_name, l.launchpad_id);
    return m;
  }, [all]);

  /** Success rate per year, over resolved launches only. */
  const rateByYear = useMemo(
    () => years.map((y) => {
      const resolved = y.success + y.failure;
      return {
        key: y.key,
        label: y.label,
        value: resolved ? (y.success / resolved) * 100 : 0,
        note: resolved ? `${y.success}/${resolved} resolved — ${((y.success / resolved) * 100).toFixed(1)}%` : 'no resolved launches',
      };
    }),
    [years],
  );

  const cumulative = useMemo(() => {
    let run = 0;
    return months.map((m) => ({ key: m.key, label: m.label.slice(2), value: (run += m.total) }));
  }, [months]);

  const reuseDist = useMemo(() => {
    const buckets = new Map<number, number>();
    for (const p of profiles) buckets.set(p.flight_count, (buckets.get(p.flight_count) ?? 0) + 1);
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([flights, count]) => ({
        key: String(flights), label: `${flights}×`, value: count,
        note: `${count} cores flew ${flights} time${flights === 1 ? '' : 's'} in window`,
      }));
  }, [profiles]);

  const turnarounds = useMemo(() => {
    const all2 = profiles.flatMap((p) => p.turnarounds);
    if (all2.length === 0) return null;
    const sorted = [...all2].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? 0;
    return {
      n: all2.length,
      median,
      min: sorted[0] ?? 0,
      max: sorted[sorted.length - 1] ?? 0,
      mean: all2.reduce((s, d) => s + d, 0) / all2.length,
    };
  }, [profiles]);

  const landing = useMemo(() => {
    const c = (k: string) => launches.filter((l) => l.landing_outcome === k).length;
    return [
      { key: 'ok', label: 'RECOVERED', value: c('success'), color: CHART_COLORS.ok },
      { key: 'no', label: 'LOST', value: c('failure'), color: CHART_COLORS.fail },
      { key: 'exp', label: 'NOT ATTEMPTED', value: c('not_attempted'), color: CHART_COLORS.mute },
      { key: 'unk', label: 'UNKNOWN', value: c('unknown'), color: '#26313f' },
    ];
  }, [launches]);

  const basis = `Built from ${launches.length} launches`;

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">08 — Mission Analytics</span>
          <h1 className="view-title">Mission Analytics</h1>
          <p className="view-sub">
            All charts derive from the same filtered set of {launches.length} launches.
            Value axes start at zero; every panel names the rows behind it.
          </p>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={resetFilters} disabled={activeFilterCount === 0}>
            RESET {activeFilterCount > 0 && `· ${activeFilterCount}`}
          </button>
        </div>
      </div>

      <div className="stack">
        <div className="filters">
          <div className="fld">
            <label className="lbl" htmlFor="a-rocket">Vehicle</label>
            <select id="a-rocket" data-filter value={filters.rocketId} onChange={(e) => setFilter('rocketId', e.target.value)}>
              <option value="">All vehicles</option>
              {rocketNames.map((r) => <option key={r} value={rocketIdBy.get(r) ?? ''}>{r}</option>)}
            </select>
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="a-pad">Launch site</label>
            <select id="a-pad" value={filters.padId} onChange={(e) => setFilter('padId', e.target.value)}>
              <option value="">All sites</option>
              {padNames.map((p) => <option key={p} value={padIdBy.get(p) ?? ''}>{p}</option>)}
            </select>
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="a-outcome">Outcome</label>
            <select id="a-outcome" value={filters.outcome} onChange={(e) => setFilter('outcome', e.target.value)}>
              <option value="">All outcomes</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="partial_failure">Partial failure</option>
            </select>
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="a-from">From</label>
            <input id="a-from" type="date" value={filters.from} onChange={(e) => setFilter('from', e.target.value)} />
          </div>
          <div className="fld">
            <label className="lbl" htmlFor="a-to">To</label>
            <input id="a-to" type="date" value={filters.to} onChange={(e) => setFilter('to', e.target.value)} />
          </div>
        </div>

        <div className="grid-2">
          <Panel title="Launch cadence by year" basis={basis}>
            <Columns data={years.map((y) => ({
              key: y.key, label: y.label, value: y.total,
              note: `${y.total} launches · ${y.success} successful · ${y.landings} landings`,
            }))} unit="launches" xTitle="Year" />
          </Panel>

          <Panel title="Success rate by year" basis="Resolved launches only — scheduled and unknown excluded">
            <Columns data={rateByYear.map((r) => ({ ...r, color: CHART_COLORS.ok }))} unit="%" xTitle="Year" />
          </Panel>
        </div>

        <Panel title="Cumulative launches" basis={`${months.length} months in range`}>
          <LineChart data={cumulative} unit="launches" height={250} xTitle="Month" />
        </Panel>

        <div className="grid-2">
          <Panel title="Vehicle usage" basis={basis}>
            <HBars data={byRocket.map((r) => ({
              key: r.key, label: r.label, value: r.count,
              note: `${r.count} launches · ${r.share.toFixed(1)}% of window · ${r.success} successful`,
            }))} unit="launches" />
          </Panel>

          <Panel title="Launchpad utilisation" basis={basis}>
            <HBars data={byPad.map((p) => ({
              key: p.key, label: p.label, value: p.count,
              note: `${p.count} launches · ${p.share.toFixed(1)}% of window`,
            }))} unit="launches" labelWidth={140} />
          </Panel>
        </div>

        <div className="grid-2">
          <Panel title="Orbit distribution" basis={`${byOrbit.length} distinct orbits`}>
            <HBars data={byOrbit.slice(0, 10).map((o) => ({
              key: o.key, label: o.label, value: o.count,
              note: `${o.count} missions · ${o.share.toFixed(1)}%`,
            }))} unit="missions" labelWidth={180} />
          </Panel>

          <Panel title="Booster reuse frequency" basis={`${profiles.length} cores with at least one flight in window`}>
            {reuseDist.length === 0 ? <div className="empty">NO CORE DATA IN RANGE</div> : (
              <Columns data={reuseDist.map((r) => ({ ...r, color: CHART_COLORS.cyan }))} unit="cores" xTitle="Flights per core" />
            )}
          </Panel>
        </div>

        <div className="grid-2">
          <Panel title="Landing outcomes" basis={basis}>
            <Proportion parts={landing} total={launches.length} />
          </Panel>

          <Panel title="Time between flights" basis={turnarounds ? `${turnarounds.n} intervals across ${profiles.length} cores` : 'No intervals in range'}>
            {!turnarounds ? (
              <div className="empty">A CORE NEEDS TWO FLIGHTS IN RANGE TO YIELD AN INTERVAL</div>
            ) : (
              <>
                <div className="metrics" style={{ border: 0 }}>
                  {[
                    ['MEDIAN', `${fmtNum(turnarounds.median, 0)} d`],
                    ['MEAN', `${fmtNum(turnarounds.mean, 0)} d`],
                    ['FASTEST', `${fmtNum(turnarounds.min, 0)} d`],
                    ['LONGEST', `${fmtNum(turnarounds.max, 0)} d`],
                  ].map(([k, v]) => (
                    <div className="metric" key={k}>
                      <span className="lbl">{k}</span>
                      <span className="metric-val small">{v}</span>
                    </div>
                  ))}
                </div>
                <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
                  Median is reported alongside the mean because a single long stand-down skews the mean
                  badly at this sample size. Both come from the same {turnarounds.n} intervals.
                </p>
              </>
            )}
          </Panel>
        </div>

        <Panel title="Monthly detail" basis={`${months.length} months`} flush>
          <div className="tbl-wrap" style={{ maxHeight: 340 }}>
            <table>
              <thead>
                <tr><th>Month</th><th>Launches</th><th>Successful</th><th>Failed</th><th>Landings</th><th>Success rate</th></tr>
              </thead>
              <tbody>
                {[...months].reverse().map((m) => {
                  const resolved = m.success + m.failure;
                  return (
                    <tr key={m.key}>
                      <td className="n">{m.label}</td>
                      <td className="n">{m.total}</td>
                      <td className="n">{m.success}</td>
                      <td className="n">{m.failure}</td>
                      <td className="n">{m.landings}</td>
                      <td className="n">
                        {resolved ? `${((m.success / resolved) * 100).toFixed(0)}%` : <span className="na">{NOT_PROVIDED}</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}
