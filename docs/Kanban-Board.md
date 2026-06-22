# Kanban Board

## Inbasket (IB)

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

## Triage (TT)

- [ ] Where to record direction / next task: CLAUDE.md, docs/backlog.md, or here?

## Ready (RR)

- [ ] naming outright blunders
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).

## In Progress (IP)

## Done (DN)

- [x] fixed: Now, move menu items are follow  follow focus-ring consistantly.
- [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)

## Backlog (BL)

- [ ] Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.

