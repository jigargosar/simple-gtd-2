import { useEffect, type RefObject } from 'react'

// Stub: shape grows as we add features. Empty for now.
export type DragInfo = {}

export type DragHandlers = {
    onMove?: (e: PointerEvent) => void
    onDrop?: (e: PointerEvent) => void
    onCancel?: () => void
}

export type UseSortableConfig = {
    containerRef: RefObject<HTMLElement | null>
    onDragStart: (info: DragInfo) => DragHandlers | void
}

// Step 1 stub: attaches one pointerdown listener on containerRef, logs the event.
// Does not detect sources, threshold, or fire onDragStart yet.
export function useSortable(config: UseSortableConfig): void {
    const { containerRef, onDragStart } = config

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        function handlePointerDown(e: PointerEvent) {
            console.log('[useSortable] pointerdown', { target: e.target })
            // Wired for type-check; not invoked until threshold logic exists.
            void onDragStart
        }

        el.addEventListener('pointerdown', handlePointerDown)
        return () => el.removeEventListener('pointerdown', handlePointerDown)
    }, [containerRef, onDragStart])
}
