# ADR

Append-only, dated. One line per event (decision or completion). Newest at bottom.

- 2026-06-22 — Decision: defer all animation + visual niceties to the end of v1. Build functional scope first (§1 archive → §2–4); near the 30 Jun deadline, cherry-pick the highest-impact niceties by impact and cut the rest. Why: ~8 days left; niceties are interchangeable and individually low-impact, so deciding late avoids sinking time into polish that may get dropped. Consequence: archive/unarchive ships as instant state changes (no exit animation); the plan's `onAnimationEnd`/`task-out` gating is stale and replaced by a direct click.

- 2026-07-01 — Decision: promote drag-and-drop from post-v1 to v1 scope (requirements.md §9).
  - Implemented via `@dnd-kit/react`: task reorder within a section, move between sections, section reorder.
  - Why: a prior hand-rolled DnD attempt (see git history, removed May 2026) was scrapped for complexity; `@dnd-kit/react` replaces it.
  - Consequence: hit an upstream DOM/React desync bug (github.com/clauderic/dnd-kit#1747) on cross-section drags, worked around in `onDragEnd` (reparent + `flushSync`, documented in docs/reference/dnd-kit-notes.md); section-drag flickering remains open in backlog.md.

- 2026-07-03 — Decision: titles edit on double-click only.
  - Why: single-click edit caused accidental editor opens and double-click selection flashes; select-on-click (click focuses the grip) was also tried and rejected — it made double-click flaky.
  - Consequence: plain click does nothing; triple-click gives edit + select-all for free (browser line-select in the input).

- 2026-07-03 — Decision: one drag model for tasks and sections — whole-row pointer drag, grip as the formal handle.
  - Mechanics: shared `rowDragSensors` (mouse: 8px distance; touch: 250ms long-press; `preventActivation` exempts buttons/inputs); `activatorElements` widens pointer activation to the row while the grip anchors keyboard focus and Space/Enter lift.
  - Rejected: sticky click-to-drop drag (custom sensor against the semi-documented 0.5 sensor API); hover-revealed handles (inconsistent chrome, invisible on touch).

- 2026-07-03 — Decision: focus rings stay keyboard-only (`focus-visible`) everywhere, grips included.
  - Always-visible grip ring was tried and reverted: the post-drop reparenting workaround (dnd-kit#1747) force-blurs the grip, so the "armed" ring lied after every mouse drag.
  - Keyboard drag anchor is either/or (dnd-kit binds keys to handle-or-element); grip won — one clean tab stop per row instead of a full-row ring.

- 2026-07-04 — Decision: row-level icons are hidden by default and fade in/out on hover, using a slow transition rather than an instant toggle.
  - Why: instant show/hide reads as abrupt, violating the "appearance/disappearance should not be jarring" convention.

- 2026-07-04 — Hover-revealed buttons over an inline edit dialog.
  - Why: simpler to implement. No other reason.

- 2026-07-06 — Decision: an edit input (task/section title) that closes while
  empty (trimmed length 0 — whitespace-only counts as empty) always reverts to
  the prior value — true for Enter, Escape, and blur/click-away alike, not
  just one trigger.
  - Why: titles can't be blank (store-level guard on trimmed length 0 already
    no-ops any empty save), so reverting is the only sane outcome for "closed
    while empty" — not a bug.
  - Consequence: hooks.ts's stale "Won't fix" comment and requirements.md's
    matching "Known issues" line both contradicted this and are removed.

- 2026-07-19 — Decision: remove scroll-locking from dialogs (deleted
  `useScrollLock`); the page behind can now scroll freely while a dialog
  is open.
  - Why: the lock never fully worked (wheel-scroll over the backdrop
    still leaked through), and fixing it costs more than accepting no
    lock at all.
