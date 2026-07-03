# Kanban Board
- AI should never use short names, of following sections, only infer them when user uses them.

## InBasket, Inbox (IB)

- [ ] Future of the grip (needs decision): auto smooth hide — e.g. rest hidden,
      fade in on row hover (~150ms opacity, gutter space stays reserved), the
      Notion/Todoist pattern; drag/keyboard behavior unchanged.
- [ ] Edit-card pass (needs decision): title editor expands into an inline card
      holding Move/Archive (+ future notes) → right-side hover buttons die.
      Interaction model already settled: double-click opens, drag/selection
      unaffected.
- [ ] Dialog/menu polish leftovers from the 2026-07-02 visual pass: archive-dialog
      focus rings, restore button indigo → accent, empty-state contrast bump,
      wire useScrollLock (exists in hooks.ts, unused) into both dialogs.

- [ ] V1 UX/UI pass (requirements §5, incl. §4 edit↔display parity) — NEXT UP.
      Then in order: §4 done-status in archive view, §4 auto-scroll to new input,
      §7 empty states. After: §6 animation hardening, cherry-pick by impact.
- [ ] Update requirements.md Priority note (still dated 2026-06-22) to the
      current order above — requirements is the authoritative source.
- [ ] Doc cleanup: trash the skill-leftover lines now moved/addressed elsewhere —
      backlog.md: scrollbar-shift note, easy-flow rule-7 block, Floor 9 quote;
      this board: the /of-skill Inbox card (all live in skill-builder-workspace
      src/fmt/dump.md or in the frontend-baseline skill as Floors 10-12).
- [ ] CLAUDE.md Workflow: reword the docs/handoff.md line — file kept but
      deprecated; this Inbox replaces handoff (handoff now only for oversized
      reference material).
- [ ] Collapse / expand all sections at once.
- [ ] Audit CLAUDE.md: cut/convert descriptive lines that snapshot current code
      state (they rot into lies). Keep only timeless rules + grep-pointers per
      Convention 9. Known offenders: Convention 2 enumerates `.anim-*`/`.dot-pop`
      class names (now stale after anim removal) and calls `.strike` a keyframe
      (it's a transition). Dated state belongs in a journal, aspirations in the
      roadmap — not in CLAUDE.md.
- [ ] Establish a tentative dev workflow in CLAUDE.md (OK to change later, but
      have one). Rough shape: pick from all lists → spec/design → plan → implement
      → verify (build+lint) → review diff → small doc cleanup → log decision.
      Cadence: one feature, then a bit of doc cleanup. No doc-to-doc migration;
      re-scan all lists each time we pick.
- [ ] Search: title-only match, mirror the `showDone` pattern
      (`searchQuery` in store, one more filter in `visibleSectionTasks`,
      input in `ViewMenu`). Bonus/may-be-cut per requirements.md.
- [ ] /of skill (personal tooling, not app scope): Critical Step checklist
      has 4 redundant clusters, documented but unmerged — trim decision
      pending. See `~/.claude/skills/of/docs/ADR.md`.
- [ ] Touch discoverability: archive/move-to are hover/focus-within only —
      unreachable on touch without tab. Overlaps the right-side-buttons and
      hover-gaps Backlog items; consider together.
- [ ] Section-level progress: no task count/tally per section (e.g. "3/8") —
      scanning which list needs attention requires opening each one.
- [ ] Desktop layout: centered max-w-2xl card leaves wide gutters on wide
      viewports — reads as a single document, not a multi-section board.
- [ ] Consistency: "Show completed" menu toggle uses a square checkbox;
      task-done uses a filled circle — same on/off concept, two shapes.
      Consider a switch for the view-level toggle.
- [ ] Icon hierarchy: grip/chevron/archive icons share one visual weight
      (stone-400/500, size-4/5) — interactive parts take a beat to pick out
      from decorative ones.

## Planning (PN)

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

## Backlog (BL)

- [ ] Ghost add-row circle: spin the dotted circle while it fills (dotted → solid
      on input focus) — cool-effect polish, keep subtle per Convention 8.
- [ ] Future of the right-side row buttons (move-to, archive): hover-revealed today;
      candidates — absorb into the edit-card (preferred if that lands), fade-in
      overlay cluster, or metadata-at-rest. Depends on the edit-card decision.
- [ ] Hover gaps (audit 2026-07-03, checkbox = model): grips lack any hover (add
      hover:text-stone-600); add rows lack the task-row tint (hover:bg-stone-100,
      optionally preview ghost circle at stone-500); move-to button missing
      hover:text-stone-700 parity with archive.
- [ ] Keyboard pass: Enter-to-edit on the focused/selected row, arrow navigation
      between rows, complete/archive shortcuts. Deferred with the focus/semantics
      territory CLAUDE.md parks.
- [ ] naming outright blunders
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
- [ ] Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.

