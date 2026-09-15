/**
 * Application store.
 *
 * The snapshot is fetched once at boot from a static asset rather than bundled
 * into the JavaScript. That choice matters operationally: re-running the ingest
 * CLI replaces the data and a browser refresh picks it up, with no rebuild and
 * no redeploy. It also keeps the bundle from growing with the dataset.
 *
 * This is the only fetch in the application, and it is for a local file. No
 * component ever calls an API, so there is no request to cancel, no race
 * between two in-flight responses, and no way for a partial payload to render
 * as a real figure. Everything downstream of `ready` is synchronous.
 */

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import {
  EMPTY_FILTERS, applyFilters, launchesOf, type Filters,
} from './analytics.ts';
import type { Launch, Snapshot } from './types.ts';

/** Shape used before any data arrives, so the UI never reads undefined. */
const EMPTY_SNAPSHOT: Snapshot = {
  meta: {
    schema_version: 1,
    generated_at: null,
    is_live: false,
    provenance_note: 'No snapshot loaded.',
    sources: [],
    pipeline: [],
    counts: {},
    window: { from: null, to: null },
  },
  launches: [], rockets: [], boosters: [], payloads: [], launchpads: [],
};

export type BootState =
  | { phase: 'loading' }
  | { phase: 'ready' }
  | { phase: 'error'; message: string };

interface Store {
  boot: BootState;
  snapshot: Snapshot;
  /** Every launch in the snapshot, unfiltered. */
  all: Launch[];
  /** Launches passing the active filters. Everything on screen derives from this. */
  launches: Launch[];
  filters: Filters;
  setFilter: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  resetFilters: () => void;
  activeFilterCount: number;
  selected: Launch | null;
  select: (l: Launch | null) => void;
  compare: [Launch | null, Launch | null];
  setCompare: (slot: 0 | 1, l: Launch | null) => void;
}

const Ctx = createContext<Store | null>(null);

/** Cheap structural check — a truncated or wrong-shaped file fails loudly here. */
function validateSnapshot(data: unknown): Snapshot {
  if (typeof data !== 'object' || data === null) throw new Error('Snapshot is not an object.');
  const s = data as Partial<Snapshot>;
  if (!s.meta || typeof s.meta !== 'object') throw new Error('Snapshot has no meta block.');
  for (const key of ['launches', 'rockets', 'boosters', 'payloads', 'launchpads'] as const) {
    if (!Array.isArray(s[key])) throw new Error(`Snapshot field "${key}" is missing or not an array.`);
  }
  if (s.meta.schema_version !== 1) {
    throw new Error(`Snapshot schema v${s.meta.schema_version} is not readable by this build (expects v1).`);
  }
  return data as Snapshot;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [boot, setBoot] = useState<BootState>({ phase: 'loading' });
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selected, setSelected] = useState<Launch | null>(null);
  const [compare, setCompareState] = useState<[Launch | null, Launch | null]>([null, null]);

  useEffect(() => {
    const ctrl = new AbortController();
    const url = `${import.meta.env.BASE_URL}snapshot.json`;

    fetch(url, { signal: ctrl.signal, cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`Could not read ${url} — HTTP ${res.status}.`);
        return res.json();
      })
      .then((data) => {
        setSnapshot(validateSnapshot(data));
        setBoot({ phase: 'ready' });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setBoot({ phase: 'error', message: err instanceof Error ? err.message : String(err) });
      });

    return () => ctrl.abort();
  }, []);

  const all = useMemo(() => launchesOf(snapshot), [snapshot]);
  const launches = useMemo(() => applyFilters(all, filters), [all, filters]);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const setCompare = useCallback((slot: 0 | 1, l: Launch | null) => {
    setCompareState((c) => (slot === 0 ? [l, c[1]] : [c[0], l]));
  }, []);

  const activeFilterCount = useMemo(
    () =>
      (Object.keys(EMPTY_FILTERS) as (keyof Filters)[]).filter(
        (k) => filters[k] !== EMPTY_FILTERS[k],
      ).length,
    [filters],
  );

  const value = useMemo<Store>(
    () => ({
      boot, snapshot, all, launches, filters, setFilter, resetFilters,
      activeFilterCount, selected, select: setSelected, compare, setCompare,
    }),
    [boot, snapshot, all, launches, filters, setFilter, resetFilters,
     activeFilterCount, selected, compare, setCompare],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
}

export const isEmpty = (s: Snapshot): boolean => s.launches.length === 0;
