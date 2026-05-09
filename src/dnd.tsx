/**
 * DnD sortable spike — no animation, no auto-scroll, no polish.
 * Validates: single generic DragProvider<T>, union T, beacon closure pattern.
 */

import {
    createContext,
    useContext,
    useId,
    useEffect,
    useRef,
    useState,
    type ReactNode,
    type RefCallback,
    type PointerEvent as ReactPointerEvent,
} from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Point = { x: number; y: number }

type DragContextValue<T> = {
    dragSrc: T | null
    setDragSrc: (item: T | null) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DragContext = createContext<DragContextValue<any> | null>(null)

function useDragContext<T>(): DragContextValue<T> {
    const ctx = useContext(DragContext)
    if (ctx === null) throw new Error('useDragContext: must be inside DragProvider')
    return ctx as DragContextValue<T>
}

// ─── Provider ────────────────────────────────────────────────────────────────

type DragProviderProps<T> = {
    children: ReactNode
    renderGhost?: (dragSrc: T) => ReactNode
}

export function DragProvider<T>({ children, renderGhost }: DragProviderProps<T>) {
    const [dragSrc, setDragSrc] = useState<T | null>(null)
    const ghostPos = useRef<Point>({ x: 0, y: 0 })
    const [, forceRender] = useState(0)

    useEffect(() => {
        if (dragSrc === null) return

        function onPointerMove(e: PointerEvent) {
            ghostPos.current = { x: e.clientX, y: e.clientY }
            forceRender((n) => n + 1)
        }

        function onPointerUp(e: PointerEvent) {
            // find nearest beacon that accepts current dragSrc tag
            const tag = (dragSrc as Record<string, unknown>)['tag']
            const beacons = document.querySelectorAll<HTMLElement>('[data-beacon-id]')
            let nearest: HTMLElement | null = null
            let minDist = Infinity

            beacons.forEach((el) => {
                const accepts = el.dataset.beaconAccepts?.split(',') ?? []
                if (typeof tag === 'string' && !accepts.includes(tag)) return

                const rect = el.getBoundingClientRect()
                const cx = rect.left + rect.width / 2
                const cy = rect.top + rect.height / 2
                const dist = Math.hypot(cx - e.clientX, cy - e.clientY)
                if (dist < minDist) {
                    minDist = dist
                    nearest = el
                }
            })

            if (nearest !== null) {
                const beaconId = (nearest as HTMLElement).dataset.beaconId
                const dropEvent = new CustomEvent('beacon:drop', { detail: { beaconId } })
                ;(nearest as HTMLElement).dispatchEvent(dropEvent)
            }

            setDragSrc(null)
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)

        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
        }
    }, [dragSrc])

    return (
        <DragContext.Provider value={{ dragSrc, setDragSrc }}>
            {children}
            {dragSrc !== null && (
                <div
                    style={{
                        position: 'fixed',
                        left: ghostPos.current.x,
                        top: ghostPos.current.y,
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none',
                        zIndex: 9999,
                    }}
                >
                    {renderGhost ? (
                        renderGhost(dragSrc)
                    ) : (
                        <div className="rounded border border-accent bg-white px-4 py-2 text-sm shadow-lg opacity-80">
                            dragging…
                        </div>
                    )}
                </div>
            )}
        </DragContext.Provider>
    )
}

// ─── useDraggable ─────────────────────────────────────────────────────────────

const DRAG_THRESHOLD = 6 // px

type UseDraggableResult = {
    ref: RefCallback<HTMLElement>
    onPointerDown: (e: ReactPointerEvent) => void
    isDragSrc: boolean
}

export function useDraggable<T>(item: T): UseDraggableResult {
    const { dragSrc, setDragSrc } = useDragContext<T>()
    const elRef = useRef<HTMLElement | null>(null)
    const startPt = useRef<Point | null>(null)
    const isDragSrc = dragSrc !== null && (dragSrc as Record<string, unknown>)['tag'] === (item as Record<string, unknown>)['tag'] &&
        (dragSrc as Record<string, unknown>)['id'] === (item as Record<string, unknown>)['id']

    function onPointerDown(e: ReactPointerEvent) {
        startPt.current = { x: e.clientX, y: e.clientY }

        function onMove(ev: PointerEvent) {
            if (startPt.current === null) return
            const dist = Math.hypot(ev.clientX - startPt.current.x, ev.clientY - startPt.current.y)
            if (dist > DRAG_THRESHOLD) {
                setDragSrc(item)
                startPt.current = null
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onCancel)
            }
        }

        function onCancel() {
            startPt.current = null
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onCancel)
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onCancel)
    }

    const ref: RefCallback<HTMLElement> = (el) => {
        elRef.current = el
    }

    return { ref, onPointerDown, isDragSrc }
}

// ─── useBeacon ────────────────────────────────────────────────────────────────

type UseBeaconProps<T> = {
    accepts: string[]
    onDrop: (dragSrc: T) => void
}

type UseBeaconResult = {
    ref: RefCallback<HTMLElement>
    beaconId: string
    isActive: boolean
}

export function useBeacon<T>({ accepts, onDrop }: UseBeaconProps<T>): UseBeaconResult {
    const id = useId()
    const { dragSrc } = useDragContext<T>()
    const elRef = useRef<HTMLElement | null>(null)
    const onDropRef = useRef(onDrop)
    onDropRef.current = onDrop

    const tag = dragSrc !== null ? (dragSrc as Record<string, unknown>)['tag'] : null
    const isActive = typeof tag === 'string' && accepts.includes(tag)

    useEffect(() => {
        const el = elRef.current
        if (el === null) return

        function handleDrop(e: Event) {
            const detail = (e as CustomEvent<{ beaconId: string }>).detail
            if (detail.beaconId !== id) return
            if (dragSrc !== null) onDropRef.current(dragSrc)
        }

        el.addEventListener('beacon:drop', handleDrop)
        return () => el.removeEventListener('beacon:drop', handleDrop)
    }, [id, dragSrc])

    const ref: RefCallback<HTMLElement> = (el) => {
        elRef.current = el
    }

    return { ref, beaconId: id, isActive }
}
