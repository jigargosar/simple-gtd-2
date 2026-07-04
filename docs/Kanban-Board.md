# Kanban Board
- AI should never use short names, of following sections, only infer them when user uses them.

## InBasket, Inbox (IB)
- [ ] Sweep board/backlog for more design-system.md candidates (hover, outline,
  checkbox, animation, focus) beyond the initial seed.

## Planning (PN)

- [ ] Row-control interaction model (needs decision): grip visibility —
      auto-hide-on-hover (Notion/Todoist pattern, ~150ms fade, drag/keyboard
      unaffected) vs always visible; and whether title-edit expands into an
      inline action card (holding Move/Archive, replacing today's hover
      buttons) or hover buttons stay with a touch-friendly fallback.
      Hover-state and touch-reachability polish follow once decided.
- [ ] Dialog/menu polish leftovers from the 2026-07-02 visual pass:
      archive-dialog focus rings, restore-button color (indigo → accent),
      empty-state contrast, and wiring the unused useScrollLock hook into
      both dialogs.
- [ ] V1 UX/UI pass (requirements §5): edit↔display parity, archive
      done-status, auto-scroll to new input, empty states, then animation
      hardening, cherry-picked by impact.

## Ready (RY)


## In Progress (IP)

## Done (DN)

- [x] Synced requirements.md's Priority note to the V1 pass step order above
      (§4 → §5 → §6, stale past-deadline framing removed).
- [x] CLAUDE.md doc pass: removed stale docs/handoff.md (Inbox replaced its
      triage role, file deleted); Convention 9 audit already resolved
      (`.anim-*`/`.dot-pop`/`.strike` gone from Convention 2); added
      Convention 11 (breaking convention gives AI permission to break in
      future — fix during or before editing); noted in the intro the
      centered max-w-2xl layout is intentional; dev-workflow cadence
      considered and skipped (too tentative to commit).
- [x] JSON export / import (data safety) — export via file-saver; import:
      parse/validate/preview (summary + scrollable, wrap-anywhere tree,
      archived excluded) → confirm/error dialog → commit via loadRaw,
      persisted. Both dialogs centered (items-center, min/max-h) instead of
      top-anchored stretch.
- [x] Reorder tasks within a section (`@dnd-kit/react` `useSortable`; order recomputed via `orderBetween` between drop neighbors)
- [x] Move task between sections (same mechanism, cross-section drop)
- [x] Reorder sections (same mechanism, flat `sections` group)
- [x] Collapsible sections — persisted `collapsed` flag per section + chevron toggle; folded sections hide their task list.
- [x] fixed: Now, move menu items are follow focus-ring consistently.
- [x] ViewMoveMenu: violates fundamental leaky abstraction. (`useMoveTargets` selector)
- [x] Doc cleanup: removed skill-leftover lines from backlog.md (scrollbar-shift
      note, easy-flow rule-7 block, Floor 9 quote) and the stale /of-skill Inbox
      card — content already lived in skill-builder-workspace src/fmt/dump.md /
      frontend-baseline skill.
- [x] docs/design-system.md created — seeded with checkbox/toggle shapes, icon
      weight, and animation gaps (animation content also pulled from
      backlog.md); focus points to CLAUDE.md Convention 6; outline has no
      source yet. Referenced from CLAUDE.md's Workflow file list.

## Backlog (BL)


