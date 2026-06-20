# Scratch pad

## Move-task-to-section audit

Bug:
1. [x] move menu items dont follow focus-ring consistantly.
2. [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)

Next Actions:
3. [ ] naming outright blunders
4. [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
5. [ ] Add a broken-windows note to CLAUDE.md Conventions: fix minor convention drift promptly; treat it as a defect, not cosmetic.
6. [ ] Where to record direction / next task: CLAUDE.md, docs/backlog.md, or here?

## Modes idea (meta / tooling)

Premise:
7. Modes beat inline rules: a mode is a small, named, hard-enforced state (few degrees of freedom → near-100% compliance). `/d` discuss = no-tools, works every time. Inline CLAUDE.md rules erode; hard constraints don't.
8. TMI/tldr loop already produces good succinct output — because the *second* pass has a draft to cut toward. First pass bloats (generating + judging at once). Make that second pass the default.

Succinct mode spec:
9. Reply = tldr only + `(N items withheld)` line, then STOP; user pulls more.
10. Skipped-count is an honesty signal — terse never silently hides; user can audit omission ("expand item N" / "expand all" / "exit").
11. Decision: generate-then-suppress (not regenerate) so expansion is faithful and the withheld count is accurate.

Candidate minimum mode set (overlap → succinct may be a modifier, not its own mode):
12. [ ] discuss (exists), succinct, advise (recommend not do), bug-finding, review. Settle the *minimum* set + which are hard-enforced vs tonal.

Related:
13. [ ] Rule 4 (verify-before-fact) stays. Failure seen this session: one instance → universal "Fact:" leap (rules-always-loaded). Label tiers: observation vs hypothesis vs verified.
14. [ ] "How to write CLAUDE.md" rule → global `~/.claude/rules/`, not this project's CLAUDE.md (cross-project scope). Omit-by-default: cheap to add a doc line later, costly to keep a stale one.
