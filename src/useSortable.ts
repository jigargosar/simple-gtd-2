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

const DRAG_THRESHOLD_PX = 5

// Single mutually-exclusive state for the hook's drag lifecycle. Each variant carries
// exactly the data valid in that state. Duplication across variants is intentional —
// it keeps each arm self-contained and makes switch sites read cleanly.
type DragState =
    | { tag: 'idle' }
    | {
          tag: 'pending'
          pointerId: number
          startX: number
          startY: number
          info: DragInfo
      }
    | {
          tag: 'active'
          pointerId: number
          info: DragInfo
          handlers: DragHandlers
      }

function assertNever(_: never): never {
    throw new Error('unreachable')
}

function readDragInfo(el: HTMLElement): DragInfo | null {
    const tag = el.dataset.dragTag
    const id = el.dataset.dragId
    if (!tag || !id) return null
    return { tag, id, sourceEl: el }
}

export function useSortable(config: UseSortableConfig): void {
    const { containerRef, onDragStart } = config

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        let state: DragState = { tag: 'idle' }

        function handlePointerDown(e: PointerEvent) {
            switch (state.tag) {
                case 'idle':
                    break
                case 'pending':
                case 'active':
                    return // one drag at a time
                default:
                    return assertNever(state)
            }

            const target = e.target
            if (!(target instanceof Element)) return

            const sourceEl = target.closest<HTMLElement>('[data-drag-source]')
            if (!sourceEl) return

            const hasHandle = sourceEl.querySelector('[data-drag-handle]') !== null
            if (hasHandle && !target.closest('[data-drag-handle]')) return

            const info = readDragInfo(sourceEl)
            if (!info) return

            state = {
                tag: 'pending',
                pointerId: e.pointerId,
                startX: e.clientX,
                startY: e.clientY,
                info,
            }
        }

        function handlePointerMove(e: PointerEvent) {
            switch (state.tag) {
                case 'idle':
                    return
                case 'pending': {
                    if (e.pointerId !== state.pointerId) return
                    const dx = e.clientX - state.startX
                    const dy = e.clientY - state.startY
                    if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return

                    const result = onDragStart(state.info)
                    const handlers: DragHandlers = result ?? {}

                    try {
                        state.info.sourceEl.setPointerCapture(state.pointerId)
                    } catch {
                        // capture is best-effort; window listeners still deliver events
                    }

                    state = {
                        tag: 'active',
                        pointerId: state.pointerId,
                        info: state.info,
                        handlers,
                    }
                    return
                }
                case 'active': {
                    if (e.pointerId !== state.pointerId) return
                    state.handlers.onMove?.(e)
                    return
                }
                default:
                    return assertNever(state)
            }
        }

        function handlePointerUp(e: PointerEvent) {
            switch (state.tag) {
                case 'idle':
                    return
                case 'pending':
                    if (e.pointerId === state.pointerId) state = { tag: 'idle' }
                    return
                case 'active': {
                    if (e.pointerId !== state.pointerId) return
                    const { handlers, info, pointerId } = state
                    state = { tag: 'idle' }
                    try {
                        info.sourceEl.releasePointerCapture(pointerId)
                    } catch {
                        // already released
                    }
                    handlers.onDrop?.(e)
                    return
                }
                default:
                    return assertNever(state)
            }
        }

        function cancel(pointerId: number) {
            switch (state.tag) {
                case 'idle':
                    return
                case 'pending':
                    if (pointerId === state.pointerId) state = { tag: 'idle' }
                    return
                case 'active': {
                    if (pointerId !== state.pointerId) return
                    const { handlers, info } = state
                    state = { tag: 'idle' }
                    try {
                        info.sourceEl.releasePointerCapture(pointerId)
                    } catch {
                        // already released
                    }
                    handlers.onCancel?.()
                    return
                }
                default:
                    return assertNever(state)
            }
        }

        function handlePointerCancel(e: PointerEvent) {
            cancel(e.pointerId)
        }

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key !== 'Escape') return
            if (state.tag === 'active' || state.tag === 'pending') cancel(state.pointerId)
        }

        el.addEventListener('pointerdown', handlePointerDown)
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
        window.addEventListener('pointercancel', handlePointerCancel)
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            el.removeEventListener('pointerdown', handlePointerDown)
            window.removeEventListener('pointermove', handlePointerMove)
            window.removeEventListener('pointerup', handlePointerUp)
            window.removeEventListener('pointercancel', handlePointerCancel)
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [containerRef, onDragStart])
}
