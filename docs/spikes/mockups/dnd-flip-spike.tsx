import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { KeyboardSensor, PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'

// Isolated repro: does @dnd-kit/react's useSortable({ transition: { idle: true } })
// animate a sibling's reflow when the list mutates WITHOUT an active drag
// (a checkbox hide/show, not a drag)?
//
// No monkeypatching here — dnd-kit's animate() checks the real
// `prefers-reduced-motion` media query and plays at duration:0 if it's set
// to reduce. If nothing visibly animates below, that's this machine's actual
// OS/browser setting, not a bug in the spike.

// Matches src/App.tsx's rowDragSensors: without this, a real physical click
// (which always has a hair of pointer jitter) can register as a micro-drag,
// since nothing here tells PointerSensor to ignore presses on the checkbox.
const sensors = [
    PointerSensor.configure({
        activationConstraints: () => [new PointerActivationConstraints.Distance({ value: 8 })],
        preventActivation: (event) =>
            event.target instanceof Element && event.target.closest('button, input') !== null,
    }),
    KeyboardSensor,
]

type Row = { id: string; title: string; done: boolean }

const initialRows: Row[] = [
    { id: '1', title: 'Item 1', done: false },
    { id: '2', title: 'Item 2', done: false },
    { id: '3', title: 'Item 3', done: false },
    { id: '4', title: 'Item 4', done: false },
    { id: '5', title: 'Item 5', done: false },
    { id: '6', title: 'Item 6 (last)', done: false },
]

function ViewRow({
    row,
    index,
    onToggle,
}: {
    row: Row
    index: number
    onToggle: (id: string, done: boolean) => void
}) {
    const { ref } = useSortable({
        id: row.id,
        index,
        group: 'spike',
        type: 'row',
        accept: 'row',
        sensors,
        transition: { idle: true },
    })
    return (
        <li
            ref={ref}
            data-id={row.id}
            style={{
                display: 'flex',
                gap: 10,
                alignItems: 'center',
                padding: '10px 12px',
                borderBottom: '1px solid #eee',
            }}
        >
            <input
                type="checkbox"
                checked={row.done}
                onChange={(e) => onToggle(row.id, e.target.checked)}
            />
            {row.title}
        </li>
    )
}

function App() {
    const [rows, setRows] = useState(initialRows)
    const [showDone, setShowDone] = useState(true)

    const onToggle = (id: string, done: boolean) => {
        setRows((rs) => rs.map((r) => (r.id === id ? { ...r, done } : r)))
    }

    const visible = showDone ? rows : rows.filter((r) => !r.done)

    return (
        <div style={{ fontFamily: 'sans-serif', maxWidth: 480, margin: '40px auto' }}>
            <label>
                <input
                    id="show-done"
                    type="checkbox"
                    checked={showDone}
                    onChange={(e) => setShowDone(e.target.checked)}
                />{' '}
                Show completed
            </label>
            <DragDropProvider>
                <ul
                    id="list"
                    style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        border: '1px solid #ddd',
                        borderRadius: 8,
                    }}
                >
                    {visible.map((row, index) => (
                        <ViewRow key={row.id} row={row} index={index} onToggle={onToggle} />
                    ))}
                </ul>
            </DragDropProvider>
        </div>
    )
}

createRoot(document.getElementById('root')!).render(<App />)
