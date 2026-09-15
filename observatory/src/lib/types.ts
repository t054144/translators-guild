/**
 * Core domain types.
 *
 * Design rule that governs this whole file: nothing enters the application as a
 * bare value. Every record arrives wrapped in a RecordEnvelope carrying its
 * source, retrieval time and per-field quality, so any figure rendered anywhere
 * in the UI can be traced back to the payload it came from. A number with no
 * envelope is a bug, not a shortcut.
 */

/* ── data quality ────────────────────────────────────────────────────────── */

/**
 * How much weight a single field can bear.
 *
 * - `verified`        cross-checked against a second source
 * - `source_provided` the API gave it to us; we pass it through unchanged
 * - `derived`         computed by us from source fields (formula recorded)
 * - `estimated`       inferred with stated assumptions — never silently
 * - `missing`         the source had no value. Not zero. Not "unknown-ish".
 * - `stale`           real, but older than the freshness budget for its kind
 * - `fixture`         demonstration scaffolding, not real data
 */
export type DataStatus =
  | 'verified'
  | 'source_provided'
  | 'derived'
  | 'estimated'
  | 'missing'
  | 'stale'
  | 'fixture';

export const DATA_STATUS_LABEL: Record<DataStatus, string> = {
  verified: 'VERIFIED',
  source_provided: 'SOURCE',
  derived: 'DERIVED',
  estimated: 'ESTIMATED',
  missing: 'NOT PROVIDED',
  stale: 'STALE',
  fixture: 'FIXTURE',
};

/** Quality map keyed by field name of the normalized payload. */
export type QualityMap = Record<string, DataStatus>;

/* ── provenance envelope ─────────────────────────────────────────────────── */

export type EntityType =
  | 'launch'
  | 'rocket'
  | 'booster'
  | 'payload'
  | 'launchpad'
  | 'landing_zone'
  | 'capsule'
  | 'ship';

/**
 * Every record in the cache is an envelope. `raw_payload` is kept verbatim so
 * the Data Explorer can show the exact bytes a metric descends from, and so a
 * normalization bug can be diagnosed without re-fetching.
 */
export interface RecordEnvelope<T> {
  record_id: string;
  entity_type: EntityType;
  source: string;
  source_url: string;
  retrieved_at: string;
  last_updated: string | null;
  raw_payload: unknown;
  normalized_payload: T;
  data_quality: QualityMap;
}

/* ── domain entities ─────────────────────────────────────────────────────── */

export type MissionOutcome = 'success' | 'failure' | 'partial_failure' | 'scheduled' | 'unknown';

export const OUTCOME_LABEL: Record<MissionOutcome, string> = {
  success: 'SUCCESS',
  failure: 'FAILURE',
  partial_failure: 'PARTIAL FAILURE',
  scheduled: 'SCHEDULED',
  unknown: 'UNKNOWN',
};

export type LandingOutcome = 'success' | 'failure' | 'not_attempted' | 'unknown';

export interface Launch {
  id: string;
  /** Mission name exactly as the source gives it. */
  name: string;
  /** Sequential flight number within the dataset. Derived — see analytics. */
  flight_number: number | null;
  /** ISO 8601 UTC. `net` (no earlier than) in launch-industry terms. */
  net: string | null;
  date_utc: string | null;
  /** True when the source only knows the launch to within a month/quarter. */
  date_precise: boolean;
  window_start: string | null;
  window_end: string | null;
  rocket_id: string | null;
  rocket_name: string | null;
  booster_ids: string[];
  launchpad_id: string | null;
  launchpad_name: string | null;
  payload_ids: string[];
  orbit: string | null;
  outcome: MissionOutcome;
  /** Source's own status string, preserved before mapping. */
  outcome_raw: string | null;
  landing_attempt: boolean | null;
  landing_outcome: LandingOutcome;
  landing_zone: string | null;
  description: string | null;
  patch_url: string | null;
  webcast_url: string | null;
  article_url: string | null;
  wiki_url: string | null;
  image_url: string | null;
  upcoming: boolean;
  /** Failure cause exactly as the source records it. Never inferred. */
  failure_reason: string | null;
  /** Seconds after liftoff at which the source places the failure. */
  failure_time_s: number | null;
}

export interface Rocket {
  id: string;
  name: string;
  family: string | null;
  variant: string | null;
  full_name: string | null;
  active: boolean | null;
  description: string | null;
  /** Only ever populated from source. We do not fill in spec sheets from memory. */
  stages: number | null;
  boosters: number | null;
  height_m: number | null;
  diameter_m: number | null;
  mass_kg: number | null;
  payload_leo_kg: number | null;
  payload_gto_kg: number | null;
  reusable: boolean | null;
  first_flight: string | null;
  image_url: string | null;
  wiki_url: string | null;
}

export interface Booster {
  id: string;
  serial: string;
  /** Flights recorded in this dataset — a floor, not a claim of completeness. */
  flight_count: number;
  landing_attempts: number;
  landing_successes: number;
  first_flight: string | null;
  last_flight: string | null;
  status: string | null;
  reused: boolean;
  launch_ids: string[];
}

export interface Payload {
  id: string;
  name: string;
  type: string | null;
  customers: string[];
  nationalities: string[];
  manufacturers: string[];
  mass_kg: number | null;
  orbit: string | null;
  launch_id: string | null;
  reused: boolean | null;
}

export interface Launchpad {
  id: string;
  name: string;
  full_name: string | null;
  locality: string | null;
  region: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  launch_attempts: number | null;
  launch_successes: number | null;
  rocket_ids: string[];
  launch_ids: string[];
}

/* ── source health ───────────────────────────────────────────────────────── */

export type SourceState = 'online' | 'degraded' | 'stale' | 'offline' | 'never_fetched';

export const SOURCE_STATE_LABEL: Record<SourceState, string> = {
  online: 'ONLINE',
  degraded: 'DEGRADED',
  stale: 'STALE',
  offline: 'OFFLINE',
  never_fetched: 'NEVER FETCHED',
};

export interface SourceHealth {
  id: string;
  name: string;
  endpoint: string;
  state: SourceState;
  /** Why the source is in this state, in plain words. Shown verbatim in the UI. */
  detail: string;
  last_attempt: string | null;
  last_success: string | null;
  response_ms: number | null;
  record_count: number;
  /** Set when a source is known-dead, so the UI can explain rather than retry. */
  decommissioned: boolean;
}

/* ── lineage ─────────────────────────────────────────────────────────────── */

/**
 * The audit trail behind a single displayed metric: which source, which raw
 * fields, what transformation, what came out. Rendered by the lineage panel.
 */
export interface LineageStep {
  stage: 'source' | 'raw' | 'transform' | 'metric';
  label: string;
  detail: string;
}

export interface MetricLineage {
  metric: string;
  value: string;
  status: DataStatus;
  /** Plain-language formula, e.g. "successes / launches with known outcome". */
  formula?: string;
  steps: LineageStep[];
}

/* ── the snapshot ────────────────────────────────────────────────────────── */

export interface IngestReport {
  step: string;
  detail: string;
  in_count: number;
  out_count: number;
  dropped: number;
}

/**
 * What kind of records the snapshot holds. `live` was fetched from a serving
 * API; `archive` is real data from a frozen source; `fixture` is synthetic.
 * The distinction matters on every badge — "live" on frozen data is a lie.
 */
export type DataKind = 'live' | 'archive' | 'fixture';

export interface SnapshotMeta {
  schema_version: number;
  generated_at: string | null;
  /** True for real records (live or archive); false for fixture. */
  is_live: boolean;
  data_kind?: DataKind;
  /** Loud, human-readable statement of what this data actually is. */
  provenance_note: string;
  sources: SourceHealth[];
  pipeline: IngestReport[];
  counts: Record<string, number>;
  window: { from: string | null; to: string | null };
}

export interface Snapshot {
  meta: SnapshotMeta;
  launches: RecordEnvelope<Launch>[];
  rockets: RecordEnvelope<Rocket>[];
  boosters: RecordEnvelope<Booster>[];
  payloads: RecordEnvelope<Payload>[];
  launchpads: RecordEnvelope<Launchpad>[];
}

/** Convenience: unwrap envelopes when the provenance is not needed at the call site. */
export const unwrap = <T>(rows: RecordEnvelope<T>[]): T[] => rows.map((r) => r.normalized_payload);
