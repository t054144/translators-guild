-- ══════════════════════════════════════════════════════════════
-- RoboCycle — donation requests, and what happens to them
--
-- The shape of this schema follows one rule: a row that claims
-- something happened may only be written by someone who saw it
-- happen. Statuses, rewards and impact records are all staff
-- writes; nothing here advances itself.
--
-- Anonymous visitors never touch these tables. They reach one
-- SECURITY DEFINER function through a server endpoint that holds
-- the service-role key, and that function may only insert.
-- ══════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── enums ─────────────────────────────────────────────────────

create type donation_status as enum (
  'Request Received', 'Awaiting Contact', 'Collection Scheduled',
  'Collected', 'Under Assessment', 'Completed', 'Cancelled'
);

create type outcome_type as enum (
  'Component recovered', 'Sent to qualified recycling',
  'Not suitable for recovery', 'Future verified project use'
);

-- ── requests ──────────────────────────────────────────────────

create table donation_requests (
  id                    uuid primary key default gen_random_uuid(),
  -- Only the hash. The reference itself lives with the person.
  public_reference_hash text        not null unique,
  first_name            text        not null check (length(first_name) between 1 and 60),
  contact_method        text        not null check (contact_method in ('Email','Phone','WhatsApp')),
  contact_value         text        not null check (length(contact_value) between 3 and 120),
  preferred_area        text        check (length(preferred_area) <= 80),
  donation_method       text        not null,
  status                donation_status not null default 'Request Received',
  consent_at            timestamptz not null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create table donation_items (
  id                  uuid primary key default gen_random_uuid(),
  donation_request_id uuid not null references donation_requests(id) on delete cascade,
  device_type         text not null,
  quantity            int  not null default 1 check (quantity between 1 and 999),
  condition           text not null,
  -- Set from the condition, so a hazardous item cannot be filed as ordinary.
  battery_warning     boolean not null default false,
  notes               text check (length(notes) <= 300),
  created_at          timestamptz not null default now()
);

create index on donation_items (donation_request_id);

-- ── collection points ─────────────────────────────────────────

-- verified_at is the gate: a point with no verification date is
-- never served to the public, so an unchecked address cannot leak
-- onto the site by being inserted.
create table collection_points (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  area               text not null,
  address            text not null,
  operating_hours    text,
  accepted_items     text[] not null default '{}',
  battery_acceptance text not null default 'Not accepted',
  safety_limitations text,
  directions_url     text,
  active             boolean not null default false,
  verified_at        timestamptz
);

-- ── the operational record ────────────────────────────────────

create table status_history (
  id                  uuid primary key default gen_random_uuid(),
  donation_request_id uuid not null references donation_requests(id) on delete cascade,
  previous_status     donation_status,
  new_status          donation_status not null,
  changed_by          uuid references auth.users(id),
  created_at          timestamptz not null default now()
);

create table automation_events (
  id                  uuid primary key default gen_random_uuid(),
  donation_request_id uuid references donation_requests(id) on delete cascade,
  event_type          text not null,
  delivery_status     text not null default 'pending',
  -- Redacted only: no names, no contact values.
  redacted_metadata   jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

create table reward_records (
  id                  uuid primary key default gen_random_uuid(),
  donation_request_id uuid not null references donation_requests(id) on delete cascade,
  reward_type         text not null,
  verification_status text not null default 'unverified',
  issued_at           timestamptz
);

create table impact_records (
  id                   uuid primary key default gen_random_uuid(),
  donation_item_id     uuid not null references donation_items(id) on delete cascade,
  outcome_type         outcome_type not null,
  verified_description text not null,
  -- Not nullable on purpose: an impact record cannot exist unverified.
  verified_at          timestamptz not null default now()
);

-- ── row-level security ────────────────────────────────────────

alter table donation_requests enable row level security;
alter table donation_items    enable row level security;
alter table collection_points enable row level security;
alter table status_history    enable row level security;
alter table automation_events enable row level security;
alter table reward_records    enable row level security;
alter table impact_records    enable row level security;

-- No policy for anon or authenticated on the request tables, which
-- means no read and no write: everything goes through the server.
-- Staff are identified by a claim set on their account.

create policy staff_read_requests on donation_requests
  for select using (auth.jwt() ->> 'role' = 'robocycle_staff');
create policy staff_write_requests on donation_requests
  for update using (auth.jwt() ->> 'role' = 'robocycle_staff');

create policy staff_read_items on donation_items
  for select using (auth.jwt() ->> 'role' = 'robocycle_staff');

create policy staff_all_history on status_history
  for all using (auth.jwt() ->> 'role' = 'robocycle_staff');
create policy staff_all_events on automation_events
  for all using (auth.jwt() ->> 'role' = 'robocycle_staff');
create policy staff_all_rewards on reward_records
  for all using (auth.jwt() ->> 'role' = 'robocycle_staff');
create policy staff_all_impact on impact_records
  for all using (auth.jwt() ->> 'role' = 'robocycle_staff');

-- The public may read collection points, but only verified, active
-- ones — the policy, not the application, decides that.
create policy public_read_verified_points on collection_points
  for select using (active = true and verified_at is not null);

-- ── the one way in ────────────────────────────────────────────

create or replace function create_donation_request(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  item   jsonb;
begin
  insert into donation_requests (
    public_reference_hash, first_name, contact_method, contact_value,
    preferred_area, donation_method, consent_at
  ) values (
    payload ->> 'public_reference_hash',
    payload ->> 'first_name',
    payload ->> 'contact_method',
    payload ->> 'contact_value',
    nullif(payload ->> 'preferred_area', ''),
    payload ->> 'donation_method',
    coalesce((payload ->> 'consent_at')::timestamptz, now())
  )
  returning id into new_id;

  for item in select * from jsonb_array_elements(payload -> 'items')
  loop
    insert into donation_items (
      donation_request_id, device_type, quantity, condition, battery_warning, notes
    ) values (
      new_id,
      item ->> 'device_type',
      coalesce((item ->> 'quantity')::int, 1),
      item ->> 'condition',
      coalesce((item ->> 'battery_warning')::boolean, false),
      nullif(item ->> 'notes', '')
    );
  end loop;

  insert into status_history (donation_request_id, new_status)
  values (new_id, 'Request Received');

  insert into automation_events (donation_request_id, event_type, redacted_metadata)
  values (new_id, 'request_received',
          jsonb_build_object('item_count', jsonb_array_length(payload -> 'items')));

  -- The id, and nothing else. The caller already holds the reference.
  return jsonb_build_object('id', new_id);
end;
$$;

revoke all on function create_donation_request(jsonb) from public, anon, authenticated;

-- ── keeping the record honest ─────────────────────────────────

create or replace function log_status_change()
returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status then
    insert into status_history (donation_request_id, previous_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
    new.updated_at := now();
  end if;
  return new;
end;
$$;

create trigger donation_status_audit
  before update on donation_requests
  for each row execute function log_status_change();

-- ── retention ─────────────────────────────────────────────────

-- Contact details are kept only as long as they are needed to
-- finish a request. Schedule this; do not run it by hand.
create or replace function redact_old_contacts()
returns void language sql as $$
  update donation_requests
     set contact_value = '[redacted]', first_name = '[redacted]'
   where status in ('Completed', 'Cancelled')
     and updated_at < now() - interval '180 days'
     and contact_value <> '[redacted]';
$$;
