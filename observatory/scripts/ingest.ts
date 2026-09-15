/**
 * Ingest CLI — the only thing in this project that talks to the network.
 *
 *   npm run ingest                    r/SpaceX v4 archive, reassembled from pinned mirrors (default)
 *   npm run ingest -- --ll2           Launch Library 2, live (needs network; 15 req/h anonymous)
 *   npm run ingest -- --ll2 --days 3650
 *   npm run ingest -- --ll2 --dev     LL2 dev mirror: no rate limit, stale data
 *   npm run ingest -- --fixture       synthetic data, flagged as such, for UI work
 *
 * Writes public/snapshot.json, which the app fetches at boot. Re-running this
 * script replaces the data with no rebuild required — refresh the browser and
 * the new snapshot is live.
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CONNECTORS, launchLibrary2, spacexV4Mirror, type FetchContext, type RawRecord } from '../src/lib/connectors.ts';
import { normalizeV4 } from '../src/lib/pipeline-v4.ts';
import {
  normalizeLaunch,
  projectBoosters,
  projectLaunchpads,
  projectPayloads,
  projectRockets,
  validateLaunches,
  type NormalizeContext,
} from '../src/lib/pipeline.ts';
import type { IngestReport, Snapshot, SourceHealth } from '../src/lib/types.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, '../public/snapshot.json');
const UA = 'SpaceXMissionObservatory/1.0 (open-source data project)';

/* ── args ────────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, dflt: number): number => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return dflt;
  const v = Number(argv[i + 1]);
  return Number.isFinite(v) ? v : dflt;
};

const DAYS = opt('days', 2920); // ~8 years
const MAX = opt('max', 800);
const DEV = flag('dev');
const FIXTURE = flag('fixture');
const LL2 = flag('ll2');
/** Default mode: the pinned v4 archive. Real, complete for its era, needs no network. */
const V4 = !FIXTURE && !LL2;

/* ── http ────────────────────────────────────────────────────────────────── */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson(url: string, attempt = 1): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45_000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      signal: controller.signal,
    });

    if (res.status === 429) {
      throw new Error(
        'Rate limited (429). Launch Library 2 allows 15 calls/hour/IP anonymously.\n' +
          'Wait an hour, or re-run with --dev to use the unmetered dev mirror.',
      );
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // Retry transport failures, never a 429 — retrying a rate limit just digs in.
    if (attempt < 3 && !msg.includes('429')) {
      const wait = 2 ** attempt * 1000;
      console.log(`    retry ${attempt} in ${wait}ms — ${msg}`);
      await sleep(wait);
      return getJson(url, attempt + 1);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

/* ── fixture generator ───────────────────────────────────────────────────── */

/**
 * Synthetic records shaped exactly like Launch Library 2 payloads.
 *
 * This exists so the interface can be built and demonstrated without a network,
 * NOT to stand in for real data. Every record produced here is stamped
 * `fixture` at the field level, `is_live` is false, and the UI carries a
 * permanent banner. Rocket and pad names are real because they are facts;
 * dates, outcomes and booster assignments are generated.
 */
function buildFixture(): RawRecord[] {
  // Deterministic PRNG so the fixture is stable across runs and diffs cleanly.
  let seed = 20260915;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = <T,>(xs: T[]): T => xs[Math.floor(rnd() * xs.length)]!;

  const pads = [
    { id: 'fx-pad-39a', name: 'LC-39A', loc: 'Kennedy Space Center, FL, USA', lat: 28.6084, lon: -80.6043 },
    { id: 'fx-pad-40', name: 'SLC-40', loc: 'Cape Canaveral SFS, FL, USA', lat: 28.5619, lon: -80.5772 },
    { id: 'fx-pad-4e', name: 'SLC-4E', loc: 'Vandenberg SFB, CA, USA', lat: 34.632, lon: -120.611 },
  ];
  const orbits = [
    'Low Earth Orbit', 'Low Earth Orbit', 'Low Earth Orbit',
    'Geostationary Transfer Orbit', 'Sun-Synchronous Orbit', 'Medium Earth Orbit', 'Heliocentric',
  ];
  const zones = ['ASOG', 'JRTI', 'OCISLY', 'LZ-1', 'LZ-4'];
  const boosters = Array.from({ length: 22 }, (_, i) => `B10${String(31 + i).padStart(2, '0')}`);

  const records: RawRecord[] = [];
  const start = new Date('2019-01-05T00:00:00Z').getTime();
  const flights = new Map<string, number>();

  for (let i = 0; i < 260; i += 1) {
    // Cadence accelerates over the window, which is the real shape of the era.
    const gap = 26 - Math.min(20, Math.floor(i / 14));
    const net = new Date(start + i * gap * 86_400_000 + Math.floor(rnd() * 3) * 86_400_000);
    const heavy = rnd() < 0.05;
    const pad = pick(pads);
    const serial = pick(boosters);
    flights.set(serial, (flights.get(serial) ?? 0) + 1);

    const roll = rnd();
    const status = roll < 0.965 ? 'Success' : roll < 0.99 ? 'Partial Failure' : 'Failure';
    const attempt = rnd() < 0.94;
    const landed = attempt && rnd() < 0.96 && status === 'Success';

    const cores = heavy ? 3 : 1;
    const launcherStage = Array.from({ length: cores }, (_, c) => ({
      id: `fx-stage-${i}-${c}`,
      type: 'Core',
      reused: (flights.get(serial) ?? 1) > 1,
      launcher_flight_number: flights.get(serial) ?? 1,
      launcher: {
        id: `fx-l-${serial}`,
        serial_number: c === 0 ? serial : `${serial}-S${c}`,
        flight_proven: (flights.get(serial) ?? 1) > 1,
        status: { name: 'Active' },
        flights: flights.get(serial) ?? 1,
      },
      landing: {
        attempt,
        success: attempt ? landed : null,
        location: { name: pick(zones), abbrev: pick(zones) },
        type: { name: attempt ? 'Autonomous Spaceport Drone Ship' : 'Expended' },
      },
    }));

    records.push({
      record_id: `fx-${String(i).padStart(4, '0')}`,
      entity_type: 'launch',
      last_updated: net.toISOString(),
      payload: {
        id: `fx-${String(i).padStart(4, '0')}`,
        name: heavy
          ? `Falcon Heavy | FIXTURE Mission ${i + 1}`
          : `Falcon 9 Block 5 | FIXTURE Mission ${i + 1}`,
        net: net.toISOString(),
        window_start: net.toISOString(),
        window_end: new Date(net.getTime() + 3 * 3600_000).toISOString(),
        last_updated: net.toISOString(),
        status: { name: `Launch ${status}`, abbrev: status },
        launch_service_provider: { id: 121, name: 'SpaceX', abbrev: 'SpX' },
        rocket: {
          id: heavy ? 'fx-r-fh' : 'fx-r-f9',
          configuration: {
            id: heavy ? 'fx-r-fh' : 'fx-r-f9',
            name: heavy ? 'Falcon Heavy' : 'Falcon 9',
            full_name: heavy ? 'Falcon Heavy' : 'Falcon 9 Block 5',
            family: 'Falcon',
            variant: heavy ? 'Heavy' : 'Block 5',
            reusable: true,
            maiden_flight: heavy ? '2018-02-06' : '2018-05-11',
            length: heavy ? 70 : 70,
            diameter: 3.7,
            launch_mass: heavy ? 1420 : 549,
            leo_capacity: heavy ? 63800 : 22800,
            gto_capacity: heavy ? 26700 : 8300,
            max_stage: 2,
            description: 'FIXTURE RECORD — structural placeholder, not a source specification.',
          },
          launcher_stage: launcherStage,
        },
        mission: {
          id: i,
          name: `FIXTURE Payload ${i + 1}`,
          description: 'FIXTURE RECORD — generated for interface development. Not a real mission.',
          type: pick(['Communications', 'Earth Science', 'Resupply', 'Navigation', 'Test Flight']),
          orbit: { name: pick(orbits), abbrev: 'LEO' },
        },
        pad: {
          id: pad.id,
          name: pad.name,
          latitude: pad.lat,
          longitude: pad.lon,
          total_launch_count: null,
          location: { id: 1, name: pad.loc, country_code: 'USA' },
        },
      },
    });
  }
  return records;
}

/* ── main ────────────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  const started = Date.now();
  const retrieved_at = new Date().toISOString();
  const reports: IngestReport[] = [];
  const health: SourceHealth[] = [];
  const MIRROR_DIR = resolve(HERE, '../data/v4-mirror');

  console.log('\n  SpaceX Mission Observatory — ingest');
  console.log(`  mode      ${FIXTURE ? 'FIXTURE (synthetic, flagged)' : V4 ? 'V4 ARCHIVE (pinned mirrors, frozen 2022-12-05)' : DEV ? 'LL2 LIVE via dev mirror' : 'LL2 LIVE'}`);
  if (LL2) console.log(`  window    last ${DAYS} days, max ${MAX} records`);
  console.log('');

  let snapshot: Snapshot;

  if (V4) {
    /* ── the reassembled archive ─────────────────────────────────────────── */
    const read = (name: string): unknown[] => {
      const path = resolve(MIRROR_DIR, `${name}.json`);
      const data = JSON.parse(readFileSync(path, 'utf8')) as unknown;
      if (!Array.isArray(data)) throw new Error(`${name}.json is not a JSON array`);
      console.log(`  read      ${name.padEnd(11)} ${String(data.length).padStart(4)} records`);
      return data;
    };
    const cols = {
      launches: read('launches'), rockets: read('rockets'), cores: read('cores'),
      launchpads: read('launchpads'), landpads: read('landpads'), payloads: read('payloads'),
    };
    const sourceName = spacexV4Mirror.name;
    const sourceUrl = 'data/v4-mirror/ — see SOURCES.md for the originating repositories';

    reports.push({
      step: 'fetch',
      detail: 'Six v4 collections read from pinned files. Nothing was fetched over the network.',
      in_count: cols.launches.length, out_count: cols.launches.length, dropped: 0,
    });

    const nctx: NormalizeContext = { source: sourceName, source_url: sourceUrl, retrieved_at, fixture: false };
    const r = normalizeV4(cols, nctx);

    reports.push({
      step: 'normalize',
      detail: 'v4 payloads mapped to typed entities. Ids resolved across collections; names never guessed.',
      in_count: cols.launches.length, out_count: r.launches.length,
      dropped: cols.launches.length - r.launches.length,
    });
    const byKind = new Map<string, number>();
    for (const u of r.unresolved) byKind.set(u.kind, (byKind.get(u.kind) ?? 0) + 1);
    reports.push({
      step: 'join:foreign-keys',
      detail: r.unresolved.length === 0
        ? 'Every rocket, launchpad, core, landpad and payload id referenced by a launch resolved to a record. The six dumps are from one consistent database.'
        : `Unresolved references: ${[...byKind].map(([k, n]) => `${n} ${k}`).join(', ')}. Kept with the id and a NOT PROVIDED name.`,
      in_count: r.launches.length, out_count: r.launches.length, dropped: 0,
    });

    const { kept, dropped, reports: vreports } = validateLaunches(r.launches);
    reports.push(...vreports);
    if (dropped.length) {
      console.log('\n  DROPPED');
      for (const d of dropped.slice(0, 10)) console.log(`    ${d.id}  ${d.reason}`);
    }

    reports.push({
      step: 'project',
      detail: 'Boosters, pads and payloads are scoped to launches actually present — counts describe this window, not a vehicle’s whole life.',
      in_count: kept.length,
      out_count: r.rockets.length + r.boosters.length + r.launchpads.length + r.payloads.length,
      dropped: 0,
    });

    health.push({
      id: spacexV4Mirror.id, name: sourceName, endpoint: sourceUrl,
      state: 'stale',
      detail: 'Real records, reassembled from six public mirrors of the archived API. The dataset is frozen at its last launch, 2022-12-05, and cannot gain records. Foreign keys verified at ingest.',
      last_attempt: retrieved_at, last_success: retrieved_at, response_ms: 0,
      record_count: kept.length, decommissioned: false,
    });
    health.push({
      id: launchLibrary2.id, name: launchLibrary2.name, endpoint: launchLibrary2.endpoint,
      state: 'never_fetched',
      detail: 'Not contacted in archive mode. Run with --ll2 for current launches (network required; 15 requests/hour anonymous).',
      last_attempt: null, last_success: null, response_ms: null, record_count: 0, decommissioned: false,
    });

    const dates = kept.map((k) => k.normalized_payload.net).filter((d): d is string => d !== null).sort();
    snapshot = {
      meta: {
        schema_version: 1, generated_at: retrieved_at,
        is_live: true, data_kind: 'archive',
        provenance_note:
          `Real launch records from the archived r/SpaceX API v4, reassembled from six public mirrors ` +
          `(data/v4-mirror/SOURCES.md). Frozen: last launch ${dates[dates.length - 1]?.slice(0, 10) ?? '—'}. ` +
          `Every cross-collection id was verified to resolve. For launches after 2022, run with --ll2.`,
        sources: health, pipeline: reports,
        counts: {
          launch: kept.length, rocket: r.rockets.length, booster: r.boosters.length,
          payload: r.payloads.length, launchpad: r.launchpads.length,
        },
        window: { from: dates[0] ?? null, to: dates[dates.length - 1] ?? null },
      },
      launches: kept, rockets: r.rockets, boosters: r.boosters,
      payloads: r.payloads, launchpads: r.launchpads,
    };
  } else {
    /* ── fixture or LL2 live: the launch-nested path ─────────────────────── */
    let raw: RawRecord[] = [];
    let sourceName: string;
    let sourceUrl: string;

    if (FIXTURE) {
      raw = buildFixture();
      sourceName = 'FIXTURE GENERATOR (synthetic — not real data)';
      sourceUrl = 'local://scripts/ingest.ts#buildFixture';
      health.push({
        id: 'fixture', name: sourceName, endpoint: sourceUrl, state: 'offline',
        detail: 'Synthetic records generated locally for interface development. Every field is flagged FIXTURE. Run `npm run ingest` for the real archive.',
        last_attempt: retrieved_at, last_success: retrieved_at, response_ms: 0,
        record_count: raw.length, decommissioned: false,
      });
      console.log(`  generated ${raw.length} synthetic launch records`);
    } else {
      const base = DEV ? launchLibrary2.endpoint.replace('//ll.', '//lldev.') : launchLibrary2.endpoint;
      sourceName = launchLibrary2.name + (DEV ? ' [dev mirror — stale]' : '');
      sourceUrl = base;
      const ctx: FetchContext = {
        get: (url) => getJson(DEV ? url.replace('//ll.', '//lldev.') : url),
        log: (m) => console.log(m), days: DAYS, max: MAX,
      };
      const attempt = new Date().toISOString();
      try {
        const result = await launchLibrary2.fetchAll(ctx);
        raw = result.records;
        health.push({
          id: launchLibrary2.id, name: sourceName, endpoint: base,
          state: DEV ? 'stale' : 'online',
          detail: DEV ? 'Dev mirror: unmetered but serves a frozen dataset. Not for production reporting.'
                      : `Responded in ${result.response_ms ?? 0}ms across ${result.pages} page(s).`,
          last_attempt: attempt, last_success: new Date().toISOString(),
          response_ms: result.response_ms, record_count: raw.length, decommissioned: false,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`\n  FETCH FAILED: ${msg}\n`);
        console.error('  Nothing written. The existing snapshot is untouched.');
        console.error('  The pinned archive needs no network: npm run ingest\n');
        process.exit(1);
      }
    }

    reports.push({ step: 'fetch', detail: `Retrieved from ${sourceName}`, in_count: raw.length, out_count: raw.length, dropped: 0 });
    const nctx: NormalizeContext = { source: sourceName, source_url: sourceUrl, retrieved_at, fixture: FIXTURE };
    const normalized = raw.map((r) => normalizeLaunch(r, nctx)).filter((e): e is NonNullable<typeof e> => e !== null);
    reports.push({
      step: 'normalize', detail: 'Raw payloads mapped to typed Launch entities. Records missing id or name dropped.',
      in_count: raw.length, out_count: normalized.length, dropped: raw.length - normalized.length,
    });
    const { kept, dropped, reports: vreports } = validateLaunches(normalized);
    reports.push(...vreports);
    const rockets = projectRockets(kept, nctx);
    const boosters = projectBoosters(kept, nctx);
    const launchpads = projectLaunchpads(kept, nctx);
    const payloads = projectPayloads(kept, nctx);
    reports.push({
      step: 'project',
      detail: 'Rockets, boosters, pads and payloads projected out of the launch payloads. LL2 nests them rather than exposing separate collections.',
      in_count: kept.length, out_count: rockets.length + boosters.length + launchpads.length + payloads.length, dropped: 0,
    });
    if (dropped.length) { console.log('\n  DROPPED'); for (const d of dropped.slice(0, 10)) console.log(`    ${d.id}  ${d.reason}`); }

    const dates = kept.map((k) => k.normalized_payload.net).filter((d): d is string => d !== null).sort();
    snapshot = {
      meta: {
        schema_version: 1, generated_at: retrieved_at,
        is_live: !FIXTURE, data_kind: FIXTURE ? 'fixture' : 'live',
        provenance_note: FIXTURE
          ? 'SYNTHETIC FIXTURE DATA. These records were generated locally to develop and demonstrate the interface. They are not real launches. Run `npm run ingest` for the real archive.'
          : `Live records from ${sourceName}, retrieved ${retrieved_at}.` + (DEV ? ' Dev mirror was used — dataset is stale by design.' : ''),
        sources: health, pipeline: reports,
        counts: { launch: kept.length, rocket: rockets.length, booster: boosters.length, payload: payloads.length, launchpad: launchpads.length },
        window: { from: dates[0] ?? null, to: dates[dates.length - 1] ?? null },
      },
      launches: kept, rockets, boosters, payloads, launchpads,
    };
  }

  // Declared-dead sources always appear, so System Status can explain them.
  for (const c of CONNECTORS.filter((x) => x.decommissioned)) {
    snapshot.meta.sources.push({
      id: c.id, name: c.name, endpoint: c.endpoint, state: 'offline',
      detail: c.decommission_note ?? 'Decommissioned.',
      last_attempt: null, last_success: null, response_ms: null, record_count: 0, decommissioned: true,
    });
  }

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(snapshot), 'utf8');

  console.log('\n  PIPELINE');
  for (const r of snapshot.meta.pipeline) {
    const drop = r.dropped > 0 ? `  (-${r.dropped})` : '';
    console.log(`    ${r.step.padEnd(24)} ${String(r.in_count).padStart(5)} → ${String(r.out_count).padStart(5)}${drop}`);
  }
  console.log('\n  COUNTS');
  for (const [k, v] of Object.entries(snapshot.meta.counts)) console.log(`    ${k.padEnd(12)} ${String(v).padStart(5)}`);
  console.log(`\n  window    ${snapshot.meta.window.from?.slice(0, 10)} → ${snapshot.meta.window.to?.slice(0, 10)}`);
  console.log(`  kind      ${snapshot.meta.data_kind}`);
  console.log(`  written   public/snapshot.json in ${Date.now() - started}ms\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
