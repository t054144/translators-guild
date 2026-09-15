/**
 * 11 — DEBRIEF
 *
 * The account of what the data says, and of how it came to be here.
 *
 * The findings are generated, not written. Every figure in the prose is computed
 * from the rows currently in view, so narrowing a filter rewrites the sentences
 * rather than leaving a confident paragraph standing over data that no longer
 * supports it. Where the rows cannot support a claim, the sentence is omitted
 * instead of hedged.
 *
 * The provenance record below it is fixed text, because it describes events
 * rather than measurements — which source was used, which one died, and which
 * judgements were made at the points where the data ran out. Those are the parts
 * a reader has to take on trust, so they are stated plainly and kept separate
 * from the generated findings above.
 */

import { useMemo } from 'react';
import { Panel } from '../components/ui.tsx';
import { useStore } from '../lib/store.tsx';
import { absences, dataKind, narrative, fmtDate, type Seg } from '../lib/analytics.ts';

function Prose({ body }: { body: Seg[] }) {
  return (
    <p className="nar-body">
      {body.map((seg, i) =>
        typeof seg === 'string'
          ? <span key={i}>{seg}</span>
          : <span className="nar-n" key={i}>{seg.n}</span>,
      )}
    </p>
  );
}

export default function Debrief() {
  const { snapshot, launches, all, activeFilterCount } = useStore();

  const beats = useMemo(() => narrative(snapshot, launches), [snapshot, launches]);
  const gaps = useMemo(() => absences(snapshot, launches), [snapshot, launches]);
  const live = snapshot.meta.is_live;
  const kind = dataKind(snapshot.meta);

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <span className="eyebrow">11 — Debrief</span>
          <h1 className="view-title">Debrief</h1>
          <p className="view-sub">
            What the record shows, what it cannot show, and how it got here.
            The findings are generated from the {launches.length.toLocaleString()} launches currently
            in view — change a filter and they rewrite themselves.
          </p>
        </div>
        <span className={`badge ${kind === 'fixture' ? 'b-warn' : kind === 'archive' ? 'b-info' : 'b-ok'}`}>
          GENERATED FROM {kind.toUpperCase()} DATA
        </span>
      </div>

      <div className="stack">
        {!live && (
          <div className="prov-banner">
            <strong>Read this first</strong>
            <span>
              These findings are computed correctly, but from synthetic records. The reasoning is
              real; the conclusions are not about real launches until the ingest CLI has run.
            </span>
          </div>
        )}

        <section className="narrative">
          {beats.map((b, i) => (
            <article className="nar-beat" key={b.id}>
              <div className="nar-mark">
                <span className="nar-idx">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="nar-text">
                <span className="lbl">{b.kicker}</span>
                <h2 className="nar-head">{b.heading}</h2>
                <Prose body={b.body} />
              </div>
            </article>
          ))}
        </section>

        <Panel title="How this account is written" basis="Method, not disclaimer">
          <p className="note">
            Every number in the paragraphs above is read from the filtered rows at the moment the
            page renders. None of it is typed into the prose. That is deliberate: a written summary
            and the data beneath it drift apart the moment either one changes, and the summary is
            always the one that stops being true first.
          </p>
          <p className="note">
            It also means the account can be checked. Narrow the date range or select a single
            vehicle and the sentences change with it — including the paragraph that says this
            selection is too small to support a claim, which appears when it is.
          </p>
          {activeFilterCount > 0 && (
            <p className="note flag">
              {activeFilterCount} filter{activeFilterCount === 1 ? ' is' : 's are'} active.
              These findings describe {launches.length.toLocaleString()} of{' '}
              {all.length.toLocaleString()} records, not the whole dataset.
            </p>
          )}
        </Panel>

        <Panel title="What is deliberately absent" basis="Counted, not characterised" flush>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr><th>Field</th><th>Not provided</th><th>Of</th><th>Coverage</th><th>Why it is left empty</th></tr>
              </thead>
              <tbody>
                {gaps.map((g) => {
                  const cov = g.total ? ((g.total - g.missing) / g.total) * 100 : 0;
                  return (
                    <tr key={g.label}>
                      <td>{g.label}</td>
                      <td className="n" style={{ color: g.missing > 0 ? 'var(--warn)' : 'var(--text-3)' }}>
                        {g.missing.toLocaleString()}
                      </td>
                      <td className="n">{g.total.toLocaleString()}</td>
                      <td className="n">{g.total ? `${cov.toFixed(0)}%` : '—'}</td>
                      <td style={{ color: 'var(--text-3)', fontSize: 12, lineHeight: 1.55, maxWidth: 460 }}>
                        {g.note}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Provenance record" basis="Events, not measurements">
          <div className="lineage">
            <div className="lin-step">
              <span className="lin-stage">SOURCE</span>
              <div>
                <div className="lin-label">The obvious source was dead</div>
                <div className="lin-detail">
                  The r/SpaceX API is the source nearly every SpaceX project is built on. It was
                  archived on 6 June 2026 and its origin now returns TLS 525 — and it had already
                  stopped adding launches in 2024, so projects that still load it have been showing
                  frozen data without knowing. It remains registered here as a declared-dead
                  connector so System Status can explain it rather than fail silently.
                </div>
              </div>
            </div>

            <div className="lin-step">
              <span className="lin-stage">DESIGN</span>
              <div>
                <div className="lin-label">So the sources were made replaceable</div>
                <div className="lin-detail">
                  Data arrives through a connector boundary rather than a direct call from the
                  interface. Adding or swapping a source is one file. That was a reaction to
                  watching what happens to an application wired to a single upstream.
                </div>
              </div>
            </div>

            <div className="lin-step">
              <span className="lin-stage">JUDGEMENT</span>
              <div>
                <div className="lin-label">Gaps were left as gaps</div>
                <div className="lin-detail">
                  Payload mass, vehicle dimensions and in-flight events are missing or absent from
                  the source for most records. All of them could have been filled in from widely
                  published figures and almost nobody would have checked. They read NOT PROVIDED
                  instead, and the table above counts exactly how often.
                </div>
              </div>
            </div>

            <div className="lin-step">
              <span className="lin-stage">JUDGEMENT</span>
              <div>
                <div className="lin-label">Unresolved outcomes were kept out of the denominator</div>
                <div className="lin-detail">
                  Success rate divides by launches with a known result, not by all launches.
                  Counting scheduled and unknown launches as successes would raise every figure on
                  the page; counting them as failures would lower every figure. Excluding them, and
                  saying so beside the number, is the only version that survives being checked.
                </div>
              </div>
            </div>

            <div className="lin-step">
              <span className="lin-stage">CURRENT</span>
              <div>
                <div className="lin-label">
                  Running on {kind} records
                </div>
                <div className="lin-detail">
                  {snapshot.meta.provenance_note}
                  {snapshot.meta.generated_at && ` Snapshot generated ${fmtDate(snapshot.meta.generated_at)}.`}
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
