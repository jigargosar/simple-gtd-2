import {
    createContext,
    useContext,
    useId,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

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
          srcEl: HTMLElement
          offsetX: number
          offsetY: number
          activeDroppableId: string
      }

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

type DropParty = { id: string; tag: string; data: unknown }
type DropEvent = { draggable: DropParty; droppable: DropParty }

type Ctx = {
    state: Model
    startPress: (
        draggableId: string,
        draggableTag: string,
        draggableData: unknown,
        srcEl: HTMLElement,
        e: ReactPointerEvent<HTMLElement>,
    ) => void
}

const SortableCtx = createContext<Ctx | null>(null)

function useCtx(): Ctx {
    const c = useContext(SortableCtx)
    if (!c) throw new Error('useSortable hooks must be used inside <SortableProvider>')
    return c
}

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

type ProviderProps = {
    children: ReactNode
    onDrop: (e: DropEvent) => void
    threshold?: number
}

function SortableProvider({ children, onDrop, threshold = 5 }: ProviderProps) {
    const [state, setState] = useState<Model>({ tag: 'idle' })

    function startPress(
        draggableId: string,
        draggableTag: string,
        draggableData: unknown,
        srcEl: HTMLElement,
        e: ReactPointerEvent<HTMLElement>,
    ) {
        const pointerId = e.pointerId
        setState({
            tag: 'pressed',
            pointerId,
            draggableId,
            draggableTag,
            draggableData,
            srcEl,
            startX: e.clientX,
            startY: e.clientY,
        })

        function detach() {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onCancel)
            window.removeEventListener('keydown', onKey)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        function onMove(ev: PointerEvent) {
            if (ev.pointerId !== pointerId) return
            setState((m) => {
                switch (m.tag) {
                    case 'idle':
                        return m
                    case 'pressed': {
                        if (Math.hypot(ev.clientX - m.startX, ev.clientY - m.startY) < threshold)
                            return m
                        const target = findNearestDroppable(ev.clientX, ev.clientY, m.draggableTag)
                        if (!target) return m
                        const activeDroppableId = target.getAttribute('data-droppable-id') ?? ''
                        const rect = m.srcEl.getBoundingClientRect()
                        document.body.style.userSelect = 'none'
                        document.body.style.cursor = 'grabbing'
                        return {
                            tag: 'dragging',
                            pointerId: m.pointerId,
                            draggableId: m.draggableId,
                            draggableTag: m.draggableTag,
                            draggableData: m.draggableData,
                            srcEl: m.srcEl,
                            offsetX: m.startX - rect.left,
                            offsetY: m.startY - rect.top,
                            activeDroppableId,
                        }
                    }
                    case 'dragging': {
                        const target = findNearestDroppable(ev.clientX, ev.clientY, m.draggableTag)
                        if (!target) return m
                        const next = target.getAttribute('data-droppable-id') ?? ''
                        if (next === m.activeDroppableId) return m
                        return { ...m, activeDroppableId: next }
                    }
                    default:
                        return assertNever(m)
                }
            })
            updateGhostPosition(ev.clientX, ev.clientY)
        }

        function onUp(ev: PointerEvent) {
            if (ev.pointerId !== pointerId) return
            let drop: DropEvent | null = null
            setState((m) => {
                if (m.tag === 'dragging') {
                    const target = findNearestDroppable(ev.clientX, ev.clientY, m.draggableTag)
                    if (target) {
                        drop = {
                            draggable: {
                                id: m.draggableId,
                                tag: m.draggableTag,
                                data: m.draggableData,
                            },
                            droppable: readDroppable(target),
                        }
                    }
                }
                return { tag: 'idle' }
            })
            detach()
            if (drop) onDrop(drop)
        }

        function onCancel(ev: PointerEvent) {
            if (ev.pointerId !== pointerId) return
            setState({ tag: 'idle' })
            detach()
        }

        function onKey(ev: KeyboardEvent) {
            if (ev.key !== 'Escape') return
            setState({ tag: 'idle' })
            detach()
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKey)
    }

    return <SortableCtx.Provider value={{ state, startPress }}>{children}</SortableCtx.Provider>
}

// Ghost position is updated imperatively on pointermove (not via React state)
// so that 60fps cursor tracking doesn't trigger a render per frame.
const GHOST_VAR_X = '--sortable-ghost-x'
const GHOST_VAR_Y = '--sortable-ghost-y'

function updateGhostPosition(clientX: number, clientY: number) {
    document.documentElement.style.setProperty(GHOST_VAR_X, `${clientX}px`)
    document.documentElement.style.setProperty(GHOST_VAR_Y, `${clientY}px`)
}

type GhostProps = {
    children: ReactNode
}

function Ghost({ children }: GhostProps) {
    const { state } = useCtx()
    if (state.tag !== 'dragging') return null
    const { offsetX, offsetY, srcEl } = state
    const rect = srcEl.getBoundingClientRect()
    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: rect.width,
                pointerEvents: 'none',
                opacity: 0.85,
                zIndex: 9999,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                transform: `translate3d(calc(var(${GHOST_VAR_X}) - ${offsetX}px), calc(var(${GHOST_VAR_Y}) - ${offsetY}px), 0)`,
            }}
        >
            {children}
        </div>,
        document.body,
    )
}

type DraggableProps = {
    id: string
    tag: string
    data: unknown
}

function useDraggable({ id, tag, data }: DraggableProps) {
    const { state, startPress } = useCtx()
    const isDragging =
        state.tag === 'dragging' && state.draggableTag === tag && state.draggableId === id

    return {
        isDragging,
        rootProps: {
            'data-draggable-id': id,
            'data-draggable-tag': tag,
            'data-dragging': isDragging || undefined,
            onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
                if (e.button !== 0) return
                if (
                    e.target instanceof Element &&
                    e.target.closest('button,input,textarea,select,a')
                )
                    return
                e.stopPropagation()
                startPress(id, tag, data, e.currentTarget, e)
            },
        },
    }
}

type DroppableProps = {
    tag: string
    data: unknown
}

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
