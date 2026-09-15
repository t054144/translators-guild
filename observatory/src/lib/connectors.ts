/**
 * API connectors.
 *
 * Each connector owns exactly one concern: talk to one upstream API and hand
 * back raw payloads plus enough context to normalize them. Connectors never
 * touch React, never cache, and never decide what a metric means. Adding a
 * source means adding a file here and one entry in CONNECTORS — nothing else
 * in the application changes.
 *
 * This layer stopped being theoretical in June 2026, when the r/SpaceX API —
 * the source almost every SpaceX side-project was built on — was archived and
 * its origin began returning TLS 525. Anything hard-wired to it broke. The
 * registry below keeps it as a declared-dead source so the UI can explain the
 * situation instead of silently rendering nothing.
 */

import type { EntityType } from './types.ts';

/* ── connector contract ──────────────────────────────────────────────────── */

export interface RawRecord {
  record_id: string;
  entity_type: EntityType;
  payload: unknown;
  last_updated: string | null;
}

export interface ConnectorResult {
  records: RawRecord[];
  /** Wall-clock time of the last successful HTTP call, for source health. */
  response_ms: number | null;
  pages: number;
}

export interface FetchContext {
  /** Injected so the ingest script can add retries, logging and rate limiting. */
  get: (url: string) => Promise<unknown>;
  log: (msg: string) => void;
  /** How far back to look, in days. */
  days: number;
  /** Hard ceiling on records, so a bad filter cannot pull the whole database. */
  max: number;
}

export interface Connector {
  id: string;
  name: string;
  endpoint: string;
  /** Documentation the UI links to, so users can check our reading of the data. */
  docs_url: string;
  /** True when the upstream is known dead. The ingest script will not call it. */
  decommissioned: boolean;
  decommission_note: string | null;
  /** Entity kinds this connector can supply. Drives the System Status matrix. */
  provides: EntityType[];
  fetchAll(ctx: FetchContext): Promise<ConnectorResult>;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

/** Walk a nested payload without throwing. APIs rename fields between versions. */
export function dig(obj: unknown, ...path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (!isObj(cur)) return null;
    cur = cur[key];
    if (cur === undefined) return null;
  }
  return cur ?? null;
}

export const asString = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() !== '' ? v.trim() : null;

export const asNumber = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

export const asBool = (v: unknown): boolean | null => (typeof v === 'boolean' ? v : null);

/* ── Launch Library 2 ────────────────────────────────────────────────────── */

const LL2_BASE = 'https://ll.thespacedevs.com/2.3.0';
const LL2_PAGE = 100;

/**
 * Launch Library 2, by The Space Devs. Free, keyless, actively maintained,
 * and — since the r/SpaceX API died — the practical primary source for
 * current launch data.
 *
 * Rate limit is 15 calls/hour/IP anonymously. One call returns 100 launches,
 * so a decade of SpaceX history costs a handful of calls. The dev mirror at
 * lldev.thespacedevs.com has no limit but serves stale data; the ingest script
 * exposes it behind --dev and the snapshot records which one was used.
 */
export const launchLibrary2: Connector = {
  id: 'll2',
  name: 'Launch Library 2 (The Space Devs)',
  endpoint: `${LL2_BASE}/launches/`,
  docs_url: 'https://thespacedevs.com/llapi',
  decommissioned: false,
  decommission_note: null,
  provides: ['launch', 'rocket', 'booster', 'launchpad', 'payload'],

  async fetchAll(ctx: FetchContext): Promise<ConnectorResult> {
    const end = new Date();
    const start = new Date(end.getTime() - ctx.days * 86_400_000);
    const records: RawRecord[] = [];
    let offset = 0;
    let pages = 0;
    let lastMs: number | null = null;

    while (records.length < ctx.max) {
      const params = new URLSearchParams({
        net__gte: start.toISOString().slice(0, 10),
        net__lte: end.toISOString().slice(0, 10),
        limit: String(Math.min(LL2_PAGE, ctx.max - records.length)),
        offset: String(offset),
        ordering: 'net',
        mode: 'detailed',
        // SpaceX agency id in LL2. Kept as a named constant rather than inline
        // so a source rename is a one-line change.
        lsp__id: '121',
      });

      const t0 = Date.now();
      const payload = await ctx.get(`${LL2_BASE}/launches/?${params.toString()}`);
      lastMs = Date.now() - t0;
      pages += 1;

      const results = dig(payload, 'results');
      if (!Array.isArray(results) || results.length === 0) break;

      for (const row of results) {
        const id = asString(dig(row, 'id')) ?? `ll2-${records.length}`;
        records.push({
          record_id: id,
          entity_type: 'launch',
          payload: row,
          last_updated: asString(dig(row, 'last_updated')),
        });
      }

      ctx.log(`  LL2 offset=${offset} -> ${results.length} launches (total ${records.length})`);
      if (!dig(payload, 'next')) break;
      offset += results.length;
    }

    return { records, response_ms: lastMs, pages };
  },
};

/* ── r/SpaceX API (archived) ─────────────────────────────────────────────── */

/**
 * The original community SpaceX API. Kept in the registry deliberately.
 *
 * It entered maintenance-only mode in 2024 (no new launches added) and the
 * repository was archived on 6 June 2026, after which the origin began
 * returning TLS 525. `decommissioned` short-circuits the ingest script, so we
 * never spend a request on it — but System Status can still explain to a user
 * why a source they have seen in a hundred tutorials is not feeding this app.
 *
 * If a maintained mirror is adopted later, point `endpoint` at it, flip
 * `decommissioned` to false, and the rest of the pipeline picks it up unchanged.
 */
export const spacexArchive: Connector = {
  id: 'spacex-v4',
  name: 'r/SpaceX API v4 (archived)',
  endpoint: 'https://api.spacexdata.com/v4/launches',
  docs_url: 'https://docs.spacexdata.com/',
  decommissioned: true,
  decommission_note:
    'Repository archived 6 June 2026; origin returns TLS 525. Dataset was already ' +
    'frozen in maintenance-only mode from 2024, so even when reachable it served no ' +
    'launches after that point. Not called by the ingest pipeline.',
  provides: ['launch', 'rocket', 'booster', 'payload', 'launchpad', 'capsule', 'ship'],

  async fetchAll(): Promise<ConnectorResult> {
    throw new Error(
      'spacex-v4 is decommissioned and must not be called. See decommission_note.',
    );
  },
};

/* ── registry ────────────────────────────────────────────────────────────── */

export const CONNECTORS: Connector[] = [launchLibrary2, spacexArchive];

export const activeConnectors = (): Connector[] => CONNECTORS.filter((c) => !c.decommissioned);
