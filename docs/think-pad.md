Item 1 of 4 — CLAUDE.md content

1. Context. New file replaces existing one and loads every turn. Length matters: too long → I skim; too short → I make mistakes. You want global rules duplicated, which adds bulk on purpose.

2. Sub-choices:
    3. Length target — existing is ~48 lines; keep similar, shorter, or longer?
    4. Global rules block — copy verbatim vs. rewritten/merged.
    5. ARIA / semantic HTML / prefers-reduced-motion OUT OF SCOPE — keep or drop?
    6. Preview full draft before write, or write and diff in editor?

7. ★ Recommendation:
    8. Target 55–65 lines.
    9. Copy global verbatim as a mirrored block.
    10. Keep the ARIA exclusion.
    11. Show full draft before writing.


Item 2 of 4 — The /check skill

1. Context. No test runner exists in this repo. After making changes I need a way to self-verify type-check + lint pass without re-typing commands. `/check` would run `pnpm build && pnpm lint` as a single skill invocation.

2. Sub-choices:
    3. User-invoked only, or model-invocable too?
    4. Just build + lint, or also browser sanity via Chrome?
    5. Skill name — `/check` vs. `/verify-local` vs. something else?
    6. Failure handling — stop on first error, or run both and report combined?

7. ★ Recommendation:
    8. User-invoked only (`disable-model-invocation: true`).
    9. Just `pnpm build && pnpm lint`; defer browser check to bundled `/verify`.
    10. Name it `/check`.
    11. Stop on first failure (default `&&` behavior).


Item 3 of 4 — Prettier format-on-edit hook

1. Context. Repo uses Prettier with strict config (singleQuote, no semi, tabWidth 4, printWidth 100, prettier-plugin-tailwindcss). After every Write/Edit by Claude, file should be re-formatted so the diff stays clean.

2. Sub-choices:
    3. Target file — `.claude/settings.json` (team-shared) vs. `.claude/settings.local.json` (personal).
    4. File scope — `.ts`/`.tsx` only, or also `.css`, `.md`, `.json`?
    5. Event — `PostToolUse` on `Write|Edit` (per-file) vs. `Stop` (batch at turn end)?
    6. Command — `pnpm prettier --write <file>` (pinned) vs. `npx prettier --write` (faster, drift risk)?

7. ★ Recommendation:
    8. `.claude/settings.json` (team-shared since you picked project scope).
    9. `.ts`/`.tsx`/`.css`/`.md` (skip `.json` to avoid reformatting config files).
    10. `PostToolUse` on `Write|Edit` — per-file is faster feedback.
    11. `pnpm prettier --write` for version consistency.


Item 4 of 4 — Anything I omitted

1. Context. Survey covered manifests, configs, source shape, docs, AI configs, git state. Considered but not proposed: subdirectory CLAUDE.md (single-file UI), `.claude/rules/` split (file is small), test runner setup (out of scope), `/run` skill (bundled), pre-commit git hook (no commit workflow).

2. Sub-choices:
    3. Want a test runner skill scaffold (e.g., vitest)?
    4. Want `.claude/rules/` split for CLAUDE.md sections?
    5. Want a GTD-pattern skill (e.g., reminder of selector-hook + action-function shape when adding store features)?
    6. Any survey finding to pin that I missed?

7. ★ Recommendation:
    8. No test runner — out of project scope per current repo state.
    9. No `/rules/` split — file too small to justify.
    10. No GTD-pattern skill — Architecture section in CLAUDE.md already covers it.
    11. Nothing missed from survey — confirm or point to gap.
