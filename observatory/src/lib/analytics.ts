/**
 * Analytics engine.
 *
 * Pure functions over a snapshot. No React, no fetching, no formatting for
 * display beyond what a metric's own definition requires.
 *
 * Every headline metric returns a `Metric`, which carries its value *and* the
 * lineage that produced it. The UI never computes a number inline — if a figure
 * appears on screen, it came from here, and the lineage panel can walk a user
 * from that figure back to the raw payload.
 */

import type {
  Booster,
  DataStatus,
  Launch,
  Launchpad,
  MetricLineage,
  Payload,
  RecordEnvelope,
  Rocket,
  Snapshot,
} from './types.ts';

/* ── filters ─────────────────────────────────────────────────────────────── */

export interface Filters {
  search: string;
  rocketId: string;
  padId: string;
  boosterId: string;
  outcome: string;
  orbit: string;
  landing: string;
  reuseOnly: boolean;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  rocketId: '',
  padId: '',
  boosterId: '',
  outcome: '',
  orbit: '',
  landing: '',
  reuseOnly: false,
  from: '',
  to: '',
};

export function applyFilters(launches: Launch[], f: Filters): Launch[] {
  const q = f.search.trim().toLowerCase();
  return launches.filter((l) => {
    if (f.rocketId && l.rocket_id !== f.rocketId) return false;
    if (f.padId && l.launchpad_id !== f.padId) return false;
    if (f.boosterId && !l.booster_ids.includes(f.boosterId)) return false;
    if (f.outcome && l.outcome !== f.outcome) return false;
    if (f.orbit && l.orbit !== f.orbit) return false;
    if (f.landing && l.landing_outcome !== f.landing) return false;
    if (f.reuseOnly && l.booster_ids.length === 0) return false;
    if (f.from && (!l.net || l.net.slice(0, 10) < f.from)) return false;
    if (f.to && (!l.net || l.net.slice(0, 10) > f.to)) return false;
    if (q) {
      const hay = [l.name, l.rocket_name, l.launchpad_name, l.orbit, ...l.booster_ids]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/* ── metric ──────────────────────────────────────────────────────────────── */

export interface Metric {
  key: string;
  label: string;
  /** Null means genuinely unavailable. The UI renders NOT PROVIDED, never 0. */
  value: number | null;
  display: string;
  unit: string | null;
  status: DataStatus;
  lineage: MetricLineage;
}

function metric(
  key: string,
  label: string,
  value: number | null,
  display: string,
  unit: string | null,
  status: DataStatus,
  formula: string,
  steps: MetricLineage['steps'],
): Metric {
  return {
    key,
    label,
    value,
    display,
    unit,
    status,
    lineage: { metric: label, value: display, status, formula, steps },
  };
}

const src = (snap: Snapshot): MetricLineage['steps'][number] => ({
  stage: 'source',
  label: snap.meta.sources[0]?.name ?? 'No source',
  detail: snap.meta.sources[0]?.endpoint ?? 'No endpoint recorded',
});

/* ── headline metrics ────────────────────────────────────────────────────── */

export function headlineMetrics(snap: Snapshot, launches: Launch[]): Metric[] {
  const total = launches.length;
  const known = launches.filter((l) => l.outcome !== 'unknown' && l.outcome !== 'scheduled');
  const ok = launches.filter((l) => l.outcome === 'success').length;
  const bad = launches.filter(
    (l) => l.outcome === 'failure' || l.outcome === 'partial_failure',
  ).length;

  const attempts = launches.filter((l) => l.landing_attempt === true).length;
  const landings = launches.filter((l) => l.landing_outcome === 'success').length;

  const boosterFlights = launches.reduce((s, l) => s + l.booster_ids.length, 0);

  const boosterTally = new Map<string, number>();
  for (const l of launches) for (const b of l.booster_ids) boosterTally.set(b, (boosterTally.get(b) ?? 0) + 1);
  const topBooster = [...boosterTally.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const padTally = new Map<string, number>();
  for (const l of launches) if (l.launchpad_name) padTally.set(l.launchpad_name, (padTally.get(l.launchpad_name) ?? 0) + 1);
  const topPad = [...padTally.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const orbitTally = new Map<string, number>();
  for (const l of launches) if (l.orbit) orbitTally.set(l.orbit, (orbitTally.get(l.orbit) ?? 0) + 1);
  const topOrbit = [...orbitTally.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;

  const payloads = launches.reduce((s, l) => s + l.payload_ids.length, 0);
  const fx = snap.meta.is_live ? null : ('fixture' as DataStatus);

  return [
    metric('total', 'TOTAL LAUNCHES', total, String(total), 'launches', fx ?? 'source_provided',
      'count of launch records passing validation and the active filters',
      [src(snap), { stage: 'raw', label: 'launch records', detail: `${snap.launches.length} in snapshot` },
       { stage: 'transform', label: 'filter', detail: `${snap.launches.length} → ${total} after filters` },
       { stage: 'metric', label: 'TOTAL LAUNCHES', detail: String(total) }]),

    metric('success', 'SUCCESSFUL', ok, String(ok), 'launches', fx ?? 'derived',
      'count where mapped outcome = success',
      [src(snap), { stage: 'raw', label: 'status.abbrev', detail: 'source status string per launch' },
       { stage: 'transform', label: 'mapOutcome()', detail: 'status string → enum; unrecognised → UNKNOWN' },
       { stage: 'metric', label: 'SUCCESSFUL', detail: String(ok) }]),

    metric('failure', 'FAILED', bad, String(bad), 'launches', fx ?? 'derived',
      'count where outcome = failure or partial_failure',
      [src(snap), { stage: 'raw', label: 'status.abbrev', detail: 'source status string per launch' },
       { stage: 'transform', label: 'mapOutcome()', detail: 'failure and partial failure counted together' },
       { stage: 'metric', label: 'FAILED', detail: String(bad) }]),

    metric('rate', 'SUCCESS RATE',
      known.length ? (ok / known.length) * 100 : null,
      known.length ? `${((ok / known.length) * 100).toFixed(1)}%` : 'NOT PROVIDED',
      '%', fx ?? 'derived',
      'successful launches ÷ launches with a known outcome. Scheduled and unknown excluded from the denominator, and the excluded count is shown beside it.',
      [src(snap), { stage: 'raw', label: 'outcomes', detail: `${launches.length} launches` },
       { stage: 'transform', label: 'exclude unresolved', detail: `${launches.length - known.length} scheduled/unknown removed from denominator` },
       { stage: 'metric', label: 'SUCCESS RATE', detail: known.length ? `${ok}/${known.length}` : 'no resolved launches' }]),

    metric('landings', 'BOOSTER LANDINGS', landings, String(landings), 'landings', fx ?? 'derived',
      'count where landing.success = true on the first stage',
      [src(snap), { stage: 'raw', label: 'rocket.launcher_stage[].landing', detail: 'attempt + success booleans' },
       { stage: 'transform', label: 'mapLanding()', detail: 'attempt=false → NOT ATTEMPTED; success absent → UNKNOWN' },
       { stage: 'metric', label: 'BOOSTER LANDINGS', detail: `${landings} of ${attempts} attempts` }]),

    metric('boosterFlights', 'BOOSTER FLIGHTS', boosterFlights, String(boosterFlights), 'flights', fx ?? 'derived',
      'sum of booster serials across launches — Falcon Heavy contributes three',
      [src(snap), { stage: 'raw', label: 'launcher_stage[]', detail: 'one entry per core' },
       { stage: 'transform', label: 'sum serials', detail: 'counts cores, not launches' },
       { stage: 'metric', label: 'BOOSTER FLIGHTS', detail: String(boosterFlights) }]),

    metric('topBooster', 'MOST USED BOOSTER', topBooster?.[1] ?? null,
      topBooster ? `${topBooster[0]}` : 'NOT PROVIDED',
      topBooster ? `${topBooster[1]} flights` : null, fx ?? 'derived',
      'booster serial with the highest flight count in this window',
      [src(snap), { stage: 'raw', label: 'launcher.serial_number', detail: 'per core, per launch' },
       { stage: 'transform', label: 'group + rank', detail: 'tally by serial, take max' },
       { stage: 'metric', label: 'MOST USED BOOSTER', detail: topBooster ? `${topBooster[0]} — ${topBooster[1]} flights` : 'no booster data' }]),

    metric('topPad', 'MOST USED LAUNCHPAD', topPad?.[1] ?? null,
      topPad ? topPad[0] : 'NOT PROVIDED',
      topPad ? `${topPad[1]} launches` : null, fx ?? 'derived',
      'launchpad with the highest launch count in this window',
      [src(snap), { stage: 'raw', label: 'pad.name', detail: 'per launch' },
       { stage: 'transform', label: 'group + rank', detail: 'tally by pad name' },
       { stage: 'metric', label: 'MOST USED LAUNCHPAD', detail: topPad ? `${topPad[0]} — ${topPad[1]}` : 'no pad data' }]),

    metric('payloads', 'PAYLOAD RECORDS', payloads, String(payloads), 'records', fx ?? 'derived',
      'one payload record projected per mission that names one',
      [src(snap), { stage: 'raw', label: 'mission.name', detail: 'LL2 has no per-payload collection' },
       { stage: 'transform', label: 'project', detail: 'mission → payload record; mass usually NOT PROVIDED' },
       { stage: 'metric', label: 'PAYLOAD RECORDS', detail: String(payloads) }]),

    metric('topOrbit', 'MOST FREQUENT ORBIT', topOrbit?.[1] ?? null,
      topOrbit ? topOrbit[0] : 'NOT PROVIDED',
      topOrbit ? `${topOrbit[1]} missions` : null, fx ?? 'derived',
      'destination orbit appearing most often',
      [src(snap), { stage: 'raw', label: 'mission.orbit.name', detail: 'per launch' },
       { stage: 'transform', label: 'group + rank', detail: 'tally by orbit name' },
       { stage: 'metric', label: 'MOST FREQUENT ORBIT', detail: topOrbit ? `${topOrbit[0]} — ${topOrbit[1]}` : 'no orbit data' }]),
  ];
}

/* ── series ──────────────────────────────────────────────────────────────── */

export interface Bucket {
  key: string;
  label: string;
  total: number;
  success: number;
  failure: number;
  landings: number;
}

export function byYear(launches: Launch[]): Bucket[] {
  const m = new Map<string, Bucket>();
  for (const l of launches) {
    if (!l.net) continue;
    const k = l.net.slice(0, 4);
    if (!m.has(k)) m.set(k, { key: k, label: k, total: 0, success: 0, failure: 0, landings: 0 });
    const b = m.get(k)!;
    b.total += 1;
    if (l.outcome === 'success') b.success += 1;
    if (l.outcome === 'failure' || l.outcome === 'partial_failure') b.failure += 1;
    if (l.landing_outcome === 'success') b.landings += 1;
  }
  return [...m.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

export function byMonth(launches: Launch[]): Bucket[] {
  const m = new Map<string, Bucket>();
  for (const l of launches) {
    if (!l.net) continue;
    const k = l.net.slice(0, 7);
    if (!m.has(k)) m.set(k, { key: k, label: k, total: 0, success: 0, failure: 0, landings: 0 });
    const b = m.get(k)!;
    b.total += 1;
    if (l.outcome === 'success') b.success += 1;
    if (l.outcome === 'failure' || l.outcome === 'partial_failure') b.failure += 1;
    if (l.landing_outcome === 'success') b.landings += 1;
  }
  return [...m.values()].sort((a, b) => (a.key < b.key ? -1 : 1));
}

export interface Ranked {
  key: string;
  label: string;
  count: number;
  success: number;
  share: number;
}

export function rankBy(launches: Launch[], pick: (l: Launch) => string | null): Ranked[] {
  const m = new Map<string, { count: number; success: number }>();
  for (const l of launches) {
    const k = pick(l);
    if (!k) continue;
    if (!m.has(k)) m.set(k, { count: 0, success: 0 });
    const e = m.get(k)!;
    e.count += 1;
    if (l.outcome === 'success') e.success += 1;
  }
  const total = launches.length || 1;
  return [...m.entries()]
    .map(([key, v]) => ({ key, label: key, count: v.count, success: v.success, share: (v.count / total) * 100 }))
    .sort((a, b) => b.count - a.count);
}

/* ── booster analytics ───────────────────────────────────────────────────── */

export interface BoosterProfile extends Booster {
  /** Mean days between consecutive flights. Null when fewer than two flights. */
  avg_turnaround_days: number | null;
  turnarounds: number[];
  missions: Launch[];
}

export function boosterProfiles(snap: Snapshot, launches: Launch[]): BoosterProfile[] {
  const byId = new Map(launches.map((l) => [l.id, l]));

  return snap.boosters
    .map((env) => env.normalized_payload)
    .map((b) => {
      const missions = b.launch_ids
        .map((id) => byId.get(id))
        .filter((l): l is Launch => l !== undefined)
        .sort((a, b2) => ((a.net ?? '') < (b2.net ?? '') ? -1 : 1));

      const turnarounds: number[] = [];
      for (let i = 1; i < missions.length; i += 1) {
        const prev = missions[i - 1]!.net;
        const cur = missions[i]!.net;
        if (prev && cur) {
          turnarounds.push((new Date(cur).getTime() - new Date(prev).getTime()) / 86_400_000);
        }
      }

      return {
        ...b,
        missions,
        turnarounds,
        avg_turnaround_days: turnarounds.length
          ? turnarounds.reduce((s, d) => s + d, 0) / turnarounds.length
          : null,
      };
    })
    .filter((b) => b.missions.length > 0)
    .sort((a, b) => b.missions.length - a.missions.length);
}

/* ── lookups ─────────────────────────────────────────────────────────────── */

export const indexById = <T extends { id: string }>(rows: RecordEnvelope<T>[]): Map<string, T> =>
  new Map(rows.map((r) => [r.normalized_payload.id, r.normalized_payload]));

export function rocketsOf(snap: Snapshot): Rocket[] {
  return snap.rockets.map((r) => r.normalized_payload);
}
export function padsOf(snap: Snapshot): Launchpad[] {
  return snap.launchpads.map((r) => r.normalized_payload);
}
export function payloadsOf(snap: Snapshot): Payload[] {
  return snap.payloads.map((r) => r.normalized_payload);
}
export function launchesOf(snap: Snapshot): Launch[] {
  return snap.launches.map((r) => r.normalized_payload);
}

/** Distinct, sorted, non-null values of one launch field — drives filter menus. */
export function distinct(launches: Launch[], pick: (l: Launch) => string | null): string[] {
  return [...new Set(launches.map(pick).filter((s): s is string => s !== null))].sort();
}

/* ── provenance label ────────────────────────────────────────────────────── */

import type { SnapshotMeta } from './types.ts';

/** The one word every badge uses for what the records are. */
export function dataKind(meta: SnapshotMeta): 'live' | 'archive' | 'fixture' {
  if (meta.data_kind) return meta.data_kind;
  return meta.is_live ? 'live' : 'fixture';
}
export function dataKindLabel(meta: SnapshotMeta): string {
  const k = dataKind(meta);
  return k === 'live' ? 'LIVE DATA' : k === 'archive' ? 'ARCHIVE DATA' : 'FIXTURE DATA';
}

/* ── formatting ──────────────────────────────────────────────────────────── */

export const NOT_PROVIDED = 'NOT PROVIDED';

export function fmtDate(iso: string | null): string {
  if (!iso) return NOT_PROVIDED;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NOT_PROVIDED;
  return d.toISOString().slice(0, 10);
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return NOT_PROVIDED;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return NOT_PROVIDED;
  return `${d.toISOString().slice(0, 10)} ${d.toISOString().slice(11, 16)}Z`;
}

export function fmtNum(n: number | null, digits = 0): string {
  if (n === null || !Number.isFinite(n)) return NOT_PROVIDED;
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function fmtMass(kg: number | null): string {
  if (kg === null) return NOT_PROVIDED;
  return kg >= 1000 ? `${(kg / 1000).toFixed(1)} t` : `${fmtNum(kg)} kg`;
}

export function daysBetween(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const d = (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000;
  return Number.isFinite(d) ? d : null;
}

/* ── narrative ───────────────────────────────────────────────────────────── */

/**
 * Narrative generation.
 *
 * Prose assembled from the filtered rows, not written by hand. Every figure a
 * sentence contains is computed at render time, so the account cannot drift
 * away from the data underneath it — change a filter and the wording changes
 * with it. Where a claim cannot be supported by the rows in view, the sentence
 * is not emitted at all rather than softened into something unfalsifiable.
 *
 * Segments keep numbers separable from words so the UI can set them in the
 * telemetry face without the narrative shipping markup.
 */
export type Seg = string | { n: string };

export interface Beat {
  id: string;
  kicker: string;
  heading: string;
  body: Seg[];
}

const n = (v: string | number): Seg => ({ n: String(v) });

/** Absences worth stating out loud, counted rather than characterised. */
export interface Absence {
  label: string;
  missing: number;
  total: number;
  note: string;
}

export function absences(snap: Snapshot, launches: Launch[]): Absence[] {
  const pay = snap.payloads.map((p) => p.normalized_payload);
  const rockets = snap.rockets.map((r) => r.normalized_payload);
  const out: Absence[] = [];

  const noMass = pay.filter((p) => p.mass_kg === null).length;
  if (pay.length) {
    out.push({
      label: 'Payload mass',
      missing: noMass,
      total: pay.length,
      note: 'The source exposes no per-payload collection. No aggregate mass is published anywhere in this application.',
    });
  }

  const noCore = launches.filter((l) => l.booster_ids.length === 0).length;
  out.push({
    label: 'Booster serial',
    missing: noCore,
    total: launches.length,
    note: 'Launches with no core serial are still counted as launches; they are absent only from booster analytics.',
  });

  const unresolved = launches.filter((l) => l.outcome === 'unknown' || l.outcome === 'scheduled').length;
  out.push({
    label: 'Resolved outcome',
    missing: unresolved,
    total: launches.length,
    note: 'Excluded from every success-rate denominator, and never counted as either result.',
  });

  const noHeight = rockets.filter((r) => r.height_m === null).length;
  if (rockets.length) {
    out.push({
      label: 'Vehicle height',
      missing: noHeight,
      total: rockets.length,
      note: 'Dimensions are shown only where the record carries them, including for vehicles whose specifications are widely published.',
    });
  }

  const noLanding = launches.filter((l) => l.landing_outcome === 'unknown').length;
  out.push({
    label: 'Landing result',
    missing: noLanding,
    total: launches.length,
    note: 'An attempted landing with no recorded result is UNKNOWN, not a failure.',
  });

  return out;
}

export function narrative(snap: Snapshot, launches: Launch[]): Beat[] {
  const total = launches.length;
  if (total === 0) {
    return [{
      id: 'empty',
      kicker: 'No records in view',
      heading: 'There is nothing to report',
      body: [
        'Every row is excluded by the current filters. This page states what the data supports and nothing else, so with no rows in view it has no findings to offer. Clear a filter and it will rewrite itself.',
      ],
    }];
  }

  const vehicles = rankBy(launches, (l) => l.rocket_name);
  const pads = rankBy(launches, (l) => l.launchpad_name);
  const orbits = rankBy(launches, (l) => l.orbit);
  const years = byYear(launches);
  const profiles = boosterProfiles(snap, launches);

  const resolved = launches.filter((l) => l.outcome !== 'unknown' && l.outcome !== 'scheduled');
  const ok = launches.filter((l) => l.outcome === 'success').length;
  const bad = launches.filter((l) => l.outcome === 'failure' || l.outcome === 'partial_failure').length;
  const rate = resolved.length ? (ok / resolved.length) * 100 : null;

  const attempts = launches.filter((l) => l.landing_attempt === true).length;
  const landed = launches.filter((l) => l.landing_outcome === 'success').length;
  const landRate = attempts ? (landed / attempts) * 100 : null;

  const topVeh = vehicles[0];
  const topPad = pads[0];
  const topOrbit = orbits[0];
  const flown = profiles[0];
  const firstYear = years[0];
  const lastYear = years[years.length - 1];

  const turns = profiles.flatMap((p) => p.turnarounds).sort((a, b) => a - b);
  const medTurn = turns.length ? turns[Math.floor(turns.length / 2)]! : null;
  const peak = years.length ? years.reduce((a, b) => (b.total > a.total ? b : a)) : null;
  const vehShare = topVeh ? (topVeh.count / total) * 100 : 0;

  const beats: Beat[] = [];

  /* 01 — the question */
  const q: Seg[] = [
    'Spaceflight reaches most people as a sequence of separate events — a launch, a landing, a failure — each covered on the day it happens and then dropped. What that coverage cannot show is the shape of the thing. Across ',
    n(total), ' launches',
  ];
  if (years.length > 1 && firstYear && lastYear) q.push(' spanning ', n(`${firstYear.label}–${lastYear.label}`));
  q.push(', this record asks a different question: who flies, what they fly, and whether flying more often means flying better.');
  beats.push({ id: 'question', kicker: 'The question worth asking', heading: 'Launch is reported one flight at a time', body: q });

  /* 02 — concentration */
  const found: Seg[] = [];
  if (topVeh) {
    found.push(
      'A single vehicle carries most of this traffic. ', n(topVeh.label), ' accounts for ',
      n(`${vehShare.toFixed(1)}%`), ' of every launch in view — ', n(topVeh.count), ' of ', n(total), '. ',
    );
    const second = vehicles[1];
    if (second) {
      found.push(
        'The next vehicle, ', n(second.label), ', flew ', n(second.count),
        `, a factor of ${(topVeh.count / second.count).toFixed(1)} fewer. `,
      );
    } else {
      found.push('No second vehicle appears in this selection at all. ');
    }
    if (topPad) {
      found.push(
        'The same pattern holds on the ground: ', n(topPad.label), ' handles ',
        n(`${topPad.share.toFixed(1)}%`), ' of departures.',
      );
    }
  } else {
    found.push('No vehicle is named on any record in view, so no concentration can be described.');
  }
  beats.push({ id: 'found', kicker: 'What the record shows', heading: 'The activity is far more concentrated than it looks', body: found });

  /* 03 — evidence */
  const ev: Seg[] = [
    n(total), ' launches across ', n(vehicles.length), ` vehicle type${vehicles.length === 1 ? '' : 's'} and `,
    n(pads.length), ` launch site${pads.length === 1 ? '' : 's'}. `,
  ];
  if (rate !== null) {
    ev.push(
      'Of the ', n(resolved.length), ' launches with a resolved outcome, ', n(ok),
      ' succeeded and ', n(bad), ' did not — a success rate of ', n(`${rate.toFixed(1)}%`), '. ',
    );
  } else {
    ev.push('No launch in view has a resolved outcome, so no success rate is computed. ');
  }
  if (landRate !== null) {
    ev.push(
      'Of ', n(attempts), ' landing attempts, ', n(landed), ' recovered the core, or ',
      n(`${landRate.toFixed(1)}%`), '. ',
    );
  } else {
    ev.push('No landing attempt in view carries a recorded result. ');
  }
  if (topOrbit) ev.push('The most common destination is ', n(topOrbit.label), ', at ', n(topOrbit.count), ' missions.');
  beats.push({ id: 'evidence', kicker: 'The evidence', heading: 'The numbers this rests on', body: ev });

  /* 04 — what runs against expectation */
  const sur: Seg[] = [];
  if (flown && flown.flight_count > 1) {
    sur.push(
      'The reuse figures are the ones that do not match intuition. One core, ', n(flown.serial),
      ', flew ', n(flown.flight_count), ' times inside this window alone',
    );
    if (flown.landing_attempts) {
      sur.push(', recovering ', n(flown.landing_successes), ' of ', n(flown.landing_attempts), ' landings');
    }
    sur.push('. ');
    if (medTurn !== null) {
      sur.push(
        'Across every core here, the median gap between one flight and the next is ',
        n(`${Math.round(medTurn)} days`),
        '. A booster is not a vehicle that is launched; it is a vehicle that is turned around.',
      );
    }
  } else if (rate !== null && rate > 90) {
    sur.push(
      'The failure rate is lower than the news cycle implies. ', n(bad), ' of ', n(resolved.length),
      ' resolved launches failed or partially failed — ', n(`${(100 - rate).toFixed(1)}%`),
      '. Rockets mostly work now, and that is genuinely new.',
    );
  } else {
    sur.push('This selection is too narrow to say anything reliable about reuse or reliability. Widen the filters and this paragraph will say more.');
  }
  beats.push({ id: 'surprise', kicker: 'What runs against expectation', heading: 'Cadence and reliability are not the same measurement', body: sur });

  /* 05 — implication */
  const imp: Seg[] = [];
  if (topVeh) {
    imp.push(
      'If one vehicle is ', n(`${vehShare.toFixed(1)}%`),
      ' of launch activity, then a stand-down of that vehicle is a stand-down of the whole programme. ',
    );
  }
  if (peak) imp.push('Cadence peaked in ', n(peak.label), ' at ', n(peak.total), ' launches. ');
  imp.push('The number worth watching is not the next failure — it is how much of the manifest depends on a single vehicle, a single pad, and a fleet of cores being turned around fast enough to keep up.');
  beats.push({ id: 'implication', kicker: 'What follows from it', heading: 'Concentration is the risk, not any single failure', body: imp });

  return beats;
}
