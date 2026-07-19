# Handoff: doc-hygiene revamp (pending, pick up after compaction)

1. Doc-hygiene structure (proposed, not executed):
   - backlog.md — regroup into Features / Visual & style exploration /
     DnD / Menu & interaction; move DnD-flicker, menu-clips-downward,
     long-section-name-verify to Kanban Inbox as defects; delete stray
     empty bullet.
   - Kanban-Board.md — trim Planning's §4 entry to a pointer; split
     "Section drag ghost" and "Row/section model finalized" Done entries
     into new docs/reference/2026-07-06-section-drag-ghost.md and
     docs/reference/2026-07-05-row-section-model.md; trim other verbose
     Done entries to one-liners.
   - Awaiting: confirmation of backlog.md category names and the two new
     reference-file names before executing.

2. fmt skill fix (proposed, not executed):
   - Add a "Micro-replies" rule to
     C:\Users\jigar\.claude\skills\fmt\SKILL.md — single trivial-fact
     replies skip numbering/tldr, one `— ` prefixed line instead.
     Awaiting go.

3. Hard constraint: docs/adr.md is off-limits entirely — do not read,
   write, or reference it. That document is the user's own
   responsibility.

4. Scope note: doc-hygiene rules (Committed/Maybe/Not, no-restating,
   verbosity nest-or-split, proportional IDs, git-log-is-history) apply
   to requirements.md/backlog.md/Kanban-Board.md/adr.md — design-system.md
   is excluded, reviewed under its own separate convention.
