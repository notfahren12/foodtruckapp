/*
  Food Truck Permit Tracker — initial schema (MVP).

  DISCLAIMER: Seed data in jurisdictions / permit_requirements is for product scaffolding only.
  It is PRELIMINARY and MUST be verified against official municipal and county sources before reliance.
*/

-- -----------------------------------------------------------------------------
-- Helpers: updated_at
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'Updates updated_at to now() before row UPDATE. Attach to tables that track updated_at.';

-- -----------------------------------------------------------------------------
-- 1. profiles
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App profile linked to Supabase Auth; one row per auth user.';
comment on column public.profiles.email is 'Optional cached email; may mirror auth.users—verify sync strategy in app.';

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. businesses
-- -----------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  owner_name text,
  phone text,
  email text,
  city text,
  county text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.businesses is 'Food truck operator business scoped to profile owner.';
comment on column public.businesses.owner_id is 'Owning user profile id; mirrors auth linkage through profiles.';

create index businesses_owner_id_idx on public.businesses (owner_id);

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. trucks
-- -----------------------------------------------------------------------------

create table public.trucks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  vin text,
  license_plate text,
  make text,
  model text,
  year int,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.trucks is 'Vehicles belonging to a business.';

create index trucks_business_id_idx on public.trucks (business_id);

create trigger trucks_set_updated_at
  before update on public.trucks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 4. jurisdictions (+ seed)
-- -----------------------------------------------------------------------------

create table public.jurisdictions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('city', 'county', 'state')),
  state text not null default 'AL',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.jurisdictions is 'Reference jurisdictions for permit and inspection linkage (Central Alabama MVP).';

create unique index jurisdictions_name_state_unique_idx
  on public.jurisdictions (lower(name), state);

-- Idempotent seed (avoids duplicates if SQL is re-run on a DB that already has rows).
insert into public.jurisdictions (name, type, state)
select v.name, v.type, v.state
from (values
  ('Birmingham', 'city', 'AL'),
  ('Hoover', 'city', 'AL'),
  ('Pelham', 'city', 'AL'),
  ('Alabaster', 'city', 'AL'),
  ('Calera', 'city', 'AL'),
  ('Columbiana', 'city', 'AL'),
  ('Shelby County', 'county', 'AL'),
  ('Jefferson County', 'county', 'AL')
) as v(name, type, state)
where not exists (
  select 1
  from public.jurisdictions j
  where lower(j.name) = lower(v.name)
    and j.state = v.state
);

-- -----------------------------------------------------------------------------
-- 5. permit_requirements (+ placeholder seed)
-- -----------------------------------------------------------------------------

create table public.permit_requirements (
  id uuid primary key default gen_random_uuid(),
  jurisdiction_id uuid not null references public.jurisdictions (id) on delete cascade,
  name text not null,
  description text,
  requirement_type text not null check (
    requirement_type in (
      'health',
      'fire',
      'city',
      'county',
      'state',
      'business',
      'vehicle',
      'tax',
      'insurance',
      'other'
    )
  ),
  renewal_frequency text,
  source_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.permit_requirements is
  'Catalog of permit-like requirements by jurisdiction. Seed rows are PLACEHOLDERS—not a complete or authoritative legal list.';
comment on column public.permit_requirements.source_url is
  'TODO: Populate with official municipal / county primary source URLs after legal review.';
comment on column public.permit_requirements.notes is
  'Internal notes; seeded rows include PRELIMINARY wording—verify with official sources before user-facing copy.';

create index permit_requirements_jurisdiction_id_idx
  on public.permit_requirements (jurisdiction_id);

-- Starter placeholders: NOT legally complete. Marked PRELIMINARY in description/notes.
insert into public.permit_requirements (
  jurisdiction_id,
  name,
  description,
  requirement_type,
  renewal_frequency,
  source_url,
  notes
)
select
  j.id,
  v.name,
  v.description,
  v.requirement_type,
  v.renewal_frequency,
  null::text, -- Official source URL to be added after verification; keep null in MVP seed.
  v.notes
from public.jurisdictions j
cross join lateral (values
  (
    'Mobile food vendor / business license (PRELIMINARY placeholder)',
    'Placeholder row for a city-level mobile food vending or general business license requirement. '
    || 'Confirm exact license name, fees, and application channel with the city clerk or licensing office.',
    'city',
    'Varies—verify with agency',
    'PRELIMINARY: Not verified. Replace with official requirement after source review.'
  ),
  (
    'Public health / mobile unit permit (PRELIMINARY placeholder)',
    'Placeholder for health department permitting that may apply to mobile food units. '
    || 'Shelby/Jefferson programs differ; verify category, inspections, and commissary rules with the health department.',
    'health',
    'Varies—verify with agency',
    'PRELIMINARY: Jurisdiction-specific. Do not treat as exhaustive health compliance guidance.'
  ),
  (
    'Fire / life safety review (PRELIMINARY placeholder)',
    'Placeholder for fire department review of cooking equipment, suppression, extinguishers, and fuel storage. '
    || 'Actual triggers depend on equipment and local code enforcement practices.',
    'fire',
    'As needed / per inspection cycle',
    'PRELIMINARY: Requirements vary by setup; official fire marshal guidance required.'
  )
) as v(name, description, requirement_type, renewal_frequency, notes)
where not exists (
  select 1
  from public.permit_requirements pr
  where pr.jurisdiction_id = j.id
    and pr.name = v.name
);

-- -----------------------------------------------------------------------------
-- 6. truck_permits
-- -----------------------------------------------------------------------------

create table public.truck_permits (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references public.trucks (id) on delete cascade,
  permit_requirement_id uuid references public.permit_requirements (id) on delete set null,
  status text not null default 'missing' check (
    status in ('missing', 'pending', 'current', 'expiring_soon', 'expired')
  ),
  issued_date date,
  expiration_date date,
  permit_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.truck_permits is 'Tracks a truck instance against a permit_requirement row.';

create index truck_permits_truck_id_idx on public.truck_permits (truck_id);
create index truck_permits_permit_requirement_id_idx on public.truck_permits (permit_requirement_id);
create index truck_permits_expiration_date_idx on public.truck_permits (expiration_date);

create trigger truck_permits_set_updated_at
  before update on public.truck_permits
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 7. documents
-- -----------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  truck_id uuid references public.trucks (id) on delete set null,
  permit_id uuid references public.truck_permits (id) on delete set null,
  document_type text not null,
  name text not null,
  file_path text,
  expiration_date date,
  status text not null default 'uploaded' check (
    status in ('missing', 'uploaded', 'expiring_soon', 'expired')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.documents is 'Uploaded or referenced files for compliance evidence.';
comment on column public.documents.file_path is 'Storage object path when using Supabase Storage; app must enforce access rules.';

create index documents_business_id_idx on public.documents (business_id);
create index documents_truck_id_idx on public.documents (truck_id);
create index documents_permit_id_idx on public.documents (permit_id);
create index documents_expiration_date_idx on public.documents (expiration_date);

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 8. inspections
-- -----------------------------------------------------------------------------

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references public.trucks (id) on delete cascade,
  jurisdiction_id uuid references public.jurisdictions (id) on delete set null,
  inspection_type text not null check (
    inspection_type in ('health', 'fire', 'city', 'county', 'other')
  ),
  scheduled_date timestamptz,
  completed_date timestamptz,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'passed', 'failed', 'cancelled', 'needs_reschedule')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.inspections is 'Scheduled or completed inspections tied to a truck and optionally a jurisdiction.';

create index inspections_truck_id_idx on public.inspections (truck_id);
create index inspections_jurisdiction_id_idx on public.inspections (jurisdiction_id);
create index inspections_scheduled_date_idx on public.inspections (scheduled_date);

create trigger inspections_set_updated_at
  before update on public.inspections
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 9. reminders
-- -----------------------------------------------------------------------------

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  truck_id uuid references public.trucks (id) on delete set null,
  permit_id uuid references public.truck_permits (id) on delete cascade,
  document_id uuid references public.documents (id) on delete cascade,
  inspection_id uuid references public.inspections (id) on delete cascade,
  title text not null,
  reminder_date timestamptz not null,
  status text not null default 'pending' check (
    status in ('pending', 'sent', 'dismissed')
  ),
  created_at timestamptz not null default now()
);

comment on table public.reminders is
  'Notification queue rows; link to permit, document, and/or inspection as applicable. At least one context FK will typically be set by the app.';

create index reminders_business_id_idx on public.reminders (business_id);
create index reminders_truck_id_idx on public.reminders (truck_id);
create index reminders_permit_id_idx on public.reminders (permit_id);
create index reminders_document_id_idx on public.reminders (document_id);
create index reminders_inspection_id_idx on public.reminders (inspection_id);
create index reminders_reminder_date_idx on public.reminders (reminder_date);

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.trucks enable row level security;
alter table public.jurisdictions enable row level security;
alter table public.permit_requirements enable row level security;
alter table public.truck_permits enable row level security;
alter table public.documents enable row level security;
alter table public.inspections enable row level security;
alter table public.reminders enable row level security;

-- profiles: own row only
create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy profiles_insert_own
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- businesses: owned by profile
create policy businesses_select_own
  on public.businesses for select
  to authenticated
  using (owner_id = auth.uid());

create policy businesses_insert_own
  on public.businesses for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy businesses_update_own
  on public.businesses for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy businesses_delete_own
  on public.businesses for delete
  to authenticated
  using (owner_id = auth.uid());

-- trucks: via business ownership
create policy trucks_select_own
  on public.trucks for select
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = trucks.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy trucks_insert_own
  on public.trucks for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = trucks.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy trucks_update_own
  on public.trucks for update
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = trucks.business_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = trucks.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy trucks_delete_own
  on public.trucks for delete
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = trucks.business_id
        and b.owner_id = auth.uid()
    )
  );

-- reference data: readable to signed-in users; writes reserved for service role / migrations
create policy jurisdictions_select_authenticated
  on public.jurisdictions for select
  to authenticated
  using (true);

create policy permit_requirements_select_authenticated
  on public.permit_requirements for select
  to authenticated
  using (true);

-- truck_permits: via truck -> business
create policy truck_permits_select_own
  on public.truck_permits for select
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = truck_permits.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy truck_permits_insert_own
  on public.truck_permits for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = truck_permits.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy truck_permits_update_own
  on public.truck_permits for update
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = truck_permits.truck_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = truck_permits.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy truck_permits_delete_own
  on public.truck_permits for delete
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = truck_permits.truck_id
        and b.owner_id = auth.uid()
    )
  );

-- documents: business ownership
create policy documents_select_own
  on public.documents for select
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy documents_insert_own
  on public.documents for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
    and (
      documents.truck_id is null
      or exists (
        select 1
        from public.trucks t
        join public.businesses b on b.id = t.business_id
        where t.id = documents.truck_id
          and b.owner_id = auth.uid()
          and t.business_id = documents.business_id
      )
    )
    and (
      documents.permit_id is null
      or exists (
        select 1
        from public.truck_permits tp
        join public.trucks t on t.id = tp.truck_id
        join public.businesses b on b.id = t.business_id
        where tp.id = documents.permit_id
          and b.owner_id = auth.uid()
          and t.business_id = documents.business_id
      )
    )
  );

create policy documents_update_own
  on public.documents for update
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
    and (
      documents.truck_id is null
      or exists (
        select 1
        from public.trucks t
        join public.businesses b on b.id = t.business_id
        where t.id = documents.truck_id
          and b.owner_id = auth.uid()
          and t.business_id = documents.business_id
      )
    )
    and (
      documents.permit_id is null
      or exists (
        select 1
        from public.truck_permits tp
        join public.trucks t on t.id = tp.truck_id
        join public.businesses b on b.id = t.business_id
        where tp.id = documents.permit_id
          and b.owner_id = auth.uid()
          and t.business_id = documents.business_id
      )
    )
  );

create policy documents_delete_own
  on public.documents for delete
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = documents.business_id
        and b.owner_id = auth.uid()
    )
  );

-- inspections: via truck -> business
create policy inspections_select_own
  on public.inspections for select
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = inspections.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy inspections_insert_own
  on public.inspections for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = inspections.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy inspections_update_own
  on public.inspections for update
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = inspections.truck_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = inspections.truck_id
        and b.owner_id = auth.uid()
    )
  );

create policy inspections_delete_own
  on public.inspections for delete
  to authenticated
  using (
    exists (
      select 1
      from public.trucks t
      join public.businesses b on b.id = t.business_id
      where t.id = inspections.truck_id
        and b.owner_id = auth.uid()
    )
  );

-- reminders: business ownership; optional truck must belong to same business
create policy reminders_select_own
  on public.reminders for select
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = reminders.business_id
        and b.owner_id = auth.uid()
    )
  );

create policy reminders_insert_own
  on public.reminders for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = reminders.business_id
        and b.owner_id = auth.uid()
    )
    and (
      reminders.truck_id is null
      or exists (
        select 1
        from public.trucks t
        where t.id = reminders.truck_id
          and t.business_id = reminders.business_id
      )
    )
    and (
      reminders.permit_id is null
      or exists (
        select 1
        from public.truck_permits tp
        join public.trucks t on t.id = tp.truck_id
        where tp.id = reminders.permit_id
          and t.business_id = reminders.business_id
      )
    )
    and (
      reminders.document_id is null
      or exists (
        select 1
        from public.documents d
        where d.id = reminders.document_id
          and d.business_id = reminders.business_id
      )
    )
    and (
      reminders.inspection_id is null
      or exists (
        select 1
        from public.inspections i
        join public.trucks t on t.id = i.truck_id
        where i.id = reminders.inspection_id
          and t.business_id = reminders.business_id
      )
    )
  );

create policy reminders_update_own
  on public.reminders for update
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = reminders.business_id
        and b.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses b
      where b.id = reminders.business_id
        and b.owner_id = auth.uid()
    )
    and (
      reminders.truck_id is null
      or exists (
        select 1
        from public.trucks t
        where t.id = reminders.truck_id
          and t.business_id = reminders.business_id
      )
    )
    and (
      reminders.permit_id is null
      or exists (
        select 1
        from public.truck_permits tp
        join public.trucks t on t.id = tp.truck_id
        where tp.id = reminders.permit_id
          and t.business_id = reminders.business_id
      )
    )
    and (
      reminders.document_id is null
      or exists (
        select 1
        from public.documents d
        where d.id = reminders.document_id
          and d.business_id = reminders.business_id
      )
    )
    and (
      reminders.inspection_id is null
      or exists (
        select 1
        from public.inspections i
        join public.trucks t on t.id = i.truck_id
        where i.id = reminders.inspection_id
          and t.business_id = reminders.business_id
      )
    )
  );

create policy reminders_delete_own
  on public.reminders for delete
  to authenticated
  using (
    exists (
      select 1
      from public.businesses b
      where b.id = reminders.business_id
        and b.owner_id = auth.uid()
    )
  );
