-- Leads: every email the marketing site captures (newsletter signups, city
-- waitlist, pre-booking questions to stylists). Written by the service role
-- from /api/leads only; no public read access.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('newsletter', 'waitlist', 'question')),
  email text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_type_created_idx on public.leads (type, created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;
-- No policies: only the service role (server API) can read or write.
