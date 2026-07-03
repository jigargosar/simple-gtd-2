# CLAUDE.md

SimpleGTD is a calm task board that holds everything you mean to do, so your mind
doesn't have to. It stays quiet and out of the way — the doing happens out in the
world, not here.

---

## Files

- `src/main.tsx`   — React entry.
- `src/App.tsx`    — entire UI.
- `src/store.ts`   — store: state, selectors, actions, persistence.
- `src/hooks.ts`   — shared edit-input behavior.
- `src/index.css`  — Tailwind import, theme tokens, style classes.

## Commands

```sh
pnpm dev                   # usually already running, lifecycle managed by user
pnpm build                 # type-check + production build
pnpm lint                  # ESLint
pnpm build && pnpm lint    # full self-check after edits
```

Prettier runs on save in the IDE — no format-on-edit hook needed.

## Architecture

1. Store is module-private — read via selector hooks, write via action functions; never expose the store.
2. Ordering is fractional-indexing (string `order`), not array index.
3. Persistence via Zustand `persist` + `migrate`; bump version and extend normalizers for breaking state-shape changes.
4. TS project references; the `strict` umbrella is off, explicit flags on.
5. Drag-and-drop is unimplemented.

## Conventions

1. Models own state and derivations. Views must not compute from multiple state reads — add a selector hook or store derivation instead.
2. Styling: Tailwind v4 with a custom `@theme` token; style classes live in `src/index.css`. Keep static styling in Tailwind, not inline `style`.
3. React Compiler is active — automatic memoization; do not add manual `useMemo` / `useCallback`.
4. Prettier: single quotes, no semicolons, tab width 4, print width 100; Tailwind class sorting via `prettier-plugin-tailwindcss`. Match these to avoid reformatter churn.
5. ARIA, semantic HTML, and `prefers-reduced-motion` are OUT OF SCOPE. Do NOT add, analyze, or account for them — deferred to a dedicated future pass.
6. Keyboard-focusable elements use: `transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none` (destructive actions use `focus-visible:ring-red-600` instead of `focus-visible:ring-accent`).
7. Icons are from `lucide-react`.
8. Appearance, disappearance, and value changes should not be jarring.
9. This file documents stable contracts, not volatile specifics. Don't enumerate things that drift (full component lists, exact counts, every hook/action name) — they go stale silently. Name the pattern and a grep to find the current set instead.
10. Interaction model: double-click edits a title; hold-and-move anywhere on a row drags it (touch: long-press); plain click does nothing; Tab reaches controls, Space/Enter activates the focused one.

---

## Workflow

Files (new items on top; except docs/journal.md excepted):

- docs/design-system.md — UI-consistency rules and known gaps (checkbox
  shapes, icon weight, animation, focus, outline).
- docs/scratch-pad.md — ad hoc work.
- docs/requirements.md — committed v1 scope.
- Kanban-Board.md — Inbox, Planning, Ready, InProgress, Done.
- backlog.md — May implement
- journal.md — ADR
- docs/handoff.md — notes passed from the previous session; resolve early in
  the current session, keep it updated before ending one.

Board sections (what each holds):

- Inbox — raw, unprocessed captures.
- Planning — Needs planning for implementation
- Ready — Ready to implement, with plan.
- In Progress — actively being worked.
- Done — complete + verified.
