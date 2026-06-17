# Handoff — SimpleGTD v1

_Last updated: 2026-06-14. Read this first if you're picking up the v1 effort._

## Start here (immediate next action)

Execute the archive-model rebuild plan:
`docs/superpowers/plans/2026-06-13-archive-model-rebuild.md` — 4 sequential
tasks, each gated by `pnpm build && pnpm lint` + a manual check + a commit.
Nothing in it has been implemented yet; it's a fresh, ready-to-run plan.

After archive lands, the next items (by priority) are in `roadmap.md`: JSON
export/import (§2), section reorder (§3), then the polish buckets (§4–§8).

## The goal

Ship a **fully usable v1** for real users by **end of June 2026 (30 Jun)**. The
bar: a real user can capture, organize, complete, and archive tasks every day
without friction, jank, or data loss. v1 = the existing CRUD core polished to a
daily-driver bar + data safety. It is NOT a feature-breadth push.

## Where everything lives

| Doc | Role |
|---|---|
| `docs/roadmap.md` | **Source of truth** for v1 scope + done-status (audited against code 13 Jun) |
| `docs/reference/archive-visibility.md` | **Spec** for the archive model (Trello-style, independent flags) |
| `docs/superpowers/plans/2026-06-13-archive-model-rebuild.md` | Task-by-task plan for the archive rebuild |
| `docs/backlog.md` | Raw unsorted issue/feature dump (pre-roadmap; mine for detail) |
| `docs/think-pad.md`, `docs/active-targets.md` | Promoted into roadmap; now just pointers |
| `CLAUDE.md` | Conventions you MUST follow (store contract, styling, TS rules) |

## Codebase shape

Single-page GTD app, no router, no backend, **no test runner**.

- `src/store.ts` — one module-private Zustand store. Read via selector hooks
  (`useBoardSections`, `useVisibleSectionTasks`, …), write via plain action
  functions (`appendTask`, `archiveTask`, …). Never export the store.
- `src/App.tsx` — entire UI as `View*` components in one file.
- `src/hooks.ts` — `useEditInput` (inline-edit input behavior).
- `src/index.css` — Tailwind v4 + keyframe `.anim-*` / `.dot-pop` / `.strike`.

**Run / verify:**
- `pnpm dev` — usually already running (port 5137, user-managed).
- `pnpm build && pnpm lint` — the full self-check after edits (there is no test
  runner; this is the only automated gate).

**Persistence:** Zustand `persist`, localStorage key `simple-gtd`, currently
`version: 4` (the archive plan bumps it to 5). `partialize` persists only
`sections` + `tasks`. Clear the key to reset to seeded mock data.

## Decisions made this session (and why)

1. **v1 = polish-first, not features.** Drag-and-drop, quick capture, search,
   and task metadata are all confirmed **Later** — get the existing app fully
   usable first.
2. **Persistence = localStorage + manual JSON export/import.** No backend, no
   accounts, no sync (that's a different, much larger project). Export/import is
   the one data-safety/trust feature in v1.
3. **Deletion = soft archive only (Trello model).** Nothing is destroyed by
   normal use. Two independent `.archived` flags (section, task), no cascade,
   pure derivation. The board archives (no confirm — it's reversible). Permanent
   hard delete exists ONLY inside the archive (with confirm). Archive view is
   **tabbed**: Sections | Tasks, never combined. Full rules + the three resolved
   edge cases (double-marked task, buried task, restore order) are in
   `archive-visibility.md`.
4. **Sections need full CRUD incl. reorder, arbitrary count.** Users must not be
   locked to the seeded five lists.
5. **Per-section collapse and empty-state polish are IN v1** (not deferred).

## Code ground-truth (done vs not) — v1-relevant

**Done:** task CRUD (add/inline-edit/delete/toggle), section create+rename,
global show-done toggle, fractional ordering on append, localStorage persistence,
entrance animations, click-title-to-edit (no pencil).

**Not done / rebuild:**
- Archive model — **absent; was built then removed.** No `archived` field;
  `deleteTask`/`deleteSection` hard-delete; both board views show a `Trash2`
  button. `store.ts`'s `migrate` comment even says it drops "the old archived
  flag from the deleted archive feature." → the rebuild plan.
- Section reorder — no action; `sortable` state exists but is unwired.
- JSON export/import — none.
- Per-section collapse, empty states — none.
- §4–§6 polish — see roadmap.

## Landmines / gotchas

- **Archive was deliberately removed once.** Don't be surprised the spec
  (`archive-visibility.md`) describes something the code lacks. `active-targets`
  previously flagged that spec as "stale doc to delete" — that note has been
  **reversed**; the spec is canonical again.
- **Misleading commit message:** commit `afaad6e` reads "feat(archive):
  implement archive model…" but is **docs-only** (roadmap, plan, think-pad,
  active-targets) — no code changed. The archive model is still unimplemented.
  Trust the code and this doc, not that subject line.
- **Edit ↔ display mismatch is real (roadmap §4).** Display titles are a
  wrapping `<span>` (`wrap-anywhere`); the editor is a single-line `<input>` —
  `wrap-anywhere` is a no-op on inputs, so long titles render multi-line as text
  but single-line while editing, causing a layout shift. Reconcile with a
  textarea or truncation; never overflow horizontally.
- **`onAnimationEnd`-gated removal is fragile** (`App.tsx`, flagged "won't
  fix"): delete/archive only fires when the slide-out animation ends, so a
  hidden tab or interruption can strand the item. The archive plan **reuses this
  pattern unchanged** (swaps delete→archive); fixing the fragility is a separate
  roadmap §6 item.
- **Two more "won't fix" flags in `hooks.ts`:** `initialValue` must not change
  after mount; Enter on an empty value closes the editor and reverts. Revisit
  under roadmap §4.

## Conventions you MUST follow (see CLAUDE.md for the full list)

- Models own state + derivations; views never compute from multiple state reads
  — add a selector hook instead.
- All components are `View*` and live in `src/App.tsx`.
- Tailwind v4 only for styling; the sole inline `style` is the per-item
  `animationDelay` stagger. React Compiler is on — **no manual `useMemo`/
  `useCallback`**.
- TypeScript: no `any`, no `as`, no `@ts-ignore`, no `!`. Discriminated unions
  use a `tag` field + `switch` + `assertNever`.
- ARIA / semantic HTML / `prefers-reduced-motion` are **out of scope** — do not
  add or analyze them.
- Commit per `cnp`: `git add <explicit files> && git commit -m "<msg>"` — never
  `git add -A` / `.`. Commit only when asked.

## Execution options for the plan

1. **Subagent-driven** — fresh subagent per task, review between tasks.
2. **Inline** — implement in-session with checkpoints.

(Per project memory, agents are costly; a 4-task plan is a legitimate use, but
inline is fine and cheaper.)
