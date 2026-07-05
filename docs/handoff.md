# Handoff (one-time compaction aid — delete once absorbed)

## Current state (2026-07-05)

Icon-button target-size work (started from a `/frontend-baseline` "aim higher
than the floor" discussion) is committed in two steps:

- `43f78fc` — unified sizing/spacing design tokens: 1:2:4 ratio off a 4px base
  (icon padding `p-1`, row edge `px-2`/`py-2`, gap `gap-4`), 28×28 hit-box on
  every row control (icon glyph 20px + checkbox dot 20px content, so nothing
  in a row is taller than anything else), ring flush on the hit-area edge (no
  `ring-offset`), no icon hover color/background.
- `1083e3f` — row hover treatment iterated to a "ruled notebook" style: a blue
  accent-colored bottom border, shown only on hover/focus-within (not
  always-on). Removed the section header's own permanent underline (its
  contrast was worse than the row treatment it was being compared against).

## Explored but reverted (not shipped)

Checkbox redesign: replaced the checkmark-in-filled-circle with an SVG
ring+dot (accent-colored outline circle, solid accent dot inside when done).
Iterated through several rounds (dot/ring gap sizing, a broken `h-4.5`/`w-4.5`
Tailwind-class bug — 4.5 isn't a valid spacing step, silently generated no
CSS, sizes/gaps that Tailwind doesn't have a real class for, concentricity /
sub-pixel rendering issues on very thin gaps around circular borders,
converting to real SVG `<circle>` elements to fix that). User reverted it —
recorded in `docs/backlog.md` as "Custom icons" for a future deliberate
icon-design pass.

## Open design questions (discussed, not decided)

- **Accent color count**: today the single `--color-accent` blue covers 4
  different meanings (logo dot, focus rings, checkbox-done state, row
  hover/focus-within underline). Discussed splitting into a "persistent
  state" color (done/checked, brand) vs. a "transient interaction" color
  (focus + hover), same hue family/different shade to preserve visual
  coherence. User wasn't sure — this needs more thought, not a rejection.
- **Ruled-notebook / hand-drawn direction**: a "wow factor" idea — sketchy,
  non-straight lines somewhere in the UI via `roughjs` or `rough-notation`
  (checkbox, section dividers, or the outer card border were candidate
  locations). Never implemented, still just an idea, needs explicit
  scoping/go-ahead before any code.

## Docs that need updating (flagged, not yet fixed)

- `docs/design-system.md`: the "Icon button target spec (proposed, not yet
  approved)" table is stale — it lists `size-4`/16px glyph, 24×24 hit target,
  `stone-300` icon-hover bg. Actual shipped state: `size-5`/20px glyph, 28×28
  hit-box, **no** icon hover bg at all. "Focus" and "Outline" sections say "no
  known gaps yet" — no longer true; ring-offset removal and the row-hover
  border evolution both happened this session.
- `docs/Kanban-Board.md`: the In Progress card "Row model: all 3 icons, hover
  state — run frontend-baseline skill (QA)" hasn't moved to Done despite two
  commits landing. The named QA step (actually running the `/frontend-baseline`
  skill) was never formally done — floors were hand-checked in conversation
  instead of via the skill itself.

## How to move ahead after compaction

1. Update `docs/design-system.md`'s icon-button table and Focus/Outline
   sections to match the committed reality (see commits above).
2. Move the Kanban IP card to Done, or split off a real `/frontend-baseline`
   skill run as its own follow-up if hand-checking isn't considered
   sufficient QA.
3. If picking the accent-color-count thread back up, start from the
   "persistent state vs. transient interaction" framing above.
4. Ruled-notebook/RoughJS stays parked until explicitly re-raised.
5. Delete this file once its contents are folded into the real docs —
   it's a checkpoint, not a new standing doc.
