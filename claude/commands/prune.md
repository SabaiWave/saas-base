# /prune — Remove modules/features after cloning Golden SaaS Base

Goal: remove unused features cleanly without breaking build.

======================================================================

FIRST: ASK THESE QUESTIONS (ONLY THESE)

1. Which feature modules/routes should be removed?

   - Provide route slugs, e.g. "projects", "invoices", "reports"

2. Should we remove related DB models too?

   - Yes/No

3. Should we remove related nav links?
   - Yes/No (default Yes)

If unclear, default:

- remove UI/actions/routes
- keep DB models unless explicitly told to remove

======================================================================

THEN: EXECUTE IN THIS ORDER

1. Remove dashboard routes:

- app/dashboard/<module>/...

2. Remove server actions:

- app/actions/<module>/...

3. Remove UI components:

- components/<module>/...

4. Remove nav entries (if present)

5. If DB models should be removed:

- Update prisma/schema.prisma
- Create migration:
  - npx prisma migrate dev --name prune\_<module>

6. Quality Gate:

- npm run lint
- npm run build
- Fix breakages

======================================================================

OUTPUT FORMAT

- Modules removed
- Files deleted/modified
- DB changes (if any)
- Confirm lint + build status
