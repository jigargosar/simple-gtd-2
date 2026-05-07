import {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// ---------- Types ----------

type Model =
    | { tag: 'idle' }
    | {
          tag: 'pressed'
          pointerId: number
          draggableId: string
          draggableTag: string
          draggableData: unknown
          srcEl: HTMLElement
          startX: number
          startY: number
      }
    | {
          tag: 'dragging'
          pointerId: number
          draggableId: string
          draggableTag: string
          draggableData: unknown
          ghostHtml: string
          ghostWidth: number
          ghostHeight: number
          offsetX: number
          offsetY: number
          activeDroppableId: string
      }

type Msg =
    | {
          tag: 'pointerDown'
          pointerId: number
          draggableId: string
          draggableTag: string
          draggableData: unknown
          srcEl: HTMLElement
          x: number
          y: number
      }
    | { tag: 'pointerMove'; pointerId: number; x: number; y: number; threshold: number }
    | { tag: 'pointerUp'; pointerId: number; x: number; y: number }
    | { tag: 'cancel' }

type DropParty = { id: string; tag: string; data: unknown }
type DropEvent = { draggable: DropParty; droppable: DropParty }

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

// ---------- DOM helpers ----------

function findNearestDroppable(x: number, y: number, draggableTag: string): Element | null {
    const els = document.querySelectorAll(`[data-droppable-tag="${CSS.escape(draggableTag)}"]`)
    let best: Element | null = null
    let minD = Infinity
    for (const el of els) {
        const r = el.getBoundingClientRect()
        const dx = r.left + r.width / 2 - x
        const dy = r.top + r.height / 2 - y
        const d = dx * dx + dy * dy
        if (d < minD) {
            minD = d
            best = el
        }
    }
    return best
}

function readDroppable(el: Element): DropParty {
    const id = el.getAttribute('data-droppable-id') ?? ''
    const tag = el.getAttribute('data-droppable-tag') ?? ''
    const raw = el.getAttribute('data-droppable-data')
    const data = raw === null ? null : (JSON.parse(raw) as unknown)
    return { id, tag, data }
}

function droppableIdAt(x: number, y: number, tag: string): string | null {
    return findNearestDroppable(x, y, tag)?.getAttribute('data-droppable-id') ?? null
}

// ---------- Pure reducer (Elm-style update) ----------

const idle: Model = { tag: 'idle' }

function step(m: Model, msg: Msg): Model {
    switch (msg.tag) {
        case 'pointerDown':
            return {
                tag: 'pressed',
                pointerId: msg.pointerId,
                draggableId: msg.draggableId,
                draggableTag: msg.draggableTag,
                draggableData: msg.draggableData,
                srcEl: msg.srcEl,
                startX: msg.x,
                startY: msg.y,
            }
        case 'pointerMove':
            if (m.tag === 'idle') return m
            if (msg.pointerId !== m.pointerId) return m
            return m.tag === 'pressed' ? maybeBeginDrag(m, msg) : trackActiveDroppable(m, msg)
        case 'pointerUp':
            if (m.tag === 'idle') return m
            if (msg.pointerId !== m.pointerId) return m
            return idle
        case 'cancel':
            return idle
        default:
            return assertNever(msg)
    }
}

function maybeBeginDrag(
    m: Model & { tag: 'pressed' },
    msg: Msg & { tag: 'pointerMove' },
): Model {
    if (Math.hypot(msg.x - m.startX, msg.y - m.startY) < msg.threshold) return m
    const activeDroppableId = droppableIdAt(msg.x, msg.y, m.draggableTag)
    if (activeDroppableId === null) return m
    const rect = m.srcEl.getBoundingClientRect()
    return {
        tag: 'dragging',
        pointerId: m.pointerId,
        draggableId: m.draggableId,
        draggableTag: m.draggableTag,
        draggableData: m.draggableData,
        ghostHtml: m.srcEl.outerHTML,
        ghostWidth: rect.width,
        ghostHeight: rect.height,
        offsetX: m.startX - rect.left,
        offsetY: m.startY - rect.top,
        activeDroppableId,
    }
}

function trackActiveDroppable(
    m: Model & { tag: 'dragging' },
    msg: Msg & { tag: 'pointerMove' },
): Model {
    const next = droppableIdAt(msg.x, msg.y, m.draggableTag)
    if (next === null || next === m.activeDroppableId) return m
    return { ...m, activeDroppableId: next }
}

// ---------- Drop event derivation ----------

function dropEventAt(m: Model, x: number, y: number): DropEvent | null {
    if (m.tag !== 'dragging') return null
    const target = findNearestDroppable(x, y, m.draggableTag)
    if (!target) return null
    return {
        draggable: { id: m.draggableId, tag: m.draggableTag, data: m.draggableData },
        droppable: readDroppable(target),
    }
}

// ---------- Body-style side effects ----------

function applyDragStyles(dragging: boolean) {
    document.body.style.userSelect = dragging ? 'none' : ''
    document.body.style.cursor = dragging ? 'grabbing' : ''
}

// ---------- Ghost position (CSS variables, no React render per frame) ----------

const GHOST_VAR_X = '--sortable-ghost-x'
const GHOST_VAR_Y = '--sortable-ghost-y'

function updateGhostPosition(x: number, y: number) {
    const root = document.documentElement.style
    root.setProperty(GHOST_VAR_X, `${x}px`)
    root.setProperty(GHOST_VAR_Y, `${y}px`)
}

// ---------- Context ----------

type Ctx = {
    state: Model
    dispatch: (msg: Msg) => void
    threshold: number
}

const SortableCtx = createContext<Ctx | null>(null)

function useCtx(): Ctx {
    const c = useContext(SortableCtx)
    if (!c) throw new Error('useDraggable / useDroppable / <Ghost> must be inside <SortableProvider>')
    return c
}

// ---------- Provider ----------

type ProviderProps = {
    children: ReactNode
    onDrop: (e: DropEvent) => void
    threshold?: number
}

function SortableProvider({ children, onDrop, threshold = 5 }: ProviderProps) {
    const [state, setState] = useState<Model>(idle)
    // modelRef mirrors state so dispatch reads the latest model regardless
    // of which render captured the listener closure. onDropRef does the same
    // for the user's callback. Both are written in an effect (not during
    // render) to keep render pure.
    const modelRef = useRef<Model>(state)
    const onDropRef = useRef(onDrop)
    useEffect(() => {
        modelRef.current = state
        onDropRef.current = onDrop
    })

    function dispatch(msg: Msg) {
        const prev = modelRef.current
        const next = step(prev, msg)
        modelRef.current = next
        if ((prev.tag === 'dragging') !== (next.tag === 'dragging')) {
            applyDragStyles(next.tag === 'dragging')
        }
        if (msg.tag === 'pointerUp') {
            const drop = dropEventAt(prev, msg.x, msg.y)
            if (drop) onDropRef.current(drop)
        }
        setState(next)
    }

    return (
        <SortableCtx.Provider value={{ state, dispatch, threshold }}>
            {children}
        </SortableCtx.Provider>
    )
}

// ---------- Ghost ----------

function Ghost() {
    const { state } = useCtx()
    if (state.tag !== 'dragging') return null
    const { offsetX, offsetY, ghostHtml, ghostWidth, ghostHeight } = state
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: ghostWidth,
                height: ghostHeight,
                pointerEvents: 'none',
                opacity: 0.85,
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transform: `translate3d(calc(var(${GHOST_VAR_X}) - ${offsetX}px), calc(var(${GHOST_VAR_Y}) - ${offsetY}px), 0)`,
            }}
            dangerouslySetInnerHTML={{ __html: ghostHtml }}
        />,
        document.body,
    )
}

// ---------- useDraggable ----------

type DraggableProps = { id: string; tag: string; data: unknown }

function useDraggable({ id, tag, data }: DraggableProps) {
    const { state, dispatch, threshold } = useCtx()
    const isDragging =
        state.tag === 'dragging' && state.draggableTag === tag && state.draggableId === id

    function onPointerDown(e: ReactPointerEvent<HTMLElement>) {
        if (e.button !== 0) return
        if (
            e.target instanceof Element &&
            e.target.closest('button,input,textarea,select,a')
        )
            return
        e.stopPropagation()
        const pointerId = e.pointerId
        const srcEl = e.currentTarget
        dispatch({
            tag: 'pointerDown',
            pointerId,
            draggableId: id,
            draggableTag: tag,
            draggableData: data,
            srcEl,
            x: e.clientX,
            y: e.clientY,
        })

        function onMove(ev: PointerEvent) {
            updateGhostPosition(ev.clientX, ev.clientY)
            dispatch({
                tag: 'pointerMove',
                pointerId,
                x: ev.clientX,
                y: ev.clientY,
                threshold,
            })
        }
        function onUp(ev: PointerEvent) {
            dispatch({ tag: 'pointerUp', pointerId, x: ev.clientX, y: ev.clientY })
            detach()
        }
        function onCancel() {
            dispatch({ tag: 'cancel' })
            detach()
        }
        function onKey(ev: KeyboardEvent) {
            if (ev.key === 'Escape') {
                dispatch({ tag: 'cancel' })
                detach()
            }
        }
        function detach() {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onCancel)
            window.removeEventListener('keydown', onKey)
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKey)
    }

    return {
        isDragging,
        rootProps: {
            'data-draggable-id': id,
            'data-draggable-tag': tag,
            'data-dragging': isDragging || undefined,
            onPointerDown,
        },
    }
}

// ---------- useDroppable ----------

type DroppableProps = { tag: string; data: unknown }

function useDroppable({ tag, data }: DroppableProps) {
    const id = useId()
    const { state } = useCtx()
    const isActive = state.tag === 'dragging' && state.activeDroppableId === id
    const isCandidate = state.tag === 'dragging' && state.draggableTag === tag

    return {
        isActive,
        isCandidate,
        rootProps: {
            'data-droppable-id': id,
            'data-droppable-tag': tag,
            'data-droppable-data': JSON.stringify(data),
            'data-active': isActive || undefined,
        },
    }
}

// eslint-disable-next-line react-refresh/only-export-components
export { SortableProvider, Ghost, useDraggable, useDroppable }
export type { DropEvent, DropParty }
