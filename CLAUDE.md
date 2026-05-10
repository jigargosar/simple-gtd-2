# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev --port 5173   # start dev server (Vite HMR) — always pass the port explicitly
pnpm build             # tsc type-check + Vite production build
pnpm lint              # ESLint
pnpm preview           # serve the production build locally
```

No test runner is configured.

## Architecture

Single-page GTD app: sections contain tasks, both ordered via fractional indexing.

**Data model** (`src/store.ts`):
- `Section { id, order, title }`
- `Task { id, sectionId, order, title, done }`
- `AppState { sections, tasks, sortable }` — `sections` and `tasks` are persisted to localStorage via Zustand `persist` middleware; `sortable` is excluded via `partialize`

**State** is a single Zustand store (`useApp`). Selectors (`useSections`, `useSectionTasks`) use `useShallow` for referential stability. All mutations are imperative actions exported directly from `store.ts` (`appendTask`, `deleteTask`, `toggleTask`) — they call `useApp.setState` directly, not through hooks.

`sortable: Sortable` tracks drag pointer state as a union: `'NotSorting' | { tag: 'PointerDown'; pt: Point } | { tag: 'Dragging' }`. Note: `'NotSorting'` is a bare string literal — not a tagged variant — so a single `switch (s.tag)` won't exhaust it. DnD reordering is in-progress; no `Beacon` components are present in `App.tsx` yet.

**Ordering** uses `fractional-indexing` (`generateKeyBetween`, `generateNKeysBetween`) so items can be reordered or inserted without renumbering.

**Mock data / seeding**: `mockState()` is the Zustand store initializer — it runs once on first load to seed localStorage with 5 sections and 3 tasks each. It is not a test fixture. Sections are currently read-only (no `appendSection`/`deleteSection` actions). A `migrate` hook is stubbed but commented out; uncomment and implement it when bumping `version` in the `persist` config.

**UI** (`src/App.tsx`) component tree: `ViewApp → ViewHeader + ViewSections → ViewSection → ViewTask`. `ViewTask` renders four sub-components: `ViewCheckbox`, `ViewTitle`, `ViewDeleteBtn`, and `ViewAddTask` (the add-task row lives at the bottom of each section). No routing; single view.

Task deletion is animated: `ViewTask` sets `removing` state → adds `anim-out` class → calls `deleteTask` after 175 ms to let the exit animation complete before removing from store.

`ViewAddTask` submits only on Enter or the explicit Add button click — blur does not submit, the draft is discarded.

**Palettes**: `PALETTES` in `App.tsx` maps palette index → `{ bg, acc, light }` CSS variable references (cycling for >5 sections). `light` is a hardcoded hex fallback used as the focused background in `ViewAddTask` (cannot use CSS variables in inline `background` when computed at runtime from an index).

**Styling**: Nearly all layout and visual styles are inline (`style={{}}`). Tailwind CSS v4 is used only for animation utility classes (`anim-header`, `anim-section`, `anim-task`, `anim-out`, `dot-pop`, `strike-line`) and global resets defined in `index.css`. The `@theme` block in `index.css` defines global design tokens (`--color-ink`, `--color-mid`, `--color-faint`, `--color-bg`) and five per-section palette CSS variables (`--s0-bg` / `--s0-acc` through `--s4-bg` / `--s4-acc`) on `:root`. `clsx` is used for conditional class composition.

**Utilities**: `remeda` (`filter`, `pipe`, `sortBy`, `prop`) is used for array operations in the store.

**React Compiler**: `babel-plugin-react-compiler` is applied via `@rolldown/plugin-babel` with `reactCompilerPreset()` as a second Babel pass after the JSX transform in `vite.config.ts`. Automatic memoization is active — no manual `useMemo`/`useCallback` needed.

**Fonts**: `Syne` (headings/logo, weights 700/800) and `Epilogue` (body/tasks, weights 300/400/500 + italic), loaded from Google Fonts.

## Key conventions

- `prettier.rc`: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`.
- TypeScript uses explicit strictness flags (`noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `noFallthroughCasesInSwitch`) — the `strict` umbrella flag is NOT set.
- ESLint uses `tseslint.configs.recommended` (not `recommendedTypeChecked`) — no `parserOptions.project`, so type-aware lint rules are not active.
- State derivations belong in the store or selector hooks — views must not compute from multiple state reads directly. (Known exception: `ViewSection` computes `pending` count inline; treat as tech debt, not a pattern to follow.)
- Discriminated unions use `tag` as the discriminant field — see `Sortable` in `store.ts` as the in-codebase example.
