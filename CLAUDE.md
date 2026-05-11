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
- `AppState { sections, tasks }` — both persisted to localStorage via Zustand `persist` middleware (key `simple-gtd`, `version: 1`).

**State** is a single Zustand store (`useApp`). Selectors (`useSections`, `useSectionTasks`, `useAllTasks`) use `useShallow` for referential stability. All mutations are imperative actions exported directly from `store.ts` (`appendTask`, `deleteTask`, `toggleTask`, `reorderTasks`, `reorderSections`) — they call `useApp.setState` directly, not through hooks.

**Ordering** uses `fractional-indexing` (`generateKeyBetween`, `generateNKeysBetween`) so items can be reordered or inserted without renumbering. Note: `reorderTasks(groups)` regenerates evenly-spaced keys for every group it receives, and the call site (`onDragEnd`) currently passes the entire `liveTasks` map — so every drop rewrites the order key of every task across every section. Same for `reorderSections`. Acceptable at current scale; revisit if the task count grows or if persist writes become a hot path.

**Drag-and-drop** (`@dnd-kit/react` + `@dnd-kit/helpers`): `ViewSections` wraps the layout in `<DragDropProvider>`, mirrors the store into local `liveSectionIds` / `liveTasks` plus parallel refs (`liveSectionsRef`, `liveTasksRef`) for synchronous reads in `onDragEnd`. Sections are sortables (`type/accept: 'section'`, drag handle = colored header band); tasks are sortables (`type/accept: 'task'`, `group: sectionId`, drag handle = grip icon on hover). `onDragOver` applies `move(...)` to the live mirror for optimistic feedback; `onDragEnd` commits to the store via `reorderTasks` / `reorderSections`. On cancel, the live state is restored from a snapshot taken at `onDragStart`.

**Mock data / seeding**: `mockState()` is the Zustand store initializer — it runs once on first load to seed localStorage with 5 sections and 3 tasks each. It is not a test fixture. Sections are currently read-only (no `appendSection`/`deleteSection` actions). When bumping `version` in the `persist` config, add a `migrate` callback to `persist`'s options.

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
