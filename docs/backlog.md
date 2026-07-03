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
