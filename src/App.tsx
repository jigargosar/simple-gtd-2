import { clsx } from 'clsx'
import { FolderInput, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useEditInput } from './hooks'
import {
    appendSection,
    appendTask,
    deleteSection,
    deleteTask,
    type Section,
    type Task,
    setTaskSection,
    toggleShowDone,
    toggleTask,
    updateSectionTitle,
    updateTaskTitle,
    useMoveTargets,
    useSections,
    useShowDone,
    useVisibleSectionTasks,
} from './store'

function ViewApp() {
    return (
        <>
            <ViewHeader />
            <ViewBoard />
        </>
    )
}

function ViewHeader() {
    return (
        <header className="px-6 pt-12 pb-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
                <span className="text-sm font-semibold tracking-tight text-stone-900">
                    SimpleGTD
                </span>
            </div>
        </header>
    )
}

function ViewBoard() {
    const sections = useSections()
    return (
        <main className="mx-auto max-w-2xl px-6 pb-24">
            <ViewDoneToggle />
            <div className="flex flex-col gap-10">
                {sections.map((section) => (
                    <ViewSection key={section.id} section={section} />
                ))}
                <ViewAddSection />
            </div>
        </main>
    )
}

// Constant label, state encoded by the checkbox — no state-vs-action ambiguity, and
// the width never changes (so no layout shift).
function ViewDoneToggle() {
    const showDone = useShowDone()
    return (
        <div className="mb-6 flex justify-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-600 select-none">
                <input
                    type="checkbox"
                    checked={showDone}
                    onChange={toggleShowDone}
                    className="accent-accent h-4 w-4 cursor-pointer"
                />
                Show completed
            </label>
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useVisibleSectionTasks(section.id)
    const [editingTitle, setEditingTitle] = useState(false)

    // The confirm() gates the destructive delete up front.
    return (
        <div className="flex flex-col gap-4 transition">
            <div className="group flex items-center gap-2 border-b border-stone-200 pb-2">
                {editingTitle ? (
                    <ViewSectionTitleEditor
                        title={section.title}
                        onSave={(next) => {
                            updateSectionTitle(section.id, next)
                            setEditingTitle(false)
                        }}
                        onCancel={() => setEditingTitle(false)}
                    />
                ) : (
                    <>
                        <span
                            onClick={() => setEditingTitle(true)}
                            className="wrap-anywhere flex-1 cursor-text pl-2 text-lg font-bold text-stone-500 transition"
                        >
                            {section.title}
                        </span>
                        <ViewDeleteBtn
                            onClick={() => {
                                if (window.confirm(`Delete section “${section.title}” and its tasks?`))
                                    deleteSection(section.id)
                            }}
                        />
                    </>
                )}
            </div>
            <ul>
                {tasks.map((task) => (
                    <ViewTask key={task.id} task={task} />
                ))}
                <ViewAddTask sectionId={section.id} />
            </ul>
        </div>
    )
}

function ViewSectionTitleEditor({
    title,
    onSave,
    onCancel,
}: {
    title: string
    onSave: (next: string) => void
    onCancel: () => void
}) {
    const editProps = useEditInput({ initialValue: title, onSave, onCancel })
    return (
        <input
            autoFocus
            {...editProps}
            placeholder="Section name…"
            className="focus-visible:ring-accent caret-accent min-w-0 flex-1 rounded-md border-none bg-transparent px-2 text-lg font-bold text-stone-500 transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
    )
}

function ViewAddSection() {
    const editProps = useEditInput({
        initialValue: '',
        onSave: appendSection,
        clearOnSave: true,
    })
    return (
        <div className="group flex items-center gap-3 border-b border-stone-200 pb-2 transition focus-within:bg-stone-100/40">
            <span className="group-focus-within:text-accent flex h-5 w-5 shrink-0 items-center justify-center text-stone-500 transition select-none">
                <Plus className="size-5" />
            </span>
            <input
                {...editProps}
                placeholder="New section…"
                className="focus-visible:ring-accent caret-accent min-w-0 flex-1 rounded-md border-none bg-transparent pl-2 text-lg font-bold text-stone-500 transition outline-none placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
        </div>
    )
}

function ViewTask({ task }: { task: Task }) {
    const [editing, setEditing] = useState(false)

    return (
        <li className="group flex items-center gap-3 py-2 transition hover:bg-stone-100/60">
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
                    <ViewMoveMenu task={task} />
                    <ViewDeleteBtn
                        onClick={() => {
                            if (window.confirm(`Delete “${task.title}”?`)) deleteTask(task.id)
                        }}
                    />
                </>
            )}
        </li>
    )
}

function ViewCheckbox({ done, onClick }: { done: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'focus-visible:ring-accent flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 p-0 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                done
                    ? 'border-stone-600 bg-stone-600'
                    : 'border-stone-500 bg-transparent hover:border-stone-700',
            )}
        >
            {done && (
                <svg
                    className="block shrink-0"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
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

// titleBox should keep the title span and editor input visually
// interchangeable so toggling between them doesn't shift layout.
const titleBox = 'block min-w-0 flex-1 rounded-md px-2 text-base leading-6 wrap-anywhere'

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
    const editProps = useEditInput({ initialValue: title, onSave, onCancel })
    return (
        <input
            autoFocus
            {...editProps}
            placeholder="Type or Esc to cancel"
            className={clsx(
                titleBox,
                'caret-accent focus-visible:ring-accent border-none bg-transparent text-stone-900 transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
            )}
        />
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

// Move a task to another section. Hover/focus-revealed like the delete button; opens a
// small menu of the other sections. This menu migrates into the task detail box (step 2).
function ViewMoveMenu({ task }: { task: Task }) {
    const targets = useMoveTargets(task.sectionId)
    const [open, setOpen] = useState(false)
    if (targets.length === 0) return null
    return (
        <div className="relative shrink-0">
            <button
                onClick={() => setOpen((v) => !v)}
                className="focus-visible:ring-accent block cursor-pointer rounded-md p-1 text-stone-500 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <FolderInput className="size-4" />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 z-20 mt-1 min-w-44 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                        <p className="px-3 py-1 text-xs font-medium text-stone-400">Move to…</p>
                        {targets.map((s) => (
                            <button
                                key={s.id}
                                onClick={() => {
                                    setTaskSection(task.id, s.id)
                                    setOpen(false)
                                }}
                                className="focus-visible:ring-accent block w-full cursor-pointer truncate rounded-md px-3 py-1.5 text-left text-sm text-stone-700 transition hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                {s.title}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

function ViewAddTask({ sectionId }: { sectionId: string }) {
    const editProps = useEditInput({
        initialValue: '',
        onSave: (title) => appendTask(sectionId, title),
        clearOnSave: true,
    })

    return (
        <li className="group flex items-center gap-3 py-2 transition focus-within:bg-stone-100/40">
            <span className="group-focus-within:text-accent flex h-5 w-5 shrink-0 items-center justify-center text-stone-600 transition select-none">
                <Plus className="size-5" />
            </span>
            <input
                {...editProps}
                placeholder="Add to list…"
                className={clsx(
                    titleBox,
                    'caret-accent focus-visible:ring-accent border-none bg-transparent text-stone-900 transition outline-none placeholder:text-stone-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                )}
            />
        </li>
    )
}

export default ViewApp
