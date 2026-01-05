# SaaS MVP Development Guide (Claude Code Contract)

This repository is a production-ready SaaS MVP baseline.All development must follow this contract.

When in doubt: **security > correctness > clarity > speed**.

======================================================================

TECH STACK (FIXED)

Frontend:

- Next.js (App Router)
- React 18
- TypeScript (strict)

Styling:

- Tailwind CSS
- shadcn/ui

Database:

- Supabase (PostgreSQL)
- Prisma ORM

Auth:

- Kinde Auth

Payments:

- Stripe (subscriptions)

Email:

- Resend
- @react-email/components

Deployment:

- Vercel

Do NOT introduce alternative libraries or frameworks without explicit instruction.

======================================================================

TENANCY MODEL (CRITICAL)

This is a multi-tenant SaaS using USER-LEVEL tenancy.

Rules:

- Every user-owned table MUST include `user_id`
- Never accept `user_id` from the client
- Always derive `user_id` from the authenticated session
- Every query MUST scope by `user_id`
- Never return data belonging to another user

Violating this is a security bug.

======================================================================

PROJECT STRUCTURE

app/
├─ actions/ # Server Actions (all mutations)
├─ api/
│ ├─ auth/ # Kinde auth routes
│ └─ webhooks/
│ └─ stripe/ # Stripe webhook handler (MANDATORY)
├─ dashboard/ # Authenticated application UI
└─ [route]/page.tsx

components/ # Reusable UI components

prisma/
├─ schema.prisma # Prisma schema (source of truth)
└─ migrations/ # Prisma migrations

emails/ # React Email templates

lib/ # Utilities (auth, stripe, helpers)

Rules:

- Do not invent new top-level directories.
- Do not place Stripe logic outside the webhook handler.

======================================================================

CODE STANDARDS

TypeScript:

- Strict mode only
- No `any`
- Prefer interfaces for object shapes
- Explicit return types for Server Actions

React / Next.js:

- Server Components by default
- Use "use client" ONLY when required:
  - State (useState, useReducer)
  - Effects (useEffect, useLayoutEffect)
  - Event handlers
  - Browser-only APIs
- All mutations MUST use Server Actions
- Call revalidatePath() after mutations
- Explicit loading and error states are required

======================================================================

DATABASE RULES (SUPABASE + PRISMA)

- PostgreSQL via Supabase
- Prisma ORM is mandatory
- snake_case for database column names
- camelCase for Prisma model fields
- Use foreign keys and indexes explicitly
- Use transactions for multi-step operations
- Prisma migrations are the single source of truth
- Never edit the database manually in production

Prisma Conventions:

- Schema lives in prisma/schema.prisma
- Use prisma migrate for all schema changes
- Prefer explicit relations
- Avoid raw SQL unless absolutely necessary
- Keep models small and focused

Example Prisma model:

model Project {
id String @id @default(uuid())
userId String @map("user_id")
name String
createdAt DateTime @default(now()) @map("created_at")

@@index([userId])
}

======================================================================

AUTHENTICATION (MANDATORY)

Auth provider: **Kinde**

All protected pages assume the following routes exist.

Required auth route (NON-OPTIONAL):

app/api/auth/[kindeAuth]/route.ts

This must exist because protected pages redirect to:

- /api/auth/login

Every Server Action MUST enforce authentication.

Example pattern:

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function exampleAction() {
const { getUser } = getKindeServerSession();
const user = await getUser();

if (!user) {
throw new Error("Unauthorized");
}

return prisma.project.findMany({
where: { userId: user.id }
});
}

Rules:

- Never skip auth checks.

======================================================================

STRIPE CONTRACT (NON-NEGOTIABLE)

Stripe correctness matters more than UI polish.

Rules:

- Never trust client-side payment state
- All entitlements come from Stripe webhooks
- Stripe webhook handler MUST exist at:
  app/api/webhooks/stripe/route.ts
- Verify webhook signatures on every request
- Webhooks MUST be idempotent (store event.id)
- Subscription status is the single source of truth
- Never infer "paid" from frontend or session state
- Server Actions may READ subscription state, never WRITE it
- Local Stripe development requires running stripe listen in a separate terminal; without it, entitlements will not update.

Webhook handler responsibilities:

- Validate Stripe signature using STRIPE_WEBHOOK_SECRET
- Persist Stripe customer mapping:
  - user_id (Kinde) ↔ stripe_customer_id
- Persist subscription lifecycle changes
- Ignore duplicate events safely
- Default to locking access on unexpected states

If unsure, default to locking access.

======================================================================

STRIPE CANCELLATION CONTRACT

- Subscription cancellations must be end-of-period by default.
- Users MUST retain paid entitlements while:
  - status IN ("active", "trialing")
  - regardless of cancel_at_period_end.
- UI MUST display a clear notice:
  - “Cancels on <current_period_end>” when cancel_at_period_end = true.
- Downgrade MUST occur only after:
  - status transitions to "canceled"
  - OR current_period_end has passed.

Violating this is a billing correctness bug.

======================================================================

INPUT VALIDATION

- Validate all inputs with Zod
- Never trust client data
- Validate again on the server even if validated on the client

======================================================================

UI / UX RULES

- Mobile-first, responsive
- Use Shadcn UI components ONLY
- No custom design systems
- Every async action requires:
  - Loading state
  - Error state
- Prefer simple tables, forms, and cards
- Clear copy > clever copy

Optimize for clarity, not aesthetics.

======================================================================

UI THEME CONTRACT (SHADCN TOKENS)

This repo uses shadcn theme tokens via CSS variables in:

- app/globals.css

Rules:

- Theme changes MUST be made by editing token values in app/globals.css.
- Do NOT hardcode hex colors across components/pages unless explicitly requested.
- Keep business logic unchanged during UI-only work.
- Dark mode is supported via .dark class (Tailwind class strategy)

Allowed UI-only files:

- app/globals.css
- tailwind.config.ts (if required)
- Small isolated toggle component (optional)

ROOT LAYOUT REQUIREMENT

The <body> element MUST include token-based theme classes:

- bg-background
- text-foreground
- min-h-screen

Example:

  <body className="min-h-screen bg-background text-foreground antialiased">

======================================================================

FILE NAMING

- Components: PascalCase.tsx
- Routes: kebab-case/page.tsx
- Server Actions: camelCase.ts
- Constants: UPPER_SNAKE_CASE

======================================================================

EDITING RULES (TOKEN EFFICIENCY)

- Do NOT rewrite unchanged files
- Prefer minimal diffs
- Explain changes briefly
- Ask a question ONLY if blocked
- Otherwise, make a reasonable assumption and proceed
- Avoid long summaries during builds
- Prefer short diffs + next step over recaps
- Do not re-explain architecture unless it changes
- Fix lint/build errors immediately

======================================================================

QUALITY GATE (MANDATORY)

Before proceeding to the next step:

- npm run lint passes
- npm run build passes
- Fix errors immediately before continuing
- Stripe webhook idempotency verified (event.id uniqueness)
- Free plan limits enforced server-side
- No server action accepts userId from client

Do NOT build on broken code.

======================================================================

DEPLOYMENT NOTES

Vercel Compatibility (MANDATORY)

To ensure Vercel compatibilit use:

- "next": "^14.2.6",
- "react": "18.2.0",
- "react-dom": "18.2.0"

next.config must be CommonJS (next.config.js):

```bash
@type {import('next').NextConfig} _/
const nextConfig = {
reactStrictMode: true,
};

module.exports = nextConfig;
```

ENVIRONMENT NOTES

- TypeScript next.config.ts is not supported in all Vercel build paths.
- Build passes locally
- No TypeScript errors
- Environment variables set in Vercel
- Kinde callback URLs configured
- Stripe webhook configured
- Prisma migrations applied

======================================================================

COMMON COMMANDS

Development:

npm run dev
npm run lint
npm run build

Database:

npx prisma migrate dev
npx prisma migrate deploy
npx prisma studio

======================================================================

CLAUDE COMMANDS (REUSABLE TEMPLATES)

Reusable command templates live in:

- .claude/commands/

Prefer these commands when applicable:

- /build-feature (scaffold a new module end-to-end)
- /setup-stripe (safe Stripe subscriptions + webhook-driven entitlements)
- /fix-build (resolve lint/build errors only)
- /review-code (security + quality review)
- /prune (remove unused modules after cloning base)

All commands must follow this CLAUDE.md contract

======================================================================

GENERAL RULES

- Keep files under ~200 lines
- One feature per file
- CRUD logic lives in Server Actions
- Review AI-generated code before committing
- Test on mobile and desktop

This file is the source of truth.
