# StyleUp

A personal styling marketplace built with Next.js 15 (App Router), TypeScript,
Tailwind CSS v4, Supabase and Stripe. Clients discover their colour season, book
vetted stylists worldwide (virtual or in person), and manage everything from a
personal dashboard. Stylists apply to join and earn through tiered commission.

## Stack

- **Next.js 15** App Router with API routes
- **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Supabase** — auth, PostgreSQL and row-level security
- **Stripe** — hosted Checkout + webhooks

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

The app runs without keys for previewing the UI — Supabase and Stripe are lazily
initialised, and the booking flow falls back to a local confirmation when Stripe
isn't configured.

## Environment variables

See `.env.example`. You'll need a Supabase project (URL, anon key, service-role
key) and a Stripe account (publishable key, secret key, webhook secret).

## Database

Apply the migration in `supabase/migrations/001_initial_schema.sql` via the
Supabase SQL editor or CLI. It creates all tables, RLS policies, the
`handle_new_user()` trigger and the `increment_stylist_sessions()` RPC.

## Stripe webhook

Point a Stripe webhook at `/api/payments/webhook` for the events
`checkout.session.completed` and `charge.refunded`.

## Key routes

- `/` landing · `/explore` browse · `/stylist/[id]` profile · `/book` booking
- `/quiz` colour quiz · `/fitting` colour fitting room · `/dashboard` client area
- `/for-stylists`, `/stylist-portal`, `/corporate`, `/admin`
- `/auth/login`, `/auth/signup`, `/terms`, `/privacy`

## Business rules

- **Platform fee:** 5% added to every booking.
- **Commission tiers:** Starter 20%, Silver 15%, Gold 12%, Elite 10% (by monthly volume).
- **Cancellation:** >48h full refund · 24–48h 50% · <24h none.
