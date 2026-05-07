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
    sources: Set<string>
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
        entry = { sources: new Set(), beacons: new Map() }
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
    const dragStateRef = useRef<DragState>({ tag: 'idle' })

    function startPress(source: SourceMeta, e: ReactPointerEvent<HTMLElement>) {
        const next: DragState = {
            tag: 'pressed',
            pointerId: e.pointerId,
            source,
            startX: e.clientX,
            startY: e.clientY,
        }
        dragStateRef.current = next
        setDragState(next)
    }

    useEffect(() => {
        function transition(next: DragState) {
            dragStateRef.current = next
            setDragState(next)
        }

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

        function reset() {
            const s = dragStateRef.current
            if (s.tag === 'dragging') s.ghost.remove()
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
            transition({ tag: 'idle' })
        }

        function promoteToDragging(
            s: Extract<DragState, { tag: 'pressed' }>,
            e: PointerEvent,
        ): void {
            const initialBeaconId = findNearestBeacon(e.clientX, e.clientY, s.source.tag)
            if (initialBeaconId === null) {
                console.warn(
                    `Sortable.Source (tag="${s.source.tag}", id="${s.source.id}"): drag aborted — no Sortable.Beacon with tag="${s.source.tag}" found in this <Sortable>.`,
                )
                reset()
                return
            }

            const el = document.querySelector(
                `[data-source-tag="${s.source.tag}"][data-source-id="${s.source.id}"]`,
            )
            if (!(el instanceof HTMLElement)) {
                reset()
                return
            }
            const rect = el.getBoundingClientRect()
            const cloned = el.cloneNode(true)
            if (!(cloned instanceof HTMLElement)) {
                reset()
                return
            }

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

            transition({
                tag: 'dragging',
                pointerId: s.pointerId,
                source: s.source,
                ghost: cloned,
                offsetX: s.startX - rect.left,
                offsetY: s.startY - rect.top,
                activeBeaconId: initialBeaconId,
            })
        }

        function onMove(e: PointerEvent): void {
            const s = dragStateRef.current
            switch (s.tag) {
                case 'idle':
                    return
                case 'pressed': {
                    if (e.pointerId !== s.pointerId) return
                    const dx = e.clientX - s.startX
                    const dy = e.clientY - s.startY
                    if (Math.hypot(dx, dy) < threshold) return
                    promoteToDragging(s, e)
                    return
                }
                case 'dragging': {
                    if (e.pointerId !== s.pointerId) return
                    s.ghost.style.transform = `translate(${e.clientX - s.offsetX}px, ${e.clientY - s.offsetY}px)`
                    const nextBeaconId = findNearestBeacon(e.clientX, e.clientY, s.source.tag)
                    if (nextBeaconId !== null && nextBeaconId !== s.activeBeaconId) {
                        transition({ ...s, activeBeaconId: nextBeaconId })
                    }
                    return
                }
                default:
                    return assertNever(s)
            }
        }

        function onUp(e: PointerEvent): void {
            const s = dragStateRef.current
            if (s.tag !== 'dragging' || e.pointerId !== s.pointerId) {
                reset()
                return
            }
            const beaconId = findNearestBeacon(e.clientX, e.clientY, s.source.tag)
            const onDrop =
                beaconId !== null
                    ? registry.current.get(s.source.tag)?.beacons.get(beaconId)
                    : undefined
            const droppedSource = s.source
            reset()
            if (onDrop) onDrop(droppedSource)
        }

        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') reset()
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', reset)
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', reset)
            window.removeEventListener('keydown', onKey)
        }
    }, [threshold])

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
    const { registry, startPress, dragState } = useSortable()

    useEffect(() => {
        const entry = getOrCreateTag(registry.current, tag)
        entry.sources.add(id)
        return () => { entry.sources.delete(id) }
    }, [registry, tag, id])

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
    const onDropRef = useRef(onDrop)

    useEffect(() => {
        onDropRef.current = onDrop
    })

    useEffect(() => {
        const entry = getOrCreateTag(registry.current, tag)
        entry.beacons.set(beaconId, (source) => onDropRef.current(source))
        return () => { entry.beacons.delete(beaconId) }
    }, [registry, tag, beaconId])

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
