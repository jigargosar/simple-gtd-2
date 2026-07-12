import {
    type ChangeEvent,
    type KeyboardEvent,
    type RefObject,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

// Locks page scrolling while a dialog/overlay is mounted. Pairs with the
// scrollbar-gutter rule on <html> so locking doesn't shift the layout.
export function useScrollLock() {
    useEffect(() => {
        const root = document.documentElement
        const prev = root.style.overflow
        root.style.overflow = 'hidden'
        return () => {
            root.style.overflow = prev
        }
    }, [])
}

// FLIP: rows are matched across renders by `data-flip-id` inside `containerRef`.
// When a row's position changes (a sibling appeared/disappeared/reordered),
// the delta between its last-measured and current position is applied as an
// inverted transform, then released into a transition — so it glides into
// place instead of snapping. `ids` (the tracked row order) is passed only to
// decide when to re-measure; matching itself is by DOM attribute, not by id.
//
// Position is measured document-relative (rect.top + scrollY), not viewport-
// relative. Viewport-relative alone breaks under scroll: dragging in the
// current scroll position (whether from the user or from Chrome's own
// scroll-anchoring, which fires automatically when content shrinks near the
// viewport) corrupts the delta for every row, including ones that never
// moved. Document-relative cancels that out, since scroll affects viewport
// position and window.scrollY equally and oppositely.
export function useFlip(containerRef: RefObject<HTMLElement | null>, ids: string[]) {
    const prevTops = useRef(new Map<string, number>())

    useLayoutEffect(() => {
        const container = containerRef.current
        if (!container) return
        container.querySelectorAll<HTMLElement>('[data-flip-id]').forEach((row) => {
            const id = row.dataset.flipId
            if (!id) return
            const top = row.getBoundingClientRect().top + window.scrollY
            const prevTop = prevTops.current.get(id)
            if (prevTop !== undefined && prevTop !== top) {
                const delta = prevTop - top
                row.style.transition = 'none'
                row.style.transform = `translateY(${delta}px)`
                requestAnimationFrame(() => {
                    row.style.transition = 'transform 200ms ease'
                    row.style.transform = ''
                    // Release the inline override once the slide finishes, so the
                    // row's own (Tailwind) transition class governs again — else
                    // this leftover shorthand would silently block its hover/color
                    // transitions from then on.
                    row.addEventListener(
                        'transitionend',
                        () => {
                            row.style.transition = ''
                        },
                        { once: true },
                    )
                })
            }
            prevTops.current.set(id, top)
        })
        // Re-measure whenever the tracked row order changes; matching happens
        // via the DOM attribute above, not via `ids` itself.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ids.join('|')])
}

export function useEditInput({
    initialValue,
    onSave,
    onCancel = () => {},
    clearOnSave = false,
}: {
    initialValue: string
    onSave: (v: string) => void
    onCancel?: () => void
    clearOnSave?: boolean
}) {
    // Won't fix now: initialValue should not change after mount.
    const [value, setValue] = useState(initialValue)
    // Escape unmounts this input and fires onBlur — this flag makes blur a no-op
    // once Enter/Escape has already resolved the edit.
    const finished = useRef(false)
    const save = () => {
        onSave(value)
        if (clearOnSave) setValue('')
    }
    return {
        value,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
        onBlur: () => {
            if (!finished.current) save()
            finished.current = false
        },
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                finished.current = true
                save()
            }
            if (e.key === 'Escape') {
                finished.current = true
                onCancel()
            }
        },
    }
}
