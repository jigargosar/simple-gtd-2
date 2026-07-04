- 
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
