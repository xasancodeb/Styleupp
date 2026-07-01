# StyleUp — launch checklist

Everything the site promises works when the environment below is configured.
Without it the site still renders and browses fine, but payments, auth and
lead capture will be disabled.

## 1. Environment variables (Vercel → Project → Settings → Environment Variables)

Required for launch:

| Variable | What it does | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Database + auth | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser auth | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes (bookings, leads) | Supabase → Project Settings → API (keep secret) |
| `STRIPE_SECRET_KEY` | Payments (bookings + gift cards) | Stripe dashboard → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Confirms payments | Stripe → Webhooks (see step 3) |
| `NEXT_PUBLIC_APP_URL` | Absolute URLs (sitemap, redirects) | Your production URL, e.g. `https://styleup.example` |

Optional but recommended:

| Variable | What it does |
| --- | --- |
| `RESEND_API_KEY` + `EMAIL_FROM` | Transactional email (booking confirmations) |
| `ADMIN_EMAILS` | Comma-separated emails that get the admin role |
| `RATE_LIMIT_PER_MINUTE` | Override default API rate limit |
| `CRON_SECRET` | Protects any scheduled endpoints |

## 2. Database

Run the migrations in `supabase/migrations/` in order (Supabase SQL editor or CLI):

1. `001_initial_schema.sql`
2. `002_production_schema.sql`
3. `003_leads.sql` ← new: stores newsletter signups, city waitlist and
   pre-booking questions. **Must be run before launch** or those three forms
   return a friendly error.

## 3. Stripe webhook

Stripe dashboard → Developers → Webhooks → Add endpoint:

- URL: `https://<your-domain>/api/payments/webhook`
- Events: `checkout.session.completed`, `checkout.session.expired`
- Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Gift-card purchases are Stripe Checkout sessions with `metadata.kind = "gift_card"`;
the code, recipient and message are stored in the session metadata (and mirrored
into the `leads` table), so support can verify any code from the Stripe dashboard.

## 4. Before you flip the switch — 10-minute smoke test

1. Home page: run the match flow end to end (pick a need → country → results).
2. Waitlist: enter a city with no stylists → submit an email → check the
   `leads` table for the row.
3. Quiz: complete it → result shows → explore now shows "% match" badges.
4. Profile: open a stylist → "Ask a question" → check `leads` for the row.
5. Booking: sign up, book a session with a Stripe **test** card (4242 4242
   4242 4242), confirm the booking appears in the dashboard and the webhook
   marks it paid.
6. Gift card: buy one with the test card → code appears on the success page →
   session visible in Stripe with metadata.
7. Newsletter (footer): submit → row in `leads`.
8. Switch Stripe from test keys to live keys. Re-run step 5 with a real card,
   then refund yourself in the Stripe dashboard.

## 5. Honest-content notes

- The roster, its photos (stock), review counts and ratings are placeholder
  catalogue data. Replace with real stylists as they onboard — each stylist is
  one object in `lib/data.ts` (plus `EXTRAS` and `STYLIST_GENDER` entries).
- Business promises shown on-site that YOU must honour operationally:
  "Love your first session or it's free", "Cancel free up to 48h",
  "£20 credit when we launch in your city", "vetted stylists".
  They live in `components/PromiseStrip.tsx`, `components/FAQ.tsx` and
  `components/MatchRequest.tsx` if you want to change the wording.
- Gift-card redemption is manual for now: verify the code in Stripe metadata
  (or the `leads` table) and apply it as a discount/refund when the recipient
  books. Automate later.
