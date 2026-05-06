# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm dev          # start dev server (Vite HMR)
pnpm build        # tsc type-check + Vite production build
pnpm lint         # ESLint
pnpm preview      # serve the production build locally
```

No test runner is configured.

## Architecture

Single-page GTD app: sections contain tasks, both ordered via fractional indexing.

**Data model** (`src/store.ts`):
- `Section { id, order, title }`
- `Task { id, sectionId, order, title, done }`
- `AppState { sections, tasks }` — persisted to localStorage via Zustand `persist` middleware

**State** is a single Zustand store (`useApp`). Selectors (`useSections`, `useSectionTasks`) use `useShallow` for referential stability. All mutations are imperative actions on the store (append, delete, toggle, reorder).

**Ordering** uses `fractional-indexing` (`generateKeyBetween`, `generateNKeysBetween`) so items can be reordered or inserted without renumbering.

**Mock data / seeding**: `mockState()` is the Zustand store initializer — it runs once on first load to seed localStorage. It is not a test fixture. Sections are currently read-only (no `appendSection`/`deleteSection` actions exist); only tasks can be added or deleted.

**UI** (`src/App.tsx`) is a tree of `View*` functional components — `ViewApp → ViewHeader + ViewSections → ViewSection → ViewTask`. No routing; single view. `Beacon` / `SectionBeacon` / `TaskBeacon` are drop-zone placeholder components for drag-and-drop reordering (in-progress; `useNearestBeaconTracker` is commented out).

**Styling**: Tailwind CSS v4 (`@import "tailwindcss"`) with a custom `--color-accent: dodgerblue` theme variable defined in `index.css`. `clsx` is used for conditional class composition in views.

**Utilities**: `remeda` (`filter`, `pipe`, `sortBy`, `prop`) is used for array operations in the store.

**React Compiler** (babel-plugin-react-compiler) is enabled via Vite's Babel plugin — automatic memoization, no manual `useMemo`/`useCallback` needed.

## Key conventions

- `prettier.rc`: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`.
- TypeScript strict mode + `noUnusedLocals` + `noUnusedParameters` + `erasableSyntaxOnly`.
- ESLint flat config (`eslint.config.js`); no type-aware rules currently enabled.
- State derivations belong in the store or selector hooks — views must not compute from multiple state reads directly.
