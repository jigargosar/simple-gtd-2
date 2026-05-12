import { clsx } from 'clsx'
import { useState } from 'react'
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react'
import {
    appendTask,
    deleteTask,
    moveSection,
    moveTask,
    type Section,
    type Task,
    toggleTask,
    useSections,
    useSectionTasks,
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

type TaskMarkerData = { kind: 'taskMarker'; sectionId: string; index: number }
type SectionMarkerData = { kind: 'sectionMarker'; index: number }
type MarkerData = TaskMarkerData | SectionMarkerData

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
    const sections = useSections()

    return (
        <DragDropProvider
            onDragEnd={(event) => {
                if (event.canceled) return
                const src = event.operation.source
                const tgt = event.operation.target
                if (!src || !tgt) return
                const data = tgt.data as MarkerData | undefined
                if (!data) return
                switch (data.kind) {
                    case 'taskMarker':
                        moveTask(src.id as string, data.sectionId, data.index)
                        return
                    case 'sectionMarker':
                        moveSection(src.id as string, data.index)
                        return
                    default:
                        throw new Error(`unknown marker kind: ${(data as { kind: string }).kind}`)
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
                }}
            >
                <SectionMarker index={0} />
                {sections.map((section, i) => (
                    <div key={section.id}>
                        <ViewSection section={section} paletteIndex={i} animDelay={i * 60} />
                        <SectionMarker index={i + 1} />
                    </div>
                ))}
            </div>
        </DragDropProvider>
    )
}

function ViewSection({
    section,
    paletteIndex,
    animDelay,
}: {
    section: Section
    paletteIndex: number
    animDelay: number
}) {
    const tasks = useSectionTasks(section.id)
    const pal = palette(paletteIndex)
    const pending = tasks.filter((t) => !t.done).length

    const { ref: rootRef, handleRef: headerRef, isDragging } = useDraggable({
        id: section.id,
        type: 'section',
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
                opacity: isDragging ? 0.4 : 1,
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
                    {section.title}
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
                <TaskMarker sectionId={section.id} index={0} accent={pal.acc} />
                {tasks.map((task, i) => (
                    <div key={task.id}>
                        <ViewTask
                            task={task}
                            taskIndex={i}
                            accent={pal.acc}
                            isLast={i === tasks.length - 1}
                        />
                        <TaskMarker sectionId={section.id} index={i + 1} accent={pal.acc} />
                    </div>
                ))}
                <ViewAddTask sectionId={section.id} accent={pal.acc} lightBg={pal.light} />
            </div>
        </div>
    )
}

function TaskMarker({
    sectionId,
    index,
    accent,
}: {
    sectionId: string
    index: number
    accent: string
}) {
    const data: TaskMarkerData = { kind: 'taskMarker', sectionId, index }
    const { ref: zoneRef, isDropTarget } = useDroppable({
        id: `task-marker:${sectionId}:${index}`,
        accept: 'task',
        data,
    })
    return (
        <div
            ref={zoneRef}
            style={{
                height: '8px',
                margin: '-4px 0',
                display: 'flex',
                alignItems: 'center',
                pointerEvents: 'auto',
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: isDropTarget ? '3px' : '0px',
                    background: accent,
                    borderRadius: '2px',
                    margin: '0 1.25rem',
                    transition: 'height 0.12s',
                }}
            />
        </div>
    )
}

function SectionMarker({ index }: { index: number }) {
    const data: SectionMarkerData = { kind: 'sectionMarker', index }
    const { ref: zoneRef, isDropTarget } = useDroppable({
        id: `section-marker:${index}`,
        accept: 'section',
        data,
    })
    return (
        <div
            ref={zoneRef}
            style={{
                height: '16px',
                display: 'flex',
                alignItems: 'center',
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: isDropTarget ? '3px' : '0px',
                    background: 'var(--color-ink)',
                    borderRadius: '2px',
                    transition: 'height 0.12s',
                }}
            />
        </div>
    )
}

function ViewTask({
    task,
    taskIndex,
    accent,
    isLast,
}: {
    task: Task
    taskIndex: number
    accent: string
    isLast: boolean
}) {
    const [removing, setRemoving] = useState(false)
    const [hovered, setHovered] = useState(false)

    const { ref: rowRef, handleRef: gripRef, isDragging } = useDraggable({
        id: task.id,
        type: 'task',
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
                animationDelay: `${taskIndex * 30}ms`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem 0.75rem 0.5rem',
                borderBottom: isLast ? 'none' : '1px solid #f2f0ee',
                background: hovered ? '#fafaf9' : 'white',
                opacity: isDragging ? 0.4 : 1,
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
