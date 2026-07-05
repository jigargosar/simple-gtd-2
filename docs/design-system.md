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

| Parameter | Target value | Basis |
|---|---|---|
| Glyph color, rest/revealed-not-hovered | `stone-500` | Hard floor: clears 3:1 in both contexts it appears in — 4.40:1 on task-row bg (stone-100, since the row's own hover is already active when an icon is merely "revealed"), 4.80:1 on section-header bg (white) |
| Glyph color, hover/focus | `stone-700` | Hard floor, wide margin: 8.18:1 on the proposed hover bg below, 9.42–10.27:1 on stone-100/white |
| Hover/focus background (icon-local) | `stone-300` | Design call, not a numeric floor — `stone-200` was too close to the row's own `stone-100` hover bg (1.15:1 delta, barely perceptible); `stone-300` gives 1.37:1 delta against the row bg, a clearer bounded affordance per floor 8 |
| Glyph size | `size-4` (16px), uniform across all 3 | Consistency call — already the one thing that *is* uniform today |
| Hit target | 24×24px minimum | Hard floor 7; 44×44 is the stated goal but not realistic at this row density, so 24×24 is the concrete target to actually hold to |
| Focus ring | `ring-2 ring-offset-2 ring-accent`, `outline-none` | Fixed project convention (CLAUDE.md #6), not up for debate |
| Reveal mechanism | `opacity-0` → `opacity-100` via `group-hover` / `group-focus-within` / `focus-visible` | Interaction-model decision already made this session, not a baseline number |

So: two colors total for all icon glyphs (`stone-500` rest, `stone-700` active), one background for the hover/focus box (`stone-300`, replacing the current `stone-100` which fuses with the row), one size, one hit-target floor. That's the full target state — everything in the earlier findings (grip's `stone-400`, move-to's missing hover color, the `stone-100`-on-`stone-100` fusion) is a gap against this table.
