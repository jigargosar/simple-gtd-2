# Handoff

The work I planned but did NOT execute — next session does it, in order.

0. Reconcile docs to code (do first — every "pick next" reads these lists):
   - requirements.md: tick §1 archive (fully built), §3 delete, §4 board-archive-only.
   - requirements.md: fix Foundation "v4" → v6; delete "entrance animations" (removed),
     the whole §6 animation section, and the `App.tsx:185` known-issue (all moot — no
     animations exist).
   - Kanban-Board.md: drop the Triage column; remove done items (audit CLAUDE.md,
     establish workflow) and the moot "review the animation code".
1. Edit↔display parity — display wraps multi-line, editor is a single-line input that
   can overflow; reconcile (textarea or truncate), never overflow horizontally.
2. Done-status visible in archive view — archive rows currently ignore `done`.
3. Auto-scroll to a newly-added input on a long page.
4. JSON export / import — data safety (download + restore backup).
5. Empty states — section / list / first-run.

Then, polish if time (post-functional): readability/tone pass, scrollbar-gutter,
hover consistency. Later (post-v1): drag-and-drop, quick capture, search, tags/notes.
