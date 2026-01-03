# /build-feature — Scaffold a feature module end-to-end (Prisma + Server Actions + UI)

You are working inside a Next.js 15 App Router SaaS using:

- Prisma + Supabase (Postgres)
- Kinde Auth
- Shadcn UI + Tailwind
- Server Actions for mutations
- USER-LEVEL tenancy (user_id everywhere)
- Zod input validation
- Quality Gate: npm run lint + npm run build must pass

======================================================================

FIRST: ASK THESE QUESTIONS (ONLY THESE)

1. Feature name (singular + plural), e.g. "Project" / "Projects"
2. Brief description (1–2 sentences)
3. User actions needed:
   - CRUD? (create/list/get/update/delete)
   - Any special action? (archive, duplicate, export, run, etc.)
4. Any plan limits?
   - None, OR
   - Free plan cap (e.g. 3 projects)

If not provided, assume:

- CRUD only
- No plan limits

======================================================================

THEN: EXECUTE IN THIS ORDER

STEP 0 — EXPLORE

- Inspect existing patterns for:
  - Server Actions structure (app/actions/)
  - Dashboard routes (app/dashboard/)
  - Components conventions (components/)
  - Prisma schema (prisma/schema.prisma)
  - Auth patterns (Kinde)
  - Any existing feature modules

Do NOT introduce new architecture.

STEP 1 — PRISMA DATA MODEL

- Update prisma/schema.prisma
- Include:
  - id: uuid
  - userId mapped to user_id
  - createdAt/updatedAt mapped to created_at/updated_at
- Add indexes:
  - @@index([userId])
- Add relations if needed
- Create and apply migration locally:
  - npx prisma migrate dev --name <feature_name_snake_case>

STEP 2 — SERVER ACTIONS (ALL MUTATIONS)
Create:

- app/actions/<feature-kebab>/actions.ts

Must include:

- Zod schemas for inputs
- Auth enforcement via Kinde on EVERY action
- Tenancy scoping by session userId on EVERY query
- CRUD functions:
  - create<Feature>()
  - list<Plural>()
  - get<Feature>ById()
  - update<Feature>()
  - delete<Feature>()
- Use revalidatePath() for affected routes after mutations

Rules:

- Never accept userId from client
- Never query without userId scope
- No `any`
- Minimal diffs

STEP 3 — UI COMPONENTS (SHADCN ONLY)
Create folder:

- components/<feature-kebab>/

Create:

- <Feature>List.tsx
- Create<Feature>Dialog.tsx
- <Feature>Form.tsx (if useful)
- <Feature>Row.tsx or <Feature>Card.tsx (optional)

UI requirements:

- loading state
- empty state
- error state
- basic success toasts (if toast util exists)
- professional but minimal UI

STEP 4 — DASHBOARD ROUTE
Create:

- app/dashboard/<feature-kebab>/page.tsx

Requirements:

- Server component page by default
- Fetch list via server action or direct prisma query ONLY IF it still enforces auth + tenancy
- Render List + Create Dialog
- Add a short header + description

STEP 5 — NAVIGATION (IF PRESENT)
If the project has a dashboard nav:

- Add a link to /dashboard/<feature-kebab>
- Keep naming consistent

STEP 6 — OPTIONAL PLAN LIMITS (IF REQUESTED)
If a Free plan limit is provided:

- Add an entitlements check in server action create<Feature>()
- Enforce cap on create (return helpful error)
- Do not enforce in UI only

STEP 7 — QUALITY GATE (MANDATORY)
Run:

- npm run lint
- npm run build

Fix issues before finishing.

======================================================================

OUTPUT FORMAT

1. Short summary of what was added
2. List of files created/modified
3. Prisma model(s) added
4. Any assumptions made
5. Confirm lint + build status
