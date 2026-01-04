Build a production-ready SaaS MVP called FocusFlow.

PRODUCT

- What it does:
  A lightweight personal workflow tracker that helps users organize projects and tasks.

- Core problem:
  Users want a simple, fast way to track what they’re working on without heavy project management tools.

- Target users:
  Solo builders, freelancers, and professionals.

- Core features:

  1. Projects (create, list, update, delete)
  2. Tasks (create, list, update, complete)
  3. Usage limits (Free vs Plus)
  4. Billing via Stripe subscriptions

- Monetization:
  Free plan with a 3-project limit
  Plus plan with unlimited projects

WORKFLOW
Use: Explore → Plan → Code → Verify → Commit
Proceed automatically unless blocked.
Pause only at defined checkpoints.

CHECKPOINTS

1. After Prisma schema + migrations
2. After Projects + Tasks are fully clickable
3. After Stripe billing + entitlements
4. Before final polish

STEP 1: DATA MODEL (PRISMA)
Define models:

- Project (user-owned)
- Task (belongs to Project)
- StripeCustomer
- Subscription
- StripeEvent (idempotency)

Rules:

- Every user-owned model includes userId mapped to user_id
- Index by userId
- Use Prisma migrations only

STEP 2: CORE FEATURES
Projects:

- CRUD via Server Actions
- Enforce Free plan limit (3 projects)
- Shadcn UI components
- Loading, empty, error states

Tasks:

- CRUD within a Project
- Toggle completion
- Basic task list UI

STEP 3: BILLING

- Stripe checkout + portal
- Webhooks as source of truth
- Idempotent event handling
- Entitlements enforced in server actions

STEP 4: QUALITY + RELEASE

- npm run lint passes
- npm run build passes
- .env.example created
- No secrets in client
- Mobile responsive

SUCCESS CRITERIA

- Auth works
- Tenancy isolation enforced
- CRUD works end-to-end
- Stripe correctly gates limits
- Ready to deploy
