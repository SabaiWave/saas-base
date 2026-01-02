# /review-code — Security + quality review pass

Review recently modified code and report issues.

======================================================================

CHECKLIST (MUST CHECK ALL)

AUTH / TENANCY

- Every server action checks auth (Kinde)
- No server action accepts userId from client
- Every DB query is scoped by userId
- No cross-tenant access possible by ID guessing

VALIDATION

- Zod validation exists on server for inputs
- Error messages are helpful and not leaky

STRIPE (IF TOUCHED)

- Webhook signature verification present
- Webhook idempotency present (event.id stored)
- Subscription status is source of truth
- No client-side “paid” assumptions

NEXT.JS / REACT

- "use client" only when needed
- Server components default
- Loading + error + empty states exist for UX
- No secrets in client code

CODE HEALTH

- Files not bloated (> ~200 lines)
- No duplicated logic (suggest extraction if repeated)
- Minimal diffs / no mass rewrites

QUALITY GATE

- npm run lint passes
- npm run build passes

======================================================================

OUTPUT FORMAT

MUST-FIX (security/correctness)

- Bullet list

SHOULD-FIX (quality/maintainability)

- Bullet list

NICE-TO-HAVE (polish)

- Bullet list

Quick file map:

- List touched files and their roles
