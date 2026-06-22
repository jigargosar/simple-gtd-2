# Journal

Append-only, dated. One line per event (decision or completion). Newest at bottom.

- 2026-06-22 — Decision: defer all animation + visual niceties to the end of v1. Build functional scope first (§1 archive → §2–4); near the 30 Jun deadline, cherry-pick the highest-impact niceties by impact and cut the rest. Why: ~8 days left; niceties are interchangeable and individually low-impact, so deciding late avoids sinking time into polish that may get dropped. Consequence: archive/unarchive ships as instant state changes (no exit animation); the plan's `onAnimationEnd`/`task-out` gating is stale and replaced by a direct click.
