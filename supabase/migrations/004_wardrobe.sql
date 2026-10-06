-- ════════════════════════════════════════════════════════════════════════════
-- 004_wardrobe.sql — the digital wardrobe and AI-generated outfits.
--
-- This is what turns StyleUp from a directory into a product: clients
-- photograph what they already own, Claude reads each garment, and outfits are
-- built from their real clothes against their colour season. Their stylist
-- then walks into the session already knowing the wardrobe.
-- ════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────── wardrobe_items ───────────────────────────────
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  image_url text not null,
  -- Everything below is filled in by the vision pass, then editable by hand.
  name text not null,
  category text not null,
  color_name text,
  color_hex text,
  pattern text,
  formality text,
  warmth text,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_wardrobe_profile on public.wardrobe_items (profile_id, created_at desc);

-- ──────────────────────────────── outfits ───────────────────────────────────
-- item_ids is a plain uuid[] rather than a join table: an outfit is always
-- read whole, never queried by member, and this keeps generation a single
-- insert. Deleting a garment leaves stale ids, which the read path filters.
create table if not exists public.outfits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  occasion text not null,
  rationale text,
  missing_piece text,
  item_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_outfits_profile on public.outfits (profile_id, created_at desc);

-- ─────────────────────────── row level security ─────────────────────────────
alter table public.wardrobe_items enable row level security;
alter table public.outfits enable row level security;

-- A wardrobe is private to its owner. Stylists see it only through a booking,
-- which is handled server-side with the service role, never by a broad policy.
drop policy if exists "wardrobe_manage_own" on public.wardrobe_items;
create policy "wardrobe_manage_own" on public.wardrobe_items
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

drop policy if exists "outfits_manage_own" on public.outfits;
create policy "outfits_manage_own" on public.outfits
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- ──────────────────────────────── storage ───────────────────────────────────
-- Garment photos. Public-read because next/image fetches them directly from
-- the browser; object keys are '<profile uuid>/<random uuid>.jpg', so they are
-- unguessable, and nothing identifying is stored in the path. Writes and
-- deletes stay restricted to the owner.
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', true)
on conflict (id) do nothing;

drop policy if exists "wardrobe_objects_read" on storage.objects;
create policy "wardrobe_objects_read" on storage.objects
  for select using (bucket_id = 'wardrobe');

drop policy if exists "wardrobe_objects_write_own" on storage.objects;
create policy "wardrobe_objects_write_own" on storage.objects
  for insert with check (
    bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe_objects_delete_own" on storage.objects;
create policy "wardrobe_objects_delete_own" on storage.objects
  for delete using (
    bucket_id = 'wardrobe' and (storage.foldername(name))[1] = auth.uid()::text
  );
