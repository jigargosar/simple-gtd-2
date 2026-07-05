- 
- [ ] Row hover/focus highlight: bottom accent border (hover:border-accent/
  focus-within:border-accent) hidden for now — no row-level hover
  indication at all currently. Also found: flex `gap-4` between rows/header
  sits outside any row's own group, so hover drops out in that strip
  regardless of treatment. Revisit both together.
- [ ] Ruled-notebook / hand-drawn direction: sketchy, non-straight lines
  somewhere in the UI via `roughjs` or `rough-notation` — candidate
  locations: checkbox, section dividers, outer card border. "Wow factor"
  idea, never implemented, needs explicit scoping before any code.
- [ ] Custom icons: explored replacing the checkbox's checkmark with a
  hand-rolled SVG (ring + solid dot for done) instead of lucide's default —
  reverted for now, revisit as part of a deliberate icon-design pass.
- [ ] Ghost add-row circle: spin the dotted circle while it fills (dotted → solid
  on input focus) — cool-effect polish, keep subtle per Convention 8.
- [ ] Keyboard pass: Enter-to-edit on the focused/selected row, arrow navigation
  between rows, complete/archive shortcuts. Deferred with the focus/semantics
  territory CLAUDE.md parks.
- [ ] Next task: review the animation code (`.anim-*` in `src/index.css` and its usages).
- [ ] Collapse / expand all sections at once.
- [ ] Section-level progress: no task count/tally per section (e.g. "3/8") —
  scanning which list needs attention requires opening each one.


---

Single undo notification for the last operation (archive, done toggle, etc.) —
one toast, undoes whatever just happened.

---

DnD: fix section flickerint issues
DnD: decide whether to collapse size of dragged list, long lists will leave huge gaps.
DnD: Should we style, with tilt and gradient opacity.

---

clickable areas should not artificially restrict UX by making user hunt!

---

Click-to-edit on the entire row (not just the title text), so no edit button
is needed — needs a decision on scope (whole row incl. checkbox/icons vs. just
title).

---

## UX
menu always opens downward below the button (absolute, no flip) — clips and can't reach all items for low tasks
long section names in the menu: verify text behavior (currently min-w-44 + truncate)
unify task row's Move-to and Archive buttons into a single menu (Move to: A, B, X | Archive) — reduces mis-click risk from two adjacent small icon buttons; relates to the "clickable areas ... hunt" complaint above
item/section alignment — general pass, all alignment UI
