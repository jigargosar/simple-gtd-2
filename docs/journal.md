# Journal

Append-only, dated. One line per event (decision or completion). Newest at bottom.

- 2026-06-22 — Decision: defer all animation + visual niceties to the end of v1. Build functional scope first (§1 archive → §2–4); near the 30 Jun deadline, cherry-pick the highest-impact niceties by impact and cut the rest. Why: ~8 days left; niceties are interchangeable and individually low-impact, so deciding late avoids sinking time into polish that may get dropped. Consequence: archive/unarchive ships as instant state changes (no exit animation); the plan's `onAnimationEnd`/`task-out` gating is stale and replaced by a direct click.

- 2026-07-01 — Decision: promote drag-and-drop from post-v1 to v1 scope (requirements.md §9).
  - Implemented via `@dnd-kit/react`: task reorder within a section, move between sections, section reorder.
  - Why: a prior hand-rolled DnD attempt (see git history, removed May 2026) was scrapped for complexity; `@dnd-kit/react` replaces it.
  - Consequence: hit an upstream DOM/React desync bug (github.com/clauderic/dnd-kit#1747) on cross-section drags, worked around in `onDragEnd` (reparent + `flushSync`, documented in docs/reference/dnd-kit-notes.md); section-drag flickering remains open in backlog.md.
