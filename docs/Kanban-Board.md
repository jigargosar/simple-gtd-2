# Kanban Board
- AI should never use short names, of following sections, only infer them when user uses them.

## InBasket, Inbox (IB)

## Planning (PN)

- [ ] CLAUDE.md doc pass (needs decision on rule placement): reword the
      docs/handoff.md Workflow line (deprecated, Inbox replaces it — handoff
      now only for oversized reference material); add a tentative dev workflow
      shape (pick from all lists → spec/design → plan → implement → verify
      (build+lint) → review diff → small doc cleanup → log decision; cadence:
      one feature then a bit of doc cleanup; no doc-to-doc migration, re-scan
      lists each pick); audit/cut stale descriptive lines per Convention 9
      (known offenders: Convention 2's `.anim-*`/`.dot-pop` names, `.strike`
      mislabeled as a keyframe); add a broken-windows note (fix minor
      convention drift promptly, treat as a defect not cosmetic); note the
      centered max-w-2xl desktop layout with wide gutters is intentional
      (calm, single-document feel) — won't-fix, not a kanban board.
- [ ] Search: title-only match, mirror the `showDone` pattern
      (`searchQuery` in store, one more filter in `visibleSectionTasks`,
      input in `ViewMenu`). Bonus/may-be-cut per requirements.md.
- [ ] Row-control interaction model (needs decision): grip — auto smooth hide
      (rest hidden, fade in on row hover ~150ms, gutter space reserved,
      Notion/Todoist pattern; drag/keyboard unchanged) vs staying permanent;
      edit-card pass — title editor expands into an inline card holding
      Move/Archive (+ future notes), right-side hover buttons die if adopted
      (double-click opens, drag/selection unaffected, already settled); if
      edit-card doesn't land, right-side buttons need a fallback (fade-in
      overlay cluster or metadata-at-rest); hover gaps to fix once decided —
      grip hover (hover:text-stone-600), add-row tint (hover:bg-stone-100),
      move-to hover:text-stone-700 parity with archive; touch discoverability —
      archive/move-to are hover/focus-within only, unreachable on touch
      without tab, same surface as the above.
- [ ] Dialog/menu polish leftovers from the 2026-07-02 visual pass: archive-dialog
      focus rings, restore button indigo → accent, empty-state contrast bump,
      wire useScrollLock (exists in hooks.ts, unused) into both dialogs.
- [ ] V1 UX/UI pass (requirements §5, incl. §4 edit↔display parity) — NEXT UP.
      Then in order: §4 done-status in archive view, §4 auto-scroll to new input,
      §7 empty states. After: §6 animation hardening, cherry-pick by impact.
- [ ] Update requirements.md Priority note (still dated 2026-06-22) to the
      current order above — requirements is the authoritative source.

## Ready (RY)


## In Progress (IP)

## Done (DN)

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

## Backlog (BL)

- [ ] Ghost add-row circle: spin the dotted circle while it fills (dotted → solid
      on input focus) — cool-effect polish, keep subtle per Convention 8.
- [ ] Keyboard pass: Enter-to-edit on the focused/selected row, arrow navigation
      between rows, complete/archive shortcuts. Deferred with the focus/semantics
      territory CLAUDE.md parks.
- [ ] naming outright blunders
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
- [ ] Collapse / expand all sections at once.
- [ ] Section-level progress: no task count/tally per section (e.g. "3/8") —
      scanning which list needs attention requires opening each one.
- [ ] Sweep board/backlog for more design-system.md candidates (hover, outline,
      checkbox, animation, focus) beyond the initial seed.

