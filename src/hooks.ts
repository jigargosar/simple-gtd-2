import { type ChangeEvent, type KeyboardEvent, useRef, useState } from 'react'

export function useEditInput({
    initialValue,
    onSave,
    onCancel = () => {},
}: {
    initialValue: string
    onSave: (v: string) => void
    onCancel?: () => void
}) {
    const [value, setValue] = useState(initialValue)
    // Escape unmounts this input and fires onBlur — this flag makes blur a no-op
    // once Enter/Escape has already resolved the edit.
    const finished = useRef(false)
    return {
        value,
        onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value),
        onBlur: () => {
            if (!finished.current) {
                onSave(value)
                setValue(initialValue)
            }
            finished.current = false
        },
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                finished.current = true
                onSave(value)
                setValue(initialValue)
            }
            if (e.key === 'Escape') {
                finished.current = true
                onCancel()
                setValue(initialValue)
            }
        },
    }
}
