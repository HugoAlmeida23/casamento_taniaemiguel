-- ============================================================================
--  CASAMENTO TÂNIA & MIGUEL — Supabase full setup (idempotent)
--
--  Run this ONCE in Supabase → SQL Editor → New query → Run.
--  Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS guards and the
--  attendees backfill only runs while that table is empty.
--
--  It sets up EVERYTHING the site's forms need on the wedding day:
--    • guests          — RSVP confirmations
--    • attendees       — one row per person (per-person table seating)
--    • tables          — the wedding tables
--    • photos          — live guest photo gallery metadata
--    • music_requests  — song suggestions for the DJ
--    • storage bucket  — wedding-photos (public read, anon upload)
--    • RLS policies     — so the anon key (used by the site) can do what it needs
--
--  SECURITY NOTE: the site talks to Supabase with the public anon key, so these
--  policies are intentionally permissive (anonymous insert/select, and
--  update/delete for admin actions). This is normal for a small private wedding
--  site. For stronger control, move the admin to Supabase Auth and tighten the
--  update/delete policies to the "authenticated" role.
-- ============================================================================

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ============================================================================
--  1) TABLES (create if they don't already exist)
-- ============================================================================

-- --- tables (wedding tables) ---
create table if not exists public.tables (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  capacity   integer not null default 8,
  created_at timestamptz not null default now()
);

-- --- guests (RSVP bookings) ---
create table if not exists public.guests (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  telefone   text,
  attending  boolean default true,
  acompanha  integer default 0,
  restricoes text,
  companions jsonb default '[]'::jsonb,
  mensagem   text,
  mesa_id    uuid references public.tables(id) on delete set null,
  checked_in integer default 0,
  created_at timestamptz not null default now()
);

-- --- attendees (one row per physical person) ---
create table if not exists public.attendees (
  id         uuid primary key default gen_random_uuid(),
  guest_id   uuid not null references public.guests(id) on delete cascade,
  name       text not null,
  type       text not null default 'adult',   -- 'adult' | 'child'
  is_primary boolean not null default false,
  allergy    text,
  mesa_id    uuid references public.tables(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists attendees_guest_id_idx on public.attendees(guest_id);
create index if not exists attendees_mesa_id_idx  on public.attendees(mesa_id);

-- --- photos (live gallery metadata) ---
create table if not exists public.photos (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null,
  uploader_name text default 'Anónimo',
  is_visible    boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists photos_created_at_idx on public.photos(created_at desc);

-- --- music_requests (song suggestions) ---
create table if not exists public.music_requests (
  id          uuid primary key default gen_random_uuid(),
  guest_name  text not null,
  song_artist text not null,
  created_at  timestamptz not null default now()
);

-- ============================================================================
--  2) ROW LEVEL SECURITY
-- ============================================================================
alter table public.tables         enable row level security;
alter table public.guests         enable row level security;
alter table public.attendees      enable row level security;
alter table public.photos         enable row level security;
alter table public.music_requests enable row level security;

-- ---- tables ----
drop policy if exists "tables read"   on public.tables;
drop policy if exists "tables insert" on public.tables;
drop policy if exists "tables update" on public.tables;
drop policy if exists "tables delete" on public.tables;
create policy "tables read"   on public.tables for select to anon, authenticated using (true);
create policy "tables insert" on public.tables for insert to anon, authenticated with check (true);
create policy "tables update" on public.tables for update to anon, authenticated using (true) with check (true);
create policy "tables delete" on public.tables for delete to anon, authenticated using (true);

-- ---- guests ----
drop policy if exists "guests read"   on public.guests;
drop policy if exists "guests insert" on public.guests;
drop policy if exists "guests update" on public.guests;
drop policy if exists "guests delete" on public.guests;
create policy "guests read"   on public.guests for select to anon, authenticated using (true);
create policy "guests insert" on public.guests for insert to anon, authenticated with check (true);
create policy "guests update" on public.guests for update to anon, authenticated using (true) with check (true);
create policy "guests delete" on public.guests for delete to anon, authenticated using (true);

-- ---- attendees ----
drop policy if exists "attendees read"   on public.attendees;
drop policy if exists "attendees insert" on public.attendees;
drop policy if exists "attendees update" on public.attendees;
drop policy if exists "attendees delete" on public.attendees;
create policy "attendees read"   on public.attendees for select to anon, authenticated using (true);
create policy "attendees insert" on public.attendees for insert to anon, authenticated with check (true);
create policy "attendees update" on public.attendees for update to anon, authenticated using (true) with check (true);
create policy "attendees delete" on public.attendees for delete to anon, authenticated using (true);

-- ---- photos ----
drop policy if exists "photos read"   on public.photos;
drop policy if exists "photos insert" on public.photos;
drop policy if exists "photos update" on public.photos;
drop policy if exists "photos delete" on public.photos;
create policy "photos read"   on public.photos for select to anon, authenticated using (true);
create policy "photos insert" on public.photos for insert to anon, authenticated with check (true);
create policy "photos update" on public.photos for update to anon, authenticated using (true) with check (true);
create policy "photos delete" on public.photos for delete to anon, authenticated using (true);

-- ---- music_requests ----
drop policy if exists "music read"   on public.music_requests;
drop policy if exists "music insert" on public.music_requests;
drop policy if exists "music delete" on public.music_requests;
create policy "music read"   on public.music_requests for select to anon, authenticated using (true);
create policy "music insert" on public.music_requests for insert to anon, authenticated with check (true);
create policy "music delete" on public.music_requests for delete to anon, authenticated using (true);

-- ============================================================================
--  3) STORAGE — wedding-photos bucket (public read, anon upload + delete)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('wedding-photos', 'wedding-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "wedding-photos read"   on storage.objects;
drop policy if exists "wedding-photos insert" on storage.objects;
drop policy if exists "wedding-photos delete" on storage.objects;
create policy "wedding-photos read"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'wedding-photos');
create policy "wedding-photos insert"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'wedding-photos');
create policy "wedding-photos delete"
  on storage.objects for delete to anon, authenticated
  using (bucket_id = 'wedding-photos');

-- ============================================================================
--  4) BACKFILL attendees from existing guests (only while attendees is empty)
-- ============================================================================

-- 4a) Main contact of each booking.
insert into public.attendees (guest_id, name, type, is_primary, allergy, mesa_id, created_at)
select g.id, g.nome, 'adult', true, g.restricoes, g.mesa_id, g.created_at
from public.guests g
where not exists (select 1 from public.attendees);

-- 4b) One row per companion stored in guests.companions JSON.
insert into public.attendees (guest_id, name, type, is_primary, allergy, mesa_id, created_at)
select
  g.id,
  coalesce(nullif(trim(c->>'name'), ''), 'Acompanhante'),
  coalesce(c->>'type', 'adult'),
  false,
  nullif(trim(coalesce(c->>'allergy', '')), ''),
  g.mesa_id,
  g.created_at
from public.guests g
cross join lateral jsonb_array_elements(
  case when jsonb_typeof((g.companions)::jsonb) = 'array' then (g.companions)::jsonb else '[]'::jsonb end
) as c
where (select count(*) from public.attendees where is_primary = false) = 0;

-- ============================================================================
--  Done. Verify with:
--    select count(*) from public.attendees;
--    select * from storage.buckets where id = 'wedding-photos';
-- ============================================================================
