# Refactoring `src/sortable.tsx`

★ Do them top-to-bottom. Steps 1-4 are mechanical and let you verify nothing broke after each. 5 is independent. 6 is the structural move and goes last.

---

## 1. `setBodyDragging` — extract body-style toggle

**Where:** Two places. Lines 149-150 in `reset` (clearing) and lines 193-194 in `promoteToDragging` (setting).

**New function** (module level):

```ts
function setBodyDragging(on: boolean): void {
    document.body.style.userSelect = on ? 'none' : ''
    document.body.style.cursor = on ? 'grabbing' : ''
}
```

**Call site changes:** `setBodyDragging(false)` replaces the 2 lines in `reset`. `setBodyDragging(true)` replaces the 2 lines in `promoteToDragging`.

---

## 2. `moveGhost` — extract transform setter

**Where:** Lines 226-228, inlined inside the `'dragging'` branch of `onMove`.

**New function** (module level):

```ts
function moveGhost(
    ghost: HTMLElement,
    x: number,
    y: number,
    offsetX: number,
    offsetY: number,
): void {
    ghost.style.transform = `translate(${x - offsetX}px, ${y - offsetY}px)`
}
```

**Call site change** inside `onMove`:

```ts
moveGhost(s.ghost, e.clientX, e.clientY, s.offsetX, s.offsetY)
```

★ Tiny extraction. Worth it because `onMove`'s dragging branch becomes 4 readable lines instead of mixing transform-string assembly with beacon updates.

---

## 3. `findNearestBeacon` — promote nested function to module level

**Where:** Lines 122-142, declared inside `useEffect`.

**Why move it:** It's pure geometry. The only reason it's nested today is to close over `beacons.current`. Make that an explicit parameter and it can live at module scope.

**New function** (place near `assertNever` and `sourceKey`):

```ts
function findNearestBeacon(
    beacons: Map<string, BeaconEntry>,
    x: number,
    y: number,
    sourceTag: string,
): string | null {
    let nearestId: string | null = null
    let minDistSq = Infinity
    for (const [id, beacon] of beacons) {
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
```

**Call site changes:** 3 call sites inside the useEffect (lines 157, 229, 250). Each becomes:

```ts
findNearestBeacon(beacons.current, x, y, tag)
```

Then delete the nested declaration.

---

## 4. `createGhost` — extract DOM cloning

**Where:** Lines 171-192, inlined inside `promoteToDragging`.

**Why:** ~25 lines of pure DOM manipulation that has nothing to do with state. The `instanceof` failure path is also currently entangled with `reset()`; pulling it out makes the failure mode a plain `null` return.

**New function** (module level):

```ts
function createGhost(
    sourceEl: HTMLElement,
): { ghost: HTMLElement; rect: DOMRect } | null {
    const rect = sourceEl.getBoundingClientRect()
    const cloned = sourceEl.cloneNode(true)
    if (!(cloned instanceof HTMLElement)) return null
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
    return { ghost: cloned, rect }
}
```

**Call site change** inside `promoteToDragging`:

```ts
const result = createGhost(src.ref.current)
if (!result) {
    reset()
    return
}
const { ghost, rect } = result
```

Delete the old block (rect calc, cloneNode, instanceof check, removeAttribute calls, Object.assign, appendChild).

---

## 5. `addSource` / `addBeacon` — extract validation + map ops

**Where:** Lines 86-101 (`registerSource`) and 103-110 (`registerBeacon`).

**Why:** The `useCallback` is the *registration plumbing*. The validation, key construction, and dedup check are *map operations*. Different concerns.

**New functions** (module level):

```ts
function addSource(
    map: Map<string, SourceEntry>,
    entry: SourceEntry,
): () => void {
    if (entry.tag === '')
        throw new Error('Sortable.Source: tag must be a non-empty string.')
    if (entry.id === '')
        throw new Error('Sortable.Source: id must be a non-empty string.')
    const key = sourceKey(entry)
    if (map.has(key)) {
        throw new Error(
            `Sortable.Source: duplicate (tag="${entry.tag}", id="${entry.id}"). Each Source must have a unique (tag, id) within a single <Sortable>.`,
        )
    }
    map.set(key, entry)
    return () => {
        map.delete(key)
    }
}

function addBeacon(
    map: Map<string, BeaconEntry>,
    beaconId: string,
    entry: BeaconEntry,
): () => void {
    if (entry.tag === '')
        throw new Error('Sortable.Beacon: tag must be a non-empty string.')
    map.set(beaconId, entry)
    return () => {
        map.delete(beaconId)
    }
}
```

**Call sites** collapse to:

```ts
const registerSource = useCallback(
    (entry: SourceEntry) => addSource(sources.current, entry),
    [],
)

const registerBeacon = useCallback(
    (beaconId: string, entry: BeaconEntry) =>
        addBeacon(beacons.current, beaconId, entry),
    [],
)
```

> ⚠ **Gotcha:** Don't memoize `addSource` / `addBeacon` themselves. They're plain functions, not hooks. The `useCallback` stays *around the call* — it's wrapping a closure over `sources.current` / `beacons.current` so the registration object stays referentially stable.

---

## 6. `useDragController` — extract custom hook

**Where:** Almost the entire body of `Sortable` (lines 80-281) except the JSX return.

**Why:** After 1-5, the body is still ~150 lines. The hook isolates *all* drag mechanics — refs, state, registration callbacks, the global event listener `useEffect` — leaving `Sortable` as a 5-line context-provider shell.

**New hook** (module level, above `Sortable`):

```ts
function useDragController(threshold: number): {
    active: Active
    registration: Registration
} {
    const sources = useRef(new Map<string, SourceEntry>())
    const beacons = useRef(new Map<string, BeaconEntry>())
    const stateRef = useRef<DragState>({ tag: 'idle' })
    const [active, setActive] = useState<Active>({ tag: 'idle' })

    const registerSource = useCallback(
        (entry: SourceEntry) => addSource(sources.current, entry),
        [],
    )

    const registerBeacon = useCallback(
        (beaconId: string, entry: BeaconEntry) =>
            addBeacon(beacons.current, beaconId, entry),
        [],
    )

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
        // ...all the handlers, now using the extracted helpers...
    }, [threshold])

    // ⚠ Gotcha: keep `reset`, `promoteToDragging`, `onMove`, etc. inside this
    // useEffect. They close over setActive, the refs, and threshold. Pulling
    // them to module level would force you to thread all those through as
    // parameters — net loss. The body shrinks naturally once 1-5 are applied.

    const registration = useMemo<Registration>(
        () => ({ registerSource, registerBeacon, startPress }),
        [registerSource, registerBeacon, startPress],
    )

    return { active, registration }
}
```

**`Sortable` collapses to:**

```tsx
function Sortable({ children, threshold = 5 }: SortableRootProps) {
    const { active, registration } = useDragController(threshold)
    return (
        <RegistrationCtx.Provider value={registration}>
            <ActiveCtx.Provider value={active}>{children}</ActiveCtx.Provider>
        </RegistrationCtx.Provider>
    )
}
```
