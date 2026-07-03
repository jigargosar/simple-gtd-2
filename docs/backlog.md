Single undo notification for the last operation (archive, done toggle, etc.) —
one toast, undoes whatever just happened.

---

DnD: fix section flickerint issues
DnD: decide whether to collapse size of dragged list, long lists will leave huge gaps.
DnD: Should we style, with tilt and gradient opacity.

---

spacing between checkbox and edit input is too narrow, for inline edit when turned need to fix it

post edit display is multiline but edit is a single line field, needs fixing truncate or text area then max lines chars truncate. Should we touch the view length? makes moving across tasks and scrolling heavy. should never overflow.

clickable areas should not artificially restrict UX by making user hunt!

stuff is too dark, some of the stuff shouldn't be so dark or bold. we need font improvements too.

update tailwind classes

---

3. Task notes / details — add notes?: string field on Task.
5. Contexts / tags — tags: string[] field plus a filter hook (@home, @calls).
6. Quick capture / global Inbox add — single keyboard-focused input that always appends to Inbox.
7. Search / filter across all sections — one input, a useMatchingTasks(query) selector.
8. Per-section collapse — pairs with the existing showDone pattern.
9. Empty-state polish — designed empty state for sections/lists that go empty.


---

auto scrolling to input view doesnt happen, at least for section addition for long page.
task view should not have delete button, on board view.
task done status should be visible in archive view.

---

click to edit in entire line, wont need edit button.

---

## UX
menu always opens downward below the button (absolute, no flip) — clips and can't reach all items for low tasks
long section names in the menu: verify text behavior (currently min-w-44 + truncate)
unify task row's Move-to and Archive buttons into a single menu (Move to: A, B, X | Archive) — reduces mis-click risk from two adjacent small icon buttons; relates to the "clickable areas ... hunt" complaint above
item/section alignment — general pass, all alignment UI
add-row (task/section) should visually read as an edit box — subtle focus treatment (e.g. dotted left circle) so it starts looking like an actual editable item, not just a plus-icon placeholder
click-to-edit on the entire row (not just the title text) — possibly the same idea as "click to edit in entire line" above, possibly distinct (whole row incl. checkbox/icons vs. just title); needs a decision
