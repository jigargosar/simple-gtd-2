# Core — simple-gtd-2

Single-page GTD app. No router, no backend, no test runner.

## Source map

- `src/store.ts` — all state, types, selectors, actions, mock seeding, `orderBetween`
- `src/App.tsx` — all `View*` components (11 total); `titleBox` CSS constant; default export = `ViewApp`
- `src/hooks.ts` — `useEditInput` (edit field logic: value, onBlur, onChange, onKeyDown)
- `src/main.tsx` — React entry point
- `src/index.css` — Tailwind v4 entry; keyframe animations (`.anim-*`, `.dot-pop`, `.strike`); `--color-accent` theme token

## Invariants

- `useApp` store is module-private — never exported directly
- Public read API: selector hooks (`useSections`, `useSectionTasks`, `useSectionPendingCount`)
- Public write API: plain action functions (`appendTask`, `deleteTask`, `toggleTask`, `updateTaskTitle`)
- Ordering is fractional-indexing — `Section` and `Task` carry `order: string`; lists always sorted by `prop('order')` via remeda
- Persistence: Zustand `persist`, localStorage key `simple-gtd`, version 1; only `sections`+`tasks` persisted
- On first load seeds from `mockState()` — 5 GTD sections with sample tasks
- `Sortable` state exists (`'NotSorting' | {tag:'PointerDown'} | {tag:'Dragging'}`) but is NOT wired to UI — drag-and-drop is scaffolding only

## Further reading

- Tech stack details: `mem:tech_stack`
- Code conventions: `mem:conventions`
- Dev/build commands: `mem:suggested_commands`
- Task completion checklist: `mem:task_completion`
