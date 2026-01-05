# /fix-build — Fix lint/build errors only (no new features)

You must only:

- resolve TypeScript errors
- resolve lint errors
- resolve build errors
- reduce warnings if easy

Do NOT:

- add features
- refactor unrelated code
- change architecture

======================================================================

PROCESS

1. Run:

- npm run lint
- npm run build

2. Fix errors in order of:

- TypeScript type errors
- Next.js build/runtime errors
- ESLint issues

3. Keep diffs minimal
4. Re-run lint/build until clean

======================================================================

OUTPUT FORMAT

- List of errors found
- Fixes applied (by file)
- Confirm final status:
  - lint: pass/fail
  - build: pass/fail
