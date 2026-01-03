# /setup-stripe — Stripe subscriptions (safe + webhook-driven entitlements)

You are working inside a Next.js 15 App Router SaaS using:

- Stripe subscriptions
- Kinde Auth
- Prisma + Supabase
- USER-LEVEL tenancy
- Webhooks are the source of truth
- Webhook signature verification is mandatory
- Webhooks must be idempotent (store event.id)
- Quality Gate: npm run lint + npm run build must pass

======================================================================

FIRST: ASK THESE QUESTIONS (ONLY THESE)

1. Product pricing:
   - Price ID(s) already created in Stripe? If yes, list them.
   - If no, assume we will add env placeholders and proceed.

2. Plans:
   - Free + Plus? (default)
   - Any limits to enforce on Free?

If not provided, assume:

- Free + Plus
- No limits enforced yet (entitlements only)

======================================================================

THEN: EXECUTE IN THIS ORDER

STEP 0 — EXPLORE

- Locate existing auth pattern
- Locate existing prisma schema + migrations
- Check if any billing tables already exist
- Check existing env conventions

STEP 1 — PRISMA BILLING MODELS
Add models to prisma/schema.prisma (or adapt if present):
If models already exist, do NOT create a new migration. Proceed to STEP 2.

- StripeCustomer:
  - id (uuid)
  - userId (map user_id, unique)
  - stripeCustomerId (unique)
  - createdAt/updatedAt

- StripeEvent:
  - id (uuid)
  - stripeEventId (unique) <-- idempotency key
  - type
  - createdAt

- Subscription:
  - id (uuid)
  - userId (map user_id, index)
  - stripeSubscriptionId (unique)
  - status
  - priceId (optional)
  - currentPeriodEnd (optional)
  - cancelAtPeriodEnd (optional)
  - createdAt/updatedAt

Create and apply migration:

- npx prisma migrate dev --name billing_base

STEP 2 — STRIPE CLIENT + HELPERS
Create:

- lib/stripe.ts
  Includes:
- stripe client init (server-only)
- getOrCreateStripeCustomer(userId)
- createCheckoutSession(userId)
- createBillingPortalSession(userId)

Create:

- lib/entitlements.ts
  Includes:
- getSubscriptionStatus(userId)
- isPlusUser(userId) (true if active/trialing as defined)
- (optional) plan limit helpers (canCreateX)

Rules:

- Entitlements must NOT rely on client state
- Entitlements are derived from DB populated via webhooks

STEP 3 — CHECKOUT + PORTAL ROUTES
Create route handlers:

- app/api/stripe/checkout/route.ts
  - Auth required
  - Creates checkout session for logged-in user
  - Returns URL

- app/api/stripe/portal/route.ts
  - Auth required
  - Returns billing portal URL

- Billing Portal session MUST include a valid return_url
  (e.g. /settings or /pricing).
- User must always be redirected back to the app after portal actions.

NOTE (Local Dev):

- Billing Portal may not redirect back to localhost after cancel.
- This is a Stripe limitation.
- Verify cancel behavior via:
  - Webhook updates (cancel_at_period_end)
  - UI state after manual return

STEP 4 — WEBHOOK ROUTE (SOURCE OF TRUTH)
Create:

- Prefer webhook location: app/api/webhooks/stripe/route.ts

Requirements:

- Verify Stripe signature
- Parse event safely
- Idempotency:
  - If stripeEventId exists in StripeEvent table, return 200 immediately
  - Otherwise insert and proceed
- Handle at minimum:
  - checkout.session.completed
  - customer.subscription.created
  - customer.subscription.updated
  - customer.subscription.deleted
- Update Subscription table accordingly (upsert by stripeSubscriptionId)
- Ensure mapping of Stripe customer to user (StripeCustomer table)
- Checkout must set client_reference_id = kindeUser.id for mapping
- Local dev requires running: stripe listen --forward-to localhost:3000/api/webhooks/stripe
- Webhook secret (whsec...) changes every session and must be updated in .env.local
- If webhook is not running, UI will remain FREE after checkout
- Webhook MUST persist cancel_at_period_end from Stripe subscription updates.
- cancel_at_period_end = true MUST NOT revoke entitlements immediately.
- Entitlements remain active until current_period_end passes.

STEP 5 — PRICING PAGE + CTA
Create:

- app/pricing/page.tsx
  Requirements:
- Show Free vs Plus
- CTA button calls /api/stripe/checkout
- If already plus user, show Manage Billing button calling /api/stripe/portal
- Minimal, clean UI (Shadcn)

STEP 6 — ENFORCEMENT HOOKS (OPTIONAL, BUT PREFERRED)
Add guard helpers:

- In server actions that should be paid-only or limited, call entitlements helpers
- Return helpful errors (upgrade CTA copy)

STEP 7 — QUALITY GATE (MANDATORY)
Run:

- npm run lint
- npm run build

Fix issues before finishing.

======================================================================

ENV VARS (ADD TO .env.example)

- STRIPE_SECRET_KEY=
- STRIPE_WEBHOOK_SECRET=
- STRIPE_PRICE_ID_PLUS= (or multiple price IDs if needed)
- NEXT_PUBLIC_APP_URL=

Do not leak secrets to client.

======================================================================

OUTPUT FORMAT

1. Summary of billing system behavior
2. Files created/modified
3. Prisma models added/modified
4. Webhook events handled
5. Confirm idempotency behavior
6. Confirm lint + build status
