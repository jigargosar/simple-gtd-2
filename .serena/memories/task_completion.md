# Task Completion

After any coding task, run:

```sh
pnpm build && pnpm lint
```

- `pnpm build` = `tsc -b` (type-check across project refs) + Vite production build
- `pnpm lint` = ESLint

No test runner exists. If UI was changed, verify in browser at the dev server (usually :5137).

Prettier runs on save in IDE — no format step needed in CI/task completion.
