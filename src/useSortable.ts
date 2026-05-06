// Generic, DOM-delegated sortable drag-and-drop hook.
//
// DOM contract (set by callers on draggable elements):
//   data-drag-source            — marks an element as draggable
//   data-drag-tag="<string>"    — caller-defined kind tag (e.g. "task", "section")
//   data-drag-id="<string>"     — caller-defined identifier
//   data-drag-handle (optional) — if any descendant has this attr, only presses inside
//                                 a [data-drag-handle] descendant initiate a drag.
//
// The drag handle, if any, must be a DOM descendant of the source — closest() walks DOM
// ancestors, not visual ancestors, so absolute positioning is fine inside the subtree.

import { useEffect, type RefObject } from 'react'

// ---------- Public types ----------

export type DragInfo = { tag: string; id: string }

export type DragHandlers = {
    onMove?: (e: PointerEvent) => void
    onDrop?: (e: PointerEvent) => void
    onCancel?: () => void
}

export type UseSortableConfig = {
    containerRef: RefObject<HTMLElement | null>
    onDragStart: (info: DragInfo) => DragHandlers | void
}

// ---------- Internal state ----------

const DRAG_THRESHOLD_PX = 5

type Source = DragInfo & { el: HTMLElement }

type DragState =
    | { tag: 'idle' }
    | { tag: 'pending'; pointerId: number; startX: number; startY: number; source: Source }
    | { tag: 'active'; pointerId: number; source: Source; handlers: DragHandlers }

const IDLE: DragState = { tag: 'idle' }

function assertNever(_: never): never {
    throw new Error('unreachable')
}

// ---------- DOM helpers ----------

function findDragSource(e: PointerEvent): Source | null {
    if (!(e.target instanceof Element)) return null
    const el = e.target.closest<HTMLElement>('[data-drag-source]')
    if (!el) return null

    const hasHandle = el.querySelector('[data-drag-handle]') !== null
    if (hasHandle && !e.target.closest('[data-drag-handle]')) return null

    const tag = el.dataset.dragTag
    const id = el.dataset.dragId
    if (!tag || !id) return null

    return { tag, id, el }
}

function capture(el: HTMLElement, pointerId: number): void {
    try {
        el.setPointerCapture(pointerId)
    } catch {
        // best-effort; window listeners deliver events regardless
    }
}

function release(el: HTMLElement, pointerId: number): void {
    try {
        el.releasePointerCapture(pointerId)
    } catch {
        // already released
    }
}

function pastThreshold(dx: number, dy: number): boolean {
    return dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX
}

// ---------- Transitions ----------
// Each returns the next DragState, or null when the event doesn't transition.
// The hook's main flow is: call transition, assign result if non-null. No guards there.

function startPending(state: DragState, e: PointerEvent): DragState | null {
    if (state.tag !== 'idle') return null
    const source = findDragSource(e)
    if (!source) return null
    return {
        tag: 'pending',
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        source,
    }
}

function progress(
    state: DragState,
    e: PointerEvent,
    onDragStart: UseSortableConfig['onDragStart'],
): DragState | null {
    switch (state.tag) {
        case 'idle':
            return null
        case 'pending': {
            if (e.pointerId !== state.pointerId) return null
            if (!pastThreshold(e.clientX - state.startX, e.clientY - state.startY)) return null

            const { tag, id } = state.source
            const handlers = onDragStart({ tag, id }) ?? {}
            capture(state.source.el, state.pointerId)
            return { tag: 'active', pointerId: state.pointerId, source: state.source, handlers }
        }
        case 'active':
            if (e.pointerId !== state.pointerId) return null
            state.handlers.onMove?.(e)
            return null
        default:
            return assertNever(state)
    }
}

function end(
    state: DragState,
    pointerId: number,
    reason: 'drop' | 'cancel',
    e: PointerEvent | null,
): DragState | null {
    switch (state.tag) {
        case 'idle':
            return null
        case 'pending':
            if (pointerId !== state.pointerId) return null
            return IDLE
        case 'active': {
            if (pointerId !== state.pointerId) return null
            release(state.source.el, pointerId)
            if (reason === 'drop' && e) state.handlers.onDrop?.(e)
            else state.handlers.onCancel?.()
            return IDLE
        }
        default:
            return assertNever(state)
    }
}

function activePointerId(state: DragState): number | null {
    switch (state.tag) {
        case 'idle':
            return null
        case 'pending':
        case 'active':
            return state.pointerId
        default:
            return assertNever(state)
    }
}

// ---------- Hook ----------

export function useSortable(config: UseSortableConfig): void {
    const { containerRef, onDragStart } = config

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        let state: DragState = IDLE
        const apply = (next: DragState | null) => {
            if (next) state = next
        }

        const onDown = (e: PointerEvent) => apply(startPending(state, e))
        const onMove = (e: PointerEvent) => apply(progress(state, e, onDragStart))
        const onUp = (e: PointerEvent) => apply(end(state, e.pointerId, 'drop', e))
        const onCancel = (e: PointerEvent) => apply(end(state, e.pointerId, 'cancel', null))
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return
            const id = activePointerId(state)
            if (id !== null) apply(end(state, id, 'cancel', null))
        }

        el.addEventListener('pointerdown', onDown)
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKey)

        return () => {
            el.removeEventListener('pointerdown', onDown)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onCancel)
            window.removeEventListener('keydown', onKey)
        }
    }, [containerRef, onDragStart])
}
