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

- No row-level hover/focus indication currently — the accent bottom-border
  ("ruled notebook" line, `hover:border-accent focus-within:border-accent`)
  was tried, then hidden. The `border-b border-transparent` placeholder stays
  in the classes (so a future border doesn't shift layout) but nothing
  renders on hover/focus right now.
- Found alongside: the flex `gap` between rows/header sits outside every
  row's own `group`, so hover/reveal drops out in that strip regardless of
  what treatment the row itself uses. See Backlog: "Row hover/focus
  highlight."
- Section header and task row now share identical structural classes
  (padding, rounded corners, border placeholder, transition, `items-center`)
  — no divergence between the two left to track here.

## Drag feedback

- Sections use a `DragOverlay` (header-only ghost, scoped to sections via its
  `disabled` prop) instead of the default whole-element feedback — see the
  `DragOverlay` usage in `ViewBoard` and Kanban Done for why. Tasks still use
  plain default feedback (single row, no collapse needed).
- No shared token for the ghost's own styling yet (bg/shadow/rounding chosen
  ad hoc for this one overlay) — revisit if a second overlay use appears.

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
|                      |                       | gap(16) = 1:2:4. Horizontal, within a row —|
|                      |                       | unrelated to vertical row/section gaps.   |
+----------------------+----------------------+-------------------------------------------+
| Transition duration    | duration-300          | Bumped from Tailwind's default 150ms —    |
|                      |                       | 150ms read as a jump, not a fade, for the |
|                      |                       | icon reveal and focus ring.               |
+----------------------+----------------------+-------------------------------------------+
```

Vertical spacing (separate from the table above): between sections, `gap-6`
(24px); between a section's header and its task list, `gap-2` (8px) — both
reduced from `gap-10`/`gap-4` for being too much whitespace. Task-to-task
spacing isn't a flex gap at all — it comes from each row's own `p-2`
padding.

Checkbox: the last icon-local hover-color exception (`group-hover/check:
border-accent` on the unchecked state) has been removed — no icon or
checkbox anywhere changes color on hover now, only the (currently hidden)
row-level border was ever meant to signal hover.

One color for all icon glyphs (`stone-500`, no rest/hover distinction), no
icon-local hover background, one size, one hit-box. Shared as module-level
tokens in `src/App.tsx` (`rowIconSize`, `rowGap`, `rowIconBtn`,
`rowIconBtnHoverReveal`) — grep those names for the current definitions rather
than trusting the literal values above if this table goes stale again.
