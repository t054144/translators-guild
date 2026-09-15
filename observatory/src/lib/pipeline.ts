/**
 * Normalization + validation.
 *
 * Raw payloads in, typed envelopes out. Two rules hold throughout:
 *
 *  1. A field the source did not provide becomes `null` with quality `missing`.
 *     It never becomes 0, "", "Unknown" or a plausible-looking guess. Downstream
 *     code distinguishes "zero landings" from "landing data not published", and
 *     it can only do that if this layer refuses to blur them.
 *
 *  2. Anything this layer computes is marked `derived`, with the formula written
 *     down where the UI can show it. Derived is not a lesser kind of true — it
 *     just has to be auditable.
 */

import {
  asBool,
  asNumber,
  asString,
  dig,
  type RawRecord,
} from './connectors.ts';
import type {
  Booster,
  IngestReport,
  Launch,
  LandingOutcome,
  Launchpad,
  MissionOutcome,
  Payload,
  QualityMap,
  RecordEnvelope,
  Rocket,
} from './types.ts';

/* ── status mapping ──────────────────────────────────────────────────────── */

const OUTCOME_MAP: Record<string, MissionOutcome> = {
  success: 'success',
  'launch successful': 'success',
  failure: 'failure',
  'launch failure': 'failure',
  'partial failure': 'partial_failure',
  'launch was a partial failure': 'partial_failure',
  go: 'scheduled',
  'go for launch': 'scheduled',
  tbd: 'scheduled',
  'to be determined': 'scheduled',
  tbc: 'scheduled',
  'to be confirmed': 'scheduled',
  hold: 'scheduled',
  'on hold': 'scheduled',
  'in flight': 'scheduled',
  'launch in flight': 'scheduled',
};

/** Unrecognised codes become `unknown` and are reported, never coerced to success. */
export function mapOutcome(raw: string | null): MissionOutcome {
  if (!raw) return 'unknown';
  return OUTCOME_MAP[raw.trim().toLowerCase()] ?? 'unknown';
}

function mapLanding(attempt: boolean | null, success: boolean | null): LandingOutcome {
  if (attempt === false) return 'not_attempted';
  if (success === true) return 'success';
  if (success === false) return 'failure';
  return 'unknown';
}

/* ── envelope helper ─────────────────────────────────────────────────────── */

interface EnvelopeInput<T> {
  record_id: string;
  entity_type: RecordEnvelope<T>['entity_type'];
  source: string;
  source_url: string;
  retrieved_at: string;
  last_updated: string | null;
  raw_payload: unknown;
  normalized_payload: T;
  data_quality: QualityMap;
}

const envelope = <T>(input: EnvelopeInput<T>): RecordEnvelope<T> => ({ ...input });

/**
 * Mark every key of a normalized object: present -> `present`, absent -> missing.
 * Callers then override the handful of fields that deserve a stronger claim.
 */
function qualityOf(obj: Record<string, unknown>, present: QualityMap[string]): QualityMap {
  const q: QualityMap = {};
  for (const [k, v] of Object.entries(obj)) {
    const empty = v === null || v === undefined || (Array.isArray(v) && v.length === 0);
    q[k] = empty ? 'missing' : present;
  }
  return q;
}

/* ── launches ────────────────────────────────────────────────────────────── */

export interface NormalizeContext {
  source: string;
  source_url: string;
  retrieved_at: string;
  /** Set for fixture data so every envelope self-identifies as non-real. */
  fixture?: boolean;
}

export function normalizeLaunch(raw: RawRecord, ctx: NormalizeContext): RecordEnvelope<Launch> | null {
  const p = raw.payload;
  const id = asString(dig(p, 'id')) ?? raw.record_id;
  const name = asString(dig(p, 'name'));
  if (!id || !name) return null;

  const net = asString(dig(p, 'net'));
  const statusRaw =
    asString(dig(p, 'status', 'abbrev')) ?? asString(dig(p, 'status', 'name'));

  // LL2 nests the first stage under rocket.launcher_stage[]. A launch may have
  // several (Falcon Heavy has three), so we collect all serials.
  const stages = dig(p, 'rocket', 'launcher_stage');
  const stageList = Array.isArray(stages) ? stages : [];
  const boosterIds = stageList
    .map((s) => asString(dig(s, 'launcher', 'serial_number')))
    .filter((s): s is string => s !== null);

  const firstStage = stageList[0] ?? null;
  const landingAttempt = asBool(dig(firstStage, 'landing', 'attempt'));
  const landingSuccess = asBool(dig(firstStage, 'landing', 'success'));

  const missionName = asString(dig(p, 'mission', 'name'));
  const orbit =
    asString(dig(p, 'mission', 'orbit', 'name')) ?? asString(dig(p, 'mission', 'orbit', 'abbrev'));

  const patches = dig(p, 'mission_patches');
  const patch = Array.isArray(patches) ? asString(dig(patches[0], 'image_url')) : null;

  const vids = dig(p, 'vid_urls') ?? dig(p, 'vidURLs');
  const webcast = Array.isArray(vids) ? asString(dig(vids[0], 'url')) : null;

  const infos = dig(p, 'info_urls') ?? dig(p, 'infoURLs');
  const article = Array.isArray(infos) ? asString(dig(infos[0], 'url')) : null;

  const payload: Launch = {
    id,
    name,
    // Assigned after the full set is known — a per-record view cannot know it.
    flight_number: null,
    net,
    date_utc: net,
    date_precise: asString(dig(p, 'net_precision', 'name'))?.toLowerCase() === 'day' || net !== null,
    window_start: asString(dig(p, 'window_start')),
    window_end: asString(dig(p, 'window_end')),
    rocket_id: asString(dig(p, 'rocket', 'configuration', 'id')),
    rocket_name:
      asString(dig(p, 'rocket', 'configuration', 'name')) ??
      asString(dig(p, 'rocket', 'configuration', 'full_name')),
    booster_ids: boosterIds,
    launchpad_id: asString(dig(p, 'pad', 'id')),
    launchpad_name: asString(dig(p, 'pad', 'name')),
    payload_ids: missionName ? [`${id}:payload`] : [],
    orbit,
    outcome: mapOutcome(statusRaw),
    outcome_raw: statusRaw,
    landing_attempt: landingAttempt,
    landing_outcome: mapLanding(landingAttempt, landingSuccess),
    landing_zone:
      asString(dig(firstStage, 'landing', 'location', 'abbrev')) ??
      asString(dig(firstStage, 'landing', 'location', 'name')),
    description: asString(dig(p, 'mission', 'description')),
    patch_url: patch,
    webcast_url: webcast,
    article_url: article,
    wiki_url: asString(dig(p, 'pad', 'wiki_url')),
    image_url: asString(dig(p, 'image', 'image_url')) ?? asString(dig(p, 'image')),
    upcoming: net ? new Date(net).getTime() > Date.now() : false,
    failure_reason: asString(dig(p, 'failreason')),
    failure_time_s: null,
  };

  const q = qualityOf(payload as unknown as Record<string, unknown>,
    ctx.fixture ? 'fixture' : 'source_provided');
  q.outcome = ctx.fixture ? 'fixture' : 'derived';
  q.landing_outcome = ctx.fixture ? 'fixture' : 'derived';
  q.flight_number = 'derived';
  q.upcoming = 'derived';

  return envelope<Launch>({
    record_id: id,
    entity_type: 'launch',
    source: ctx.source,
    source_url: ctx.source_url,
    retrieved_at: ctx.retrieved_at,
    last_updated: raw.last_updated,
    raw_payload: p,
    normalized_payload: payload,
    data_quality: q,
  });
}

/* ── entities derived from the launch payloads ───────────────────────────── */

/**
 * LL2 returns rockets, pads and boosters nested inside each launch rather than
 * as separate collections, so we project them out. Each projected record keeps
 * the launch payload it came from as `raw_payload`, which is what lets the Data
 * Explorer show the exact bytes behind a booster's flight count.
 */
export function projectRockets(
  launches: RecordEnvelope<Launch>[],
  ctx: NormalizeContext,
): RecordEnvelope<Rocket>[] {
  const byId = new Map<string, RecordEnvelope<Rocket>>();

  for (const env of launches) {
    const cfg = dig(env.raw_payload, 'rocket', 'configuration');
    const id = asString(dig(cfg, 'id'));
    if (!id || byId.has(id)) continue;

    const payload: Rocket = {
      id,
      name: asString(dig(cfg, 'name')) ?? 'Unnamed',
      family: asString(dig(cfg, 'family')),
      variant: asString(dig(cfg, 'variant')),
      full_name: asString(dig(cfg, 'full_name')),
      active: asBool(dig(cfg, 'active')),
      description: asString(dig(cfg, 'description')),
      stages: asNumber(dig(cfg, 'max_stage')),
      boosters: asNumber(dig(cfg, 'to_thrust')) !== null ? null : null,
      height_m: asNumber(dig(cfg, 'length')),
      diameter_m: asNumber(dig(cfg, 'diameter')),
      mass_kg: asNumber(dig(cfg, 'launch_mass')) !== null
        ? (asNumber(dig(cfg, 'launch_mass')) as number) * 1000
        : null,
      payload_leo_kg: asNumber(dig(cfg, 'leo_capacity')),
      payload_gto_kg: asNumber(dig(cfg, 'gto_capacity')),
      reusable: asBool(dig(cfg, 'reusable')),
      first_flight: asString(dig(cfg, 'maiden_flight')),
      image_url: asString(dig(cfg, 'image_url')) ?? asString(dig(cfg, 'image', 'image_url')),
      wiki_url: asString(dig(cfg, 'wiki_url')),
    };

    const q = qualityOf(payload as unknown as Record<string, unknown>,
      ctx.fixture ? 'fixture' : 'source_provided');
    // launch_mass arrives in tonnes; the conversion is ours, so say so.
    if (payload.mass_kg !== null) q.mass_kg = 'derived';

    byId.set(id, envelope<Rocket>({
      record_id: id,
      entity_type: 'rocket',
      source: ctx.source,
      source_url: ctx.source_url,
      retrieved_at: ctx.retrieved_at,
      last_updated: env.last_updated,
      raw_payload: cfg,
      normalized_payload: payload,
      data_quality: q,
    }));
  }

  return [...byId.values()];
}

export function projectBoosters(
  launches: RecordEnvelope<Launch>[],
  ctx: NormalizeContext,
): RecordEnvelope<Booster>[] {
  interface Acc {
    serial: string;
    launches: { id: string; date: string | null; attempt: boolean | null; success: boolean | null }[];
    status: string | null;
    raw: unknown;
  }
  const acc = new Map<string, Acc>();

  for (const env of launches) {
    const stages = dig(env.raw_payload, 'rocket', 'launcher_stage');
    if (!Array.isArray(stages)) continue;

    for (const st of stages) {
      const serial = asString(dig(st, 'launcher', 'serial_number'));
      if (!serial) continue;
      if (!acc.has(serial)) {
        acc.set(serial, {
          serial,
          launches: [],
          status: asString(dig(st, 'launcher', 'status', 'name')) ?? asString(dig(st, 'launcher', 'status')),
          raw: dig(st, 'launcher'),
        });
      }
      acc.get(serial)!.launches.push({
        id: env.normalized_payload.id,
        date: env.normalized_payload.net,
        attempt: asBool(dig(st, 'landing', 'attempt')),
        success: asBool(dig(st, 'landing', 'success')),
      });
    }
  }

  return [...acc.values()].map((a) => {
    const dated = a.launches
      .filter((l) => l.date)
      .sort((x, y) => (x.date! < y.date! ? -1 : 1));

    const payload: Booster = {
      id: a.serial,
      serial: a.serial,
      // Counts are over *this dataset's window*, not the booster's whole life.
      // The UI says so wherever these appear.
      flight_count: a.launches.length,
      landing_attempts: a.launches.filter((l) => l.attempt === true).length,
      landing_successes: a.launches.filter((l) => l.success === true).length,
      first_flight: dated[0]?.date ?? null,
      last_flight: dated[dated.length - 1]?.date ?? null,
      status: a.status,
      reused: a.launches.length > 1,
      launch_ids: a.launches.map((l) => l.id),
    };

    const q = qualityOf(payload as unknown as Record<string, unknown>,
      ctx.fixture ? 'fixture' : 'source_provided');
    for (const k of ['flight_count', 'landing_attempts', 'landing_successes',
                     'first_flight', 'last_flight', 'reused']) {
      q[k] = ctx.fixture ? 'fixture' : 'derived';
    }

    return envelope<Booster>({
      record_id: a.serial,
      entity_type: 'booster',
      source: ctx.source,
      source_url: ctx.source_url,
      retrieved_at: ctx.retrieved_at,
      last_updated: null,
      raw_payload: a.raw,
      normalized_payload: payload,
      data_quality: q,
    });
  });
}

export function projectLaunchpads(
  launches: RecordEnvelope<Launch>[],
  ctx: NormalizeContext,
): RecordEnvelope<Launchpad>[] {
  const byId = new Map<string, RecordEnvelope<Launchpad>>();
  const tally = new Map<string, { ids: string[]; rockets: Set<string>; ok: number }>();

  for (const env of launches) {
    const pad = dig(env.raw_payload, 'pad');
    const id = asString(dig(pad, 'id'));
    if (!id) continue;

    if (!tally.has(id)) tally.set(id, { ids: [], rockets: new Set(), ok: 0 });
    const t = tally.get(id)!;
    t.ids.push(env.normalized_payload.id);
    if (env.normalized_payload.rocket_id) t.rockets.add(env.normalized_payload.rocket_id);
    if (env.normalized_payload.outcome === 'success') t.ok += 1;

    if (!byId.has(id)) {
      const payload: Launchpad = {
        id,
        name: asString(dig(pad, 'name')) ?? 'Unnamed pad',
        full_name: asString(dig(pad, 'name')),
        locality: asString(dig(pad, 'location', 'name')),
        region: asString(dig(pad, 'location', 'name')),
        country:
          asString(dig(pad, 'country', 'name')) ??
          asString(dig(pad, 'location', 'country', 'name')) ??
          asString(dig(pad, 'location', 'country_code')),
        latitude: asNumber(dig(pad, 'latitude')),
        longitude: asNumber(dig(pad, 'longitude')),
        status: asString(dig(pad, 'active')) ,
        launch_attempts: asNumber(dig(pad, 'total_launch_count')),
        launch_successes: null,
        rocket_ids: [],
        launch_ids: [],
      };

      byId.set(id, envelope<Launchpad>({
        record_id: id,
        entity_type: 'launchpad',
        source: ctx.source,
        source_url: ctx.source_url,
        retrieved_at: ctx.retrieved_at,
        last_updated: env.last_updated,
        raw_payload: pad,
        normalized_payload: payload,
        data_quality: qualityOf(payload as unknown as Record<string, unknown>,
          ctx.fixture ? 'fixture' : 'source_provided'),
      }));
    }
  }

  for (const [id, t] of tally) {
    const env = byId.get(id);
    if (!env) continue;
    env.normalized_payload.launch_ids = t.ids;
    env.normalized_payload.rocket_ids = [...t.rockets];
    env.normalized_payload.launch_successes = t.ok;
    env.data_quality.launch_ids = 'derived';
    env.data_quality.rocket_ids = 'derived';
    env.data_quality.launch_successes = 'derived';
  }

  return [...byId.values()];
}

/**
 * Payloads.
 *
 * Worth being blunt: LL2 does not expose per-payload records the way the old
 * SpaceX API did. What it gives is a mission name, type and orbit. So a payload
 * here is a projection of the mission, and `mass_kg` is `missing` almost
 * everywhere — not zero, and not a figure copied out of a press kit. The
 * Payload Intelligence section states this on the page rather than leaving a
 * user to wonder why a mass column is empty.
 */
export function projectPayloads(
  launches: RecordEnvelope<Launch>[],
  ctx: NormalizeContext,
): RecordEnvelope<Payload>[] {
  const out: RecordEnvelope<Payload>[] = [];

  for (const env of launches) {
    const mission = dig(env.raw_payload, 'mission');
    const name = asString(dig(mission, 'name'));
    if (!name) continue;

    const id = `${env.normalized_payload.id}:payload`;
    const payload: Payload = {
      id,
      name,
      type: asString(dig(mission, 'type')),
      customers: [asString(dig(env.raw_payload, 'launch_service_provider', 'name'))].filter(
        (s): s is string => s !== null,
      ),
      nationalities: [],
      manufacturers: [],
      mass_kg: asNumber(dig(mission, 'payload_mass')),
      orbit: env.normalized_payload.orbit,
      launch_id: env.normalized_payload.id,
      reused: null,
    };

    const q = qualityOf(payload as unknown as Record<string, unknown>,
      ctx.fixture ? 'fixture' : 'source_provided');
    q.id = 'derived';
    q.customers = 'derived';

    out.push(envelope<Payload>({
      record_id: id,
      entity_type: 'payload',
      source: ctx.source,
      source_url: ctx.source_url,
      retrieved_at: ctx.retrieved_at,
      last_updated: env.last_updated,
      raw_payload: mission,
      normalized_payload: payload,
      data_quality: q,
    }));
  }

  return out;
}

/* ── validation ──────────────────────────────────────────────────────────── */

export interface ValidationResult {
  kept: RecordEnvelope<Launch>[];
  dropped: { id: string; name: string; reason: string }[];
  reports: IngestReport[];
}

/**
 * Validation drops a record only when it cannot be placed on any axis the app
 * draws. Everything else is kept with a quality flag — a launch missing its
 * booster serial is still a launch.
 */
export function validateLaunches(rows: RecordEnvelope<Launch>[]): ValidationResult {
  const dropped: ValidationResult['dropped'] = [];
  const seen = new Set<string>();
  const reports: IngestReport[] = [];
  const before = rows.length;

  let noDate = 0;
  let dupes = 0;
  let unknownStatus = 0;

  const kept = rows.filter((env) => {
    const l = env.normalized_payload;

    if (seen.has(l.id)) {
      dropped.push({ id: l.id, name: l.name, reason: 'Duplicate record id' });
      dupes += 1;
      return false;
    }
    seen.add(l.id);

    if (!l.net || Number.isNaN(new Date(l.net).getTime())) {
      dropped.push({ id: l.id, name: l.name, reason: 'No parseable launch date' });
      noDate += 1;
      return false;
    }

    if (l.outcome === 'unknown' && l.outcome_raw) unknownStatus += 1;
    return true;
  });

  // Where the source numbered its own flights, that numbering is kept. Only a
  // record with no flight number receives a snapshot index, and is marked so.
  kept.sort((a, b) => (a.normalized_payload.net! < b.normalized_payload.net! ? -1 : 1));
  let filled = 0;
  kept.forEach((env, i) => {
    if (env.normalized_payload.flight_number === null) {
      env.normalized_payload.flight_number = i + 1;
      env.data_quality.flight_number = 'derived';
      filled += 1;
    }
  });

  reports.push({
    step: 'validate:duplicates',
    detail: 'Records sharing an id. First occurrence kept.',
    in_count: before,
    out_count: before - dupes,
    dropped: dupes,
  });
  reports.push({
    step: 'validate:dates',
    detail: 'Records with no parseable launch date cannot be placed on a time axis.',
    in_count: before - dupes,
    out_count: kept.length,
    dropped: noDate,
  });
  reports.push({
    step: 'validate:status',
    detail:
      `Outcome codes the mapping did not recognise, filed as UNKNOWN rather than ` +
      `assumed successful.`,
    in_count: kept.length,
    out_count: kept.length,
    dropped: 0,
  });
  if (unknownStatus > 0) {
    reports[reports.length - 1]!.detail += ` ${unknownStatus} affected.`;
  }
  reports.push({
    step: 'derive:flight_number',
    detail: filled === 0
      ? 'Source supplied a flight number on every record; none were assigned here.'
      : `${filled} record(s) had no source flight number and received a snapshot index by launch date.`,
    in_count: kept.length,
    out_count: kept.length,
    dropped: 0,
  });

  return { kept, dropped, reports };
}
