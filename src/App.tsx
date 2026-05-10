import { clsx } from 'clsx'
import { useRef, useState } from 'react'
import {
    appendTask,
    deleteTask,
    type Section,
    type Task,
    toggleTask,
    useSections,
    useSectionTasks,
} from './store'

// Section accent colors — one warm ink per bucket
const SECTION_ACCENTS: Record<string, { dot: string; label: string }> = {
    Inbox: { dot: '#8b6f47', label: '#6b5a3a' },
    'Next Actions': { dot: '#5c7a5c', label: '#3d5c3d' },
    Projects: { dot: '#5a6a8a', label: '#3d4f72' },
    'Waiting For': { dot: '#8a6a5a', label: '#6b4f3d' },
    'Someday / Maybe': { dot: '#7a6a8a', label: '#5a4d72' },
}

function getAccent(title: string) {
    return SECTION_ACCENTS[title] ?? { dot: '#6b6560', label: '#4a4540' }
}

function ViewApp() {
    return (
        <div className="min-h-screen" style={{ background: 'var(--color-paper)' }}>
            <ViewHeader />
            <ViewSections />
        </div>
    )
}

function ViewHeader() {
    return (
        <header
            style={{
                borderBottom: '1px solid var(--color-rule)',
                background: 'var(--color-paper)',
                paddingBlock: '1.75rem',
                paddingInline: '2rem',
            }}
        >
            <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                <span
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.375rem',
                        fontWeight: 600,
                        color: 'var(--color-ink)',
                        letterSpacing: '-0.01em',
                    }}
                >
                    SimpleGTD
                </span>
                <span
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 300,
                        color: 'var(--color-ink-faint)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                    }}
                >
                    Getting Things Done
                </span>
            </div>
        </header>
    )
}

function ViewSections() {
    const sections = useSections()

    return (
        <div
            style={{
                maxWidth: '680px',
                margin: '0 auto',
                padding: '2.5rem 2rem 5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
            }}
        >
            {sections.map((section, i) => (
                <ViewSection
                    key={section.id}
                    section={section}
                    animDelay={i * 60}
                />
            ))}
        </div>
    )
}

function ViewSection({ section, animDelay }: { section: Section; animDelay: number }) {
    const tasks = useSectionTasks(section.id)
    const accent = getAccent(section.title)

    return (
        <div
            className="section-card"
            style={{
                animationDelay: `${animDelay}ms`,
                marginBottom: '2rem',
            }}
        >
            {/* Section header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    paddingBottom: '0.625rem',
                    paddingTop: '0.25rem',
                    marginBottom: '0',
                }}
            >
                <span
                    style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: accent.dot,
                        flexShrink: 0,
                        marginTop: '1px',
                    }}
                />
                <span
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: accent.label,
                        textTransform: 'uppercase',
                    }}
                >
                    {section.title}
                </span>
                <span
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 300,
                        color: 'var(--color-ink-faint)',
                        marginLeft: '0.25rem',
                    }}
                >
                    {tasks.filter((t) => !t.done).length}
                </span>
            </div>

            {/* Section card */}
            <div
                style={{
                    borderRadius: '6px',
                    border: '1px solid var(--color-rule)',
                    background: '#fff',
                    boxShadow: '0 1px 3px rgba(26,23,20,0.04), 0 4px 12px rgba(26,23,20,0.03)',
                    overflow: 'hidden',
                }}
            >
                {/* Left accent bar */}
                <div style={{ display: 'flex' }}>
                    <div
                        style={{
                            width: '3px',
                            background: accent.dot,
                            opacity: 0.35,
                            flexShrink: 0,
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        {tasks.length === 0 && (
                            <div
                                style={{
                                    padding: '1rem 1.25rem',
                                    fontFamily: "'DM Mono', monospace",
                                    fontSize: '0.75rem',
                                    fontStyle: 'italic',
                                    color: 'var(--color-ink-faint)',
                                    borderBottom: '1px solid var(--color-rule)',
                                }}
                            >
                                No tasks yet
                            </div>
                        )}
                        {tasks.map((task, i) => (
                            <ViewTask key={task.id} task={task} index={i} totalCount={tasks.length} />
                        ))}

                        {/* Add task row */}
                        <div
                            style={{
                                borderTop: tasks.length > 0 ? '1px solid var(--color-rule)' : undefined,
                                background: 'var(--color-paper)',
                            }}
                        >
                            <ViewAddTask sectionId={section.id} accentColor={accent.dot} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ViewTask({ task, index, totalCount }: { task: Task; index: number; totalCount: number }) {
    const [removing, setRemoving] = useState(false)

    function handleDelete() {
        setRemoving(true)
        setTimeout(() => deleteTask(task.id), 170)
    }

    return (
        <div
            className={clsx('task-row group', removing && 'removing')}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1.25rem',
                borderBottom: index < totalCount - 1 ? '1px solid var(--color-rule)' : undefined,
                transition: 'background 0.12s',
                animationDelay: `${index * 30}ms`,
                cursor: 'default',
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = 'var(--color-paper)'
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.background = ''
            }}
        >
            <ViewTaskCheckbox done={task.done} onClick={() => toggleTask(task.id)} />
            <ViewTaskTitle done={task.done} title={task.title} />
            <ViewDeleteButton onClick={handleDelete} />
        </div>
    )
}

function ViewTaskCheckbox({ done, onClick }: { done: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: done ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-ink-faint)',
                background: done ? 'var(--color-accent)' : 'transparent',
                flexShrink: 0,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.15s, background 0.15s',
                padding: 0,
            }}
        >
            {done && (
                <svg width="9" height="7" viewBox="0 0 9 7" fill="none" style={{ display: 'block' }}>
                    <path
                        className="check-path drawn"
                        d="M1 3.5L3.5 6L8 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </button>
    )
}

function ViewTaskTitle({ done, title }: { done: boolean; title: string }) {
    return (
        <span
            style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '0.8125rem',
                fontWeight: done ? 300 : 400,
                color: done ? 'var(--color-ink-faint)' : 'var(--color-ink)',
                flex: 1,
                minWidth: 0,
                transition: 'color 0.2s',
                position: 'relative',
                display: 'block',
            }}
        >
            <span style={{ position: 'relative', display: 'inline-block' }}>
                {title}
                {done && <span className="strike-line" />}
            </span>
        </span>
    )
}

function ViewDeleteButton({ onClick }: { onClick: () => void }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                marginLeft: 'auto',
                flexShrink: 0,
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: 'none',
                background: hovered ? '#fee2e2' : 'transparent',
                color: hovered ? '#dc2626' : 'var(--color-ink-faint)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.15s, background 0.15s, color 0.15s',
                fontSize: '0.625rem',
                padding: 0,
                lineHeight: 1,
            }}
            className="group-hover:!opacity-100"
        >
            ✕
        </button>
    )
}

function ViewAddTask({ sectionId, accentColor }: { sectionId: string; accentColor: string }) {
    const [value, setValue] = useState('')
    const [focused, setFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

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
                gap: '0.625rem',
                padding: '0.625rem 1.25rem',
                cursor: 'text',
            }}
            onClick={() => inputRef.current?.focus()}
        >
            <span
                style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.8125rem',
                    fontWeight: 300,
                    color: focused || value ? accentColor : 'var(--color-ink-faint)',
                    transition: 'color 0.15s',
                    userSelect: 'none',
                    flexShrink: 0,
                }}
            >
                +
            </span>
            <input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Add a task…"
                style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontFamily: "'DM Mono', monospace",
                    fontSize: '0.8125rem',
                    fontWeight: 300,
                    color: 'var(--color-ink)',
                    caretColor: accentColor,
                }}
                // inline placeholder style via CSS
            />
            {value.trim() && (
                <button
                    onClick={submit}
                    style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: '0.6875rem',
                        fontWeight: 400,
                        color: accentColor,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '3px',
                        letterSpacing: '0.04em',
                        transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'var(--color-paper-dark)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
                >
                    ↵ add
                </button>
            )}
        </div>
    )
}

export default ViewApp
