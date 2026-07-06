# SimpleGTD v1 Roadmap

Goal: ship a **fully usable v1** for real users by **end of June 2026 (30 Jun)**.

**Priority:** §1–§3, §9 done. Remaining functional work is §4 (edit↔display
parity, archive done-status, auto-scroll, empty states), then §6 animation
hardening — cherry-picked by impact, past the 30 Jun deadline. See `adr.md`.

- Archive model spec: [archive-visibility](reference/archive-visibility.md)

Status: `[x]` done · `[~]` partial · `[ ]` todo. Done-markers reflect a read of
`src/store.ts`, `src/App.tsx`, `src/hooks.ts`, `src/index.css` on 13 Jun 2026.

## Foundation (already done)

- [x] Task CRUD — add / inline-edit / delete / toggle done
- [x] Section create + inline rename
- [x] Show-completed toggle (global `showDone`)
- [x] Fractional ordering on append (sections + tasks)
- [x] localStorage persistence (Zustand `persist` + `migrate`)
- [x] Per-section collapse/expand

## 1. Archive model — REBUILD (was built, then removed)

Spec: [reference/archive-visibility.md](reference/archive-visibility.md).
Foundational — items in §2, §3, §4 depend on it.

- [x] Add independent `archived` flag to `Section` and `Task` (no cascade, pure
      derivation)
- [x] Board visibility = derive (task shows iff task **and** its section are
      both un-archived)
- [x] Replace hard delete with archive on the board (sections + tasks)
- [x] Archive view — tabbed: Sections | Tasks (never one combined list)
- [x] Restore (un-archive) — preserves original `order` (archiving never touches it)
- [x] Keep `done` orthogonal to archive
- [x] Decide: permanent delete only inside the archive (the lone hard delete)

## 2. Data safety

- [x] localStorage persistence
- [x] JSON export (download backup)
- [x] JSON import (restore from backup)

## 3. Section CRUD

- [x] Create
- [x] Rename
- [x] Delete — board action is now archive; hard delete lives only in the archive dialog (§1)

## 9. Drag-and-drop reordering

- [x] Reorder tasks within a section (`@dnd-kit/react` `useSortable`; order
      recomputed via `orderBetween` between drop neighbors)
- [x] Move task between sections (same mechanism, cross-section drop)
- [x] Reorder sections (same mechanism, flat `sections` group)

## 4. Interaction correctness & readability — V1 UX/UI pass

- [x] Click title to edit — pencil removed, title span is the trigger
- [ ] Edit ↔ display parity — display wraps multi-line, editor is single-line
      `<input>` (`wrap-anywhere` is a no-op on inputs); reconcile (textarea or
      truncate), never overflow horizontally.
- [~] Checkbox ↔ edit-input spacing — display + editor share `titleBox`; verify
      whether it still reads too narrow
- [x] Board view: archive-only, no delete button (`Trash2` lives only in the archive) — §1
- [ ] Done status visible in archive view — §1
- [ ] Auto-scroll to a newly-added input (add-section on a long page)
- [~] Reduce over-dark / over-bold text; font pass (Inter set; tone pass pending)
- [ ] Tailwind class cleanup
- [ ] Page-scrollbar shift fix (`scrollbar-gutter`)
- [ ] Hover consistency — section header has no hover bg; add-rows use
      `focus-within:bg-stone-100/40` vs task hover `bg-stone-100/60`

## 6. Animation hardening (zero jank) — POST-FUNCTIONAL: cherry-pick by impact, rest may be cut

- [ ] No layout shift on long-line edit / add-section / delete
- [ ] Resolve delete-on-`animationend` fragility (`App.tsx:185`, flagged
      "won't fix") — delete-on-click vs animation-gated

## 7. Empty states

- [ ] Designed empty state for empty sections / lists / first run

## Known issues, might not fix

- [ ] `hooks.ts:14` — `initialValue` shouldn't change after mount
- [ ] `App.tsx:185` — exit removal depends on the animation firing (see §6)

## Out of scope

- Backend / accounts / multi-device sync
- ARIA / semantic HTML / `prefers-reduced-motion` (per CLAUDE.md)
