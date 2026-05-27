## Targets

* Fix long non-spaced overflow bug — apply frontend-baseline Floor 9 to `src/App.tsx`.

  Floor 9 (`~/.claude/skills/frontend-baseline/SKILL.md` line 45):
  > All rendered text must avoid horizontal overflow. In flex/grid containers, use `wrap-anywhere` (Tailwind v4.1+) — it handles unbroken strings without needing `min-w-0` on the text item. Outside flex/grid, `wrap-break-word` is enough. For single-line cutoff use `truncate` or `line-clamp-N`. Both `wrap-break-word` and `truncate` silently fail inside flex/grid without `min-w-0`, which is why `wrap-anywhere` is the safer default there.

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

## Numbering convention

Two independent number systems coexist:

1. **Title number** (from `track` skill): static, embedded in the task title text, survives deletions — an identity.
2. **Response number** (from op-style rule 2): serial and unique within a single response, escaped period (`1\.`) — a position.

   Rule 2 (`~/.claude/output-styles/easy-flow.md` line 10):
   > Use numbered lists with escaped periods (`1\.`, `2\.`, `10\.`). Numbering must be serial and unique within a response. Indent nested items 4 spaces under their parent.

Both render side-by-side; digits diverge after deletions.

### Reference defaults

1. Bare `#N` in user messages means the response number by default.
2. Title number requires explicit marking.
3. If only one system is active, that number wins.

### File vs. response formatting

1. Files: standard markdown (`1.`, `2.`), lists may restart at 1, no escape.
2. Responses: op-style escaped serial-unique (`1\.`, `2\.`), serial across entire response.
3. Conversion: translate when user points to a number; ask if ambiguous.
