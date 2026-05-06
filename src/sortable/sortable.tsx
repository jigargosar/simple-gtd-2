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
    internalId: string
    tag: string
    ref: RefObject<HTMLDivElement | null>
}

type BeaconEntry = {
    internalId: string
    tag: string
    ref: RefObject<HTMLDivElement | null>
    onDropRef: RefObject<(source: SourceMeta) => void>
}

type DragState =
    | { tag: 'idle' }
    | {
          tag: 'pressed'
          pointerId: number
          sourceInternalId: string
          sourceTag: string
          sourceUserId: string
          startX: number
          startY: number
      }
    | {
          tag: 'dragging'
          pointerId: number
          sourceInternalId: string
          sourceTag: string
          sourceUserId: string
          ghost: HTMLElement
          offsetX: number
          offsetY: number
      }

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

type Registration = {
    registerSource: (entry: SourceEntry) => () => void
    registerBeacon: (entry: BeaconEntry) => () => void
    startPress: (
        sourceInternalId: string,
        sourceTag: string,
        sourceUserId: string,
        e: ReactPointerEvent<HTMLElement>,
    ) => void
}

type ActiveState = {
    draggingSourceInternalId: string | null
    activeBeaconInternalId: string | null
}

const RegistrationCtx = createContext<Registration | null>(null)
const ActiveCtx = createContext<ActiveState>({
    draggingSourceInternalId: null,
    activeBeaconInternalId: null,
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

function SortableRoot({ children, threshold = 5 }: SortableRootProps) {
    const sources = useRef(new Map<string, SourceEntry>())
    const beacons = useRef(new Map<string, BeaconEntry>())
    const stateRef = useRef<DragState>({ tag: 'idle' })

    const [draggingSourceInternalId, setDraggingId] = useState<string | null>(null)
    const [activeBeaconInternalId, setActiveBeacon] = useState<string | null>(null)

    const registerSource = useCallback((entry: SourceEntry) => {
        sources.current.set(entry.internalId, entry)
        return () => {
            sources.current.delete(entry.internalId)
        }
    }, [])

    const registerBeacon = useCallback((entry: BeaconEntry) => {
        beacons.current.set(entry.internalId, entry)
        return () => {
            beacons.current.delete(entry.internalId)
        }
    }, [])

    const startPress = useCallback<Registration['startPress']>(
        (sourceInternalId, sourceTag, sourceUserId, e) => {
            stateRef.current = {
                tag: 'pressed',
                pointerId: e.pointerId,
                sourceInternalId,
                sourceTag,
                sourceUserId,
                startX: e.clientX,
                startY: e.clientY,
            }
        },
        [],
    )

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
            setDraggingId(null)
            setActiveBeacon(null)
            document.body.style.userSelect = ''
            document.body.style.cursor = ''
        }

        function promoteToDragging(
            s: Extract<DragState, { tag: 'pressed' }>,
            e: PointerEvent,
        ): void {
            const src = sources.current.get(s.sourceInternalId)
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
                sourceInternalId: s.sourceInternalId,
                sourceTag: s.sourceTag,
                sourceUserId: s.sourceUserId,
                ghost: cloned,
                offsetX: s.startX - rect.left,
                offsetY: s.startY - rect.top,
            }
            setDraggingId(s.sourceInternalId)
            setActiveBeacon(findNearestBeacon(e.clientX, e.clientY, s.sourceTag))
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
                    setActiveBeacon(findNearestBeacon(e.clientX, e.clientY, s.sourceTag))
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
            const beaconId = findNearestBeacon(e.clientX, e.clientY, s.sourceTag)
            const beacon = beaconId !== null ? beacons.current.get(beaconId) : undefined
            const sourceMeta: SourceMeta = { tag: s.sourceTag, id: s.sourceUserId }
            reset()
            if (beacon) beacon.onDropRef.current(sourceMeta)
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
        () => ({ draggingSourceInternalId, activeBeaconInternalId }),
        [draggingSourceInternalId, activeBeaconInternalId],
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
    const internalId = useId()
    const reg = useRegistration()
    const { draggingSourceInternalId } = useContext(ActiveCtx)

    useEffect(
        () => reg.registerSource({ internalId, tag, ref }),
        [reg, internalId, tag],
    )

    const isDragging = draggingSourceInternalId === internalId

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
                reg.startPress(internalId, tag, id, e)
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
    const internalId = useId()
    const reg = useRegistration()
    const { activeBeaconInternalId } = useContext(ActiveCtx)
    const onDropRef = useRef(onDrop)

    useEffect(() => {
        onDropRef.current = onDrop
    })

    useEffect(
        () => reg.registerBeacon({ internalId, tag, ref, onDropRef }),
        [reg, internalId, tag],
    )

    const isActive = activeBeaconInternalId === internalId

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

export { SortableRoot, SortableSource, SortableBeacon }
export type { SourceMeta }
