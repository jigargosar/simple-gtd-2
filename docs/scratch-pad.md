# Scratch pad

## Move-task-to-section audit

Functionally sound; build + lint pass. Open items:

1. Convention 6 — dropdown item buttons miss the focus-visible ring (only `focus-visible:bg-stone-100`). Fix.
2. Convention 8 — dropdown open/close is instant, no `.anim-*` transition; may be deferred to step 2 (per the `// step 2` comment). Confirm.
3. Convention 8 — move is abrupt (no exit/enter animation); may be deferred to step 2 (per the `// step 2` comment). Confirm.
4. Convention 1 (optional) — `targets` derived inline in `ViewMoveMenu`; could be a `useMoveTargets(sectionId)` selector. Borderline (one read filtered by a prop), not a clear breach.
5. Optional — dropdown `absolute right-0` never flips; can overflow the bottom for low tasks. With 5 short sections, likely never overflows.

## Direction

6. Building move-task-between-sections — step 1 (hover move menu) done; step 2 migrates the menu into the task detail box.
7. Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).

## Pending decisions

8. Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.
9. Where to record direction / next task: CLAUDE.md, docs/backlog.md, or here?
