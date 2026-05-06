import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type RefObject,
} from 'react'

type SourceMeta = { tag: string; id: string }

type SourceEntry = {
    tag: string
    id: string
    ref: RefObject<HTMLDivElement | null>
}

type BeaconEntry = {
    tag: string
    ref: RefObject<HTMLDivElement | null>
    onDropRef: RefObject<(source: SourceMeta) => void>
}

type DragState =
    | { tag: 'idle' }
    | {
          tag: 'pressed'
          pointerId: number
          source: SourceMeta
          startX: number
          startY: number
      }
    | {
          tag: 'dragging'
          pointerId: number
          source: SourceMeta
          ghost: HTMLElement
          offsetX: number
          offsetY: number
      }

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

function sourceKey(meta: SourceMeta): string {
    return `${meta.tag}\x00${meta.id}`
}

type Registration = {
    registerSource: (entry: SourceEntry) => () => void
    registerBeacon: (beaconId: string, entry: BeaconEntry) => () => void
    startPress: (source: SourceMeta, e: ReactPointerEvent<HTMLElement>) => void
}

type ActiveState = {
    draggingSource: SourceMeta | null
    activeBeaconId: string | null
}

const RegistrationCtx = createContext<Registration | null>(null)
const ActiveCtx = createContext<ActiveState>({
    draggingSource: null,
    activeBeaconId: null,
})

function useRegistration(): Registration {
    const ctx = useContext(RegistrationCtx)
    if (!ctx) throw new Error('Sortable.Source / Sortable.Beacon must be used inside <Sortable>')
    return ctx
}

type SortableRootProps = {
    children: ReactNode
    threshold?: number
}

function Sortable({ children, threshold = 5 }: SortableRootProps) {
    const sources = useRef(new Map<string, SourceEntry>())
    const beacons = useRef(new Map<string, BeaconEntry>())
    const stateRef = useRef<DragState>({ tag: 'idle' })

    const [draggingSource, setDraggingSource] = useState<SourceMeta | null>(null)
    const [activeBeaconId, setActiveBeaconId] = useState<string | null>(null)

    const registerSource = useCallback((entry: SourceEntry) => {
        if (entry.tag === '')
            throw new Error('Sortable.Source: tag must be a non-empty string.')
        if (entry.id === '')
            throw new Error('Sortable.Source: id must be a non-empty string.')
        const key = sourceKey(entry)
        if (sources.current.has(key)) {
            throw new Error(
                `Sortable.Source: duplicate (tag="${entry.tag}", id="${entry.id}"). Each Source must have a unique (tag, id) within a single <Sortable>.`,
            )
        }
        sources.current.set(key, entry)
        return () => {
            sources.current.delete(key)
        }
    }, [])

    const registerBeacon = useCallback((beaconId: string, entry: BeaconEntry) => {
        if (entry.tag === '')
            throw new Error('Sortable.Beacon: tag must be a non-empty string.')
        beacons.current.set(beaconId, entry)
        return () => {
            beacons.current.delete(beaconId)
        }
    }, [])

    const startPress = useCallback<Registration['startPress']>((source, e) => {
        stateRef.current = {
            tag: 'pressed',
            pointerId: e.pointerId,
            source,
            startX: e.clientX,
            startY: e.clientY,
        }
    }, [])

    useEffect(() => {
        function findNearestBeacon(x: number, y: number, sourceTag: string): string | null {
            let nearestId: string | null = null
            let minDistSq = Infinity
            for (const [id, beacon] of beacons.current) {
                if (beacon.tag !== sourceTag) continue
                const el = beacon.ref.current
                if (!el) continue
                const r = el.getBoundingClientRect()
                const cx = r.left + r.width / 2
                const cy = r.top + r.height / 2
                const dx = cx - x
                const dy = cy - y
                const distSq = dx * dx + dy * dy
                if (distSq < minDistSq) {
                    minDistSq = distSq
                    nearestId = id
                }
            }
            return nearestId
        }

        function reset() {
            const s = stateRef.current
            if (s.tag === 'dragging') s.ghost.remove()
            stateRef.current = { tag: 'idle' }
            setDraggingSource(null)
            setActiveBeaconId(null)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        function promoteToDragging(
            s: Extract<DragState, { tag: 'pressed' }>,
            e: PointerEvent,
        ): void {
            const src = sources.current.get(sourceKey(s.source))
            if (!src?.ref.current) {
                reset()
                return
            }
            const rect = src.ref.current.getBoundingClientRect()
            const cloned = src.ref.current.cloneNode(true)
            if (!(cloned instanceof HTMLElement)) {
                reset()
                return
            }

            cloned.removeAttribute('id')
            cloned.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
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

            stateRef.current = {
                tag: 'dragging',
                pointerId: s.pointerId,
                source: s.source,
                ghost: cloned,
                offsetX: s.startX - rect.left,
                offsetY: s.startY - rect.top,
            }
            setDraggingSource(s.source)
            setActiveBeaconId(findNearestBeacon(e.clientX, e.clientY, s.source.tag))
        }

        function onMove(e: PointerEvent): void {
            const s = stateRef.current
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
                    s.ghost.style.transform = `translate(${e.clientX - s.offsetX}px, ${
                        e.clientY - s.offsetY
                    }px)`
                    setActiveBeaconId(findNearestBeacon(e.clientX, e.clientY, s.source.tag))
                    return
                }
                default:
                    return assertNever(s)
            }
        }

        function onUp(e: PointerEvent): void {
            const s = stateRef.current
            if (s.tag !== 'dragging' || e.pointerId !== s.pointerId) {
                reset()
                return
            }
            const beaconId = findNearestBeacon(e.clientX, e.clientY, s.source.tag)
            const beacon = beaconId !== null ? beacons.current.get(beaconId) : undefined
            const droppedSource = s.source
            reset()
            if (beacon) beacon.onDropRef.current(droppedSource)
        }

        function onCancel(): void {
            reset()
        }

        function onKey(e: KeyboardEvent): void {
            if (e.key === 'Escape') reset()
        }

        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onCancel)
        window.addEventListener('keydown', onKey)
        return () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
            window.removeEventListener('pointercancel', onCancel)
            window.removeEventListener('keydown', onKey)
        }
    }, [threshold])

    const registration = useMemo<Registration>(
        () => ({ registerSource, registerBeacon, startPress }),
        [registerSource, registerBeacon, startPress],
    )

    const active = useMemo<ActiveState>(
        () => ({ draggingSource, activeBeaconId }),
        [draggingSource, activeBeaconId],
    )

    return (
        <RegistrationCtx.Provider value={registration}>
            <ActiveCtx.Provider value={active}>{children}</ActiveCtx.Provider>
        </RegistrationCtx.Provider>
    )
}

type SortableSourceProps = {
    tag: string
    id: string
    children: ReactNode
    className?: string
}

function SortableSource({ tag, id, children, className }: SortableSourceProps) {
    const ref = useRef<HTMLDivElement>(null)
    const reg = useRegistration()
    const { draggingSource } = useContext(ActiveCtx)

    useEffect(
        () => reg.registerSource({ tag, id, ref }),
        [reg, tag, id],
    )

    const isDragging = draggingSource?.tag === tag && draggingSource.id === id

    return (
        <div
            ref={ref}
            className={className}
            data-sortable-source=""
            data-tag={tag}
            data-dragging={isDragging || undefined}
            onPointerDown={(e) => {
                if (e.button !== 0) return
                if (
                    e.target instanceof Element &&
                    e.target.closest('button,input,textarea,select,a')
                )
                    return
                e.stopPropagation()
                reg.startPress({ tag, id }, e)
            }}
            style={
                isDragging
                    ? {
                          outline: '2px dashed dodgerblue',
                          outlineOffset: '-2px',
                          borderRadius: 'inherit',
                      }
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
    const ref = useRef<HTMLDivElement>(null)
    const beaconId = useId()
    const reg = useRegistration()
    const { activeBeaconId } = useContext(ActiveCtx)
    const onDropRef = useRef(onDrop)

    useEffect(() => {
        onDropRef.current = onDrop
    })

    useEffect(
        () => reg.registerBeacon(beaconId, { tag, ref, onDropRef }),
        [reg, beaconId, tag],
    )

    const isActive = activeBeaconId === beaconId

    return (
        <div
            ref={ref}
            className={className}
            data-sortable-beacon=""
            data-tag={tag}
            data-active={isActive || undefined}
        >
            {children}
        </div>
    )
}

export { Sortable, SortableSource, SortableBeacon }
