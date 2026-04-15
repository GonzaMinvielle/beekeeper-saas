-- ============================================================
-- BEEKEEPER SAAS — Schema inicial completo
-- ============================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- ORGANIZATIONS (tenants)
-- ============================================================
create table organizations (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  plan        text not null default 'free' check (plan in ('free', 'pro', 'enterprise')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- ORG_MEMBERS — roles por organización
-- ============================================================
create table org_members (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at       timestamptz not null default now(),
  unique (organization_id, user_id)
);

-- ============================================================
-- APIARIES — ubicaciones de colmenares
-- ============================================================
create table apiaries (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  location        text,
  latitude        numeric(10, 7),
  longitude       numeric(10, 7),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- HIVES — colmenas individuales
-- ============================================================
create table hives (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  apiary_id       uuid not null references apiaries(id) on delete cascade,
  name            text not null,
  code            text,                        -- código físico/etiqueta
  type            text not null default 'langstroth'
                  check (type in ('langstroth', 'dadant', 'warre', 'top_bar', 'other')),
  status          text not null default 'active'
                  check (status in ('active', 'inactive', 'dead', 'sold')),
  color           text,
  installation_date date,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- QUEENS — reinas por colmena
-- ============================================================
create table queens (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hive_id         uuid not null references hives(id) on delete cascade,
  marking_color   text check (marking_color in ('white', 'yellow', 'red', 'green', 'blue')),
  year_born       smallint,
  breed           text,
  status          text not null default 'active'
                  check (status in ('active', 'superseded', 'dead', 'removed')),
  notes           text,
  installed_at    date,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- INSPECTIONS — registro de revisiones
-- ============================================================
create table inspections (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  hive_id         uuid not null references hives(id) on delete cascade,
  inspector_id    uuid not null references auth.users(id),
  inspected_at    timestamptz not null default now(),
  weather         text,
  temperature_c   numeric(4,1),
  duration_min    integer,
  overall_health  smallint check (overall_health between 1 and 5),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- OBSERVATIONS — observaciones detalladas por inspección
-- ============================================================
create table observations (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  inspection_id   uuid not null references inspections(id) on delete cascade,
  category        text not null
                  check (category in (
                    'queen_sighting', 'brood', 'honey', 'population',
                    'disease', 'pest', 'behavior', 'feeding', 'treatment', 'other'
                  )),
  value           text,
  numeric_value   numeric,
  unit            text,
  notes           text,
  created_at      timestamptz not null default now()
);

-- ============================================================
-- INSPECTION_PHOTOS — fotos de inspecciones en Storage
-- ============================================================
create table inspection_photos (
  id              uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  inspection_id   uuid not null references inspections(id) on delete cascade,
  storage_path    text not null,          -- path en Supabase Storage
  file_name       text not null,
  file_size       integer,
  mime_type       text,
  caption         text,
  uploaded_by     uuid not null references auth.users(id),
  created_at      timestamptz not null default now()
);

-- ============================================================
-- TRIGGERS — updated_at automático
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function update_updated_at();

create trigger trg_apiaries_updated_at
  before update on apiaries
  for each row execute function update_updated_at();

create trigger trg_hives_updated_at
  before update on hives
  for each row execute function update_updated_at();

create trigger trg_queens_updated_at
  before update on queens
  for each row execute function update_updated_at();

create trigger trg_inspections_updated_at
  before update on inspections
  for each row execute function update_updated_at();

-- ============================================================
-- FUNCIÓN: crear organización al registrarse
-- ============================================================
create or replace function handle_new_user_organization()
returns trigger language plpgsql security definer as $$
declare
  org_id uuid;
  org_slug text;
begin
  -- Generar slug a partir del email (parte antes del @)
  org_slug := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '-', 'g'))
              || '-' || substr(new.id::text, 1, 8);

  -- Crear organización
  insert into organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'org_name', split_part(new.email, '@', 1) || '''s Apiary'),
    org_slug
  )
  returning id into org_id;

  -- Agregar usuario como owner
  insert into org_members (organization_id, user_id, role)
  values (org_id, new.id, 'owner');

  return new;
end;
$$;

create trigger trg_new_user_organization
  after insert on auth.users
  for each row execute function handle_new_user_organization();

-- ============================================================
-- RLS — habilitar en todas las tablas
-- ============================================================
alter table organizations       enable row level security;
alter table org_members         enable row level security;
alter table apiaries            enable row level security;
alter table hives               enable row level security;
alter table queens              enable row level security;
alter table inspections         enable row level security;
alter table observations        enable row level security;
alter table inspection_photos   enable row level security;

-- ============================================================
-- HELPER FUNCTION — obtener org_id del usuario actual
-- ============================================================
create or replace function get_user_org_ids()
returns setof uuid language sql security definer stable as $$
  select organization_id from org_members where user_id = auth.uid();
$$;

create or replace function user_has_role(p_org_id uuid, p_roles text[])
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from org_members
    where organization_id = p_org_id
      and user_id = auth.uid()
      and role = any(p_roles)
  );
$$;

-- ============================================================
-- RLS POLICIES — ORGANIZATIONS
-- ============================================================
create policy "members can view their org"
  on organizations for select
  using (id in (select get_user_org_ids()));

create policy "owners can update their org"
  on organizations for update
  using (user_has_role(id, array['owner']));

-- ============================================================
-- RLS POLICIES — ORG_MEMBERS
-- ============================================================
create policy "members can view org members"
  on org_members for select
  using (organization_id in (select get_user_org_ids()));

create policy "owners and admins can manage members"
  on org_members for all
  using (user_has_role(organization_id, array['owner', 'admin']));

create policy "system can insert members on signup"
  on org_members for insert
  with check (user_id = auth.uid() or user_has_role(organization_id, array['owner', 'admin']));

-- ============================================================
-- RLS POLICIES — APIARIES
-- ============================================================
create policy "members can view apiaries"
  on apiaries for select
  using (organization_id in (select get_user_org_ids()));

create policy "owners and admins can insert apiaries"
  on apiaries for insert
  with check (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners and admins can update apiaries"
  on apiaries for update
  using (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners can delete apiaries"
  on apiaries for delete
  using (user_has_role(organization_id, array['owner']));

-- ============================================================
-- RLS POLICIES — HIVES
-- ============================================================
create policy "members can view hives"
  on hives for select
  using (organization_id in (select get_user_org_ids()));

create policy "owners and admins can insert hives"
  on hives for insert
  with check (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners and admins can update hives"
  on hives for update
  using (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners can delete hives"
  on hives for delete
  using (user_has_role(organization_id, array['owner']));

-- ============================================================
-- RLS POLICIES — QUEENS
-- ============================================================
create policy "members can view queens"
  on queens for select
  using (organization_id in (select get_user_org_ids()));

create policy "owners and admins can insert queens"
  on queens for insert
  with check (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners and admins can update queens"
  on queens for update
  using (user_has_role(organization_id, array['owner', 'admin']));

create policy "owners can delete queens"
  on queens for delete
  using (user_has_role(organization_id, array['owner']));

-- ============================================================
-- RLS POLICIES — INSPECTIONS
-- ============================================================
create policy "members can view inspections"
  on inspections for select
  using (organization_id in (select get_user_org_ids()));

create policy "members can insert inspections"
  on inspections for insert
  with check (
    organization_id in (select get_user_org_ids())
    and inspector_id = auth.uid()
  );

create policy "inspector or admin can update inspection"
  on inspections for update
  using (
    inspector_id = auth.uid()
    or user_has_role(organization_id, array['owner', 'admin'])
  );

create policy "owners and admins can delete inspections"
  on inspections for delete
  using (user_has_role(organization_id, array['owner', 'admin']));

-- ============================================================
-- RLS POLICIES — OBSERVATIONS
-- ============================================================
create policy "members can view observations"
  on observations for select
  using (organization_id in (select get_user_org_ids()));

create policy "members can insert observations"
  on observations for insert
  with check (organization_id in (select get_user_org_ids()));

create policy "members can update their observations"
  on observations for update
  using (organization_id in (select get_user_org_ids()));

create policy "owners and admins can delete observations"
  on observations for delete
  using (user_has_role(organization_id, array['owner', 'admin']));

-- ============================================================
-- RLS POLICIES — INSPECTION_PHOTOS
-- ============================================================
create policy "members can view photos"
  on inspection_photos for select
  using (organization_id in (select get_user_org_ids()));

create policy "members can insert photos"
  on inspection_photos for insert
  with check (
    organization_id in (select get_user_org_ids())
    and uploaded_by = auth.uid()
  );

create policy "uploader or admin can delete photos"
  on inspection_photos for delete
  using (
    uploaded_by = auth.uid()
    or user_has_role(organization_id, array['owner', 'admin'])
  );

-- ============================================================
-- STORAGE — bucket para fotos de inspecciones
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'inspection-photos',
  'inspection-photos',
  false,
  10485760,   -- 10 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

-- Storage RLS
create policy "members can upload inspection photos"
  on storage.objects for insert
  with check (
    bucket_id = 'inspection-photos'
    and auth.uid() is not null
  );

create policy "members can view inspection photos"
  on storage.objects for select
  using (
    bucket_id = 'inspection-photos'
    and auth.uid() is not null
  );

create policy "uploader can delete their photos"
  on storage.objects for delete
  using (
    bucket_id = 'inspection-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
create index idx_org_members_user_id       on org_members(user_id);
create index idx_org_members_org_id        on org_members(organization_id);
create index idx_apiaries_org_id           on apiaries(organization_id);
create index idx_hives_apiary_id           on hives(apiary_id);
create index idx_hives_org_id              on hives(organization_id);
create index idx_queens_hive_id            on queens(hive_id);
create index idx_inspections_hive_id       on inspections(hive_id);
create index idx_inspections_org_id        on inspections(organization_id);
create index idx_inspections_inspected_at  on inspections(inspected_at desc);
create index idx_observations_inspection   on observations(inspection_id);
create index idx_photos_inspection         on inspection_photos(inspection_id);
