# StyleUp — Deployment & Operations

StyleUp is a Next.js 16 marketplace backed by Supabase (auth + Postgres + RLS)
and Stripe Connect (payments + payouts). This guide covers provisioning,
configuration, database migrations and the two supported deploy targets:
**Vercel** and **Docker**.

---

## 1. Prerequisites

- Node.js 22+
- A Supabase project
- A Stripe account with **Connect enabled** (Settings → Connect)
- (Optional) A Resend account for transactional email
- `psql` available locally if you run migrations from your machine

---

## 2. Environment variables

Copy `.env.example` to `.env.local` (dev) or configure them in your host's
secret manager (prod). All variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public base URL (used for redirects, emails, Stripe return URLs) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key (browser + RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (server-only, bypasses RLS) |
| `SUPABASE_DB_URL` | migrations | Postgres connection string for `db:migrate` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ✅ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Signing secret for the webhook endpoint |
| `STRIPE_PLATFORM_FEE_RATE` | optional | Default commission rate (default 0.20) |
| `RESEND_API_KEY` | optional | Enables real email; logs to console if unset |
| `EMAIL_FROM` | optional | From address for transactional email |
| `ADMIN_EMAILS` | optional | Comma-separated emails auto-granted the admin role |
| `RATE_LIMIT_PER_MINUTE` | optional | Per-IP request ceiling for sensitive routes |

> **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `STRIPE_SECRET_KEY` to the
> browser. Only `NEXT_PUBLIC_*` values are sent to clients.

---

## 3. Database setup

Migrations live in `supabase/migrations/` and are applied in filename order:

1. `001_initial_schema.sql` — core tables, RLS, new-user trigger, sessions RPC
2. `002_production_schema.sql` — availability, messaging, payments, referrals,
   loyalty, archetypes, colour-season history, saved stylists, notifications,
   double-booking constraint, richer RLS and triggers

Apply them with either:

```bash
# Option A — the bundled script (needs SUPABASE_DB_URL)
npm run db:migrate

# Option B — Supabase CLI
supabase db push

# Option C — paste each file into the Supabase SQL editor, in order
```

The migrations are idempotent (`create ... if not exists`, `add column if not
exists`, `drop policy if exists`) so they're safe to re-run.

### Granting admin

Add your email to `ADMIN_EMAILS`; the role is granted automatically on your next
sign-in via the auth callback. Alternatively run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

---

## 4. Stripe configuration

1. **Enable Connect** (Express accounts) in the Stripe Dashboard.
2. Create a webhook endpoint pointing at `https://<your-domain>/api/payments/webhook`
   subscribed to:
   - `checkout.session.completed`
   - `charge.refunded`
   - `account.updated`
   - `payment_intent.payment_failed`
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

Stylists connect their payout account from **Stylist studio → Payouts**, which
runs Express onboarding. Funds are transferred automatically on each paid
booking, minus the platform application fee (service fee + tier commission).

---

## 5. Deploy: Vercel

1. Import the repo into Vercel.
2. Add every environment variable from the table above.
3. Build settings are already in `vercel.json` (`npm ci` / `npm run build`).
4. After the first deploy, run migrations against your Supabase DB and add the
   Stripe webhook for the production URL.

---

## 6. Deploy: Docker

The app builds to a standalone server (`output: "standalone"`).

```bash
# Build the image
docker build -t styleup:latest .

# Run with your env file
docker run --env-file .env -p 3000:3000 styleup:latest

# …or with compose (includes a health check on /api/health)
docker compose up -d --build
```

The container runs as a non-root user and exposes port 3000. Put it behind a
TLS-terminating reverse proxy (nginx, Caddy, a cloud load balancer) in
production.

### Scaling notes

- The in-memory rate limiter (`lib/rate-limit.ts`) is per-instance. For multiple
  replicas, back it with Redis/Upstash by swapping the `rateLimit` implementation.
- Sessions and data are external (Supabase), so the web tier is stateless and
  horizontally scalable.

---

## 6b. Scheduled reminders (cron)

24-hour booking reminders are sent by `GET /api/cron/reminders`, secured with
`CRON_SECRET`.

- **Vercel:** already wired in `vercel.json` (`crons`) to run hourly. Set
  `CRON_SECRET`; Vercel sends it automatically as an `Authorization: Bearer`
  header.
- **Docker / other:** add a cron job, e.g.
  ```
  0 * * * * curl -fsS -H "x-cron-secret: $CRON_SECRET" https://<domain>/api/cron/reminders
  ```

The endpoint dedupes via existing reminder notifications, so re-runs are safe.

---

## 7. Post-deploy checklist

- [ ] Migrations applied (`npm run db:migrate`)
- [ ] Stripe webhook verified (send a test event)
- [ ] An admin account exists (`ADMIN_EMAILS` or SQL)
- [ ] `NEXT_PUBLIC_APP_URL` matches the live domain
- [ ] Email sending verified (Resend) or intentionally console-only
- [ ] A test booking completes end-to-end (checkout → webhook → confirmation email)

---

## 8. Health & monitoring

- Liveness: `GET /api/health` returns `{ "status": "ok" }`.
- Application logs surface email/webhook/payment errors to stdout.
- Supabase provides Postgres metrics and logs; Stripe provides payment logs.
