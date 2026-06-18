# CLAUDE.md

Single-page GTD (Getting Things Done) app: sections of tasks you can add, edit,
complete, and delete, persisted to localStorage.

No router, no backend, no test runner.

## Files

- `src/main.tsx`   — React entry; mounts `<App>` into `#root`.
- `src/App.tsx`    — entire UI; all `View*` components (`ViewApp`, `ViewBoard`, `ViewSection`, `ViewTask`, …).
- `src/store.ts`   — Zustand store: state, selector hooks, action functions, persistence/migration, mock seed.
- `src/hooks.ts`   — `useEditInput`: shared Enter/Escape/blur save semantics for edit fields.
- `src/index.css`  — Tailwind import, `@theme` tokens (`--color-accent`), keyframe animation classes.

## Commands

```sh
pnpm dev                   # usually already running, lifecycle managed by user
pnpm build                 # tsc -b (project-refs type-check) + Vite production build
pnpm lint                  # ESLint
pnpm build && pnpm lint    # full self-check after edits (no test runner exists)
```

Prettier runs on save in the IDE — no format-on-edit hook needed.

## Architecture

1. Store contract (`src/store.ts`). The `useApp` store is module-private — never exported. Components read through selector hooks (`useSections`, `useVisibleSectionTasks`, `useShowDone`) and write through plain action functions (`appendTask`, `deleteTask`, `toggleTask`, `updateTaskTitle`, `appendSection`, `updateSectionTitle`, `deleteSection`, `toggleShowDone`) that call `useApp.setState` directly. Add new reads as selector hooks and new writes as action functions; do not expose the store.
2. Ordering is fractional-indexing, not array index. `Section` and `Task` each carry `order: string`; lists are always `sortBy(prop('order'))`. New positions come from `orderBetween` / `generateNKeysBetween` (`fractional-indexing` package). Append computes the key after the current last task in the section.
3. Persistence. Zustand `persist`, localStorage key `simple-gtd`, version 4. `partialize` persists only `sections` and `tasks` (not `sortable` or `showDone` — both transient). On first load, store seeds from `mockState()` — 5 GTD sections with sample tasks. Clear `simple-gtd` localStorage to reset. `migrate` is active: it normalizes each persisted section/task to the current shape via `normalizeSection`/`normalizeTask`, dropping removed fields (e.g. the old `archived` flag) and backfilling missing ones. Bump `version` and extend the normalizers for breaking state-shape changes.
4. TS project references. `tsconfig.json` references `tsconfig.app.json` (the `src` app) and `tsconfig.node.json` (the Vite config); `pnpm build` runs `tsc -b` across both. The `strict` umbrella is intentionally off — only explicit flags are on (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `erasableSyntaxOnly`).
5. Drag-and-drop is unimplemented. The `sortable` state field exists in `store.ts` but is wired to no UI — don't assume reordering works.

## Conventions

1. Models own state and derivations. Views must not compute from multiple state reads — add a selector hook or store derivation instead. `useVisibleSectionTasks` is the pattern: it sorts a section's tasks and applies the transient `showDone` toggle (set via `toggleShowDone`, surfaced by `ViewDoneToggle`) in one selector.
2. Styling: Tailwind v4. Keyframe animations live in `src/index.css` as `.anim-*` / `.dot-pop` / `.strike` classes plus a custom `--color-accent` `@theme` token. The only inline `style={{}}` is the dynamic per-item `animationDelay` that staggers entrance animations — keep all static styling in Tailwind classes.
3. React Compiler is active — automatic memoization; do not add manual `useMemo` / `useCallback`.
4. Prettier: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`. Match these to avoid reformatter churn.
5. ARIA, semantic HTML, and `prefers-reduced-motion` are OUT OF SCOPE. Do NOT add, analyze, or account for them — deferred to a dedicated future pass.
6. Keyboard-focusable elements use: `transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none` (destructive actions use `focus-visible:ring-red-600` instead of `focus-visible:ring-accent`).
7. Icons are from `lucide-react`.
8. Appearance, disappearance, and value changes should not be jarring. See `.anim-*` in `src/index.css` for the existing vocabulary.
