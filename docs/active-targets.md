## Targets

* Fix long non-spaced overflow bug — apply frontend-baseline Floor 9 to `src/App.tsx`.

*  Floor 9 (`~/.claude/skills/frontend-baseline/SKILL.md` line 45):
  > All rendered text must avoid horizontal overflow. In flex/grid containers, use `wrap-anywhere` (Tailwind v4.1+) — it handles unbroken strings without needing `min-w-0` on the text item. Outside flex/grid, `wrap-break-word` is enough. For single-line cutoff use `truncate` or `line-clamp-N`. Both `wrap-break-word` and `truncate` silently fail inside flex/grid without `min-w-0`, which is why `wrap-anywhere` is the safer default there.

* Test `arabold/docs-mcp-server` in practice — scrape libs on demand, verify `search_docs` quality vs Context7.

* Test `openspec-*` skills (explore → propose → apply → archive) on a real feature in this project.

