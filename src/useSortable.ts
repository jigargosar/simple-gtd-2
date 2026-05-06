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

import { useEffect, useRef, type RefObject } from 'react'

// ---------- Public types ----------

export type DragInfo = { tag: string; id: string }

export type DragHandlers = {
    onMove?: (e: PointerEvent) => void
    onDrop?: (e: PointerEvent) => void
    onCancel?: () => void
}

export type OnDragStart = (info: DragInfo) => DragHandlers | void

export type UseSortableConfig = {
    containerRef: RefObject<HTMLElement | null>
    onDragStart: OnDragStart
}

// ---------- Internal state ----------

const DRAG_THRESHOLD_PX = 5

type DragSource = DragInfo & { el: HTMLElement }

type Idle = { tag: 'idle' }
type Pressed = { tag: 'pressed'; pointerId: number; startX: number; startY: number; source: DragSource }
type Dragging = { tag: 'dragging'; pointerId: number; source: DragSource; handlers: DragHandlers }
type DragState = Idle | Pressed | Dragging

const IDLE: Idle = { tag: 'idle' }

function assertNever(_: never): never {
    throw new Error('unreachable')
}

// ---------- DOM helpers ----------

function resolveDragSource(e: PointerEvent): DragSource | null {
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
// Each function takes a *narrowed* state — it never asks "am I in the right state?"
// It returns the next state, or null when nothing changes.

function pressIdle(_: Idle, e: PointerEvent): DragState | null {
    const source = resolveDragSource(e)
    if (!source) return null
    return { tag: 'pressed', pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, source }
}

function movePressed(state: Pressed, e: PointerEvent, onDragStart: OnDragStart): DragState | null {
    if (!pastThreshold(e.clientX - state.startX, e.clientY - state.startY)) return null
    const handlers = onDragStart({ tag: state.source.tag, id: state.source.id }) ?? {}
    capture(state.source.el, state.pointerId)
    return { tag: 'dragging', pointerId: state.pointerId, source: state.source, handlers }
}

function moveDragging(state: Dragging, e: PointerEvent): null {
    state.handlers.onMove?.(e)
    return null
}

function dropDragging(state: Dragging, e: PointerEvent): Idle {
    release(state.source.el, state.pointerId)
    state.handlers.onDrop?.(e)
    return IDLE
}

function cancelDragging(state: Dragging): Idle {
    release(state.source.el, state.pointerId)
    state.handlers.onCancel?.()
    return IDLE
}

// ---------- Dispatcher ----------
// Routes events to the transition that owns the current state. The pointerId match
// happens here, exactly once per event — handlers receive a narrowed state and never
// re-check it.

function isLivePointer(state: Pressed | Dragging, e: PointerEvent): boolean {
    return e.pointerId === state.pointerId
}

function dispatchMove(state: DragState, e: PointerEvent, onDragStart: OnDragStart): DragState | null {
    switch (state.tag) {
        case 'idle': return null
        case 'pressed': return isLivePointer(state, e) ? movePressed(state, e, onDragStart) : null
        case 'dragging': return isLivePointer(state, e) ? moveDragging(state, e) : null
        default: return assertNever(state)
    }
}

function dispatchDrop(state: DragState, e: PointerEvent): DragState | null {
    switch (state.tag) {
        case 'idle': return null
        case 'pressed': return isLivePointer(state, e) ? IDLE : null
        case 'dragging': return isLivePointer(state, e) ? dropDragging(state, e) : null
        default: return assertNever(state)
    }
}

function dispatchCancel(state: DragState, e: PointerEvent | null): DragState | null {
    switch (state.tag) {
        case 'idle': return null
        case 'pressed': return e === null || isLivePointer(state, e) ? IDLE : null
        case 'dragging': return e === null || isLivePointer(state, e) ? cancelDragging(state) : null
        default: return assertNever(state)
    }
}

// ---------- Listener attachment ----------
// Generic "attach this map of listeners to this target" effect. Knows nothing about drag.

type Listeners<T extends EventTarget> = {
    [K in keyof GlobalEventHandlersEventMap]?: (
        this: T,
        ev: GlobalEventHandlersEventMap[K],
    ) => void
}

function useListeners<T extends EventTarget>(
    targetRef: RefObject<T | null> | { current: T },
    listeners: Listeners<T>,
): void {
    useEffect(() => {
        const target = targetRef.current
        if (!target) return
        const entries = Object.entries(listeners) as [string, EventListener][]
        for (const [type, fn] of entries) target.addEventListener(type, fn)
        return () => {
            for (const [type, fn] of entries) target.removeEventListener(type, fn)
        }
    }, [targetRef, listeners])
}

// ---------- Hook ----------

export function useSortable(config: UseSortableConfig): void {
    const { containerRef, onDragStart } = config
    const stateRef = useRef<DragState>(IDLE)
    const apply = (next: DragState | null) => { if (next) stateRef.current = next }

    useListeners(containerRef, {
        pointerdown: (e) =>
            apply(stateRef.current.tag === 'idle' ? pressIdle(stateRef.current, e) : null),
    })
    useListeners({ current: window }, {
        pointermove: (e) => apply(dispatchMove(stateRef.current, e, onDragStart)),
        pointerup: (e) => apply(dispatchDrop(stateRef.current, e)),
        pointercancel: (e) => apply(dispatchCancel(stateRef.current, e)),
        keydown: (e) => {
            if (e.key === 'Escape') apply(dispatchCancel(stateRef.current, null))
        },
    })
}
