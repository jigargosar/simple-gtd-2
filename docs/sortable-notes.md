Conversation and finalization of the beacon-based sortable/drag and drop custom model.

---

we should implement both, together, otherwise there will be too many edge cases to test. We could also do a simplementation, where we place
beacon a line between all pairs of insertable positions, while keeping original src element in list. So the ux will be orginal src in list
displayed as empty element (perhaps with accented dashed border) and a ghost element moving with mouse (while keeping the relative position to
mouse, when drag started) and on drop smoothly expand the dest gap, and collapsing the src element int the list. thoughts.

---

wait, did you understand that, there is no layout shift until ghost is released, only nearest beacon, which is a thin line where inserts are possible, one that is nearest to chost gets hilighted. This is the primiary difference that I was suggesting


---

Got it — I misread. Let me restate your model:

- Items don't shift during drag. Layout is frozen.
- A set of thin insertion lines (beacons) sit between every adjacent pair of items (and before the first, after the last).
- As the ghost moves, the nearest beacon highlights — that's the drop target.
- On release: source slot collapses, destination gap expands to fit the item. Both animated.

This is a fundamentally different collision/drop-target model from what dnd-kit's useSortable + OptimisticSortingPlugin gives out of the box. That plugin does layout shifting during drag. To do the beacon model you'd need:

1. Custom droppable targets — one per gap (N+1 per section for tasks, N+1 for sections).
2. Custom collision detection — find the beacon nearest to the ghost's center.
3. DragOverlay for the ghost.
4. Source rendered as a dashed placeholder (no layout shift).
5. On drop: animate collapse of source placeholder + expand of destination gap.

This is more work than the standard sortable path, but it's cleaner UX — no jarring reflow while dragging.


---

imagine there are no sections. except there is a beacon at start of the section, and one beacon at end of the section. once beacons are
identified/placed,