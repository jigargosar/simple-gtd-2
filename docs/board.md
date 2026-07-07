# AI should never use short names, of following sections, only infer them when user uses them.

# InBasket, Inbox (IB)

- [ ] Sweep board/backlog for more design-system.md candidates (hover, outline,
  checkbox, animation, focus) beyond the initial seed.
- [ ] Add a "Micro-replies" rule to `C:\Users\jigar\.claude\skills\fmt\SKILL.md`
  — single trivial-fact replies skip numbering/tldr, one `— ` prefixed line
  instead. Proposed earlier, not tracked anywhere until now.

---
---

# Planning (PN)

- [ ] Dialog/menu polish leftovers from the 2026-07-02 visual pass:
      archive-dialog focus rings, restore-button color (indigo → accent),
      empty-state contrast, and wiring the unused useScrollLock hook into
      both dialogs.
- [ ] V1 UX/UI pass — see §4 below.
- [ ] Search / filter — one input + `useMatchingTasks(query)` (bonus, if time
      remains). docs/reference/search-notes
- [ ] Single undo notification for the last operation (archive, done toggle,
      etc.) — one toast, undoes whatever just happened.

---
---

# Ready (RD)
-

---
---

# In Progress (IP)
- 

---
---

# Done (DN)

- [x] CLAUDE.md doc pass — cleanup, Convention 9 audit, added Convention 11.
- [x] fixed: Now, move menu items are follow focus-ring consistently.
- [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)
- [x] Doc cleanup — removed skill-leftover lines from backlog.md and the
      stale /of-skill Inbox card.
- [x] `docs/design-system.md` created — seeded with checkbox/toggle, icon
      weight, and animation gaps; focus/outline sources still pending.

---
---

# Requirements (SimpleGTD v1 Roadmap)

Goal: ship a **fully usable v1** for real users by **end of June 2026 (30 Jun)**.

**Priority:** §1–§3, §9 done. Remaining functional work is §4 (edit↔display
parity, archive done-status, auto-scroll, empty states), past the 30 Jun
deadline. See `adr.md`.

- Archive model spec: [archive-visibility](reference/archive-visibility.md)

Status: `[x]` done · `[~]` partial · `[ ]` todo. Done-markers reflect a read of
`src/store.ts`, `src/App.tsx`, `src/hooks.ts`, `src/index.css` on 13 Jun 2026.

## Foundation (already done)

- [x] Task CRUD — add / inline-edit / delete / toggle done
- [x] Section create + inline rename
- [x] Show-completed toggle (global `showDone`), persisted across reloads
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
- [x] Section drag ghost — header-only `DragOverlay` while dragging a
      section. See [reference/2026-07-06-section-drag-ghost.md](reference/2026-07-06-section-drag-ghost.md).

## 4. Interaction correctness & readability — V1 UX/UI pass

- [x] Click title to edit — pencil removed, title span is the trigger;
      keyboard-activatable (Enter/Space via `tabIndex`/`role="button"`), no
      longer double-click-only. Matching gap on `ViewSection` still open.
- [x] Row/section model finalized — unified icon sizing, spacing, and
      hover/focus treatment across rows and section headers. See
      [reference/2026-07-05-row-section-model.md](reference/2026-07-05-row-section-model.md).
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

## 7. Empty states

- [ ] Designed empty state for empty sections / lists / first run

## Known issues, might not fix

- [ ] `hooks.ts:14` — `initialValue` shouldn't change after mount
- [ ] `App.tsx:185` — exit removal depends on the animation firing (see Backlog: Animation)

## Out of scope

- Backend / accounts / multi-device sync
- ARIA / semantic HTML / `prefers-reduced-motion` (per CLAUDE.md)

---
---

# Backlog

## DnD

- [ ] Fix section flickering issues during drag.
- [ ] Style drag with tilt and gradient opacity?
- [ ] Collapse ALL sections to header-only while any section is being dragged
      (not just the dragged one) — easier to navigate/drop into on a long
      board. (Collapsing just the dragged section — via `DragOverlay` —
      shipped, see Done.)

## Features

- [ ] Click-to-edit on the entire row (not just the title text), so no edit
      button is needed — needs a decision on scope (whole row incl.
      checkbox/icons vs. just title).
- [ ] Draft recovery: transient in-progress edits (open title/add inputs) are
      pure local state and vanish on refresh/crash — consider persisting
      drafts so they survive and can be recovered.
- [ ] Keyboard pass: Enter-to-edit on the focused/selected row, arrow
      navigation between rows, complete/archive shortcuts. Deferred with the
      focus/semantics territory CLAUDE.md parks.
- [ ] Collapse / expand all sections at once.
- [ ] Section-level progress: no task count/tally per section (e.g. "3/8") —
      scanning which list needs attention requires opening each one.
- [ ] 3-state filter — Active / Done / All (replaces the binary `showDone`
      toggle) (bonus, if time remains)
- [ ] Quick capture — global keyboard-first Inbox add
- [ ] Task metadata — notes; contexts/tags (@home, @calls) + filtering

## Menu & interaction

- Note: clickable areas should not artificially restrict UX by making the
  user hunt.
- [ ] Menu always opens downward below the button (absolute, no flip) —
      clips, can't reach all items for low tasks.
- [ ] Long section names in the menu — verify text behavior (currently
      min-w-44 + truncate).
- [ ] Unify task row's Move-to and Archive buttons into a single menu (Move
      to: A, B, X | Archive) — reduces mis-click risk from two adjacent small
      icon buttons.

## Visual & style exploration

- [ ] Item/section alignment — general pass, all alignment UI.
- [ ] Row hover/focus highlight: bottom accent border (hover:border-accent/
      focus-within:border-accent) hidden for now — no row-level hover
      indication at all currently. Also found: flex `gap-4` between
      rows/header sits outside any row's own group, so hover drops out in
      that strip regardless of treatment. Revisit both together.
- [ ] Ruled-notebook / hand-drawn direction: sketchy, non-straight lines
      somewhere in the UI via `roughjs` or `rough-notation` — candidate
      locations: checkbox, section dividers, outer card border. "Wow
      factor" idea, never implemented, needs explicit scoping before any
      code.
- [ ] Custom icons: explored replacing the checkbox's checkmark with a
      hand-rolled SVG (ring + solid dot for done) instead of lucide's
      default — reverted for now, revisit as part of a deliberate
      icon-design pass.
- [ ] Ghost add-row circle: spin the dotted circle while it fills (dotted →
      solid on input focus) — cool-effect polish, keep subtle per
      Convention 8.

## Animation

- [ ] No layout shift on long-line edit / add-section / delete.
- [ ] Resolve delete-on-`animationend` fragility (`App.tsx:185`, flagged
      "won't fix") — delete-on-click vs animation-gated.
- [ ] Try animations.

---
---

═══════════════════════════════════════════════════════════════
# Workflow (WF) How to work with this file
═══════════════════════════════════════════════════════════════

- Everything below is a guideline, not a rigid rule — deviating from it is fine
using judgement, but any such judgement call should get explicit confirmation
before being acted on.
- The checkout model (below) describes how new work gets picked up going
  forward. It is not retroactive — existing Planning/Ready/In Progress/Done
  items are not required to trace back to a Requirements or Backlog entry.

## What goes where
- **InBasket** — freshly noticed, not yet triaged.
- **Planning** — being scoped/thought through before work starts.
- **Ready** — scoped, queued, next up.
- **In Progress** — actively being worked on right now.
- **Done** — recently finished pipeline entries; not a permanent home.
- **Requirements** — authoritative record of committed scope and its status
  ([ ]/[~]/[x]).
- **Backlog** — not-yet-committed items, grouped by whatever dimension is
  useful; an item fitting more than one group lives in one canonical place,
  linked from the others, never duplicated.

## Checking an item out
Requirements and Backlog items are authoritative. Picking one up creates a
full duplicate in the pipeline (Planning/Ready/In Progress) — real content,
not a bare link. The pipeline entry is tagged `$N`, a back-reference to the
authoritative item; it carries no `[ ]`/`[~]`/`[x]` checkbox, since which
section it's in already is its status.

Splitting a checked-out item keeps every split part tagged back to the same
`$N`. When any split part finishes, that result is captured back onto the
authoritative item immediately (its status updates, e.g. to `[~]`).

Once every split part is done, the final state folds back into the
authoritative item and the pipeline duplicate is deleted — the authoritative
item is then the only remaining record.

## Stable references
`$N` tags are added lazily — only once an item is actually checked out or
otherwise needs to be linked back to.

## Detail handling
- Long item detail with no reference doc yet → nested sub-list under the
  item, not a dense paragraph.
- Disproportionately large detail → extract to `docs/reference/*.md`, link
  back to it.
- Default to preserving every critical fact when merging or compressing
  items. Compression only removes verbosity (redundant wording, restated
  context) — never a fact. If preserving a fact makes a line longer, keep
  the fact and accept the length.
- When a review deliberately leaves an item alone (not critical, not worth
  acting on now), add a tiny dated note saying so. That note is what stops
  the same item from being re-litigated on the next pass.

## Progression/Evolution Cadence
Check `git log --follow -- docs/board.md` on the first request of each day.

## Open questions (workflow-only — product open questions live inline in the Requirements section above)
- None yet.
