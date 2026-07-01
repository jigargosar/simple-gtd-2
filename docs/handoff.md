# Handoff

The work planned but NOT yet executed — next session does it, in order.

0. Reconcile docs to code:
   - requirements.md — DONE (committed 4791162): ticked §1 archive, §3 delete,
     §4 board-archive-only; dropped the volatile persistence version from the
     Foundation line.
   - Animations were NOT deleted. Decision: they stay on the roadmap (§6 +
     Foundation "entrance animations" + the `App.tsx:185` known-issue are left
     as-is). Do not remove them.
   - Kanban-Board.md — STILL PENDING. The old handoff wanted the Triage column
     and some items dropped, but "done" couldn't be verified from the docs.
     Needs a decision: mark/remove items only with confirmation, don't infer.
1. Edit↔display parity — display wraps multi-line, editor is a single-line input
   that can overflow; reconcile (textarea or truncate), never overflow
   horizontally. Plan: swap the `<input>` in `ViewTitleEditor` and
   `ViewSectionTitleEditor` for an auto-growing `<textarea>`; update `hooks.ts`
   Enter handling. NEXT UP.
2. Done-status visible in archive view — archive rows currently ignore `done`.
3. Auto-scroll to a newly-added input on a long page.
4. JSON export / import — data safety (download + restore backup).
5. Empty states — section / list / first-run.

Then, polish if time (post-functional): readability/tone pass, scrollbar-gutter,
hover consistency. Later (post-v1): quick capture, search, tags/notes.
