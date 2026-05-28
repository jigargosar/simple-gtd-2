# Conventions

## Component naming

- All components prefixed `View*` and all live in `src/App.tsx`
- Pattern: `ViewApp` → `ViewSections` → `ViewSection` → `ViewTask`

## Store pattern

- Models own state AND derivations — views never compute from multiple reads
- Add reads as selector hooks; add writes as action functions calling `useApp.setState`
- Selector hook pattern: `useSectionPendingCount` (see `src/store.ts`)
- Action pattern: `appendTask` — calls `useApp.setState((s) => ...)`, returns void

## Ordering

- `Section` and `Task` both have `order: string` (fractional index)
- Always sort lists via `sortBy(prop('order'))` (remeda)
- New positions: `orderBetween(prev, next)` or `generateNKeysBetween` from `fractional-indexing`
- Append = `orderBetween(lastTask.order, null)`

## Styling

- Tailwind v4 only — no inline `style={{}}` except dynamic `animationDelay` for stagger animations
- Static animations in `src/index.css` as `.anim-*` / `.dot-pop` / `.strike` classes
- Custom theme token: `--color-accent`
- Focus ring: `transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none`
- Destructive focus ring: swap `focus-visible:ring-accent` → `focus-visible:ring-red-600`
- No ARIA, semantic HTML, or `prefers-reduced-motion` — explicitly out of scope

## TypeScript

- No `any`, no `as`, no `!`, no `@ts-ignore`
- Discriminated unions use `tag` field + `switch` + `assertNever` in `default`
- See `Sortable` type in `src/store.ts` as the canonical discriminated union example

## Comments

- No comments unless the WHY is non-obvious; no docstrings
