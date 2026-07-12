# Scratch pad

## FLIP reflow bug — fix confirmed, not yet committed (2026-07-12)

**Problem:** checking off a task / toggling "Show completed" caused sibling
rows to snap instead of sliding — user reported it as inconsistent,
overshooting, direction flipping per item, and broken on the last item.

**Root cause found:** `useFlip`'s position measurement used
`getBoundingClientRect().top` (viewport-relative). Any scroll between
measurements corrupts the delta for every row — including rows that never
moved. Scroll doesn't have to be user-initiated: Chrome's own **scroll
anchoring** silently adjusts scroll position whenever content shrinks near
the viewport (e.g. a row disappearing), and that adjustment landed inside
the measurement window.

**Fix:** measure document-relative instead — `rect.top + window.scrollY`.
Scroll (from any source) affects both terms equally and cancels out.

**Practice established — isolated spike before touching real code:**
1. Build a throwaway static HTML/JS reproduction (`docs/spikes/mockups/*.html`)
   with zero framework noise (no React/dnd-kit/multi-section reflow) —
   proves the animation math is right or wrong in total isolation.
2. Port the proven fix into the real app.
3. Write a Playwright test against the real app that reproduces the exact
   failure scenario, to lock the fix in as a regression test.

**State right now:**
- Fix applied: `src/hooks.ts` (`useFlip` hook, document-relative measurement)
  and wired into `src/App.tsx` (`ViewSection`, `ViewTask` via `data-flip-id`).
  `pnpm build && pnpm lint` both clean.
- Playwright added as a real devDependency (chromium-only project config,
  `pnpm test` / `pnpm test:ui` scripts) — committed in `dc08eeb`.
- `tests/pages/BoardPage.ts` — Page Object for the real app; `setShowDone()`
  sets AND verifies the toggle state instead of assuming a default, since
  that assumption caused repeated test-writing mistakes earlier (the spike
  file and the real app's seed data default "Show completed" differently).
- Both Playwright tests are green:
  - `tests/flip-spike.spec.ts` — isolated spike, proves the core math.
  - `tests/flip-scroll.spec.ts` — real app via `BoardPage`, proves the port.
  `pnpm test flip-spike flip-scroll` → 2 passed.

**Not yet done:**
- None of this is committed yet (hooks.ts/App.tsx fix, BoardPage, the two
  spec files) — still working tree changes.
- Haven't manually re-confirmed in the live app that the originally reported
  symptoms (overshoot, direction-flip-per-item, last-item case) are gone —
  the Playwright tests cover the specific scroll-contamination mechanism we
  root-caused, which is strong evidence but not the same as re-running the
  user's own original repro steps by hand.
- `tests/example.spec.ts` (Playwright scaffold default, tests playwright.dev)
  is still present — candidate for deletion, not yet decided.

