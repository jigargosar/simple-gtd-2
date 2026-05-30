# Claude Code Output Styles — Reference

Tags: **[FACT]** authoritative (docs/official changelog) · **[SECONDARY]** corroborated third-party · ❓ unverified.

## What it is — [FACT, current docs]

- *"Output styles change how Claude responds, not what Claude knows."* They modify the system prompt to set role, tone, and output format.
- They keep core tools (running scripts, file read/write, TODO tracking).
- Docs route project/codebase/convention context to **CLAUDE.md** instead.

## Built-in styles — [FACT, current docs]

- **Default** — standard software-engineering system prompt.
- **Proactive** — executes immediately, makes reasonable assumptions, prefers action over planning; stronger than auto mode; still shows permission prompts.
- **Explanatory** — educational "Insights" between tasks.
- **Learning** — collaborative; adds `TODO(human)` markers for you to implement.

## Using it — [FACT, current docs]

- `/config` → **Output style** picks from a menu; saved to `.claude/settings.local.json` (local project level).
- Or set the field directly:
  ```json
  { "outputStyle": "Explanatory" }
  ```
- Read **once at session start** — changes take effect after `/clear` or a new session (for prompt-cache stability).

## Custom styles — [FACT, current docs]

- A custom style = a Markdown file: YAML frontmatter + instructions appended to the system prompt.
- Save locations:
  - User: `~/.claude/output-styles`
  - Project: `.claude/output-styles`
  - Managed policy: `.claude/output-styles` in the managed settings dir
- File name becomes the style name unless `name` is set in frontmatter.
- Plugins can ship styles in an `output-styles/` directory.

### Frontmatter fields

| Field | Default | Purpose |
|---|---|---|
| `name` | file name | Style name |
| `description` | none | Shown in the `/config` picker |
| `keep-coding-instructions` | `false` | Custom styles drop built-in coding instructions unless `true` |
| `force-for-plugin` | `false` | Plugin styles only; auto-applies and overrides the user's `outputStyle` |

## How it works — [FACT, current docs]

- Custom instructions append to the **end** of the system prompt, plus periodic adherence reminders during the conversation.
- Input tokens rise (cached after first request); Explanatory/Learning produce longer outputs by design.

## Comparison to related features — [FACT, current docs]

| Feature | How it works | Use when |
|---|---|---|
| Output styles | **Modifies** the system prompt | Different role/tone/format every turn |
| CLAUDE.md | Adds a **user message after** the system prompt | Always-known project conventions |
| `--append-system-prompt` | **Appends** to the system prompt | One-off, single invocation |
| Agents | Subagent with own prompt/model/tools | Separately scoped helper |
| Skills | Task-specific instructions loaded on demand | Reusable workflow |

## Version timeline

- **Intro** — ❓ ~v1.0.81 (Aug 2025), introducing Explanatory + Learning. Cited by trackers, not confirmable against a primary changelog.
- **Feature deprecated** — v2.0.30 (Oct 31 2025). [SECONDARY + issue #10721]
- **Reversed** — v2.0.32 (~4 days later): *"Un-deprecate output styles based on community feedback."* [@ClaudeCodeLog quoting changelog]
- **`keep-coding-instructions` added** — v2.1.63 (plugin output styles). [SECONDARY]
- **Command deprecated** — v2.1.73: *"Deprecated /output-style command; use /config instead. Output style is now fixed at session start for better prompt caching."* [FACT, changelog]
- **Command removed** — v2.1.91 (docs `Note`, max-version 2.1.90). [FACT]
- **Bug fix** — v2.1.141: fixed prompt suggestions being silently disabled when an output style was configured. [FACT, changelog]

Reconciliation: the *feature* was nearly killed then saved (2.0.30→2.0.32); the *`/output-style` command* was later retired for `/config` (2.1.73→2.1.91) while the feature continued.

## Known limitations — [FACT, official issue tracker]

- Base training can override style instructions — tone guidance ignored (#6450).
- Generated code keeps narration comments regardless of "terse" styling (#58600).
- VS Code extension does not load `outputStyle` — CLI-only (#39331).
- No non-interactive/`-p` (headless) support reported (#6180).
- `outputStyle` once failed settings validation ("Property not allowed"); issue now closed, key documented (#6126).

## Unverified ❓

- ❓ Introduction version (commonly cited ~v1.0.81, Aug 2025).
- ❓ Whether `/output-style:new` still scaffolds styles after the command's v2.1.91 removal.

## Sources

- [Output styles — Claude Code Docs](https://code.claude.com/docs/en/output-styles)
- [Official changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)
- [@ClaudeCodeLog — 2.0.32 "Un-deprecate output styles"](https://x.com/ClaudeCodeLog/status/2019482638344462341)
- [Boris Cherny — Threads, output-style→plugin migration notice](https://www.threads.com/@boris_cherny/post/DQfooqiD0Qh/)
- Issues: [#10671](https://github.com/anthropics/claude-code/issues/10671) · [#10721](https://github.com/anthropics/claude-code/issues/10721) · [#6450](https://github.com/anthropics/claude-code/issues/6450) · [#58600](https://github.com/anthropics/claude-code/issues/58600) · [#39331](https://github.com/anthropics/claude-code/issues/39331) · [#6180](https://github.com/anthropics/claude-code/issues/6180) · [#6126](https://github.com/anthropics/claude-code/issues/6126)
