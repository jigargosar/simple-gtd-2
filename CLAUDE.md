# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page GTD app. All state lives in one Zustand store (`src/store.ts`); the entire UI is one file of `View*` components (`src/App.tsx`). No router, no backend, no test runner.

## Commands

```sh
pnpm dev --port 5173   # always pass the port explicitly
pnpm build             # tsc -b (project-refs type-check) + Vite production build
pnpm lint              # ESLint
pnpm preview           # serve the production build locally
```

## Architecture

1. **Store contract (`src/store.ts`).** The `useApp` store instance is module-private — never exported. Components read through selector hooks (`useSections`, `useSectionTasks`, `useSectionPendingCount`) and write through plain exported action functions (`appendTask`, `deleteTask`, `toggleTask`) that call `useApp.setState` directly. Add new reads as selector hooks and new writes as action functions; do not expose the store.
2. **Ordering is fractional-indexing, not array index.** `Section` and `Task` each carry `order: string`; lists are always `sortBy(prop('order'))`. New positions come from `orderBetween` / `generateNKeysBetween` (`fractional-indexing` package). Append computes the key after the current last task in the section.
3. **Persistence.** Zustand `persist` middleware, localStorage key `simple-gtd`, version 1. `partialize` persists only `sections` and `tasks` (not `sortable`). On first load (empty storage) the store seeds from `mockState()` — 5 GTD sections with sample tasks. To reset to mock data, clear the `simple-gtd` localStorage key. The `migrate` hook is commented out; bump `version` and implement it for breaking state-shape changes.
4. **Drag-and-drop is scaffolding only.** `Sortable` (`'NotSorting' | {tag:'PointerDown'} | {tag:'Dragging'}`) exists in state but is not wired to any UI yet.
5. **TS project references.** `tsconfig.json` references `tsconfig.app.json` (the `src` app) and `tsconfig.node.json` (the Vite config); `pnpm build` runs `tsc -b` across both. The `strict` umbrella is intentionally off — only explicit flags are on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`).

## Conventions

1. **Models own state and derivations.** Views must not compute from multiple state reads — add a selector hook or store derivation instead. Per-section pending count is already factored out as `useSectionPendingCount`; follow that pattern for new derived values.
2. **Components are prefixed `View*`** and all live in `src/App.tsx` (`ViewApp`, `ViewSection`, `ViewTask`, …).
3. **Styling: Tailwind v4.** Keyframe animations live in `src/index.css` as `.anim-*` / `.dot-pop` / `.strike-line` classes plus a custom `--color-accent` `@theme` token; components apply them by className. The only inline `style={{}}` is the dynamic per-item `animationDelay` that staggers entrance animations (`ViewSection`, `ViewTask`) — keep all static styling in Tailwind classes.
4. **React Compiler is active** — automatic memoization; do not add manual `useMemo` / `useCallback`.
5. **Tighten TypeScript and ESLint when feasible.** ESLint currently uses `tseslint.configs.recommended` (not `recommendedTypeChecked`) with no `parserOptions.project`; `README.md` documents the type-checked upgrade path.
6. **Prettier**: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`. Match these when generating code to avoid reformatter churn.
