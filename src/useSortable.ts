import { useEffect, type RefObject } from 'react'

// DOM contract (set by callers):
//   data-drag-source            — marks an element as draggable
//   data-drag-tag="<string>"    — caller-defined kind tag (e.g. "task", "section")
//   data-drag-id="<string>"     — caller-defined identifier
//   data-drag-handle (optional) — if any descendant has this attr, only presses inside
//                                 a [data-drag-handle] descendant initiate a drag.
//
// Drag handle (if any) must be a DOM descendant of the source — no portals.
// closest() walks DOM ancestors, not visual ancestors, so absolute positioning is fine
// as long as the handle is still a descendant in the tree.

export type DragInfo = {
    tag: string
    id: string
    sourceEl: HTMLElement
}

export type DragHandlers = {
    onMove?: (e: PointerEvent) => void
    onDrop?: (e: PointerEvent) => void
    onCancel?: () => void
}

export type UseSortableConfig = {
    containerRef: RefObject<HTMLElement | null>
    onDragStart: (info: DragInfo) => DragHandlers | void
}

function readDragInfo(el: HTMLElement): DragInfo | null {
    const tag = el.dataset.dragTag
    const id = el.dataset.dragId
    if (!tag || !id) return null
    return { tag, id, sourceEl: el }
}

// Step 2: detect the source on pointerdown via delegation. Threshold + onDragStart firing
// still pending (step 3).
export function useSortable(config: UseSortableConfig): void {
    const { containerRef, onDragStart } = config

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        function handlePointerDown(e: PointerEvent) {
            const target = e.target
            if (!(target instanceof Element)) return

            const sourceEl = target.closest<HTMLElement>('[data-drag-source]')
            if (!sourceEl) return

            // Handle gating: if the source declares any [data-drag-handle] descendant,
            // require the press to land inside one. Sources without a handle are draggable
            // anywhere on the source.
            const hasHandle = sourceEl.querySelector('[data-drag-handle]') !== null
            if (hasHandle && !target.closest('[data-drag-handle]')) return

            const info = readDragInfo(sourceEl)
            if (!info) return

            console.log('[useSortable] source detected', info)
            // Wired for type-check; not invoked until threshold logic exists.
            void onDragStart
        }

        el.addEventListener('pointerdown', handlePointerDown)
        return () => el.removeEventListener('pointerdown', handlePointerDown)
    }, [containerRef, onDragStart])
}
