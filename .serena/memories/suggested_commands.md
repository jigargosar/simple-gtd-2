# Suggested Commands

## Project scripts (pnpm)

```sh
pnpm dev          # dev server (usually already running on :5137)
pnpm build        # tsc -b + vite build (full type-check + bundle)
pnpm lint         # ESLint
pnpm preview      # serve production build locally
```

Full self-check after edits (no test runner):
```sh
pnpm build && pnpm lint
```

## State reset

Clear localStorage key `simple-gtd` in browser devtools to reset to mock seed data.

## Notes

- Dev server is lifecycle-managed by the user; do not restart it unless asked.
- No test runner exists — correctness verified via build + lint + manual browser check.
