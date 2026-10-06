# StyleUp

A personal styling marketplace built with Next.js 15 (App Router), TypeScript,
Tailwind CSS v4, Supabase and Stripe. Clients discover their colour season, book
vetted stylists worldwide (virtual or in person), and manage everything from a
personal dashboard. Stylists apply to join and earn through tiered commission.

## Stack

- **Next.js 15** App Router with API routes
- **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/postcss`)
- **Supabase** — auth, PostgreSQL, storage and row-level security
- **Stripe** — hosted Checkout + webhooks
- **Claude (Anthropic SDK)** — reads garment photos and builds outfits

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
key), a Stripe account (publishable key, secret key, webhook secret) and an
Anthropic API key (`ANTHROPIC_API_KEY`) for the wardrobe.

Without `ANTHROPIC_API_KEY` the rest of the site is unaffected: the wardrobe
pages still load, and adding a piece returns a clear 503 instead of failing.

## Database

Run `npm run db:migrate` to apply everything in `supabase/migrations` in order,
or paste each file into the Supabase SQL editor. Between them they create all
tables, RLS policies, the `handle_new_user()` trigger, the
`increment_stylist_sessions()` RPC, and the `wardrobe` storage bucket.

## Stripe webhook

Point a Stripe webhook at `/api/payments/webhook` for the events
`checkout.session.completed` and `charge.refunded`.

## Key routes

- `/` landing · `/explore` browse · `/stylist/[id]` profile · `/book` booking
- `/quiz` colour quiz · `/fitting` colour fitting room · `/dashboard` client area
- `/wardrobe` the digital wardrobe and AI outfit builder
- `/for-stylists`, `/stylist-portal`, `/corporate`, `/admin`
- `/auth/login`, `/auth/signup`, `/terms`, `/privacy`

## The wardrobe

Clients photograph what they own. Each photo goes to Claude with a vision
prompt and a structured output schema, which returns the garment's name,
category, dominant colour (name and hex), pattern, formality and warmth; the
image lands in the `wardrobe` storage bucket under the owner's uuid.

Asking for an outfit sends the catalogue plus the client's colour-season
palette to Claude, which returns complete looks built only from pieces they
own, the reasoning behind each, and the one gap worth buying.

Two things are deliberate in `lib/ai.ts`: the model may only cite item ids
from the catalogue it was given, and every returned id is checked against the
real wardrobe before an outfit is stored, so a hallucinated id can never reach
the database or the interface.

## Business rules

- **Platform fee:** 5% added to every booking.
- **Commission tiers:** Starter 20%, Silver 15%, Gold 12%, Elite 10% (by monthly volume).
- **Cancellation:** >48h full refund · 24–48h 50% · <24h none.
