/**
 * 03 — LIVE / UPCOMING
 *
 * The honesty rule that matters most on this page: a countdown is rendered only
 * when the record carries a NET timestamp in the future. Everything else shows
 * COUNTDOWN DATA UNAVAILABLE with the reason. A dashboard that invents a ticking
 * clock is worse than one that admits it does not know.
 *
 * "Live" here means the snapshot's freshness, not a websocket. The page says
 * how old the data is rather than implying a stream that does not exist.
 */

import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import { NOT_PROVIDED, fmtDate, fmtDateTime } from '../lib/analytics.ts';
import { OUTCOME_LABEL, type Launch } from '../lib/types.ts';

function Countdown({ launch }: { launch: Launch }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!launch.net) {
    return (
      <div>
        <div className="ro-val na">COUNTDOWN DATA UNAVAILABLE</div>
        <div className="lbl" style={{ marginTop: 4 }}>NO NET TIMESTAMP IN RECORD</div>
      </div>
    );
  }

  const target = new Date(launch.net).getTime();
  const delta = target - now;

  if (delta <= 0) {
    return (
      <div>
        <div className="ro-val na">COUNTDOWN DATA UNAVAILABLE</div>
        <div className="lbl" style={{ marginTop: 4 }}>NET HAS PASSED — SNAPSHOT NOT REFRESHED</div>
      </div>
    );
  }

  const d = Math.floor(delta / 86_400_000);
  const h = Math.floor((delta % 86_400_000) / 3_600_000);
  const m = Math.floor((delta % 3_600_000) / 60_000);
  const s = Math.floor((delta % 60_000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div>
      <div className="ro-val big accent mono">T−{d}d {pad(h)}:{pad(m)}:{pad(s)}</div>
      <div className="lbl" style={{ marginTop: 4 }}>COMPUTED FROM RECORD NET — NOT A LIVE FEED</div>
    </div>
  );
}

export default function Upcoming() {
  const { snapshot, all } = useStore();

  const upcoming = useMemo(
    () => all.filter((l) => l.upcoming).sort((a, b) => ((a.net ?? '') < (b.net ?? '') ? -1 : 1)),
    [all],
  );

  const ageHours = useMemo(() => {
    const gen = snapshot.meta.generated_at;
    if (!gen) return null;
    return (Date.now() - new Date(gen).getTime()) / 3_600_000;
  }, [snapshot.meta.generated_at]);

  const freshness =
    ageHours === null ? 'UNKNOWN'
    : ageHours < 6 ? 'FRESH'
    : ageHours < 48 ? 'AGEING'
    : 'STALE';

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">03 — Live / Upcoming</span>
          <h1 className="view-title">Live / Upcoming</h1>
          <p className="view-sub">
            Scheduled launches held in the current snapshot. This page reads the cache; it does not
            poll. Re-run the ingest CLI to refresh it.
          </p>
        </div>
        <div className="row">
          <span className={`badge ${freshness === 'FRESH' ? 'b-ok' : freshness === 'AGEING' ? 'b-warn' : 'b-fail'}`}>
            SNAPSHOT {freshness}
          </span>
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-3)' }}>
            {ageHours === null ? NOT_PROVIDED : `${ageHours.toFixed(1)}h old`}
          </span>
        </div>
      </div>

      <div className="stack">
        {upcoming.length === 0 ? (
          <Panel title="No upcoming launches in snapshot">
            <p style={{ margin: 0, color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '72ch' }}>
              Every launch held in this snapshot has a NET in the past. That is a statement about the
              cache, not about the launch manifest — nothing is inferred about what may be scheduled.
            </p>
            <pre className="json" style={{ marginTop: 12 }}>npm run ingest -- --days 120</pre>
          </Panel>
        ) : (
          <>
            <Panel title={`Next launch — ${upcoming[0]!.name}`} basis="Earliest NET in snapshot">
              <div className="grid-3">
                <div><span className="lbl">Countdown</span><Countdown launch={upcoming[0]!} /></div>
                <div>
                  <span className="lbl">NET (UTC)</span>
                  <div className="ro-val">{fmtDateTime(upcoming[0]!.net)}</div>
                </div>
                <div>
                  <span className="lbl">Vehicle</span>
                  <div className="ro-val">{upcoming[0]!.rocket_name ?? NOT_PROVIDED}</div>
                </div>
                <div>
                  <span className="lbl">Launch site</span>
                  <div className="ro-val">{upcoming[0]!.launchpad_name ?? NOT_PROVIDED}</div>
                </div>
                <div>
                  <span className="lbl">Orbit</span>
                  <div className="ro-val">{upcoming[0]!.orbit ?? NOT_PROVIDED}</div>
                </div>
                <div>
                  <span className="lbl">Status</span>
                  <div className="ro-val">{OUTCOME_LABEL[upcoming[0]!.outcome]}</div>
                </div>
              </div>
            </Panel>

            <Panel title="Manifest" basis={`${upcoming.length} scheduled`} flush>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>NET</th><th>Mission</th><th>Vehicle</th><th>Site</th><th>Orbit</th><th>Status</th></tr></thead>
                  <tbody>
                    {upcoming.map((l) => (
                      <tr key={l.id}>
                        <td className="n">{fmtDate(l.net)}</td>
                        <td>{l.name}</td>
                        <td>{l.rocket_name ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                        <td>{l.launchpad_name ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                        <td>{l.orbit ?? <span className="na">{NOT_PROVIDED}</span>}</td>
                        <td><span className="badge b-info">{OUTCOME_LABEL[l.outcome]}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </>
        )}
      </div>
    </div>
  );
}
