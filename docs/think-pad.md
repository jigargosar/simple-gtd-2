Think Pad 

App Scope

> Working scope for Simple GTD. Target: ship a **fully usable v1** for real
> users by **end of June 2026 (30 Jun)**.

# What this app is

A single-page, fully client-side GTD app. GTD lists (Inbox, Next Actions,
Waiting For, Projects, Someday/Maybe) holding ordered tasks. Calm, fast, and
trustworthy for daily personal task management. No backend, no accounts — data
lives in the browser.

# v1 milestone: "Fully usable"

The bar: a real user can capture, organize, complete, and archive tasks every
day without friction, jank, or data loss.

Scope = the existing CRUD core (sections, tasks, add/edit/delete/toggle,
archive, fractional ordering) polished and hardened to a daily-driver bar, plus
one data-safety feature. The four big net-new capabilities are explicitly
deferred (see Later).

## v1 scope

1. Data safety:
- localStorage + manual JSON export / import (backup & restore). The one trust
  feature.

2. Interaction correctness:
- Whole-line click-to-edit — no edit-button hunting; the whole task row is the
  click target.
- Edit ↔ display parity — display is multi-line, edit is single-line; reconcile
  (truncate vs textarea + max lines). Never overflow horizontally.
- Checkbox ↔ edit-input spacing too narrow on inline edit.
- Board view: archive-only, no delete button.
- Delete available within the archive view.
- Done status visible in archive view.
- Auto-scroll to a newly-added input (e.g. add-section on a long page).

3. Readability / visual baseline:
- Reduce over-dark / over-bold text; font pass.
- Tailwind class cleanup.
- Page-scrollbar shift fix (add to baseline skill).
- Hover consistency: section-header hover bg; reconcile add-row (focus-within)
  vs task-row hover trigger + opacity.

4. Animation hardening (zero jank):
- No layout shift on: long-line edit, add-section, delete.
- Shorten exit stagger (slide-out currently waits up to 360ms section / 240ms
  task).
- Resolve delete-on-`animationend` fragility — decide delete-on-click vs
  animation-gated.
- Checkbox: animates in (dot-pop) but not out — make symmetric.
- Keyframe naming: task-out drives section exits via `.anim-out`.

5. Empty states:
- Designed empty state for sections / lists that go empty (and first run).

6. Per-section collapse / show:
- Collapse/expand each section; pairs with the existing show-done pattern.

# Later (post-"fully usable")

All confirmed lesser priority — ship "fully usable" first, then:
- **Drag-and-drop** — wire existing Sortable state; reorder within a section +
  move tasks between sections.
- **Quick capture** — global keyboard-first input that always appends to Inbox.
- **Search / filter** — one input + a `useMatchingTasks(query)` selector across
  all sections.
- **Task metadata** — notes/details field; contexts/tags (@home, @calls) +
  filtering.

# Out of scope (v1 and likely beyond)

- Backend, accounts, multi-device sync.
- ARIA / semantic HTML / `prefers-reduced-motion` (deferred per CLAUDE.md).
