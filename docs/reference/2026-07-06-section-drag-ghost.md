# Section drag ghost

Dragging a section now shows a header-only overlay (via `@dnd-kit/react`'s
`DragOverlay`, scoped to sections only) instead of floating/reserving space
for the full task list. The original section also collapses to header-only
while dragging.

Tried first without an overlay (plain `isDragging` collapse, then a manual
`sortable.refreshShape()`, then `Feedback.configure({feedback:'move'})`) —
all failed because dnd-kit's default feedback mode clones a frozen
placeholder at drag-start to reserve space, and that clone predates our
React collapse. `DragOverlay` sidesteps the clone entirely.

Tasks are single rows already, so they keep the plain default behavior.
