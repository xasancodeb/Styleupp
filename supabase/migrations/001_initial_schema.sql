-- StyleUp initial schema
-- Tables, row-level security, the new-user trigger and the session counter RPC.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('client', 'stylist', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stylist_status as enum ('active', 'paused', 'suspended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type application_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles — one row per auth user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'client',
  avatar_url text,
  color_season text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stylists
-- ---------------------------------------------------------------------------
create table if not exists public.stylists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null,
  tagline text,
  bio text,
  city text,
  country text,
  specialties text[] not null default '{}',
  session_types text[] not null default '{}',
  starting_price numeric(10, 2) not null default 0,
  rating numeric(3, 2) not null default 0,
  sessions_completed integer not null default 0,
  commission_tier text not null default 'Starter',
  status stylist_status not null default 'active',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stylist_services
-- ---------------------------------------------------------------------------
create table if not exists public.stylist_services (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references public.stylists (id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null default 60,
  price numeric(10, 2) not null default 0,
  session_type text not null default 'virtual',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  stylist_id text not null,
  service_id text,
  service_name text not null,
  session_type text not null default 'virtual',
  scheduled_for timestamptz not null,
  amount numeric(10, 2) not null default 0,
  platform_fee numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status booking_status not null default 'pending',
  stripe_session_id text,
  stripe_payment_intent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  client_id uuid not null references public.profiles (id) on delete cascade,
  stylist_id text not null,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- stylist_applications
-- ---------------------------------------------------------------------------
create table if not exists public.stylist_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  city text,
  country text,
  years_experience integer,
  specialties text[] not null default '{}',
  portfolio_url text,
  about text,
  status application_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- ---------------------------------------------------------------------------
-- Indexes on foreign keys / hot columns
-- ---------------------------------------------------------------------------
create index if not exists idx_stylists_profile_id on public.stylists (profile_id);
create index if not exists idx_services_stylist_id on public.stylist_services (stylist_id);
create index if not exists idx_bookings_client_id on public.bookings (client_id);
create index if not exists idx_bookings_stylist_id on public.bookings (stylist_id);
create index if not exists idx_bookings_payment_intent on public.bookings (stripe_payment_intent);
create index if not exists idx_reviews_booking_id on public.reviews (booking_id);
create index if not exists idx_reviews_stylist_id on public.reviews (stylist_id);
create index if not exists idx_applications_status on public.stylist_applications (status);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_bookings_updated_at on public.bookings;
create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- handle_new_user — create a profile row whenever an auth user is created
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- increment_stylist_sessions — bump completed-session count after payment
-- ---------------------------------------------------------------------------
create or replace function public.increment_stylist_sessions(stylist_uuid text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  update public.stylists
  set sessions_completed = sessions_completed + 1
  where id::text = stylist_uuid or profile_id::text = stylist_uuid;
end;
$$;

-- ---------------------------------------------------------------------------
-- is_admin helper for policies
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.stylists enable row level security;
alter table public.stylist_services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.stylist_applications enable row level security;

-- profiles ------------------------------------------------------------------
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

-- stylists (public read) ----------------------------------------------------
drop policy if exists "stylists_select_all" on public.stylists;
create policy "stylists_select_all" on public.stylists
  for select using (true);

drop policy if exists "stylists_manage_own" on public.stylists;
create policy "stylists_manage_own" on public.stylists
  for all using (auth.uid() = profile_id or public.is_admin())
  with check (auth.uid() = profile_id or public.is_admin());

-- stylist_services (public read) --------------------------------------------
drop policy if exists "services_select_all" on public.stylist_services;
create policy "services_select_all" on public.stylist_services
  for select using (true);

drop policy if exists "services_manage_own" on public.stylist_services;
create policy "services_manage_own" on public.stylist_services
  for all using (
    public.is_admin()
    or exists (
      select 1 from public.stylists s
      where s.id = stylist_services.stylist_id and s.profile_id = auth.uid()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1 from public.stylists s
      where s.id = stylist_services.stylist_id and s.profile_id = auth.uid()
    )
  );

-- bookings ------------------------------------------------------------------
drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own" on public.bookings
  for select using (auth.uid() = client_id or public.is_admin());

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own" on public.bookings
  for insert with check (auth.uid() = client_id);

drop policy if exists "bookings_update_own" on public.bookings;
create policy "bookings_update_own" on public.bookings
  for update using (auth.uid() = client_id or public.is_admin())
  with check (auth.uid() = client_id or public.is_admin());

-- reviews -------------------------------------------------------------------
drop policy if exists "reviews_select_all" on public.reviews;
create policy "reviews_select_all" on public.reviews
  for select using (true);

drop policy if exists "reviews_insert_own" on public.reviews;
create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = client_id);

drop policy if exists "reviews_update_own" on public.reviews;
create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = client_id) with check (auth.uid() = client_id);

-- stylist_applications ------------------------------------------------------
-- Anyone may submit an application; only admins may read or review them.
drop policy if exists "applications_insert_public" on public.stylist_applications;
create policy "applications_insert_public" on public.stylist_applications
  for insert with check (true);

drop policy if exists "applications_select_admin" on public.stylist_applications;
create policy "applications_select_admin" on public.stylist_applications
  for select using (public.is_admin());

drop policy if exists "applications_update_admin" on public.stylist_applications;
create policy "applications_update_admin" on public.stylist_applications
  for update using (public.is_admin()) with check (public.is_admin());
