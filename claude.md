# SaaS MVP Development Guide (Claude Code Contract)

This project is a production-ready SaaS MVP built with strict conventions.
Follow this file exactly. When in doubt, prefer safety, clarity, and simplicity.

======================================================================

TECH STACK (FIXED)

Frontend:

- Next.js 15 (App Router)
- React
- TypeScript (strict)

Styling:

- Tailwind CSS
- Shadcn UI components

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

Do not invent new top-level directories.
Do not place Stripe logic outside the webhook handler.

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
- Every user-owned table MUST include `user_id`
- Never accept `user_id` from the client
- Always scope queries by authenticated `user_id`
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

Never skip this check.

======================================================================

STRIPE RULES (NON-NEGOTIABLE)

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

STRIPE LOCAL DEV LIMITATION

- Stripe Billing Portal may NOT redirect back to localhost after actions
  (e.g. cancel subscription).
- This is expected behavior and NOT a bug.
- In production (real domain), return_url works correctly.

Local dev workaround:

- Manually navigate back to the app
- OR use HTTPS tunneling (e.g. ngrok)

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

Dark mode is supported via:

- .dark class (Tailwind class strategy)

Rules:

- Theme changes MUST be made by editing token values in app/globals.css.
- Do NOT hardcode hex colors across components/pages unless explicitly requested.
- Use Shadcn UI components only; they must inherit from the tokens.
- Keep business logic unchanged during UI-only work.

TOKENS TO SET (MINIMUM)
Light + Dark:

- --background
- --foreground
- --card
- --card-foreground
- --primary
- --primary-foreground
- --secondary
- --secondary-foreground
- --muted
- --muted-foreground
- --accent
- --accent-foreground
- --border
- --input
- --ring
- --destructive
- --destructive-foreground
- --radius (optional)

DARK MODE TOGGLE (OPTIONAL)
If adding a UI toggle:

- Use class strategy: add/remove "dark" on <html>
- Store preference in localStorage
- Default to system preference if unset
- Implement toggle as a small isolated client component (no app-wide client conversion)

HOW TO PROVIDE A PALETTE (USER INPUT FORMAT)
When the user provides a theme, they may supply either:
A) HSL token values (preferred, matches globals.css):

- primary: 221.2 83.2% 53.3%
- background: 222.2 84% 4.9%
  etc.

OR

B) Hex codes:

- primary: #6D28D9
- background: #0B1220
  etc.

If hex is provided, convert to HSL and update globals.css tokens accordingly.

SCOPE FOR UI-ONLY CHANGES
Allowed files:

- app/globals.css
- tailwind.config.ts (only if needed for token mapping)
- minimal UI toggle component (optional)
  Not allowed:
- touching Stripe/auth/DB logic during theme work

QUALITY GATE

- npm run lint passes
- npm run build passes

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
- Briefly explain changes when editing
- Ask a question ONLY if blocked
- Otherwise, make a reasonable assumption and proceed
- Avoid long summaries during builds
- Prefer short diffs + next step over recaps
- Do not re-explain architecture unless it changes

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

All commands must follow this CLAUDE.md contract:

- Tenancy isolation (user_id)
- Auth checks in every server action
- Zod validation
- Stripe webhook signature + idempotency
- Quality Gate: npm run lint + npm run build must pass

QUALITY GATE (MANDATORY)

Before proceeding to the next step:

- npm run lint passes
- npm run build passes
- Fix errors immediately before continuing
- Ensure a production-ready .gitignore exists for Next.js + Prisma. Create or update it if missing.
- Stripe webhook idempotency verified (event.id uniqueness)
- Free plan limits enforced server-side
- No server action accepts userId from client

Do NOT build on broken code.

======================================================================

DEPLOYMENT CHECKLIST

- Build passes locally
- No TypeScript errors
- Environment variables set in Vercel
- Kinde callback URLs configured
- Stripe webhook configured
- Prisma migrations applied

======================================================================

GENERAL RULES

- Keep files under ~200 lines
- One feature per file
- CRUD logic lives in Server Actions
- Review AI-generated code before committing
- Test on mobile and desktop

This file is the source of truth.
