/**
 * Normalization for the r/SpaceX API v4 shape.
 *
 * v4 stored each entity in its own collection and joined by Mongo ObjectId, so
 * unlike the LL2 path — where everything is nested inside the launch payload —
 * this normalizer receives all six collections and resolves ids across them.
 * The join is checked, not assumed: a launch pointing at a rocket id that is
 * not in the rockets collection keeps the id and gets a `missing` name rather
 * than a guessed one.
 *
 * Same rules as pipeline.ts: a field the source did not carry is `null` with
 * quality `missing`; anything we compute is `derived`; anything the source
 * carried is `source_provided`, including `flight_number`, which here is the
 * operator's own numbering rather than our snapshot index.
 */

import { asBool, asNumber, asString, dig } from './connectors.ts';
import type {
  Booster, Launch, LandingOutcome, Launchpad, MissionOutcome, Payload,
  QualityMap, RecordEnvelope, Rocket,
} from './types.ts';
import type { NormalizeContext } from './pipeline.ts';

export interface V4Collections {
  launches: unknown[];
  rockets: unknown[];
  cores: unknown[];
  launchpads: unknown[];
  landpads: unknown[];
  payloads: unknown[];
}

const idOf = (o: unknown): string | null => asString(dig(o, 'id'));

function index(rows: unknown[]): Map<string, unknown> {
  const m = new Map<string, unknown>();
  for (const r of rows) { const id = idOf(r); if (id) m.set(id, r); }
  return m;
}

function qualityOf(obj: Record<string, unknown>): QualityMap {
  const q: QualityMap = {};
  for (const [k, v] of Object.entries(obj)) {
    const empty = v === null || v === undefined || (Array.isArray(v) && v.length === 0);
    q[k] = empty ? 'missing' : 'source_provided';
  }
  return q;
}

function mapOutcome(success: boolean | null, upcoming: boolean | null): MissionOutcome {
  if (success === true) return 'success';
  if (success === false) return 'failure';
  return upcoming ? 'scheduled' : 'unknown';
}

function mapLanding(attempt: boolean | null, success: boolean | null): LandingOutcome {
  if (attempt === false) return 'not_attempted';
  if (success === true) return 'success';
  if (success === false) return 'failure';
  return 'unknown';
}

export interface V4Result {
  launches: RecordEnvelope<Launch>[];
  rockets: RecordEnvelope<Rocket>[];
  boosters: RecordEnvelope<Booster>[];
  launchpads: RecordEnvelope<Launchpad>[];
  payloads: RecordEnvelope<Payload>[];
  /** Foreign keys that did not resolve, for the ingest report. */
  unresolved: { kind: string; id: string; launch: string }[];
}

export function normalizeV4(c: V4Collections, ctx: NormalizeContext): V4Result {
  const rockets = index(c.rockets);
  const cores = index(c.cores);
  const pads = index(c.launchpads);
  const landpads = index(c.landpads);
  const payloads = index(c.payloads);
  const unresolved: V4Result['unresolved'] = [];

  const env = <T>(entity: RecordEnvelope<T>['entity_type'], id: string, raw: unknown,
                  payload: T, q: QualityMap, updated: string | null): RecordEnvelope<T> => ({
    record_id: id, entity_type: entity, source: ctx.source, source_url: ctx.source_url,
    retrieved_at: ctx.retrieved_at, last_updated: updated, raw_payload: raw,
    normalized_payload: payload, data_quality: q,
  });

  /* ── launches ── */
  const launches: RecordEnvelope<Launch>[] = [];
  for (const raw of c.launches) {
    const id = idOf(raw);
    const name = asString(dig(raw, 'name'));
    if (!id || !name) continue;

    const rocketId = asString(dig(raw, 'rocket'));
    const padId = asString(dig(raw, 'launchpad'));
    const rocket = rocketId ? rockets.get(rocketId) : undefined;
    const pad = padId ? pads.get(padId) : undefined;
    if (rocketId && !rocket) unresolved.push({ kind: 'rocket', id: rocketId, launch: id });
    if (padId && !pad) unresolved.push({ kind: 'launchpad', id: padId, launch: id });

    const coreList = Array.isArray(dig(raw, 'cores')) ? (dig(raw, 'cores') as unknown[]) : [];
    const serials: string[] = [];
    for (const ce of coreList) {
      const cid = asString(dig(ce, 'core'));
      if (!cid) continue;
      const core = cores.get(cid);
      const serial = asString(dig(core, 'serial'));
      if (serial) serials.push(serial);
      else unresolved.push({ kind: 'core', id: cid, launch: id });
    }
    const first = coreList[0];
    const landingAttempt = asBool(dig(first, 'landing_attempt'));
    const landingSuccess = asBool(dig(first, 'landing_success'));
    const landpadId = asString(dig(first, 'landpad'));
    const landpad = landpadId ? landpads.get(landpadId) : undefined;
    if (landpadId && !landpad) unresolved.push({ kind: 'landpad', id: landpadId, launch: id });

    const payloadIds = (Array.isArray(dig(raw, 'payloads')) ? (dig(raw, 'payloads') as unknown[]) : [])
      .map((p) => asString(p)).filter((p): p is string => p !== null);
    for (const pid of payloadIds) if (!payloads.has(pid)) unresolved.push({ kind: 'payload', id: pid, launch: id });

    const net = asString(dig(raw, 'date_utc'));
    const windowS = asNumber(dig(raw, 'window'));
    const precision = asString(dig(raw, 'date_precision'));
    const upcoming = asBool(dig(raw, 'upcoming'));
    const failures = Array.isArray(dig(raw, 'failures')) ? (dig(raw, 'failures') as unknown[]) : [];

    const launch: Launch = {
      id, name,
      flight_number: asNumber(dig(raw, 'flight_number')),
      net, date_utc: net,
      date_precise: precision === 'day' || precision === 'hour',
      window_start: net,
      window_end: net && windowS !== null ? new Date(new Date(net).getTime() + windowS * 1000).toISOString() : null,
      rocket_id: rocketId,
      rocket_name: asString(dig(rocket, 'name')),
      booster_ids: serials,
      launchpad_id: padId,
      launchpad_name: asString(dig(pad, 'name')),
      payload_ids: payloadIds,
      // Orbit lives on the payload in v4; the launch inherits its primary payload's.
      orbit: payloadIds.length ? asString(dig(payloads.get(payloadIds[0]!), 'orbit')) : null,
      outcome: mapOutcome(asBool(dig(raw, 'success')), upcoming),
      outcome_raw: dig(raw, 'success') === null ? null : String(dig(raw, 'success')),
      landing_attempt: landingAttempt,
      landing_outcome: mapLanding(landingAttempt, landingSuccess),
      landing_zone: asString(dig(landpad, 'name')) ?? asString(dig(first, 'landing_type')),
      description: asString(dig(raw, 'details')),
      patch_url: asString(dig(raw, 'links', 'patch', 'small')),
      webcast_url: asString(dig(raw, 'links', 'webcast')),
      article_url: asString(dig(raw, 'links', 'article')),
      wiki_url: asString(dig(raw, 'links', 'wikipedia')),
      image_url: (() => { const f = dig(raw, 'links', 'flickr', 'original'); return Array.isArray(f) ? asString(f[0]) : null; })(),
      upcoming: upcoming ?? false,
      failure_reason: asString(dig(failures[0], 'reason')),
      failure_time_s: asNumber(dig(failures[0], 'time')),
    };

    const q = qualityOf(launch as unknown as Record<string, unknown>);
    for (const k of ['outcome', 'landing_outcome', 'window_end', 'orbit', 'rocket_name', 'launchpad_name', 'landing_zone']) {
      if (launch[k as keyof Launch] !== null) q[k] = 'derived';
    }
    q.flight_number = launch.flight_number === null ? 'missing' : 'source_provided';
    if (ctx.fixture) for (const k of Object.keys(q)) q[k] = 'fixture';

    launches.push(env('launch', id, raw, launch, q, null));
  }

  const inWindow = new Set(launches.map((l) => l.record_id));

  /* ── rockets ── */
  const rocketsOut: RecordEnvelope<Rocket>[] = [];
  for (const raw of c.rockets) {
    const id = idOf(raw); const name = asString(dig(raw, 'name'));
    if (!id || !name) continue;
    const weights = Array.isArray(dig(raw, 'payload_weights')) ? (dig(raw, 'payload_weights') as unknown[]) : [];
    const w = (code: string) => asNumber(dig(weights.find((x) => asString(dig(x, 'id')) === code), 'kg'));
    const imgs = dig(raw, 'flickr_images');
    const r: Rocket = {
      id, name,
      family: null, variant: null, full_name: name,
      active: asBool(dig(raw, 'active')),
      description: asString(dig(raw, 'description')),
      stages: asNumber(dig(raw, 'stages')),
      boosters: asNumber(dig(raw, 'boosters')),
      height_m: asNumber(dig(raw, 'height', 'meters')),
      diameter_m: asNumber(dig(raw, 'diameter', 'meters')),
      mass_kg: asNumber(dig(raw, 'mass', 'kg')),
      payload_leo_kg: w('leo'),
      payload_gto_kg: w('gto'),
      reusable: asBool(dig(raw, 'first_stage', 'reusable')),
      first_flight: asString(dig(raw, 'first_flight')),
      image_url: Array.isArray(imgs) ? asString(imgs[0]) : null,
      wiki_url: asString(dig(raw, 'wikipedia')),
    };
    rocketsOut.push(env('rocket', id, raw, r, qualityOf(r as unknown as Record<string, unknown>), null));
  }

  /* ── boosters: one per core the window actually references ── */
  const perSerial = new Map<string, { raw: unknown; flights: { id: string; net: string | null; attempt: boolean | null; success: boolean | null }[] }>();
  for (const le of launches) {
    const raw = le.raw_payload;
    const coreList = Array.isArray(dig(raw, 'cores')) ? (dig(raw, 'cores') as unknown[]) : [];
    for (const ce of coreList) {
      const cid = asString(dig(ce, 'core')); if (!cid) continue;
      const core = cores.get(cid); const serial = asString(dig(core, 'serial')); if (!serial) continue;
      if (!perSerial.has(serial)) perSerial.set(serial, { raw: core, flights: [] });
      perSerial.get(serial)!.flights.push({
        id: le.record_id, net: le.normalized_payload.net,
        attempt: asBool(dig(ce, 'landing_attempt')), success: asBool(dig(ce, 'landing_success')),
      });
    }
  }
  const boostersOut: RecordEnvelope<Booster>[] = [];
  for (const [serial, { raw, flights }] of perSerial) {
    const dated = flights.filter((f) => f.net).sort((a, b) => (a.net! < b.net! ? -1 : 1));
    const b: Booster = {
      id: serial, serial,
      flight_count: flights.length,
      landing_attempts: flights.filter((f) => f.attempt === true).length,
      landing_successes: flights.filter((f) => f.success === true).length,
      first_flight: dated[0]?.net ?? null,
      last_flight: dated[dated.length - 1]?.net ?? null,
      status: asString(dig(raw, 'status')),
      reused: flights.length > 1,
      launch_ids: flights.map((f) => f.id),
    };
    const q = qualityOf(b as unknown as Record<string, unknown>);
    for (const k of ['flight_count', 'landing_attempts', 'landing_successes', 'first_flight', 'last_flight', 'reused', 'launch_ids']) q[k] = 'derived';
    boostersOut.push(env('booster', serial, raw, b, q, asString(dig(raw, 'last_update'))));
  }

  /* ── launchpads ── */
  const padsOut: RecordEnvelope<Launchpad>[] = [];
  for (const raw of c.launchpads) {
    const id = idOf(raw); const name = asString(dig(raw, 'name'));
    if (!id || !name) continue;
    const mine = launches.filter((l) => l.normalized_payload.launchpad_id === id);
    const p: Launchpad = {
      id, name,
      full_name: asString(dig(raw, 'full_name')),
      locality: asString(dig(raw, 'locality')),
      region: asString(dig(raw, 'region')),
      country: null,
      latitude: asNumber(dig(raw, 'latitude')),
      longitude: asNumber(dig(raw, 'longitude')),
      status: asString(dig(raw, 'status')),
      launch_attempts: asNumber(dig(raw, 'launch_attempts')),
      launch_successes: asNumber(dig(raw, 'launch_successes')),
      rocket_ids: [...new Set(mine.map((l) => l.normalized_payload.rocket_id).filter((x): x is string => !!x))],
      launch_ids: mine.map((l) => l.record_id),
    };
    const q = qualityOf(p as unknown as Record<string, unknown>);
    q.rocket_ids = 'derived'; q.launch_ids = 'derived';
    padsOut.push(env('launchpad', id, raw, p, q, null));
  }

  /* ── payloads: only those a launch in the window references ── */
  const payloadsOut: RecordEnvelope<Payload>[] = [];
  for (const raw of c.payloads) {
    const id = idOf(raw); const name = asString(dig(raw, 'name'));
    if (!id || !name) continue;
    const launchId = asString(dig(raw, 'launch'));
    if (!launchId || !inWindow.has(launchId)) continue;
    const strs = (k: string) => (Array.isArray(dig(raw, k)) ? (dig(raw, k) as unknown[]) : [])
      .map((x) => asString(x)).filter((x): x is string => x !== null);
    const p: Payload = {
      id, name,
      type: asString(dig(raw, 'type')),
      customers: strs('customers'),
      nationalities: strs('nationalities'),
      manufacturers: strs('manufacturers'),
      mass_kg: asNumber(dig(raw, 'mass_kg')),
      orbit: asString(dig(raw, 'orbit')),
      launch_id: launchId,
      reused: asBool(dig(raw, 'reused')),
    };
    payloadsOut.push(env('payload', id, raw, p, qualityOf(p as unknown as Record<string, unknown>), null));
  }

  return { launches, rockets: rocketsOut, boosters: boostersOut, launchpads: padsOut, payloads: payloadsOut, unresolved };
}
