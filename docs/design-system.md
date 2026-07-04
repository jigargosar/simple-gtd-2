# Design System

UI-consistency rules and known gaps — hover, outline, checkbox, animation, focus.
Stable rules already live in CLAUDE.md Conventions; this file is for the rest.

## Checkbox / toggle shapes

- "Show completed" menu toggle uses a square checkbox; task-done uses a filled
  circle — same on/off concept, two shapes. Consider a switch for the
  view-level toggle.

## Icon weight

- grip/chevron/archive icons share one visual weight (stone-400/500, size-4/5)
  — interactive parts take a beat to pick out from decorative ones.

## Animation

- Long lines in the editor input cause layout shift.
- Adding a section causes layout shift.
- Delete has a jumpy animation.
- Move-menu dropdown open/close and the moved item are abrupt and jarring.
- Full `.anim-*` review needed (see Backlog: "review the
  animation code").

## Focus

- See CLAUDE.md Convention 6 — focus-visible ring pattern. No known gaps yet.

## Outline

- No documented rule yet.
