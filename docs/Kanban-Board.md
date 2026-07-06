# Kanban Board
- AI should never use short names, of following sections, only infer them when user uses them.

## InBasket, Inbox (IB)
- [ ] Sweep board/backlog for more design-system.md candidates (hover, outline,
  checkbox, animation, focus) beyond the initial seed.

## Planning (PN)

- [ ] Dialog/menu polish leftovers from the 2026-07-02 visual pass:
      archive-dialog focus rings, restore-button color (indigo → accent),
      empty-state contrast, and wiring the unused useScrollLock hook into
      both dialogs.
- [ ] V1 UX/UI pass (requirements §4): edit↔display parity, archive
      done-status, auto-scroll to new input, empty states, then animation
      hardening, cherry-picked by impact.

## Ready (RY)


## In Progress (IP)
- 

## Done (DN)

- [x] Section drag ghost: dragging a section now shows a header-only overlay
      (via `@dnd-kit/react`'s `DragOverlay`, scoped to sections only) instead
      of floating/reserving space for the full task list. The original
      section also collapses to header-only while dragging. Tried first
      without an overlay (plain `isDragging` collapse, then a manual
      `sortable.refreshShape()`, then `Feedback.configure({feedback:'move'})`)
      — all failed because dnd-kit's default feedback mode clones a frozen
      placeholder at drag-start to reserve space, and that clone predates our
      React collapse. `DragOverlay` sidesteps the clone entirely. Tasks are
      single rows already, so they keep the plain default behavior.
- [x] `ViewTitle` (task title): added `tabIndex`, `role="button"`, and an
      Enter/Space keydown handler so entering edit mode no longer requires a
      double-click — double-click still works too. Matching gap on
      `ViewSection`'s title-edit span is still open (not in scope, noted for
      later).
- [x] Persist `showDone` filter across reloads (was deliberately transient;
      now included in `partialize`/`migrate`, same safe-default pattern as
      other fields, no version bump needed).
- [x] Row/section model finalized: unified 1:2:4 icon sizing/spacing tokens
      (28×28 hit-box on every row control), ring flush on hit-area edge, no
      icon or checkbox hover-color anywhere. Row-level hover/focus bottom
      border tried, then hidden (see backlog — no row hover indication
      currently, plus a found gap-hover-dropout issue between rows).
      Section header unified to the task row's exact structural classes
      (padding, rounded corners, border placeholder, transition,
      items-center). Between-section and header-to-tasks gaps reduced
      (40px→24px, 16px→8px). Transition durations bumped 150ms→300ms so
      state changes read as a fade. Formal `/frontend-baseline` skill run
      still outstanding — floors were hand-checked in conversation instead;
      see backlog if that's wanted as a separate QA pass.
- [x] Synced requirements.md's Priority note to the V1 pass step order above
      (§4 → §5 → §6, stale past-deadline framing removed).
- [x] CLAUDE.md doc pass: removed stale docs/handoff.md (Inbox replaced its
      triage role, file deleted); Convention 9 audit already resolved
      (`.anim-*`/`.dot-pop`/`.strike` gone from Convention 2); added
      Convention 11 (breaking convention gives AI permission to break in
      future — fix during or before editing); noted in the intro the
      centered max-w-2xl layout is intentional; dev-workflow cadence
      considered and skipped (too tentative to commit).
- [x] JSON export / import (data safety) — export via file-saver; import:
      parse/validate/preview (summary + scrollable, wrap-anywhere tree,
      archived excluded) → confirm/error dialog → commit via loadRaw,
      persisted. Both dialogs centered (items-center, min/max-h) instead of
      top-anchored stretch.
- [x] Reorder tasks within a section (`@dnd-kit/react` `useSortable`; order recomputed via `orderBetween` between drop neighbors)
- [x] Move task between sections (same mechanism, cross-section drop)
- [x] Reorder sections (same mechanism, flat `sections` group)
- [x] Collapsible sections — persisted `collapsed` flag per section + chevron toggle; folded sections hide their task list.
- [x] fixed: Now, move menu items are follow focus-ring consistently.
- [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)
- [x] Doc cleanup: removed skill-leftover lines from backlog.md (scrollbar-shift
      note, easy-flow rule-7 block, Floor 9 quote) and the stale /of-skill Inbox
      card — content already lived in skill-builder-workspace src/fmt/dump.md /
      frontend-baseline skill.
- [x] docs/design-system.md created — seeded with checkbox/toggle shapes, icon
      weight, and animation gaps (animation content also pulled from
      backlog.md); focus points to CLAUDE.md Convention 6; outline has no
      source yet. Referenced from CLAUDE.md's Workflow file list.
