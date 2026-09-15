/**
 * Shared interface primitives.
 *
 * The important one is <Value>: a single component that renders a field and
 * its provenance together. Using it everywhere is what stops "not provided"
 * from silently degrading into a blank cell that looks like a zero.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from 'react';
import { DATA_STATUS_LABEL, type DataStatus, type MetricLineage } from '../lib/types.ts';
import { NOT_PROVIDED } from '../lib/analytics.ts';

/* ── status badge ────────────────────────────────────────────────────────── */

const STATUS_CLASS: Record<DataStatus, string> = {
  verified: 'b-ok',
  source_provided: 'b-info',
  derived: 'b-info',
  estimated: 'b-warn',
  missing: 'b-mute',
  stale: 'b-warn',
  fixture: 'b-warn',
};

export function StatusBadge({ status, title }: { status: DataStatus; title?: string }) {
  return (
    <span className={`badge ${STATUS_CLASS[status]}`} title={title ?? DATA_STATUS_LABEL[status]}>
      {DATA_STATUS_LABEL[status]}
    </span>
  );
}

/* ── value ───────────────────────────────────────────────────────────────── */

/**
 * Renders a field. A null value becomes NOT PROVIDED in the muted treatment —
 * never an empty cell, never a dash that could be mistaken for a measurement.
 */
export function Value({
  value,
  status,
  accent = false,
  mono = true,
}: {
  value: string | number | null | undefined;
  status?: DataStatus;
  accent?: boolean;
  mono?: boolean;
}) {
  const empty = value === null || value === undefined || value === '' || value === NOT_PROVIDED;
  if (empty) return <span className="na">{NOT_PROVIDED}</span>;
  return (
    <span
      className={[mono ? 'mono' : '', accent ? '' : ''].join(' ')}
      style={accent ? { color: 'var(--cyan)' } : undefined}
      title={status ? DATA_STATUS_LABEL[status] : undefined}
    >
      {value}
    </span>
  );
}

/* ── tooltip ─────────────────────────────────────────────────────────────── */

interface TipState { title: string; value: string; x: number; y: number; on: boolean }
const TipCtx = createContext<{
  show: (e: { clientX: number; clientY: number }, title: string, value: string) => void;
  move: (e: { clientX: number; clientY: number }) => void;
  hide: () => void;
}>({ show: () => {}, move: () => {}, hide: () => {} });

export const useTip = () => useContext(TipCtx);

export function TipProvider({ children }: { children: ReactNode }) {
  const [tip, setTip] = useState<TipState>({ title: '', value: '', x: 0, y: 0, on: false });

  const place = (e: { clientX: number; clientY: number }) => {
    const pad = 14;
    const w = 240;
    const h = 62;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + w > window.innerWidth - 8) x = e.clientX - w - pad;
    if (y + h > window.innerHeight - 8) y = e.clientY - h - pad;
    return { x: Math.max(8, x), y: Math.max(8, y) };
  };

  const api = useMemo(
    () => ({
      show: (e: { clientX: number; clientY: number }, title: string, value: string) =>
        setTip({ title, value, ...place(e), on: true }),
      move: (e: { clientX: number; clientY: number }) =>
        setTip((t) => (t.on ? { ...t, ...place(e) } : t)),
      hide: () => setTip((t) => ({ ...t, on: false })),
    }),
    [],
  );

  return (
    <TipCtx.Provider value={api}>
      {children}
      <div className={`tip${tip.on ? ' on' : ''}`} style={{ left: tip.x, top: tip.y }} role="status">
        <b>{tip.title}</b>
        <span className="v">{tip.value}</span>
      </div>
    </TipCtx.Provider>
  );
}

/* ── panel ───────────────────────────────────────────────────────────────── */

export function Panel({
  title, basis, children, flush = false, actions,
}: {
  title: string; basis?: string; children: ReactNode; flush?: boolean; actions?: ReactNode;
}) {
  return (
    <section className="panel">
      <header className="panel-hd">
        <h3>{title}</h3>
        {actions ?? (basis ? <span className="lbl">{basis}</span> : null)}
      </header>
      <div className={`panel-bd${flush ? ' flush' : ''}`}>{children}</div>
    </section>
  );
}

/* ── animated counter ────────────────────────────────────────────────────── */

/**
 * Counts from the previous value to the new one, so a filter change reads as a
 * quantity moving rather than a number being swapped. Skipped entirely for
 * non-numeric values and under reduced motion.
 */
export function Counter({ value, digits = 0 }: { value: number | null; digits?: number }) {
  const [shown, setShown] = useState(value ?? 0);
  const fromRef = useRef(value ?? 0);
  const raf = useRef(0);

  useEffect(() => {
    if (value === null) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setShown(value); fromRef.current = value; return; }

    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const dur = 520;
    const t0 = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(from + (to - from) * e);
      if (t < 1) raf.current = requestAnimationFrame(step);
      else fromRef.current = to;
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);

  if (value === null) return <span className="na">{NOT_PROVIDED}</span>;
  return <>{shown.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}</>;
}

/* ── lineage ─────────────────────────────────────────────────────────────── */

export function LineagePanel({ lineage }: { lineage: MetricLineage }) {
  return (
    <div>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div className="lbl">METRIC</div>
          <div className="mono" style={{ fontSize: 15 }}>{lineage.metric}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="lbl">VALUE</div>
          <div className="mono" style={{ fontSize: 15, color: 'var(--cyan)' }}>{lineage.value}</div>
        </div>
      </div>
      {lineage.formula && (
        <p style={{ margin: '0 0 12px', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
          <span className="lbl" style={{ marginRight: 8 }}>FORMULA</span>
          {lineage.formula}
        </p>
      )}
      <div className="lineage">
        {lineage.steps.map((s, i) => (
          <div className="lin-step" key={i}>
            <span className="lin-stage">{s.stage.toUpperCase()}</span>
            <div>
              <div className="lin-label">{s.label}</div>
              <div className="lin-detail">{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── sortable table ──────────────────────────────────────────────────────── */

export interface Column<T> {
  key: string;
  head: string;
  num?: boolean;
  width?: number;
  get?: (row: T) => string | number | null;
  cell?: (row: T) => ReactNode;
}

export function DataTable<T>({
  rows, columns, initialSort, onRowClick, selectedId, rowId, empty = 'NO RECORDS MATCH THE CURRENT FILTERS',
}: {
  rows: T[];
  columns: Column<T>[];
  initialSort?: [string, 'asc' | 'desc'];
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  rowId?: (row: T) => string;
  empty?: string;
}) {
  const [sort, setSort] = useState<[string, 'asc' | 'desc']>(initialSort ?? [columns[0]?.key ?? '', 'asc']);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort[0]);
    if (!col) return rows;
    const dir = sort[1] === 'asc' ? 1 : -1;
    const val = (r: T) => (col.get ? col.get(r) : (r as Record<string, unknown>)[col.key] as string | number | null);
    return [...rows].sort((a, b) => {
      const x = val(a);
      const y = val(b);
      if (x === null || x === undefined) return 1;
      if (y === null || y === undefined) return -1;
      if (typeof x === 'number' && typeof y === 'number') return (x - y) * dir;
      return String(x).localeCompare(String(y)) * dir;
    });
  }, [rows, columns, sort]);

  const toggle = useCallback((key: string) => {
    setSort(([k, d]) => (k === key ? [k, d === 'asc' ? 'desc' : 'asc'] : [key, 'desc']));
  }, []);

  /**
   * Row windowing.
   *
   * The table scrolls inside a fixed-height container, so reconciling every row
   * pays for hundreds that are never on screen — a few hundred rows cost a
   * visible frame on navigation, and the live dataset is several times the
   * fixture. Only the visible slice plus an overscan margin is rendered; two
   * spacer rows hold the scroll height so the scrollbar stays honest.
   *
   * This requires uniform row height, which `tbody tr` fixes in CSS.
   */
  const ROW_H = 34;
  const OVERSCAN = 10;
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ start: 0, end: 40 });

  const recalc = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const first = Math.max(0, Math.floor(el.scrollTop / ROW_H) - OVERSCAN);
    const visible = Math.ceil(el.clientHeight / ROW_H) + OVERSCAN * 2;
    setView({ start: first, end: first + visible });
  }, []);

  useEffect(() => {
    recalc();
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalc, rows.length]);

  if (rows.length === 0) return <div className="empty">{empty}</div>;

  const start = Math.min(view.start, Math.max(0, sorted.length - 1));
  const end = Math.min(view.end, sorted.length);
  const window_ = sorted.slice(start, end);
  const padTop = start * ROW_H;
  const padBottom = Math.max(0, (sorted.length - end) * ROW_H);

  return (
    <div className="tbl-wrap" ref={wrapRef} onScroll={recalc}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                onClick={() => toggle(c.key)}
                data-sorted={sort[0] === c.key ? sort[1] : undefined}
                style={c.width ? { width: c.width } : undefined}
                scope="col"
              >
                {c.head} {sort[0] === c.key ? (sort[1] === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {padTop > 0 && <tr aria-hidden="true" style={{ height: padTop }}><td colSpan={columns.length} /></tr>}
          {window_.map((r, i) => {
            const id = rowId?.(r);
            return (
              <tr
                key={id ?? i}
                onClick={() => onRowClick?.(r)}
                className={id && id === selectedId ? 'sel' : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} className={c.num ? 'n' : undefined}>
                    {c.cell ? c.cell(r) : <Value value={c.get ? c.get(r) : null} mono={!!c.num} />}
                  </td>
                ))}
              </tr>
            );
          })}
          {padBottom > 0 && <tr aria-hidden="true" style={{ height: padBottom }}><td colSpan={columns.length} /></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ── json view ───────────────────────────────────────────────────────────── */

export function JsonView({ data, filter = '' }: { data: unknown; filter?: string }) {
  const text = useMemo(() => JSON.stringify(data, null, 2) ?? 'null', [data]);

  const lines = useMemo(() => {
    const all = text.split('\n');
    if (!filter.trim()) return all;
    const q = filter.trim().toLowerCase();
    return all.filter((l) => l.toLowerCase().includes(q));
  }, [text, filter]);

  // Token colouring without a highlighter dependency: one pass, four classes.
  const paint = (line: string) => {
    const out: ReactNode[] = [];
    const re = /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|(\b-?\d+\.?\d*(?:e[+-]?\d+)?\b)|(\btrue\b|\bfalse\b)|(\bnull\b)/gi;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) out.push(line.slice(last, m.index));
      const cls = m[1] ? 'j-key' : m[2] ? 'j-str' : m[3] ? 'j-num' : m[4] ? 'j-bool' : 'j-null';
      out.push(<span className={cls} key={`${m.index}-${cls}`}>{m[0]}</span>);
      last = m.index + m[0].length;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
  };

  return (
    <div className="json">
      {lines.length === 0 ? <span className="dim">NO KEYS MATCH “{filter}”</span>
        : lines.map((l, i) => <div key={i}>{paint(l)}</div>)}
    </div>
  );
}

/* ── copy button ─────────────────────────────────────────────────────────── */

export function CopyButton({ text, label = 'COPY JSON' }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={`btn${done ? ' on' : ''}`}
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).catch(() => {});
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
    >
      {done ? 'COPIED' : label}
    </button>
  );
}

/* ── download button ─────────────────────────────────────────────────────── */

export function DownloadButton({ data, filename, label = 'DOWNLOAD' }: { data: unknown; filename: string; label?: string }) {
  return (
    <button
      className="btn"
      type="button"
      onClick={() => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }}
    >
      {label}
    </button>
  );
}
