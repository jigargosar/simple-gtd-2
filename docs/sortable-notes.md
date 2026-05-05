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


---

**Section sorting behaviour:**

- User grabs a section header. Drag begins.
- The source section becomes a dashed placeholder, occupying its original space.
- A ghost copy of the section header follows the cursor, offset-locked to the grab point.
- At any moment during the drag, exactly one beacon is visible: the one nearest to the ghost's Y-center. It is rendered as a thin highlighted horizontal line at one of the N+1 insertion positions (before each section, after the last).
- As the ghost moves and the nearest position changes, the active beacon transitions smoothly from its previous location to the new one — no teleportation, no multiple beacons visible at once.
- The beacons immediately flanking the source section can become the nearest beacon and are rendered the same way (their drop is a no-op, but the user sees consistent feedback).
- No layout shift occurs at any point during the drag — beacon visibility is purely a visual overlay, not an inserted element.
- On drop: the section moves to the active beacon's position. The ghost smoothly animates into that slot, the placeholder collapses, and the rest of the list adjusts to its final arrangement.
- On cancel (Escape, drop outside the list): the ghost returns to the source, the placeholder restores, no change to the data.

---
❯ FYI beacons dont move

Understood — beacons are fixed positions, they don't physically move. Correction:

- Beacons exist at fixed insertion positions (before each section, after the last). They don't move.
- At any moment during drag, exactly one beacon is active (visible/highlighted) — the one nearest the ghost's Y-center.
- As the ghost moves and the nearest beacon changes, the active state transitions smoothly: the previously-active beacon fades out as the newly-active one fades in. Each beacon's position is fixed; only the active state moves between them.




---


Task sorting behaviour:

- User grabs a task. Drag begins.
- The source task becomes a dashed placeholder, occupying its original space in its original section.
- A ghost copy of the task follows the cursor, offset-locked to the grab point.
- Beacons exist at fixed insertion positions across all sections: before each task, after the last task of each section, and in the empty-state slot of any section with no tasks. They don't move.
- At any moment during drag, exactly one beacon is active — the one nearest the ghost's center. As the ghost moves between tasks within a section, or crosses into another section, the active state transitions smoothly: the previously-active beacon fades out as the newly-active one fades in.
- The beacons immediately flanking the source task can become active and are rendered the same way (their drop is a no-op, but feedback is consistent).
- No layout shift during drag — beacon visibility is a visual overlay.
- On drop:
    - If the active beacon is in the same section as the source: the task moves to that position within the section.
    - If the active beacon is in a different section: the task moves to that section at that position; its sectionId updates.
    - The ghost smoothly animates into the slot, placeholder collapses, surrounding tasks adjust to final arrangement.
- On cancel (Escape, drop outside any beacon): ghost returns to source, placeholder restores, no data change.


---
New Plan proposed by opus which included DnD-Kit primitives:

A handful of design choices shape the implementation. Locking these before I write code.

### 1. Drag mechanism
1. Hand-rolled with pointer events (`pointerdown`/`move`/`up`) — full control, no HTML5 drag-image quirks.
2. `@use-gesture/react` for the gesture + Framer Motion for ghost/placeholder animation. ★ — gives you cursor-locked drag, momentum, cancel, and `<motion.div layout>` for the collapse/expand on drop, with very little glue code. Aligns with "prefer libraries".
3. `dnd-kit` primitives (not its sortable preset, which insists on layout-shift). About the same effort as #1 because the sortable preset doesn't apply; only worth it if you want its keyboard a11y sensors out of the box.

### 2. Drag initiation
1. Whole row, with a movement threshold (~6px) so taps still hit the done-marker / delete button.
2. Explicit drag handle (e.g., `⋮⋮` on hover for tasks; a handle next to the section title). ★ — zero ambiguity with existing buttons, and section headers are currently plain text with no obvious grab affordance.
3. Long-press.

### 3. Beacon identity
Right now `Beacon` only knows its `kind`; the drop handler needs to know what insertion point each beacon represents.
1. Pass `prev` / `next` ids (or a single insertion descriptor) as props at render time, also written as data-attributes for the tracker to read. ★
2. Compute by walking DOM siblings at drop time.
3. Maintain a parallel index array keyed by position.

### 4. Beacons when not dragging
Today `useNearestBeaconTracker` activates the closest beacon any time the mouse moves — even idle.
1. Show beacons only while dragging. ★
2. Keep current always-faintly-visible behavior; only "active" highlight is drag-gated.

### 5. Kind filtering during drag
Section drag should ignore task beacons; task drag should ignore section beacons. Today the tracker picks the global nearest.
1. Filter `getBeacons()` by the in-flight drag's `kind`. ★ — confirm.

### 6. Drag-state location
State shape ≈ `{ kind, sourceId, pointerOffset, activeBeaconId }`. Read by ghost + active beacon + source placeholder.
1. Module-level store (tiny custom subscription, or a second Zustand store excluded from `persist`). ★ — keeps the persisted GTD store clean.
2. Inside the existing `useApp` with `partialize` filtering it out.
3. React context.

### 7. Cross-section task moves
A task dropped under a different section must update both `order` and `sectionId`. Current `reorderTask(id, newOrder)` only updates order.
1. Replace with `moveTask(id, sectionId, newOrder)`; in-section moves pass the same `sectionId`. ★
2. Keep `reorderTask`, add a separate `moveTaskToSection`.

### 8. Cancel triggers
1. Escape + release outside any beacon-kind region + window blur. ★
2. Escape only.

### 9. Scope
1. Mouse + touch (pointer events cover both for free). ★
2. Mouse only.
3. Mouse + touch + keyboard reordering.

### 10. Empty-section beacon
The current rendering already produces a single `TaskBeacon` between `ViewEmptySection` and `ViewAddTask` when a section is empty. Confirming that one beacon is the intended drop target for "drop into empty section" — no separate empty-state beacon needed.

If 1.★, 2.★, 3.★, 4.★, 5.★, 6.★, 7.★, 8.★, 9.★, 10. confirmed are all "yes", I have enough to start. Otherwise tell me which to override.


---

My notes:

❯ instade of mouse we can and should use pointer events. also I am not sure how keyboard sortable would work, (we can figure out later if need be) also auto scorll is kind of necessary, but I dont think it will be a big issue, since we are already considering scrolling to update nearst drop location. FYI general auto-scrolling that I have seen in other apps is very bad, either its to slow, or too fast. Its unpredicitable. I would like ours to be better controlled. Also on principle, I dont want layout shifts, arbitary artifacts shown, i.e. delete cross on hover (delete UX needs more work, but later) shouldnt activate, i.e. keep sort focused and neat. Thoughts.

---
Data Structure discussion:

**TL;DR**: discriminated union with `tag`, four variants. No optional fields — each phase carries exactly the data it needs and nothing else.

```ts
type Point = { x: number; y: number }

type TaskBeacon = {
    sectionId: string       // destination section
    previousTaskId: string | null   // order of preceding task, null if first
    nextTaskId: string | null    // order of following task, null if last
}

type SectionBeacon = {
    previousSectionId: string | null
    nextSectionId: string | null
}

type DragState =
    | { tag: 'idle' }
    | {
          tag: 'pending'
          kind: 'task' | 'section'
          sourceId: string
          pointerId: number
          startPointer: Point
          grabOffset: Point
      }
    | {
          tag: 'dragging-task'
          sourceId: string
          pointerId: number
          grabOffset: Point
          pointer: Point
          activeBeacon: TaskBeacon | null
      }
    | {
          tag: 'dragging-section'
          sourceId: string
          pointerId: number
          grabOffset: Point
          pointer: Point
          activeBeacon: SectionBeacon | null
      }
```
