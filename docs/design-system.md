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

## Click targets

- Run frontend-baseline skill (QA).

## Icon button target spec (proposed, not yet approved)

Concrete target values for the icon buttons in this row model (grip, move-to, archive), independent of what's in the code today:

```
+----------------------+----------------------+-------------------------------------------+
| Parameter            | Target               | Basis                                     |
+----------------------+----------------------+-------------------------------------------+
| Glyph, rest state    | stone-500            | Hard floor: 4.40:1 on hovered row bg,     |
|                      |                      | 4.80:1 on section header.                 |
+----------------------+----------------------+-------------------------------------------+
| Glyph, hover/focus   | stone-700            | Hard floor, wide margin across            |
|                      |                      | all contexts (8-10:1).                    |
+----------------------+----------------------+-------------------------------------------+
| Hover bg             | stone-300            | Design call, not a floor. stone-200       |
| (icon-local)         |                      | too close to row hover bg (1.15:1);       |
|                      |                      | stone-300 gives 1.37:1 (floor 8).         |
+----------------------+----------------------+-------------------------------------------+
| Glyph size           | size-4 (16px)        | Consistency call; already                 |
|                      |                      | uniform today.                            |
+----------------------+----------------------+-------------------------------------------+
| Hit target           | 24x24px minimum      | Hard floor 7. 44x44 is the goal           |
|                      |                      | but unrealistic here; 24x24 is            |
|                      |                      | the real target.                          |
+----------------------+----------------------+-------------------------------------------+
| Focus ring           | ring-accent, ring-2  | Fixed convention                          |
|                      |                      | (CLAUDE.md #6).                           |
+----------------------+----------------------+-------------------------------------------+
| Reveal mechanism     | opacity 0->100       | Decision already made this                |
|                      | on hover/focus       | session; not a floor value.               |
+----------------------+----------------------+-------------------------------------------+
```

So: two colors total for all icon glyphs (`stone-500` rest, `stone-700` active), one background for the hover/focus box (`stone-300`, replacing the current `stone-100` which fuses with the row), one size, one hit-target floor. That's the full target state — everything in the earlier findings (grip's `stone-400`, move-to's missing hover color, the `stone-100`-on-`stone-100` fusion) is a gap against this table.
