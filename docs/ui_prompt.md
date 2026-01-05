# UI Prompt — Theme + UI Correctness

We are working in a Next.js SaaS that follows the UI Theme Contract in `claude.md`.

Primary goal:

- Update the **global UI theme** only.
- Use shadcn + Tailwind theme tokens from `app/globals.css`.
- Keep diffs minimal and isolated.

Secondary goal (allowed UI-only fixes):

- Fix UI behavior issues that are strictly **render/state/cache invalidation** problems.
- Do NOT change auth, Stripe, database schema, backend business rules, or server logic.

---

## Theme Input (paste one)

### Option A — HSL tokens (preferred)

Light:

- --background:
- --foreground:
- --card:
- --card-foreground:
- --primary:
- --primary-foreground:
- --secondary:
- --secondary-foreground:
- --muted:
- --muted-foreground:
- --accent:
- --accent-foreground:
- --border:
- --input:
- --ring:
- --destructive:
- --destructive-foreground:
- --radius:

Dark:

- --background:
- --foreground:
- --card:
- --card-foreground:
- --primary:
- --primary-foreground:
- --secondary:
- --secondary-foreground:
- --muted:
- --muted-foreground:
- --accent:
- --accent-foreground:
- --border:
- --input:
- --ring:
- --destructive:
- --destructive-foreground:
- --radius:

OR

### Option B — Hex palette

- Primary:
- Secondary:
- Accent:
- Background:
- Surface/Card:
- Foreground/Text:
- Border:
- Danger:
- Radius:

---

## Rules (Theme)

- Convert hex → HSL if needed.
- Apply values **only** in `app/globals.css`.
- Keep existing token names + structure.
- Do NOT hardcode colors in components.
- Preserve dark mode via `.dark` tokens.
- Ensure `<body>` uses `bg-background text-foreground min-h-screen`.

---

## Rules (UI-only Bug Fixes Allowed)

Allowed fixes are limited to:

- React state updates / optimistic UI
- cache invalidation / router refresh where appropriate
- correcting conditional UI flows (modals/alerts/toasts)
- improving immediate UI consistency after mutations

Not allowed:

- touching Stripe logic, auth logic, DB queries, Prisma schema, webhook handling, entitlements logic

Two known UI issues to enforce:

1. **Deletion eligibility UX**

- If an item is not eligible for deletion, do **not** show the “confirm delete” alert/modal first.
- Show the rejection toast/message directly.

2. **Project page staleness**

- Creating/deleting a task inside a Project page must update the UI immediately (no manual refresh, no navigate away/back).
- Match the behavior of the main dashboard.

---

## Output Requirements

- If theme-only: show only the updated `app/globals.css`.
- If UI bug fix is included: show only the minimal changed files required (avoid unrelated diffs).
- Confirm changes in **1–2 lines max**.
- Ensure `npm run lint` and `npm run build` would pass.
