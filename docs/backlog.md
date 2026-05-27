spacing between checkbox and edit input is too narrow, for inline edit when turned need to fix it

post edit display is multiline but edit is a single line field, needs fixing truncate or text area then max lines chars truncate. Should we touch the view length? makes moving across tasks and scrolling heavy. should never overflow.

clickable areas should not artificially restrict UX by making user hunt!

stuff is too dark, some of the stuff shouldn't be so dark or bold. we need font improvements too.

update tailwind classes

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
