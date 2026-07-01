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
## Planning (PN)


## Ready (RY)


## In Progress (IP)


## Done (DN)

- [x] Collapsible sections — persisted `collapsed` flag per section + chevron toggle; folded sections hide their task list.
- [x] fixed: Now, move menu items are follow focus-ring consistently.
- [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)

## Backlog (BL)

- [ ] naming outright blunders
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
- [ ] Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.

