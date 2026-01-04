We are working in a Next.js SaaS that follows the UI Theme Contract in claude.md.

Goal:

- Update the global UI theme only.
- Do NOT modify auth, Stripe, database, or business logic.
- Use shadcn + Tailwind tokens defined in app/globals.css.

Theme Input:
[PASTE ONE OF THE FOLLOWING]

Option A — HSL tokens (preferred):
Light:
--background:
--foreground:
--card:
--card-foreground:
--primary:
--primary-foreground:
--secondary:
--secondary-foreground:
--muted:
--muted-foreground:
--accent:
--accent-foreground:
--border:
--input:
--ring:
--destructive:
--destructive-foreground:
--radius:

Dark:
--background:
--foreground:
--card:
--card-foreground:
--primary:
--primary-foreground:
--secondary:
--secondary-foreground:
--muted:
--muted-foreground:
--accent:
--accent-foreground:
--border:
--input:
--ring:
--destructive:
--destructive-foreground:

OR

Option B — Hex palette:
Primary:
Secondary:
Accent:
Background:
Surface/Card:
Foreground/Text:
Border:
Danger:
Radius:

Rules:

- Convert hex to HSL if needed.
- Apply values only in app/globals.css.
- Keep existing token names and structure.
- Do not hardcode colors in components.
- Preserve dark mode via .dark tokens.
- Keep diffs minimal and isolated.
- Ensure <body> applies bg-background and text-foreground so theme tokens are visually effective.

Output:

- Show only the updated app/globals.css.
- Briefly confirm what changed (1–2 lines max).
- Ensure npm run lint and npm run build would pass.
