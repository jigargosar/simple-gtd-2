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
