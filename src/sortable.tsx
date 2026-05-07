import React, {
    createContext,
    useContext,
    useEffect,
    useId,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
} from 'react'

type SourceMeta = { tag: string; id: string }

type TagRegistry = {
    beacons: Map<string, (source: SourceMeta) => void>
}

type DragState =
    | { tag: 'idle' }
    | { tag: 'pressed'; pointerId: number; source: SourceMeta; startX: number; startY: number }
    | {
          tag: 'dragging'
          pointerId: number
          source: SourceMeta
          ghost: HTMLElement
          offsetX: number
          offsetY: number
          activeBeaconId: string
      }

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

type SortableCtx = {
    registry: React.RefObject<Map<string, TagRegistry>>
    startPress: (source: SourceMeta, e: ReactPointerEvent<HTMLElement>) => void
    dragState: DragState
}

const Ctx = createContext<SortableCtx | null>(null)

function useSortable(): SortableCtx {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('Sortable.Source / Sortable.Beacon must be used inside <Sortable>')
    return ctx
}

function getOrCreateTag(registry: Map<string, TagRegistry>, tag: string): TagRegistry {
    let entry = registry.get(tag)
    if (!entry) {
        entry = { beacons: new Map() }
        registry.set(tag, entry)
    }
    return entry
}

type SortableRootProps = {
    children: ReactNode
    threshold?: number
}

function Sortable({ children, threshold = 5 }: SortableRootProps) {
    const registry = useRef(new Map<string, TagRegistry>())
    const [dragState, setDragState] = useState<DragState>({ tag: 'idle' })

    function findNearestBeacon(x: number, y: number, tag: string): string | null {
        const tagEntry = registry.current.get(tag)
        if (!tagEntry) return null
        let nearestId: string | null = null
        let minDistSq = Infinity
        for (const [beaconId] of tagEntry.beacons) {
            const el = document.querySelector(`[data-beacon-id="${beaconId}"]`)
            if (!el) continue
            const r = el.getBoundingClientRect()
            const cx = r.left + r.width / 2
            const cy = r.top + r.height / 2
            const dx = cx - x
            const dy = cy - y
            const distSq = dx * dx + dy * dy
            if (distSq < minDistSq) {
                minDistSq = distSq
                nearestId = beaconId
            }
        }
        return nearestId
    }

    function startPress(source: SourceMeta, e: ReactPointerEvent<HTMLElement>) {
        const pointerId = e.pointerId
        const startX = e.clientX
        const startY = e.clientY
        let current: DragState = { tag: 'pressed', pointerId, source, startX, startY }
        setDragState(current)

        function reset() {
            if (current.tag === 'dragging') current.ghost.remove()
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
            current = { tag: 'idle' }
            setDragState(current)
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onCancel)
            window.removeEventListener('keydown', onKey)
        }

        function onMove(e: PointerEvent) {
            if (e.pointerId !== pointerId) return
            switch (current.tag) {
                case 'idle':
                    return
                case 'pressed': {
                    const dx = e.clientX - startX
                    const dy = e.clientY - startY
                    if (Math.hypot(dx, dy) < threshold) return

                    const initialBeaconId = findNearestBeacon(e.clientX, e.clientY, source.tag)
                    if (initialBeaconId === null) {
                        console.warn(
                            `Sortable.Source (tag="${source.tag}", id="${source.id}"): drag aborted — no Sortable.Beacon with tag="${source.tag}" found in this <Sortable>.`,
                        )
                        reset()
                        return
                    }

                    const el = document.querySelector(
                        `[data-source-tag="${source.tag}"][data-source-id="${source.id}"]`,
                    )
                    if (!(el instanceof HTMLElement)) { reset(); return }
                    const rect = el.getBoundingClientRect()
                    const cloned = el.cloneNode(true)
                    if (!(cloned instanceof HTMLElement)) { reset(); return }

                    cloned.removeAttribute('id')
                    cloned.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'))
                    Object.assign(cloned.style, {
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: `${rect.width}px`,
                        margin: '0',
                        pointerEvents: 'none',
                        opacity: '0.85',
                        zIndex: '9999',
                        transform: `translate(${rect.left}px, ${rect.top}px)`,
                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    })
                    document.body.appendChild(cloned)
                    document.body.style.userSelect = 'none'
                    document.body.style.cursor = 'grabbing'

                    current = {
                        tag: 'dragging',
                        pointerId,
                        source,
                        ghost: cloned,
                        offsetX: startX - rect.left,
                        offsetY: startY - rect.top,
                        activeBeaconId: initialBeaconId,
                    }
                    setDragState(current)
                    return
                }
                case 'dragging': {
                    current.ghost.style.transform = `translate(${e.clientX - current.offsetX}px, ${e.clientY - current.offsetY}px)`
                    const nextBeaconId = findNearestBeacon(e.clientX, e.clientY, source.tag)
                    if (nextBeaconId !== null && nextBeaconId !== current.activeBeaconId) {
                        current = { ...current, activeBeaconId: nextBeaconId }
                        setDragState(current)
                    }
                    return
                }
                default:
                    return assertNever(current)
            }
        }

        function onUp(e: PointerEvent) {
            if (e.pointerId !== pointerId) return
            if (current.tag !== 'dragging') { reset(); return }
            const beaconId = findNearestBeacon(e.clientX, e.clientY, source.tag)
            const onDrop =
                beaconId !== null
                    ? registry.current.get(source.tag)?.beacons.get(beaconId)
                    : undefined
            const droppedSource = source
            reset()
            if (onDrop) onDrop(droppedSource)
        }

        function onCancel() { reset() }
        function onKey(e: KeyboardEvent) { if (e.key === 'Escape') reset() }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKey)
    }

    return (
        <Ctx.Provider value={{ registry, startPress, dragState }}>
            {children}
        </Ctx.Provider>
    )
}

type SortableSourceProps = {
    tag: string
    id: string
    children: ReactNode
    className?: string
}

function SortableSource({ tag, id, children, className }: SortableSourceProps) {
    const { startPress, dragState } = useSortable()

    const isDragging =
        dragState.tag === 'dragging' && dragState.source.tag === tag && dragState.source.id === id

    return (
        <div
            className={className}
            data-sortable-source=""
            data-source-tag={tag}
            data-source-id={id}
            data-dragging={isDragging || undefined}
            onPointerDown={(e) => {
                if (e.button !== 0) return
                if (e.target instanceof Element && e.target.closest('button,input,textarea,select,a'))
                    return
                e.stopPropagation()
                startPress({ tag, id }, e)
            }}
            style={
                isDragging
                    ? { outline: '2px dashed dodgerblue', outlineOffset: '-2px', borderRadius: 'inherit' }
                    : undefined
            }
        >
            <div style={isDragging ? { visibility: 'hidden' } : undefined}>{children}</div>
        </div>
    )
}

type SortableBeaconProps = {
    tag: string
    onDrop: (source: SourceMeta) => void
    children?: ReactNode
    className?: string
}

function SortableBeacon({ tag, onDrop, children, className }: SortableBeaconProps) {
    const beaconId = useId()
    const { registry, dragState } = useSortable()

    useEffect(() => {
        const entry = getOrCreateTag(registry.current, tag)
        entry.beacons.set(beaconId, onDrop)
        return () => { entry.beacons.delete(beaconId) }
    })

    const isActive = dragState.tag === 'dragging' && dragState.activeBeaconId === beaconId

    return (
        <div
            className={className}
            data-sortable-beacon=""
            data-beacon-id={beaconId}
            data-tag={tag}
            data-active={isActive || undefined}
        >
            {children}
        </div>
    )
}

export { Sortable, SortableSource, SortableBeacon }
export type { SourceMeta }
