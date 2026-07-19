import {
    type ChangeEvent,
    type KeyboardEvent,
    type RefObject,
    useLayoutEffect,
    useRef,
    useState,
} from 'react'

type EditableElement = HTMLInputElement | HTMLTextAreaElement

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
        onChange: (e: ChangeEvent<EditableElement>) => setValue(e.target.value),
        onBlur: () => {
            if (!finished.current) save()
            finished.current = false
        },
        onKeyDown: (e: KeyboardEvent<EditableElement>) => {
            if (e.key === 'Enter') {
                // Textarea callers rely on this to stop Enter from inserting a
                // newline — title editing is single-conceptual-line, matching input.
                e.preventDefault()
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

// Grows a textarea to fit its content instead of scrolling internally, so an
// edit-mode textarea visually matches the wrap-anywhere display span it replaces.
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement | null>, value: string) {
    useLayoutEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }, [ref, value])
}
