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

- See CLAUDE.md Convention 6 — focus-visible ring pattern.
- Icon-button rings sit flush on the hit-area edge (no `ring-offset`), so the
  ring never implies a bigger clickable area than what's actually there.

## Outline

- Row hover/focus-within: a blue accent-colored bottom border only (`border-b
  border-transparent … hover:border-accent focus-within:border-accent`), not
  always-on. Shown as a "ruled notebook" line rather than a full-row fill —
  full-row background fill was tried and rejected for low contrast (didn't
  clear the WCAG 1.4.11 3:1 floor even at `stone-400`).
- Section headers do not have their own permanent underline — removed because
  its contrast read worse than the row treatment it was compared against.

## Click targets

- Shipped (see table below). `/frontend-baseline` skill run as formal QA is
  still outstanding — floors were hand-checked in conversation, not run
  through the skill itself.

## Icon button target spec (shipped)

Actual values for every row control (grip, move-to, archive, checkbox) — same
28×28 hit-box across all of them, so nothing in a row is taller than anything
else:

```
+----------------------+----------------------+-------------------------------------------+
| Parameter            | Value                | Basis                                      |
+----------------------+----------------------+-------------------------------------------+
| Glyph size           | size-5 (20px)         | Consistency call.                         |
+----------------------+----------------------+-------------------------------------------+
| Icon padding          | p-1 (4px)             | 20px content + 4px/side = 28×28.          |
+----------------------+----------------------+-------------------------------------------+
| Hit target            | 28×28px               | Clears hard floor 7 (24×24 min) with      |
|                      |                       | margin; 44×44 judged unrealistic here.    |
+----------------------+----------------------+-------------------------------------------+
| Glyph color, rest      | stone-500             | 4.80:1 on white/row bg — passes.          |
+----------------------+----------------------+-------------------------------------------+
| Glyph color, hover/focus | stone-500 (unchanged) | No icon-local hover color change —    |
|                      |                       | see below.                                |
+----------------------+----------------------+-------------------------------------------+
| Icon hover bg          | none                  | Explicitly rejected — icons only appear   |
|                      |                       | on hover already; a second hover bg on    |
|                      |                       | top was redundant and, per user feedback, |
|                      |                       | broke row-to-icon scanability (Gestalt    |
|                      |                       | common-region: the row's own hover/focus  |
|                      |                       | underline is what ties icons to their row).|
+----------------------+----------------------+-------------------------------------------+
| Focus ring             | ring-accent, ring-2, no offset | Fixed convention (CLAUDE.md #6). |
+----------------------+----------------------+-------------------------------------------+
| Reveal mechanism       | opacity 0->100 on hover/focus-within/focus-visible | Icons hidden at rest. |
+----------------------+----------------------+-------------------------------------------+
| Gap between controls   | gap-4 (16px)          | Ratio: icon padding(4) : row edge(8) :    |
|                      |                       | gap(16) = 1:2:4.                          |
+----------------------+----------------------+-------------------------------------------+
```

One color for all icon glyphs (`stone-500`, no rest/hover distinction), no
icon-local hover background, one size, one hit-box. Shared as module-level
tokens in `src/App.tsx` (`rowIconSize`, `rowGap`, `rowIconBtn`,
`rowIconBtnHoverReveal`) — grep those names for the current definitions rather
than trusting the literal values above if this table goes stale again.
