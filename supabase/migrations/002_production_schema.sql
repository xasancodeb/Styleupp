-- StyleUp production schema (phase 2)
-- Extends 001 with the full marketplace data model: availability, messaging,
-- payments, referrals, loyalty, archetypes, colour-season history, saved
-- stylists and notifications — plus double-booking prevention and richer RLS.

-- ───────────────────────────── extra enums ──────────────────────────────────
do $$ begin
  create type message_visibility as enum ('standard', 'contact');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'paid', 'refunded', 'partially_refunded', 'failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type referral_status as enum ('pending', 'completed', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending', 'published', 'hidden');
exception when duplicate_object then null; end $$;

-- ─────────────────────────── profiles additions ─────────────────────────────
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists archetype text;
alter table public.profiles add column if not exists referral_code text unique;
alter table public.profiles add column if not exists referred_by uuid references public.profiles (id);
alter table public.profiles add column if not exists loyalty_points integer not null default 0;
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists email_verified boolean not null default false;

-- ─────────────────────────── stylists additions ─────────────────────────────
alter table public.stylists alter column profile_id drop not null;
alter table public.stylists add column if not exists slug text;
alter table public.stylists add column if not exists avatar_url text;
alter table public.stylists add column if not exists cover_url text;
alter table public.stylists add column if not exists languages text[] not null default '{}';
alter table public.stylists add column if not exists years_experience integer not null default 0;
alter table public.stylists add column if not exists review_count integer not null default 0;
alter table public.stylists add column if not exists portfolio_images text[] not null default '{}';
alter table public.stylists add column if not exists commission_rate numeric(4, 3) not null default 0.20;
alter table public.stylists add column if not exists stripe_account_id text;
alter table public.stylists add column if not exists payouts_enabled boolean not null default false;
alter table public.stylists add column if not exists onboarding_complete boolean not null default false;
alter table public.stylists add column if not exists featured boolean not null default false;

create unique index if not exists idx_stylists_slug on public.stylists (slug) where slug is not null;
create unique index if not exists idx_stylists_stripe_account on public.stylists (stripe_account_id) where stripe_account_id is not null;

-- ─────────────────────────── bookings additions ─────────────────────────────
alter table public.bookings add column if not exists stylist_account_id uuid references public.stylists (id) on delete set null;
alter table public.bookings add column if not exists reschedule_count integer not null default 0;
alter table public.bookings add column if not exists rescheduled_from timestamptz;
alter table public.bookings add column if not exists confirmed_at timestamptz;
alter table public.bookings add column if not exists cancelled_at timestamptz;
alter table public.bookings add column if not exists completed_at timestamptz;
alter table public.bookings add column if not exists cancellation_reason text;
alter table public.bookings add column if not exists refund_amount numeric(10, 2) not null default 0;
alter table public.bookings add column if not exists duration_minutes integer not null default 60;
alter table public.bookings add column if not exists notes text;

-- Prevent double-booking: a stylist cannot hold two live bookings at the same
-- start time. Cancelled/refunded slots free up again.
create unique index if not exists idx_bookings_no_double_book
  on public.bookings (stylist_id, scheduled_for)
  where status in ('pending', 'confirmed', 'completed');

create index if not exists idx_bookings_account_id on public.bookings (stylist_account_id);
create index if not exists idx_bookings_scheduled_for on public.bookings (scheduled_for);

-- ─────────────────────────── reviews moderation ─────────────────────────────
alter table public.reviews add column if not exists status review_status not null default 'published';
create unique index if not exists idx_reviews_unique_booking on public.reviews (booking_id);

-- ────────────────────────── stylist_availability ────────────────────────────
create table if not exists public.stylist_availability (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references public.stylists (id) on delete cascade,
  weekday smallint check (weekday between 0 and 6),     -- recurring weekly rule
  specific_date date,                                   -- one-off override
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  slot_minutes integer not null default 60,
  is_available boolean not null default true,           -- false = blackout
  created_at timestamptz not null default now(),
  check (weekday is not null or specific_date is not null)
);
create index if not exists idx_availability_stylist on public.stylist_availability (stylist_id);

-- ───────────────────────────────── messages ─────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  visibility message_visibility not null default 'standard',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_messages_booking on public.messages (booking_id);
create index if not exists idx_messages_recipient on public.messages (recipient_id);

-- ───────────────────────────────── payments ─────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings (id) on delete set null,
  client_id uuid not null references public.profiles (id) on delete cascade,
  stylist_account_id uuid references public.stylists (id) on delete set null,
  amount numeric(10, 2) not null default 0,
  platform_fee numeric(10, 2) not null default 0,
  stylist_earnings numeric(10, 2) not null default 0,
  currency text not null default 'gbp',
  status payment_status not null default 'pending',
  refunded_amount numeric(10, 2) not null default 0,
  stripe_payment_intent text,
  stripe_charge_id text,
  stripe_transfer_id text,
  created_at timestamptz not null default now()
);
create index if not exists idx_payments_booking on public.payments (booking_id);
create index if not exists idx_payments_client on public.payments (client_id);
create index if not exists idx_payments_intent on public.payments (stripe_payment_intent);

-- ──────────────────────────────── referrals ─────────────────────────────────
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_email text not null,
  referred_id uuid references public.profiles (id) on delete set null,
  code text not null,
  status referral_status not null default 'pending',
  reward_points integer not null default 250,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists idx_referrals_referrer on public.referrals (referrer_id);
create index if not exists idx_referrals_code on public.referrals (code);

-- ─────────────────────────── loyalty_milestones ─────────────────────────────
create table if not exists public.loyalty_milestones (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  milestone text not null,
  points_required integer not null,
  reward text,
  achieved_at timestamptz not null default now(),
  unique (profile_id, milestone)
);
create index if not exists idx_loyalty_profile on public.loyalty_milestones (profile_id);

-- ──────────────────────────── style_archetypes ──────────────────────────────
create table if not exists public.style_archetypes (
  id text primary key,
  name text not null,
  description text not null
);

insert into public.style_archetypes (id, name, description) values
  ('classic', 'The Classic', 'Timeless, polished and considered. You invest in pieces that outlast trends.'),
  ('creative', 'The Creative', 'Expressive and bold. You treat dressing as a daily act of self-expression.'),
  ('minimalist', 'The Minimalist', 'Clean lines, quiet luxury, and a wardrobe that works as hard as you do.'),
  ('romantic', 'The Romantic', 'Soft textures, flowing silhouettes and details that feel personal.'),
  ('edge', 'The Edge', 'Sharp, modern and unafraid. You like contrast, structure and statement pieces.')
on conflict (id) do nothing;

-- ────────────────────────── colour_season_results ───────────────────────────
create table if not exists public.color_season_results (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  season text not null,
  answers jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_color_results_profile on public.color_season_results (profile_id);

-- ───────────────────────────── saved_stylists ───────────────────────────────
create table if not exists public.saved_stylists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  stylist_slug text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, stylist_slug)
);
create index if not exists idx_saved_profile on public.saved_stylists (profile_id);

-- ─────────────────────────────── notifications ──────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_profile on public.notifications (profile_id);

-- ─────────────────────── enrich the new-user trigger ────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  desired_role user_role := 'client';
  gen_code text := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
begin
  if (new.raw_user_meta_data ->> 'role') in ('client', 'stylist') then
    desired_role := (new.raw_user_meta_data ->> 'role')::user_role;
  end if;

  insert into public.profiles (id, email, full_name, role, referral_code, email_verified)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    desired_role,
    gen_code,
    coalesce(new.email_confirmed_at is not null, false)
  )
  on conflict (id) do nothing;

  -- Link a pending referral if the new user signed up via a code.
  if (new.raw_user_meta_data ->> 'referral_code') is not null then
    update public.referrals
    set referred_id = new.id
    where code = (new.raw_user_meta_data ->> 'referral_code') and referred_id is null;
  end if;

  return new;
end;
$$;

-- Keep profiles.email_verified in sync when the user confirms their email.
create or replace function public.handle_user_email_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and (old.email_confirmed_at is null) then
    update public.profiles set email_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute function public.handle_user_email_confirmed();

-- ──────────── award loyalty points + complete referral on first paid booking ─
create or replace function public.handle_booking_confirmed()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status in ('confirmed', 'completed') and (old.status is distinct from new.status) then
    -- 1 point per whole pound spent.
    update public.profiles
    set loyalty_points = loyalty_points + floor(new.total)::int
    where id = new.client_id;

    -- Complete any pending referral for this client.
    update public.referrals r
    set status = 'completed', completed_at = now()
    where r.referred_id = new.client_id and r.status = 'pending';
  end if;
  return new;
end;
$$;

drop trigger if exists on_booking_confirmed on public.bookings;
create trigger on_booking_confirmed
  after update on public.bookings
  for each row execute function public.handle_booking_confirmed();

-- ───────────────────────────────── RLS ──────────────────────────────────────
alter table public.stylist_availability enable row level security;
alter table public.messages enable row level security;
alter table public.payments enable row level security;
alter table public.referrals enable row level security;
alter table public.loyalty_milestones enable row level security;
alter table public.style_archetypes enable row level security;
alter table public.color_season_results enable row level security;
alter table public.saved_stylists enable row level security;
alter table public.notifications enable row level security;

-- availability: public read, stylist/admin manage
drop policy if exists "availability_select_all" on public.stylist_availability;
create policy "availability_select_all" on public.stylist_availability for select using (true);

drop policy if exists "availability_manage_own" on public.stylist_availability;
create policy "availability_manage_own" on public.stylist_availability
  for all using (
    public.is_admin() or exists (
      select 1 from public.stylists s where s.id = stylist_availability.stylist_id and s.profile_id = auth.uid()
    )
  ) with check (
    public.is_admin() or exists (
      select 1 from public.stylists s where s.id = stylist_availability.stylist_id and s.profile_id = auth.uid()
    )
  );

-- messages: only the two participants (or admin) can read/write
drop policy if exists "messages_select_participants" on public.messages;
create policy "messages_select_participants" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id or public.is_admin());

drop policy if exists "messages_insert_sender" on public.messages;
create policy "messages_insert_sender" on public.messages
  for insert with check (auth.uid() = sender_id);

drop policy if exists "messages_update_recipient" on public.messages;
create policy "messages_update_recipient" on public.messages
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);

-- payments: client or admin read; writes happen via service role only
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments
  for select using (auth.uid() = client_id or public.is_admin());

-- referrals
drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id or public.is_admin());

drop policy if exists "referrals_insert_own" on public.referrals;
create policy "referrals_insert_own" on public.referrals
  for insert with check (auth.uid() = referrer_id);

-- loyalty
drop policy if exists "loyalty_select_own" on public.loyalty_milestones;
create policy "loyalty_select_own" on public.loyalty_milestones
  for select using (auth.uid() = profile_id or public.is_admin());

-- archetypes: public reference data
drop policy if exists "archetypes_select_all" on public.style_archetypes;
create policy "archetypes_select_all" on public.style_archetypes for select using (true);

-- colour results
drop policy if exists "color_results_select_own" on public.color_season_results;
create policy "color_results_select_own" on public.color_season_results
  for select using (auth.uid() = profile_id or public.is_admin());

drop policy if exists "color_results_insert_own" on public.color_season_results;
create policy "color_results_insert_own" on public.color_season_results
  for insert with check (auth.uid() = profile_id);

-- saved stylists
drop policy if exists "saved_manage_own" on public.saved_stylists;
create policy "saved_manage_own" on public.saved_stylists
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- notifications
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select using (auth.uid() = profile_id);

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
