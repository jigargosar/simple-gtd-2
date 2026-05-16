# Think-pad

State and open options as of 2026-05-16. These are tentative working notes, not
goals or directives — direction is the user's to set. Nothing here is absolute.

## What was done (UX)

- Contrast/legibility pass on `src/App.tsx` and `src/index.css`: several muted
  texts moved stone-400 → stone-500, section heading stone-500 → stone-600,
  checkbox border/fill darkened, `--color-accent` set to Tailwind blue-700's
  value, the placeholder italic rule removed, strike-line colour → stone-500.
  Values stayed within Tailwind presets; `pnpm build` passed after the changes.
- `ViewDeleteBtn` (`src/App.tsx`) is currently a hover-only red text button
  reading "Trash" (`text-red-700`, `opacity-0` → `group-hover:opacity-100`,
  `hover:bg-red-50`). Earlier icon stroke/hit-area tweaks were superseded by it.

## Open options (none decided)

- Delete control: a trash-can icon via a library (`lucide-react`'s `Trash`) was
  the last-discussed direction; not implemented (would add a dependency). Also
  raised and left open, none chosen: undo snackbar after delete, a per-row
  overflow/kebab menu, swipe-to-delete on touch, soft-delete with a recoverable
  list.
- Optional, discussed only: a `scripts/contrast.mjs` regression check.
