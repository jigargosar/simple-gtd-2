import { type ChangeEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react'

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
