# FocusFlow — Backend Prompt

Build the backend for a production-ready SaaS MVP called **FocusFlow**.

This prompt defines **backend deliverables and correctness rules**.
Global engineering standards (tenancy, Stripe source-of-truth, etc.) live in `claude.md` and must be followed.

---

## Product Summary

FocusFlow is a lightweight workflow tracker:

- Projects (CRUD)
- Tasks within Projects (CRUD + complete toggle)
- Free vs Plus limits
- Stripe subscriptions for Plus

Plan rules:

- Free: max **3 projects**
- Plus: **unlimited projects**

---

## Execution Workflow

Follow: **Explore → Plan → Code → Verify → Commit**
Proceed automatically unless blocked.
Stop only at checkpoints.

---

## Checkpoints (Hard Stops)

1. Prisma schema + migrations complete
2. Server Actions for Projects + Tasks fully working (end-to-end)
3. Stripe billing + webhook-driven entitlements working
4. Final verification before polish / refactor

---

## Data Model (Prisma)

Models required:

- `Project` (user-owned)
- `Task` (belongs to Project)
- `StripeCustomer` (user ↔ customer mapping)
- `Subscription` (current entitlement state)
- `StripeEvent` (stores processed `event.id` for idempotency)

Minimum fields (high-level intent, not exhaustive):

- Project: `id`, `user_id`, `name`, timestamps
- Task: `id`, `user_id`, `project_id`, `title`, `completed`, timestamps
- StripeCustomer: `user_id`, `stripe_customer_id`
- Subscription: `user_id`, `stripe_customer_id`, `status`, `price_id`, `current_period_end`, `cancel_at_period_end`
- StripeEvent: `event_id`, timestamps

DB rules:

- User-owned models include `userId @map("user_id")` and `@@index([userId])`
- `Task` must also include `projectId @map("project_id")` + index on `projectId` (and usually compound index `[userId, projectId]`)
- Use migrations only (no manual DB edits)

---

## Server Actions (Core Backend API)

Implement Server Actions for:

### Projects

- create
- list (scoped to user)
- update (scoped)
- delete (scoped)
- enforce free-plan limit on create (max 3)

### Tasks

- create within project
- list by project (scoped)
- update (scoped)
- delete (scoped)
- toggle completion (scoped)

Backend correctness requirements:

- All actions authenticate
- All reads/writes scoped by `user_id`
- Never accept `user_id` from client
- Validate inputs with Zod (server-side)
- After mutations, trigger cache invalidation appropriately (e.g., `revalidatePath`) so UI can update without refresh (UI will call these actions; backend must provide the revalidation hooks)
- Revalidate the specific route that reads the mutated data (list + detail paths as applicable)

---

## Billing + Entitlements (Stripe)

Goals:

- Checkout + Billing Portal are wired
- Webhooks drive entitlement state
- Server Actions enforce plan limits based on entitlement state (never frontend)

Webhook handler responsibilities:

- Verify Stripe signature
- Store and dedupe `event.id` (idempotency)
- Maintain `StripeCustomer` mapping
- Maintain `Subscription` state (status, period end, cancel flag)
- On unknown/ambiguous states: default to **no entitlement**

Entitlement logic used by Server Actions:

- Plus access if subscription status is `active` or `trialing`
- Free otherwise
- Free plan limit enforced only when creating new projects

Local dev requirements:

- Stripe events only flow when `stripe listen` is running

---

## Quality Gate (Release Readiness)

Must pass:

- `npm run lint`
- `npm run build`
- `.env.example` exists
- No secrets exposed to client
- Backend logic is deploy-ready on Vercel

---

## Success Criteria (Backend)

- Auth enforced in every Server Action
- Tenancy isolation: impossible to access another user’s projects/tasks
- Free plan limit is enforced server-side
- Stripe webhooks correctly update subscription state
- Subscription state correctly gates project creation
- Clean, predictable error handling for invalid inputs and unauthorized access
