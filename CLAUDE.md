# CLAUDE.md

Single-page GTD app. State in Zustand (`src/store.ts`); UI in `src/App.tsx`.

## Commands

```sh
pnpm dev --port 5173   # always pass the port explicitly
pnpm build             # tsc type-check + Vite production build
pnpm lint              # ESLint
pnpm preview           # serve the production build locally
```

No test runner is configured.

## Conventions

1. **Models own state and derivations.** Views must not compute from multiple state reads — add a derivation to the store or a selector hook instead. Known exception: `ViewSection` computes `pending` count inline — tech debt, not a pattern.
2. **Styling**: Tailwind v4. Current heavy inline `style={{}}` usage in `src/App.tsx` is tech debt to be migrated.
3. **React Compiler is active** — automatic memoization, no manual `useMemo` / `useCallback`.
4. **Tighten TypeScript and ESLint when feasible.** Current state: TS uses explicit strictness flags only (`strict` umbrella off); ESLint uses `tseslint.configs.recommended` (not `recommendedTypeChecked`), no `parserOptions.project`.
5. **Prettier**: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`. Match these when generating code to avoid reformatter churn.
