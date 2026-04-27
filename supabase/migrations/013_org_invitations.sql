-- ============================================================
-- INVITACIONES DE EQUIPO
-- ============================================================

create table org_invitations (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  invited_by      uuid not null references auth.users(id),
  role            text not null default 'member' check (role in ('owner', 'admin', 'member')),
  token           text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at      timestamptz not null default now() + interval '7 days',
  accepted_at     timestamptz,
  accepted_by     uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table org_invitations enable row level security;

-- Miembros de la org pueden ver sus invitaciones
create policy "org members view invitations"
  on org_invitations for select
  using (organization_id in (select get_user_org_ids()));

-- Owners y admins gestionan invitaciones
create policy "owners and admins manage invitations"
  on org_invitations for all
  using (
    exists (
      select 1 from org_members
      where user_id = auth.uid()
        and organization_id = org_invitations.organization_id
        and role in ('owner', 'admin')
    )
  );

create index idx_org_invitations_org_id on org_invitations(organization_id);
create index idx_org_invitations_token  on org_invitations(token);

-- ============================================================
-- MODIFICAR TRIGGER: saltear creación de org si viene de invite
-- ============================================================
create or replace function handle_new_user_organization()
returns trigger language plpgsql security definer as $$
declare
  org_id   uuid;
  org_slug text;
begin
  -- Si el usuario viene de un invite, no crear org propia
  if (new.raw_user_meta_data->>'skip_org_creation')::boolean = true then
    return new;
  end if;

  org_slug := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-z0-9]', '-', 'g'))
              || '-' || substr(new.id::text, 1, 8);

  insert into organizations (name, slug)
  values (
    coalesce(new.raw_user_meta_data->>'org_name', split_part(new.email, '@', 1) || '''s Apiary'),
    org_slug
  )
  returning id into org_id;

  insert into org_members (organization_id, user_id, role)
  values (org_id, new.id, 'owner');

  return new;
end;
$$;

-- Permitir que el sistema inserte en org_members al aceptar invitación
-- (service_role bypasses RLS, handled in server action)
