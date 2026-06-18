# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Single-page GTD app. All state lives in one Zustand store (`src/store.ts`); the UI is `View*` components in `src/App.tsx`, with shared edit-input behavior (Enter/Escape/blur save semantics) factored into `useEditInput` in `src/hooks.ts`. No router, no backend, no test runner. The current few-file layout reflects an early, small codebase — it's a snapshot, not a mandate; expect it to grow and split as the app expands.

## Commands

```sh
pnpm dev                   # usually already running, lifecycle managed by user
pnpm build                 # tsc -b (project-refs type-check) + Vite production build
pnpm lint                  # ESLint
pnpm build && pnpm lint    # full self-check after edits (no test runner exists)
pnpm preview               # serve the production build locally
```

Prettier runs on save in the IDE — no format-on-edit hook needed.

## Architecture

1. **Store contract (`src/store.ts`).** The `useApp` store is module-private — never exported. Components read through selector hooks (`useSections`, `useVisibleSectionTasks`, `useShowDone`) and write through plain action functions (`appendTask`, `deleteTask`, `toggleTask`, `updateTaskTitle`, `appendSection`, `updateSectionTitle`, `deleteSection`, `toggleShowDone`) that call `useApp.setState` directly. Add new reads as selector hooks and new writes as action functions; do not expose the store.
2. **Ordering is fractional-indexing, not array index.** `Section` and `Task` each carry `order: string`; lists are always `sortBy(prop('order'))`. New positions come from `orderBetween` / `generateNKeysBetween` (`fractional-indexing` package). Append computes the key after the current last task in the section.
3. **Persistence.** Zustand `persist`, localStorage key `simple-gtd`, version 4. `partialize` persists only `sections` and `tasks` (not `sortable` or `showDone` — both transient). On first load, store seeds from `mockState()` — 5 GTD sections with sample tasks. Clear `simple-gtd` localStorage to reset. `migrate` is active: it normalizes each persisted section/task to the current shape via `normalizeSection`/`normalizeTask`, dropping removed fields (e.g. the old `archived` flag) and backfilling missing ones. Bump `version` and extend the normalizers for breaking state-shape changes.
4. **Drag-and-drop is scaffolding only.** `Sortable` (`'NotSorting' | {tag:'PointerDown'} | {tag:'Dragging'}`) exists in state but is not wired to any UI yet.
5. **TS project references.** `tsconfig.json` references `tsconfig.app.json` (the `src` app) and `tsconfig.node.json` (the Vite config); `pnpm build` runs `tsc -b` across both. The `strict` umbrella is intentionally off — only explicit flags are on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`).

## Conventions

1. **Models own state and derivations.** Views must not compute from multiple state reads — add a selector hook or store derivation instead. `useVisibleSectionTasks` is the pattern: it sorts a section's tasks and applies the transient `showDone` toggle (set via `toggleShowDone`, surfaced by `ViewDoneToggle`) in one selector.
2. **Components are prefixed `View*`** and all live in `src/App.tsx` (`ViewApp`, `ViewSection`, `ViewTask`, …).
3. **Styling: Tailwind v4.** Keyframe animations live in `src/index.css` as `.anim-*` / `.dot-pop` / `.strike` classes plus a custom `--color-accent` `@theme` token. The only inline `style={{}}` is the dynamic per-item `animationDelay` that staggers entrance animations — keep all static styling in Tailwind classes.
4. **React Compiler is active** — automatic memoization; do not add manual `useMemo` / `useCallback`.
5. **Prettier**: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`. Match these to avoid reformatter churn.
6. **ESLint** uses `tseslint.configs.recommended` (not `recommendedTypeChecked`) with no `parserOptions.project`; `README.md` documents the type-checked upgrade path.
7. **ARIA, semantic HTML, and `prefers-reduced-motion` are OUT OF SCOPE.** Do NOT add, analyze, or account for them — deferred to a dedicated future pass.
8. Keyboard-focusable elements use: `transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none` (destructive actions use `focus-visible:ring-red-600` instead of `focus-visible:ring-accent`).
9. Icons are from `lucide-react`.
10. Appearance, disappearance, and value changes should not be jarring. See `.anim-*` in `src/index.css` for the existing vocabulary.
