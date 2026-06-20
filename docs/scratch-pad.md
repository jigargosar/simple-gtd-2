Audit of the move-task-to-section change (`setTaskSection` + `ViewMoveMenu`):

1. Build passes (`tsc -b` + Vite); lint passes (ESLint clean).
2. `setTaskSection` is correct: early-returns `{}` no-op when task missing or already in target.
3. Order placement is correct: appends after the target section's last task, mirroring `appendTask`.
4. No self-collision: the early return guarantees the moved task isn't in the target list when computing `lastOrder`.
5. Empty-target case handled: `lastOrder` null → `orderBetween(null, null)` base key.
6. Store conventions met: new write is an action calling `useApp.setState`, fractional ordering, no escape hatches.
7. App conventions met: `FolderInput` from lucide-react, Tailwind-only, no manual memo, move button uses the prescribed focus-visible ring.
8. Edge case handled: `targets.length === 0` hides the button (single-section case).
9. Deviation (convention 8): move is abrupt — task vanishes from the old section and pops into the new one with no exit/enter animation, unlike the animated delete path.
10. Deviation (convention 8): dropdown open/close is instant (`{open && …}`) with no `.anim-*` transition.
11. Deviation (convention 6): dropdown item buttons omit the focus-visible ring, using only `focus-visible:bg-stone-100`.
12. Minor (convention 1): `targets` is derived inline in the view; could be a `useMoveTargets(sectionId)` selector hook.
13. Minor: dropdown uses fixed `absolute right-0` with no viewport-flip — can overflow the bottom for low tasks.
14. Context: the `// step 2` comment signals 9–10 may be intentionally deferred interim state — confirm before fixing.
15. Verdict: functionally sound and safe to keep; items 9–11 are the polish gaps to address if not deferred.

---

Explaining items 4 and 5 from my prior list:

1. Item 4 is convention 1 (views must not derive state): `ViewMoveMenu` calls `useSections()` then filters by `task.sectionId` inline to build `targets`.
2. Fix would be a `useMoveTargets(sectionId)` selector hook in store.ts, keeping the derivation in the model layer.
3. It's optional because it's one state read filtered by a prop, not multiple reads combined — borderline, not a clear breach.
4. Item 5 is the dropdown's fixed `absolute right-0 mt-1` — it always opens downward with no flip.
5. A task low in the viewport can push the menu off-screen or get it clipped.
6. "Viewport-flip" = detect available space and open upward (or shift) when there's no room below.
7. It's optional because with 5 short sections the small menu likely never overflows — complexity may not pay off.

Proposed writes (need permission for CLAUDE.md per my rules):

8. Add to CLAUDE.md Conventions: "Fix minor issues promptly — unresolved convention drift normalizes lower standards (broken-windows theory); treat it as a defect, not cosmetic."
9. Record current direction: "Building move-task-between-sections — step 1 (hover move menu) done; step 2 migrates the menu into the task detail box."
10. Record next task: "Review the animation code (`.anim-*` in src/index.css and its usages)."
11. Open question: items 9–10 — write to CLAUDE.md too, or to docs/scratch-pad.md / docs/backlog.md? Tell me where.

Waiting for permission.
