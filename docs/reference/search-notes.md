## 1. Search feature (SimpleGTD)

- Plan: title-only match (Task has no notes/tags field), mirror the
  showDone pattern — `searchQuery: string` in AppState (transient, not
  persisted), `setSearchQuery(query)` action, `useSearchQuery()` hook.
- `visibleSectionTasks` gets one more filter step matching `task.title`
  (case-insensitive substring, trimmed).
- Collapsed-section override: `ViewSection` computes
  `effectivelyCollapsed = section.collapsed && (query === '' || no matches)`
  — force-open only while a query yields matches, without mutating the
  persisted `collapsed` flag.
- Section hides entirely when query is non-empty and it has zero matches.
- UI: input added to the `ViewMenu` row, always visible, left of the "..."
  button. Clear (X) button when non-empty.
- Explicitly out of scope: archived items, keyboard shortcut, section-title
  matching.
- Open call: blank board vs "No matches" placeholder when nothing matches
  anywhere — leaning no message for v1 (this is a bonus/may-be-cut feature
  per requirements.md; the 30 Jun deadline has already passed).
