# FocusFlow - SaaS Golden Base

A production-ready SaaS MVP built with Next.js 15, Stripe subscriptions, Kinde Auth, and Prisma.

## Quick Start

```bash
npm install
npx prisma generate
npm run dev
```

Open:
- http://localhost:3000 (marketing page)
- http://localhost:3000/dashboard (requires Kinde auth)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Fill in your credentials:
   - Supabase: `DATABASE_URL`
   - Kinde Auth: `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_ISSUER_URL`
   - Stripe: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_PLUS`

## Stripe Local Development (IMPORTANT)

To test Stripe subscriptions locally, you **MUST** run the Stripe webhook listener in a separate terminal.

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook secret from Terminal 2 output and add to `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

**See [STRIPE_LOCAL_DEV.md](STRIPE_LOCAL_DEV.md) for complete guide.**

## Database Migrations

If tables are missing in Supabase:
```bash
npx prisma migrate deploy
```

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **Styling:** Tailwind CSS, Shadcn UI
- **Database:** Supabase (PostgreSQL), Prisma ORM
- **Auth:** Kinde Auth
- **Payments:** Stripe (subscriptions)
- **Email:** Resend (optional)

## Features

- ✅ Projects & Tasks management
- ✅ Free plan (3 projects) vs Plus plan (unlimited)
- ✅ Stripe subscriptions with webhook-driven entitlements
- ✅ User-level tenancy isolation
- ✅ Mobile-responsive UI

## Documentation

- [STRIPE_LOCAL_DEV.md](STRIPE_LOCAL_DEV.md) - Stripe local testing guide
- [STRIPE_CANCEL_BEHAVIOR.md](STRIPE_CANCEL_BEHAVIOR.md) - Subscription cancellation flow
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues and solutions
- [CLAUDE.md](CLAUDE.md) - Development contract & conventions
- [.env.example](.env.example) - Environment variables reference
