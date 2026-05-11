import { clsx } from 'clsx'
import { useEffect, useReducer, useState } from 'react'
import { DragDropProvider, type DragOverEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import {
    appendTask,
    deleteTask,
    reorderSections,
    reorderTasks,
    type Task,
    toggleTask,
    useAllTasks,
    useSections,
} from './store'

const PALETTES = [
    { bg: 'var(--s0-bg)', acc: 'var(--s0-acc)', light: '#fef4ee' },
    { bg: 'var(--s1-bg)', acc: 'var(--s1-acc)', light: '#eef6fb' },
    { bg: 'var(--s2-bg)', acc: 'var(--s2-acc)', light: '#eef8ef' },
    { bg: 'var(--s3-bg)', acc: 'var(--s3-acc)', light: '#f5f1fe' },
    { bg: 'var(--s4-bg)', acc: 'var(--s4-acc)', light: '#fef9ee' },
]

function palette(i: number) {
    return PALETTES[i % PALETTES.length]
}

type TaskGroups = Record<string, string[]>

function buildTaskGroups(sectionIds: string[], allTasks: Task[]): TaskGroups {
    const out: TaskGroups = {}
    for (const id of sectionIds) out[id] = []
    for (const t of allTasks) {
        if (out[t.sectionId]) out[t.sectionId].push(t.id)
    }
    return out
}

// Drag state machine. The phase tag determines what the rest means:
//   idle      — `sections` and `tasks` mirror the store; no drag.
//   dragging  — mid-drag preview; `snapshot` holds the pre-drag state for cancel.
//   committed — drop succeeded; an effect picks this up, calls store mutators,
//               and dispatches RESET. Existing only between END and the effect.
//
// The reducer is the only writer of `sections`/`tasks`, so onDragEnd reads the
// post-onDragOver value through the same dispatch chain. No closure to be stale.
type Snapshot = { sections: string[]; tasks: TaskGroups }

type DragState =
    | { tag: 'idle'; sections: string[]; tasks: TaskGroups }
    | { tag: 'dragging'; sections: string[]; tasks: TaskGroups; snapshot: Snapshot }
    | { tag: 'committed'; sections: string[]; tasks: TaskGroups; kind: 'task' | 'section' }

type DragAction =
    | { tag: 'SYNC'; sections: string[]; tasks: TaskGroups }
    | { tag: 'START' }
    | { tag: 'OVER_TASK'; event: DragOverEvent }
    | { tag: 'OVER_SECTION'; event: DragOverEvent }
    | { tag: 'END'; kind: 'task' | 'section' }
    | { tag: 'CANCEL' }
    | { tag: 'RESET' }

function assertNever(x: never): never {
    throw new Error(`unreachable: ${JSON.stringify(x)}`)
}

function dragReducer(state: DragState, action: DragAction): DragState {
    switch (action.tag) {
        case 'SYNC':
            // Only resync when idle — never overwrite a drag in progress.
            if (state.tag !== 'idle') return state
            return { tag: 'idle', sections: action.sections, tasks: action.tasks }
        case 'START':
            if (state.tag !== 'idle') return state
            return {
                tag: 'dragging',
                sections: state.sections,
                tasks: state.tasks,
                snapshot: { sections: state.sections, tasks: structuredClone(state.tasks) },
            }
        case 'OVER_TASK':
            if (state.tag !== 'dragging') return state
            return { ...state, tasks: move(state.tasks, action.event) }
        case 'OVER_SECTION':
            if (state.tag !== 'dragging') return state
            return { ...state, sections: move(state.sections, action.event) }
        case 'END':
            if (state.tag !== 'dragging') return state
            return {
                tag: 'committed',
                sections: state.sections,
                tasks: state.tasks,
                kind: action.kind,
            }
        case 'CANCEL':
            if (state.tag !== 'dragging') return state
            return { tag: 'idle', sections: state.snapshot.sections, tasks: state.snapshot.tasks }
        case 'RESET':
            return { tag: 'idle', sections: state.sections, tasks: state.tasks }
        default:
            return assertNever(action)
    }
}

function ViewApp() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <ViewHeader />
            <ViewSections />
        </div>
    )
}

function ViewHeader() {
    return (
        <header
            className="anim-header"
            style={{
                padding: '1.5rem 2.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}
        >
            <div
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--s0-acc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}
            >
                <div
                    style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        background: 'white',
                        opacity: 0.85,
                    }}
                />
            </div>
            <span
                style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: '1.125rem',
                    letterSpacing: '-0.01em',
                    color: 'var(--color-ink)',
                }}
            >
                SimpleGTD
            </span>
        </header>
    )
}

function ViewSections() {
    const storeSections = useSections()
    const allTasks = useAllTasks()
    const taskById = new Map(allTasks.map((t) => [t.id, t]))
    const sectionTitleById = new Map(storeSections.map((s) => [s.id, s.title]))

    const [drag, dispatch] = useReducer(dragReducer, { storeSections, allTasks }, initDragState)

    // SYNC the mirror from store whenever store changes, but the reducer
    // ignores SYNC during a drag — so this never clobbers in-progress state.
    useEffect(() => {
        const ids = storeSections.map((s) => s.id)
        dispatch({ tag: 'SYNC', sections: ids, tasks: buildTaskGroups(ids, allTasks) })
    }, [storeSections, allTasks])

    // After END, commit to store and RESET. Splitting the commit out as an
    // effect keeps the reducer pure.
    useEffect(() => {
        if (drag.tag !== 'committed') return
        switch (drag.kind) {
            case 'task':
                reorderTasks(drag.tasks)
                break
            case 'section':
                reorderSections(drag.sections)
                break
            default:
                assertNever(drag.kind)
        }
        dispatch({ tag: 'RESET' })
    }, [drag])

    return (
        <DragDropProvider
            onDragStart={() => dispatch({ tag: 'START' })}
            onDragOver={(event) => {
                const src = event.operation.source
                if (!src) return
                switch (src.type) {
                    case 'task':
                        dispatch({ tag: 'OVER_TASK', event })
                        return
                    case 'section':
                        dispatch({ tag: 'OVER_SECTION', event })
                        return
                    default:
                        throw new Error(`unknown drag source type: ${src.type}`)
                }
            }}
            onDragEnd={(event) => {
                if (event.canceled) {
                    dispatch({ tag: 'CANCEL' })
                    return
                }
                const src = event.operation.source
                if (!src) return
                switch (src.type) {
                    case 'task':
                        dispatch({ tag: 'END', kind: 'task' })
                        return
                    case 'section':
                        dispatch({ tag: 'END', kind: 'section' })
                        return
                    default:
                        throw new Error(`unknown drag source type: ${src.type}`)
                }
            }}
        >
            <div
                style={{
                    maxWidth: '680px',
                    margin: '0 auto',
                    padding: '0.5rem 2rem 6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}
            >
                {drag.sections.map((sectionId, i) => {
                    const ids = drag.tasks[sectionId] ?? []
                    const tasks = ids
                        .map((id) => taskById.get(id))
                        .filter((t): t is Task => t !== undefined)
                    return (
                        <ViewSection
                            key={sectionId}
                            sectionId={sectionId}
                            title={sectionTitleById.get(sectionId) ?? ''}
                            index={i}
                            paletteIndex={i}
                            animDelay={i * 60}
                            tasks={tasks}
                        />
                    )
                })}
            </div>
        </DragDropProvider>
    )
}

function initDragState(arg: {
    storeSections: { id: string }[]
    allTasks: Task[]
}): DragState {
    const ids = arg.storeSections.map((s) => s.id)
    return { tag: 'idle', sections: ids, tasks: buildTaskGroups(ids, arg.allTasks) }
}

function ViewSection({
    sectionId,
    title,
    index,
    paletteIndex,
    animDelay,
    tasks,
}: {
    sectionId: string
    title: string
    index: number
    paletteIndex: number
    animDelay: number
    tasks: Task[]
}) {
    const pal = palette(paletteIndex)
    const pending = tasks.filter((t) => !t.done).length

    const { ref: rootRef, handleRef: headerRef, isDragging } = useSortable({
        id: sectionId,
        index,
        type: 'section',
        accept: 'section',
    })

    return (
        <div
            ref={rootRef}
            className="anim-section"
            style={{
                animationDelay: `${animDelay}ms`,
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.06)',
                boxShadow: isDragging
                    ? '0 8px 24px rgba(0,0,0,0.12)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                opacity: isDragging ? 0.85 : 1,
            }}
        >
            <div
                ref={headerRef}
                style={{
                    background: pal.bg,
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'grab',
                    touchAction: 'none',
                }}
            >
                <div
                    style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: pal.acc,
                        flexShrink: 0,
                    }}
                />
                <span
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        letterSpacing: '0.01em',
                        color: pal.acc,
                        flex: 1,
                    }}
                >
                    {title}
                </span>
                {pending > 0 && (
                    <span
                        style={{
                            fontFamily: "'Epilogue', sans-serif",
                            fontSize: '0.6875rem',
                            fontWeight: 500,
                            color: pal.acc,
                            background: 'rgba(255,255,255,0.6)',
                            borderRadius: '20px',
                            padding: '1px 8px',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {pending}
                    </span>
                )}
            </div>

            <div style={{ background: 'white' }}>
                {tasks.map((task, i) => (
                    <ViewTask
                        key={task.id}
                        task={task}
                        index={i}
                        sectionId={sectionId}
                        accent={pal.acc}
                        isLast={i === tasks.length - 1}
                    />
                ))}
                <ViewAddTask sectionId={sectionId} accent={pal.acc} lightBg={pal.light} />
            </div>
        </div>
    )
}

function ViewTask({
    task,
    index,
    sectionId,
    accent,
    isLast,
}: {
    task: Task
    index: number
    sectionId: string
    accent: string
    isLast: boolean
}) {
    const [removing, setRemoving] = useState(false)
    const [hovered, setHovered] = useState(false)

    const { ref: rowRef, handleRef: gripRef, isDragging } = useSortable({
        id: task.id,
        index,
        group: sectionId,
        type: 'task',
        accept: 'task',
    })

    function handleDelete() {
        setRemoving(true)
        setTimeout(() => deleteTask(task.id), 175)
    }

    return (
        <div
            ref={rowRef}
            className={clsx('anim-task', removing && 'anim-out')}
            style={{
                animationDelay: `${index * 30}ms`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem 0.75rem 0.5rem',
                borderBottom: isLast ? 'none' : '1px solid #f2f0ee',
                background: isDragging ? '#f5f5f4' : hovered ? '#fafaf9' : 'white',
                opacity: isDragging ? 0.6 : 1,
                transition: 'background 0.1s',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <ViewDragHandle handleRef={gripRef} visible={hovered} />
            <ViewCheckbox done={task.done} accent={accent} onClick={() => toggleTask(task.id)} />
            <ViewTitle done={task.done} title={task.title} accent={accent} />
            <ViewDeleteBtn visible={hovered} onClick={handleDelete} />
        </div>
    )
}

function ViewDragHandle({
    handleRef,
    visible,
}: {
    handleRef: (el: Element | null) => void
    visible: boolean
}) {
    return (
        <span
            ref={handleRef}
            aria-label="Drag task"
            style={{
                width: '18px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'grab',
                color: 'var(--color-faint)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.15s',
                touchAction: 'none',
                userSelect: 'none',
                flexShrink: 0,
            }}
        >
            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                <circle cx="2" cy="2" r="1.2" fill="currentColor" />
                <circle cx="8" cy="2" r="1.2" fill="currentColor" />
                <circle cx="2" cy="7" r="1.2" fill="currentColor" />
                <circle cx="8" cy="7" r="1.2" fill="currentColor" />
                <circle cx="2" cy="12" r="1.2" fill="currentColor" />
                <circle cx="8" cy="12" r="1.2" fill="currentColor" />
            </svg>
        </span>
    )
}

function ViewCheckbox({
    done,
    accent,
    onClick,
}: {
    done: boolean
    accent: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${done ? accent : 'var(--color-faint)'}`,
                background: done ? accent : 'transparent',
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transition: 'border-color 0.15s, background 0.15s',
            }}
        >
            {done && (
                <svg
                    className="dot-pop"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                    style={{ display: 'block', flexShrink: 0 }}
                >
                    <path
                        d="M1 3.5L3.5 6L8 1"
                        stroke="white"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    )
}

function ViewTitle({ done, title, accent }: { done: boolean; title: string; accent: string }) {
    return (
        <span
            style={{
                fontFamily: "'Epilogue', sans-serif",
                fontSize: '0.875rem',
                fontWeight: done ? 300 : 400,
                color: done ? 'var(--color-faint)' : 'var(--color-ink)',
                flex: 1,
                minWidth: 0,
                display: 'block',
                transition: 'color 0.2s',
            }}
        >
            <span style={{ position: 'relative', display: 'inline-block' }}>
                {title}
                {done && (
                    <span className="strike-line" style={{ background: accent, opacity: 0.5 }} />
                )}
            </span>
        </span>
    )
}

function ViewDeleteBtn({ visible, onClick }: { visible: boolean; onClick: () => void }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                flexShrink: 0,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: 'none',
                background: hovered ? '#fee2e2' : '#f5f5f4',
                color: hovered ? '#dc2626' : 'var(--color-faint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.5625rem',
                padding: 0,
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.15s, background 0.12s, color 0.12s',
            }}
        >
            ✕
        </button>
    )
}

function ViewAddTask({
    sectionId,
    accent,
    lightBg,
}: {
    sectionId: string
    accent: string
    lightBg: string
}) {
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)

    function submit() {
        const trimmed = value.trim()
        if (!trimmed) return
        appendTask(sectionId, trimmed)
        setValue('')
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 1.25rem',
                background: focused ? lightBg : '#fafaf9',
                borderTop: '1px solid #f2f0ee',
                transition: 'background 0.15s',
                cursor: 'text',
            }}
            onClick={(e) => {
                const inp = (e.currentTarget as HTMLDivElement).querySelector('input')
                inp?.focus()
            }}
        >
            <span
                style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: `2px dashed ${focused ? accent : 'var(--color-faint)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: focused ? accent : 'var(--color-faint)',
                    fontSize: '0.875rem',
                    flexShrink: 0,
                    transition: 'border-color 0.15s, color 0.15s',
                    lineHeight: 1,
                    userSelect: 'none',
                }}
            >
                +
            </span>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Add a task…"
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontFamily: "'Epilogue', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 400,
                    color: 'var(--color-ink)',
                    caretColor: accent,
                }}
            />
            {value.trim() && (
                <button
                    onClick={submit}
                    style={{
                        fontFamily: "'Epilogue', sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: 'white',
                        background: accent,
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'opacity 0.12s',
                    }}
                    onMouseEnter={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.opacity = '0.85'
                    }}
                    onMouseLeave={(e) => {
                        ;(e.currentTarget as HTMLButtonElement).style.opacity = '1'
                    }}
                >
                    Add
                </button>
            )}
        </div>
    )
}

export default ViewApp
