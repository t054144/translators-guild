/**
 * Charts — hand-built SVG, no plotting library.
 *
 * Shared rules, enforced here rather than left to each call site:
 *   - value axes start at zero and say so beneath the axis
 *   - ticks land on round numbers, and every tick is labelled
 *   - the drawing area reserves room for its outermost labels
 *   - colour comes from the theme tokens, so marks and type agree
 *   - hover reports the exact value, never an interpolated one
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTip } from './ui.tsx';

const C = {
  cyan: '#4dd4e8',
  ok: '#3dd68c',
  fail: '#e5484d',
  warn: '#f0a93b',
  mute: '#36414f',
};

/** Round tick steps: 1, 2, 2.5, 5, 10 × 10ⁿ. */
function ticks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 1];
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  const out: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) out.push(Math.round(v * 1000) / 1000);
  return out;
}

const nf = (n: number) => n.toLocaleString('en-US');

/** Track the rendered width so charts fill their panel and reflow on resize. */
function useWidth(fallback = 720) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? fallback;
      if (next > 0) setW(next);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return [ref, w] as const;
}

export interface Datum {
  key: string;
  label: string;
  value: number;
  color?: string;
  note?: string;
}

/* ── horizontal bars ─────────────────────────────────────────────────────── */

export function HBars({ data, unit, max: cap, labelWidth = 168 }: {
  data: Datum[]; unit: string; max?: number; labelWidth?: number;
}) {
  const [ref, W] = useWidth();
  const tip = useTip();
  if (data.length === 0) return <div className="empty">NO DATA IN RANGE</div>;

  const padL = labelWidth;
  const padR = 56;
  const padT = 8;
  const padB = 38;
  const rowH = 22;
  const gap = 6;
  const plotW = Math.max(W - padL - padR, 80);
  const H = padT + data.length * (rowH + gap) - gap + padB;
  const tk = ticks(cap ?? Math.max(...data.map((d) => d.value)));
  const top = tk[tk.length - 1] ?? 1;

  return (
    <div className="chart" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img"
           aria-label={`Bar chart, ${data.length} rows, ${unit}, axis from zero`}>
        {tk.map((t) => {
          const x = padL + (t / top) * plotW;
          return (
            <g key={t}>
              <line x1={x} y1={padT} x2={x} y2={H - padB + 4} className={t === 0 ? 'ax-zero' : 'ax-line'} />
              <text x={x} y={H - padB + 17} className="ax-txt" textAnchor="middle">{nf(t)}</text>
            </g>
          );
        })}
        <text x={padL} y={H - padB + 31} className="ax-title">{unit} — axis starts at 0</text>

        {data.map((d, i) => {
          const y = padT + i * (rowH + gap);
          const w = Math.max((d.value / top) * plotW, d.value > 0 ? 2 : 0);
          return (
            <g key={d.key}>
              <text x={padL - 10} y={y + rowH / 2 + 4} className="lbl-txt" textAnchor="end">
                {d.label.length > 24 ? `${d.label.slice(0, 23)}…` : d.label}
              </text>
              <rect
                x={padL} y={y} width={w} height={rowH} rx="1"
                fill={d.color ?? C.cyan} className="bar-r"
                onMouseEnter={(e) => tip.show(e, d.label, d.note ?? `${nf(d.value)} ${unit}`)}
                onMouseMove={tip.move}
                onMouseLeave={tip.hide}
              >
                <animate attributeName="width" from="0" to={String(w)} dur="0.55s"
                         fill="freeze" calcMode="spline" keySplines="0.22 0.7 0.28 1" keyTimes="0;1" />
              </rect>
              <text x={padL + w + 8} y={y + rowH / 2 + 4} className="val-txt">{nf(d.value)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── columns ─────────────────────────────────────────────────────────────── */

export function Columns({ data, unit, height = 260, xTitle = '' }: {
  data: Datum[]; unit: string; height?: number; xTitle?: string;
}) {
  const [ref, W] = useWidth();
  const tip = useTip();
  if (data.length === 0) return <div className="empty">NO DATA IN RANGE</div>;

  const padL = 46;
  const padR = 14;
  const padT = 16;
  const padB = 48;
  const plotW = Math.max(W - padL - padR, 80);
  const plotH = height - padT - padB;
  const tk = ticks(Math.max(...data.map((d) => d.value)));
  const top = tk[tk.length - 1] ?? 1;
  const slot = plotW / data.length;
  const bw = Math.min(slot * 0.66, 46);
  const every = Math.ceil(data.length / 14) || 1;

  return (
    <div className="chart" ref={ref}>
      <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} role="img"
           aria-label={`Column chart, ${data.length} periods, ${unit}, axis from zero`}>
        {tk.map((t) => {
          const y = padT + plotH - (t / top) * plotH;
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} className={t === 0 ? 'ax-zero' : 'ax-line'} />
              <text x={padL - 8} y={y + 3.5} className="ax-txt" textAnchor="end">{nf(t)}</text>
            </g>
          );
        })}
        <text x={padL} y={11} className="ax-title">{unit} — axis starts at 0</text>

        {data.map((d, i) => {
          const x = padL + i * slot + (slot - bw) / 2;
          const h = Math.max((d.value / top) * plotH, d.value > 0 ? 1.5 : 0);
          return (
            <g key={d.key}>
              <rect
                x={x} y={padT + plotH - h} width={bw} height={h} rx="1"
                fill={d.color ?? C.cyan} className="bar-r"
                onMouseEnter={(e) => tip.show(e, d.label, d.note ?? `${nf(d.value)} ${unit}`)}
                onMouseMove={tip.move}
                onMouseLeave={tip.hide}
              >
                <animate attributeName="height" from="0" to={String(h)} dur="0.5s" begin={`${i * 0.012}s`}
                         fill="freeze" calcMode="spline" keySplines="0.22 0.7 0.28 1" keyTimes="0;1" />
                <animate attributeName="y" from={String(padT + plotH)} to={String(padT + plotH - h)} dur="0.5s"
                         begin={`${i * 0.012}s`} fill="freeze" calcMode="spline" keySplines="0.22 0.7 0.28 1" keyTimes="0;1" />
              </rect>
              {i % every === 0 && (
                <text x={x + bw / 2} y={height - padB + 16} className="ax-txt" textAnchor="middle">{d.label}</text>
              )}
            </g>
          );
        })}
        {xTitle && <text x={W - padR} y={height - padB + 32} className="ax-title" textAnchor="end">{xTitle}</text>}
      </svg>
    </div>
  );
}

/* ── line, drawn progressively ───────────────────────────────────────────── */

export function LineChart({ data, unit, height = 240, xTitle = '' }: {
  data: Datum[]; unit: string; height?: number; xTitle?: string;
}) {
  const [ref, W] = useWidth();
  const tip = useTip();
  const pathRef = useRef<SVGPathElement | null>(null);

  const padL = 46;
  const padR = 16;
  const padT = 16;
  const padB = 44;
  const plotW = Math.max(W - padL - padR, 80);
  const plotH = height - padT - padB;
  const tk = useMemo(() => ticks(Math.max(...data.map((d) => d.value), 1)), [data]);
  const top = tk[tk.length - 1] ?? 1;

  const px = (i: number) => padL + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2);
  const py = (v: number) => padT + plotH - (v / top) * plotH;
  const d = data.map((pt, i) => `${px(i)},${py(pt.value)}`).join('L');

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const len = el.getTotalLength();
    el.style.transition = 'none';
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    // Force a reflow so the transition starts from the dashed state.
    void el.getBoundingClientRect();
    el.style.transition = 'stroke-dashoffset 0.85s cubic-bezier(0.22,0.7,0.28,1)';
    el.style.strokeDashoffset = '0';
  }, [d]);

  if (data.length < 2) return <div className="empty">NEEDS AT LEAST TWO POINTS IN RANGE</div>;
  const every = Math.ceil(data.length / 10) || 1;

  return (
    <div className="chart" ref={ref}>
      <svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} role="img"
           aria-label={`Line chart of ${unit}, axis from zero`}>
        {tk.map((t) => {
          const y = py(t);
          return (
            <g key={t}>
              <line x1={padL} y1={y} x2={W - padR} y2={y} className={t === 0 ? 'ax-zero' : 'ax-line'} />
              <text x={padL - 8} y={y + 3.5} className="ax-txt" textAnchor="end">{nf(t)}</text>
            </g>
          );
        })}
        <text x={padL} y={11} className="ax-title">{unit} — axis starts at 0</text>

        <path d={`M${padL},${py(0)}L${d}L${px(data.length - 1)},${py(0)}Z`} fill="rgba(77,212,232,0.09)" />
        <path ref={pathRef} d={`M${d}`} fill="none" stroke={C.cyan} strokeWidth="1.6" strokeLinejoin="round" />

        {data.map((pt, i) => (
          <circle
            key={pt.key} cx={px(i)} cy={py(pt.value)} r="3.4"
            fill="#05070a" stroke={C.cyan} strokeWidth="1.4" className="bar-r"
            onMouseEnter={(e) => tip.show(e, pt.label, pt.note ?? `${nf(pt.value)} ${unit}`)}
            onMouseMove={tip.move}
            onMouseLeave={tip.hide}
          />
        ))}
        {data.map((pt, i) =>
          i % every === 0 || i === data.length - 1 ? (
            <text key={`x${pt.key}`} x={px(i)} y={height - padB + 16} className="ax-txt" textAnchor="middle">
              {pt.label}
            </text>
          ) : null,
        )}
        {xTitle && <text x={W - padR} y={height - padB + 30} className="ax-title" textAnchor="end">{xTitle}</text>}
      </svg>
    </div>
  );
}

/* ── proportion bar ──────────────────────────────────────────────────────── */

export function Proportion({ parts, total }: { parts: Datum[]; total: number }) {
  const tip = useTip();
  const shown = parts.filter((p) => p.value > 0);
  if (total === 0) return <div className="empty">NO RECORDS IN RANGE</div>;

  return (
    <div>
      <div style={{ display: 'flex', height: 26, border: '1px solid var(--line-2)', overflow: 'hidden' }}>
        {shown.map((p) => (
          <div
            key={p.key}
            style={{
              flexGrow: p.value,
              background: p.color ?? C.cyan,
              transition: 'flex-grow 0.5s cubic-bezier(0.22,0.7,0.28,1)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => tip.show(e, p.label, `${nf(p.value)} — ${((p.value / total) * 100).toFixed(1)}%`)}
            onMouseMove={tip.move}
            onMouseLeave={tip.hide}
          />
        ))}
      </div>
      <div className="row" style={{ marginTop: 10, gap: '8px 18px' }}>
        {shown.map((p) => (
          <span key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
            <span style={{ width: 9, height: 9, background: p.color ?? C.cyan, flex: '0 0 auto' }} />
            <span style={{ color: 'var(--text-2)' }}>{p.label}</span>
            <span className="mono" style={{ color: 'var(--text-3)' }}>
              {nf(p.value)} · {((p.value / total) * 100).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export const CHART_COLORS = C;
