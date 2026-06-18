import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react'

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
    // Won't fix now: pressing Enter with an empty value closes the
    // editor and reverts to the old text.
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
