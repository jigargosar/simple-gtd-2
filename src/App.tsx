import { clsx } from 'clsx'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import {
    appendTask,
    deleteTask,
    type Section,
    type Task,
    toggleTask,
    updateTaskTitle,
    useSections,
    useSectionPendingCount,
    useSectionTasks,
} from './store'

function ViewApp() {
    return (
        <>
            <ViewHeader />
            <ViewSections />
        </>
    )
}

function ViewHeader() {
    return (
        <header className="anim-header px-6 pt-12 pb-8">
            <div className="mx-auto max-w-2xl">
                <span className="text-sm font-semibold tracking-tight text-stone-900">
                    SimpleGTD
                </span>
            </div>
        </header>
    )
}

function ViewSections() {
    const sections = useSections()

    return (
        <main className="mx-auto max-w-2xl px-6 pb-24">
            <div className="flex flex-col gap-10">
                {sections.map((section, i) => (
                    <ViewSection
                        key={section.id}
                        section={section}
                        animDelay={Math.min(i, 6) * 60}
                    />
                ))}
            </div>
        </main>
    )
}

function ViewSection({ section, animDelay }: { section: Section; animDelay: number }) {
    const tasks = useSectionTasks(section.id)
    const pending = useSectionPendingCount(section.id)

    return (
        <section className="anim-section" style={{ animationDelay: `${animDelay}ms` }}>
            <h2 className="mb-4 flex items-baseline gap-2 border-b border-stone-200 pb-2 text-lg font-bold text-stone-500">
                {section.title}
                <span className="text-sm font-medium text-stone-600 tabular-nums">
                    ·{' '}
                    <span key={pending} className="anim-count-pulse">
                        {pending}
                    </span>
                </span>
            </h2>
            <ul>
                {tasks.map((task, i) => (
                    <ViewTask key={task.id} task={task} taskIndex={i} />
                ))}
                <ViewAddTask sectionId={section.id} />
            </ul>
        </section>
    )
}

function ViewTask({ task, taskIndex }: { task: Task; taskIndex: number }) {
    const [removing, setRemoving] = useState(false)
    const [editing, setEditing] = useState(false)

    return (
        <li
            className={clsx(
                'anim-task group flex items-center gap-3 py-2 transition hover:bg-stone-100/60',
                removing && 'anim-out',
            )}
            style={{ animationDelay: `${Math.min(taskIndex, 8) * 30}ms` }}
            onAnimationEnd={(e) => {
                if (e.animationName === 'task-out') deleteTask(task.id)
            }}
        >
            <ViewCheckbox done={task.done} onClick={() => toggleTask(task.id)} />
            {editing ? (
                <ViewTitleEditor
                    title={task.title}
                    onSave={(next) => {
                        updateTaskTitle(task.id, next)
                        setEditing(false)
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <ViewTitle
                        done={task.done}
                        title={task.title}
                        onEdit={() => setEditing(true)}
                    />
                    <ViewEditBtn onClick={() => setEditing(true)} />
                    <ViewDeleteBtn onClick={() => setRemoving(true)} />
                </>
            )}
        </li>
    )
}

function ViewCheckbox({ done, onClick }: { done: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label={done ? 'Mark not done' : 'Mark done'}
            className={clsx(
                'focus-visible:ring-accent flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 p-0 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                done
                    ? 'border-stone-600 bg-stone-600'
                    : 'border-stone-500 bg-transparent hover:border-stone-700',
            )}
        >
            {done && (
                <svg
                    className="dot-pop block shrink-0"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                    aria-hidden
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

// Static title and the editor input MUST share this exact box so swapping
// between them produces zero layout shift. -mx-2/px-2 net to zero horizontal
// text offset (keeps title aligned with the "+ Add a task" row) while giving
// the editor's background/ring side breathing room. leading-6 equals
// text-base's default line-height, so row height is identical in both states.
const titleBox = 'block min-w-0 flex-1 -mx-2 rounded-md px-2 text-base leading-6'

function ViewTitle({ done, title, onEdit }: { done: boolean; title: string; onEdit: () => void }) {
    return (
        <span
            onClick={onEdit}
            className={clsx(
                titleBox,
                'cursor-text transition',
                done ? 'text-stone-600' : 'text-stone-900',
            )}
        >
            <span className={clsx('strike', done && 'is-done')}>{title}</span>
        </span>
    )
}

function ViewTitleEditor({
    title,
    onSave,
    onCancel,
}: {
    title: string
    onSave: (next: string) => void
    onCancel: () => void
}) {
    const [value, setValue] = useState(title)
    // Escape sets editing=false, which unmounts this input and fires onBlur.
    // This flag makes blur a no-op once Enter/Escape has already resolved the edit.
    const finished = useRef(false)

    return (
        <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
                if (!finished.current) onSave(value)
            }}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    finished.current = true
                    onSave(value)
                }
                if (e.key === 'Escape') {
                    finished.current = true
                    onCancel()
                }
            }}
            className={clsx(
                titleBox,
                'caret-accent bg-white text-stone-900 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none',
            )}
        />
    )
}

function ViewEditBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="focus-visible:ring-accent shrink-0 cursor-pointer rounded-md p-1 text-stone-600 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-200 focus-visible:bg-stone-200 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <Pencil className="size-4" />
        </button>
    )
}

function ViewDeleteBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 cursor-pointer rounded-md p-1 text-red-700 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-600 focus-visible:outline-none"
        >
            <Trash2 className="size-4" />
        </button>
    )
}

function ViewAddTask({ sectionId }: { sectionId: string }) {
    const [value, setValue] = useState('')

    function submit() {
        appendTask(sectionId, value)
        setValue('')
    }

    return (
        <li className="group flex items-center gap-3 py-2 transition focus-within:bg-stone-100/40">
            <span className="group-focus-within:text-accent flex h-5 w-5 shrink-0 items-center justify-center text-stone-600 transition select-none">
                <Plus className="size-5" />
            </span>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') submit()
                }}
                placeholder="Add a task…"
                className="caret-accent min-w-0 flex-1 rounded-md border-none bg-transparent text-base text-stone-900 transition outline-none placeholder:text-stone-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none"
            />
            {value.trim() && (
                <button
                    onClick={submit}
                    className="bg-accent shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-white transition hover:opacity-85 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                    Add
                </button>
            )}
        </li>
    )
}

export default ViewApp
