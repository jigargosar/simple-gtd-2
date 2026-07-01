spacing between checkbox and edit input is too narrow, for inline edit when turned need to fix it

post edit display is multiline but edit is a single line field, needs fixing truncate or text area then max lines chars truncate. Should we touch the view length? makes moving across tasks and scrolling heavy. should never overflow.

clickable areas should not artificially restrict UX by making user hunt!

stuff is too dark, some of the stuff shouldn't be so dark or bold. we need font improvements too.

update tailwind classes

page scrollbar shifting: should add to baseline skill.

---

* Add a new rule to `~/.claude/output-styles/easy-flow.md`:

  "Don't act unilaterally without explicit permission."

  Existing rule 7 (`~/.claude/output-styles/easy-flow.md` line 15) is too weak:
  > Show steps, take permission

  Got violated repeatedly this session by:
    - Bundling multiple changes (format + content + restructure + class-name updates) into a single proposal without per-change permission.
    - Updating Tasks without asking (TaskUpdate on #5).
    - Misinterpreting "next" / "format is correct" as go-ahead for actions.
    - Chaining WebFetch calls in sequence without re-asking between each.

  Stronger phrasing options to consider:
    - "Never bundle multiple changes into one approval. Ask permission per change."
    - "Show exactly what will change verbatim. Get explicit yes before each edit."
    - "Default to verbatim reproduction. Any deviation requires explicit permission first."

  Decide placement: amplify rule 7 in-place vs. add as new rule.


---

*  Floor 9 (`~/.claude/skills/frontend-baseline/SKILL.md` line 45):
> All rendered text must avoid horizontal overflow. In flex/grid containers, use `wrap-anywhere` (Tailwind v4.1+) — it handles unbroken strings without needing `min-w-0` on the text item. Outside flex/grid, `wrap-break-word` is enough. For single-line cutoff use `truncate` or `line-clamp-N`. Both `wrap-break-word` and `truncate` silently fail inside flex/grid without `min-w-0`, which is why `wrap-anywhere` is the safer default there.

* Test `arabold/docs-mcp-server` in practice — scrape libs on demand, verify `search_docs` quality vs Context7.

* Test `openspec-*` skills (explore → propose → apply → archive) on a real feature in this project.

---

## Animation
for long lines editor input causes layout shift
on add section, anim causes layout shift
delete also has jumpy anim
move menu: dropdown open/close and the moved item are abrupt and jarring
full anim need to be reviewed.

---

1. Drag-and-drop reordering — wire the existing Sortable state machine to UI; reorder via orderBetween between drop neighbors.
2. Move task between sections — Inbox → Next Actions → Waiting For; reuses drag-and-drop + order recompute.
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