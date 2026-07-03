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
