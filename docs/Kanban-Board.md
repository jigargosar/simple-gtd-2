# Kanban Board
- AI should never use short names, of following sections, only infer them when user uses them.

## InBasket, Inbox (IB)

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

- [ ] naming outright blunders
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
- [ ] Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.

