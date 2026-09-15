/**
 * Application shell: navigation rail, command palette, keyboard routing.
 *
 * Heavy sections are code-split. The shell itself stays small so the first
 * paint is the instrument frame, not a spinner.
 */

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import { StoreProvider, useStore } from './lib/store.tsx';
import { TipProvider } from './components/ui.tsx';
import { fmtDate } from './lib/analytics.ts';
import type { Launch } from './lib/types.ts';

import MissionControl from './sections/MissionControl.tsx';

const LaunchDatabase = lazy(() => import('./sections/LaunchDatabase.tsx'));
const Upcoming = lazy(() => import('./sections/Upcoming.tsx'));
const RocketLab = lazy(() => import('./sections/RocketLab.tsx'));
const BoosterReuse = lazy(() => import('./sections/BoosterReuse.tsx'));
const PayloadIntel = lazy(() => import('./sections/PayloadIntel.tsx'));
const LaunchSites = lazy(() => import('./sections/LaunchSites.tsx'));
const Analytics = lazy(() => import('./sections/Analytics.tsx'));
const DataExplorer = lazy(() => import('./sections/DataExplorer.tsx'));
const SystemStatus = lazy(() => import('./sections/SystemStatus.tsx'));

export interface SectionDef {
  idx: string;
  path: string;
  label: string;
  short: string;
  count?: (s: ReturnType<typeof useStore>) => number;
}

export const SECTIONS: SectionDef[] = [
  { idx: '01', path: '/', label: 'Mission Control', short: 'CONTROL' },
  { idx: '02', path: '/launches', label: 'Launch Database', short: 'LAUNCHES', count: (s) => s.launches.length },
  { idx: '03', path: '/upcoming', label: 'Live / Upcoming', short: 'UPCOMING', count: (s) => s.all.filter((l) => l.upcoming).length },
  { idx: '04', path: '/rockets', label: 'Rocket Lab', short: 'ROCKETS', count: (s) => s.snapshot.rockets.length },
  { idx: '05', path: '/boosters', label: 'Booster Reuse', short: 'BOOSTERS', count: (s) => s.snapshot.boosters.length },
  { idx: '06', path: '/payloads', label: 'Payload Intelligence', short: 'PAYLOADS', count: (s) => s.snapshot.payloads.length },
  { idx: '07', path: '/sites', label: 'Launch Sites', short: 'SITES', count: (s) => s.snapshot.launchpads.length },
  { idx: '08', path: '/analytics', label: 'Mission Analytics', short: 'ANALYTICS' },
  { idx: '09', path: '/explorer', label: 'Data Explorer', short: 'DATA' },
  { idx: '10', path: '/status', label: 'System Status', short: 'STATUS' },
];

/* ── command palette ─────────────────────────────────────────────────────── */

interface Cmd {
  kind: string;
  label: string;
  hint: string;
  run: () => void;
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const store = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cur, setCur] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const commands = useMemo<Cmd[]>(() => {
    const out: Cmd[] = SECTIONS.map((s) => ({
      kind: 'GO',
      label: `${s.idx} — ${s.label}`,
      hint: s.path,
      run: () => { nav(s.path); onClose(); },
    }));

    const term = q.trim().toLowerCase();
    if (term.length >= 1) {
      for (const l of store.all) {
        if (out.length > 160) break;
        if (l.name.toLowerCase().includes(term)) {
          out.push({
            kind: 'MISSION',
            label: l.name,
            hint: `${fmtDate(l.net)} · ${l.rocket_name ?? '—'}`,
            run: () => { store.select(l); nav('/launches'); onClose(); },
          });
        }
      }
      for (const b of store.snapshot.boosters) {
        if (out.length > 200) break;
        const p = b.normalized_payload;
        if (p.serial.toLowerCase().includes(term)) {
          out.push({
            kind: 'BOOSTER',
            label: p.serial,
            hint: `${p.flight_count} flights recorded`,
            run: () => { store.setFilter('boosterId', p.id); nav('/boosters'); onClose(); },
          });
        }
      }
      for (const r of store.snapshot.rockets) {
        const p = r.normalized_payload;
        if (p.name.toLowerCase().includes(term)) {
          out.push({
            kind: 'ROCKET',
            label: p.name,
            hint: p.family ?? 'vehicle',
            run: () => { store.setFilter('rocketId', p.id); nav('/rockets'); onClose(); },
          });
        }
      }
      for (const pad of store.snapshot.launchpads) {
        const p = pad.normalized_payload;
        if (p.name.toLowerCase().includes(term)) {
          out.push({
            kind: 'PAD',
            label: p.name,
            hint: p.locality ?? 'launch site',
            run: () => { store.setFilter('padId', p.id); nav('/sites'); onClose(); },
          });
        }
      }
    }
    return out;
  }, [q, store, nav, onClose]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return commands.slice(0, 12);
    return commands
      .filter((c) => c.label.toLowerCase().includes(term) || c.hint.toLowerCase().includes(term))
      .slice(0, 40);
  }, [commands, q]);

  useEffect(() => { setCur(0); }, [q]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCur((c) => Math.min(c + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCur((c) => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); results[cur]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div className="palette-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-label="Mission command">
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKey}
          placeholder="Search missions, boosters, rockets, pads, sections…"
          aria-label="Mission command search"
        />
        <div className="palette-list">
          {results.length === 0 && <div className="empty">NO MATCH</div>}
          {results.map((c, i) => (
            <div
              key={`${c.kind}-${c.label}-${i}`}
              className={`palette-row${i === cur ? ' cur' : ''}`}
              onMouseEnter={() => setCur(i)}
              onMouseDown={(e) => { e.preventDefault(); c.run(); }}
            >
              <span className="palette-kind">{c.kind}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.label}</span>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--text-4)' }}>{c.hint}</span>
            </div>
          ))}
        </div>
        <div className="palette-foot">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

/* ── shell ───────────────────────────────────────────────────────────────── */

function Shell() {
  const store = useStore();
  const nav = useNavigate();
  const [palette, setPalette] = useState(false);

  const latest = useMemo<Launch | null>(() => {
    const past = store.all.filter((l) => !l.upcoming);
    return past[past.length - 1] ?? null;
  }, [store.all]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA');

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette((p) => !p);
        return;
      }
      if (typing) return;

      if (e.key === '/') {
        e.preventDefault();
        const search = document.querySelector<HTMLInputElement>('[data-search]');
        if (search) search.focus();
        else setPalette(true);
      } else if (e.key.toLowerCase() === 'l' && latest) {
        store.select(latest);
        nav('/launches');
      } else if (e.key.toLowerCase() === 'u') {
        nav('/upcoming');
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        document.querySelector<HTMLSelectElement>('[data-filter]')?.focus();
      } else if (e.key === 'Escape') {
        store.select(null);
      }
    },
    [latest, nav, store],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  const live = store.snapshot.meta.is_live;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark"><span /></span>
          <div>
            <div className="brand-name">Mission Intelligence</div>
            <div className="brand-sub">SpaceX Data Observatory</div>
          </div>
        </div>

        <span className={`badge ${live ? 'b-ok' : 'b-warn'}`} title={store.snapshot.meta.provenance_note}>
          {live ? 'LIVE DATA' : 'FIXTURE DATA'}
        </span>

        <div className="topbar-spacer" />

        <span className="lbl" style={{ display: 'none' }}>records</span>
        <span className="mono topbar-count" style={{ fontSize: 11, color: 'var(--text-3)' }}>
          {store.launches.length.toLocaleString()} / {store.all.length.toLocaleString()} LAUNCHES
        </span>

        <button className="cmd-hint" type="button" onClick={() => setPalette(true)}>
          <span className="cmd-hint-label">Mission Command</span>
          <kbd>⌘K</kbd>
        </button>
      </header>

      <nav className="rail" aria-label="Sections">
        <div className="rail-group">
          <span className="lbl">Sections</span>
          {SECTIONS.map((s) => (
            <NavLink
              key={s.path}
              to={s.path}
              end={s.path === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="idx">{s.idx}</span>
              <span>{s.label}</span>
              {s.count && <span className="count">{s.count(store)}</span>}
            </NavLink>
          ))}
        </div>
        <div className="rail-group" style={{ marginTop: 'auto' }}>
          <span className="lbl">Shortcuts</span>
          <div style={{ padding: '2px 16px', display: 'grid', gap: 4 }}>
            {[['⌘K', 'command'], ['/', 'search'], ['L', 'latest'], ['U', 'upcoming'], ['esc', 'close']].map(([k, v]) => (
              <div key={k} className="row" style={{ gap: 8, fontSize: 11, color: 'var(--text-4)' }}>
                <kbd>{k}</kbd><span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      <main className="main">
        {store.boot.phase === 'loading' && (
          <div className="view">
            <div className="panel" style={{ padding: 20 }}>
              <span className="eyebrow">Data layer</span>
              <h2 style={{ fontSize: 17, margin: '8px 0 14px' }}>Reading snapshot…</h2>
              <div className="stack" style={{ gap: 8, maxWidth: 520 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="skel" style={{ width: `${88 - i * 14}%` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {store.boot.phase === 'error' && (
          <div className="view">
            <div className="view-head">
              <div>
                <span className="eyebrow">Data layer</span>
                <h1 className="view-title">No snapshot</h1>
                <p className="view-sub">
                  The interface loaded but its cache did not. Nothing is rendered from memory or
                  guessed — the application has no data until the ingest CLI produces some.
                </p>
              </div>
              <span className="badge b-fail">CACHE UNAVAILABLE</span>
            </div>
            <div className="panel" style={{ padding: 18 }}>
              <span className="lbl">Reason</span>
              <p className="mono" style={{ color: 'var(--fail)', fontSize: 12.5, margin: '6px 0 16px' }}>
                {store.boot.message}
              </p>
              <span className="lbl">Fix</span>
              <pre className="json" style={{ marginTop: 6 }}>
{`npm run ingest              # live data from Launch Library 2
npm run ingest -- --fixture # synthetic, flagged, for interface work`}
              </pre>
            </div>
          </div>
        )}

        <Suspense fallback={<div className="view"><div className="empty">LOADING MODULE…</div></div>}>
          {store.boot.phase === 'ready' && (
          <Routes>
            <Route path="/" element={<MissionControl />} />
            <Route path="/launches" element={<LaunchDatabase />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/rockets" element={<RocketLab />} />
            <Route path="/boosters" element={<BoosterReuse />} />
            <Route path="/payloads" element={<PayloadIntel />} />
            <Route path="/sites" element={<LaunchSites />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/explorer" element={<DataExplorer />} />
            <Route path="/status" element={<SystemStatus />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          )}
        </Suspense>
      </main>

      <nav className="mobile-nav" aria-label="Sections">
        {SECTIONS.map((s) => (
          <NavLink key={s.path} to={s.path} end={s.path === '/'}
                   className={({ isActive }) => (isActive ? 'active' : '')}>
            {s.short}
          </NavLink>
        ))}
      </nav>

      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <TipProvider>
          <Shell />
        </TipProvider>
      </StoreProvider>
    </HashRouter>
  );
}
