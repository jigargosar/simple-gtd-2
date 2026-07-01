# @dnd-kit

`@dnd-kit/react` is the React binding, built on `@dnd-kit/dom`. Highly configurable:
sensors, plugins, modifiers, collision detection, and `useDraggable` / `useDroppable` /
`useSortable` hooks compose for everything from simple drag-to-trash to nested sortable
lists. Docs: https://dndkit.com/react/quickstart

*Note: `@dnd-kit/core` is an older parallel API; ignore it.*

## Sortable lists

`useSortable({ id, index, group, type, accept })`:

- `group` scopes ordering — items only reorder against others sharing the same group.
  Give each independent list its own group.
- `type`/`accept` gate which draggables a droppable will accept. Match `type`/`accept`
  across groups to allow dragging between lists; scope them per-group to restrict drags
  to within a single list.
- The hook returns `ref` (the sortable element) and `handleRef` (an optional narrower
  drag-activator element, e.g. a grip icon, if you don't want the whole row to start a
  drag).
- `isSortable()` (from `@dnd-kit/react/sortable`) type-guards a `DragOperation`'s
  `source`/`target` down to their sortable-specific shape, exposing `.index`, `.group`,
  `.type` for use in event handlers.

## Nested sortable lists (list-of-lists)

For a two-level hierarchy (e.g. reorderable containers that each hold their own
reorderable items), give each level its own `type`/`accept` (e.g. `'container'` vs.
`'item'`) so the two levels never collide as drop targets — dragging an item never gets
mistaken for dragging a container, even though both live under the same
`<DragDropProvider>`. Containers use one flat shared `group`; items use their parent
container's id as `group`, so an item's index is computed within its own container.
A single `onDragEnd`/`onDragOver` handler on the shared provider branches on
`source.type` to route the event to the right update.

## Reacting to a drop

- Simple: do all state updates in `onDragEnd` only. Straightforward, but a drag crossing
  between groups won't show a live preview until drop.
- Live preview across groups: mirror state during `onDragOver` too, via
  `@dnd-kit/helpers`'s `move()` — but `move()` reorders an in-memory array/index; it does
  not apply to order-string/fractional-index state models. For those, recompute order
  from the drop position's neighbor items instead. Production apps generally use
  fractional string indexing over raw array indices for persisted/synced ordering;
  `move()`'s array-splice model fits simple, local-only, non-persisted lists.

## Known gotcha: DOM/React desync across groups

The default `OptimisticSortingPlugin` mutates the DOM directly while a drag is hovering
over a *different* droppable group than its source. If your own state update in
`onDragEnd` doesn't account for that already-mutated DOM, React's next render can throw:

```
Uncaught NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be
removed is not a child of this node.
```

Open upstream issue: github.com/clauderic/dnd-kit#1747 (unresolved as of writing).

Two fixes:

1. **Reparent + flushSync** (keeps the live optimistic preview): in `onDragEnd`, before
   applying your state update, move the dragged element back under the parent it had at
   `onDragStart` (undoing the plugin's raw DOM move), then apply the state update inside
   `flushSync` (from `react-dom`) so React re-derives the DOM from state in one
   synchronous step, with no flash.
2. **`event.preventDefault()` in `onDragOver`** when source and target belong to
   different groups. Simpler, but disables the live preview while hovering a different
   group — the item only snaps into place on drop.
