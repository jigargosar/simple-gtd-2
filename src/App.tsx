import { clsx } from 'clsx'
import { Archive, ArchiveRestore, FolderInput, MoreHorizontal, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { useEditInput } from './hooks'
import {
    appendSection,
    appendTask,
    archiveSection,
    archiveTask,
    deleteSection,
    deleteTask,
    restoreSection,
    restoreTask,
    type Section,
    type Task,
    setTaskSection,
    toggleShowDone,
    toggleTask,
    updateSectionTitle,
    updateTaskTitle,
    useArchivedSections,
    useArchivedTasks,
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
            <ViewMenu />
            <div className="flex flex-col gap-10">
                {sections.map((section) => (
                    <ViewSection key={section.id} section={section} />
                ))}
                <ViewAddSection />
            </div>
        </main>
    )
}

// Top-right menu: holds the show-completed toggle and the Archive entry.
// Keeps the active view's top area to a single control and gives archive a home.
function ViewMenu() {
    const showDone = useShowDone()
    const [open, setOpen] = useState(false)
    const [archiveOpen, setArchiveOpen] = useState(false)

    return (
        <div className="mb-6 flex justify-end">
            <div className="relative">
                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Menu"
                    className="focus-visible:ring-accent grid h-8 w-8 cursor-pointer place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <MoreHorizontal className="size-5" />
                </button>

                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <div className="absolute right-0 z-20 mt-1 min-w-52 rounded-lg border border-stone-200 bg-white py-1 shadow-lg">
                            <button
                                onClick={toggleShowDone}
                                className="focus-visible:ring-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <span
                                    className={clsx(
                                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                                        showDone
                                            ? 'border-accent bg-accent text-white'
                                            : 'border-stone-400',
                                    )}
                                >
                                    {showDone && (
                                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                            <path
                                                d="M1 3.5L3.5 6L8 1"
                                                stroke="currentColor"
                                                strokeWidth="1.75"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                                Show completed
                            </button>
                            <div className="my-1 h-px bg-stone-100" />
                            <button
                                onClick={() => {
                                    setOpen(false)
                                    setArchiveOpen(true)
                                }}
                                className="focus-visible:ring-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Archive className="size-4 text-stone-500" />
                                Archive…
                            </button>
                        </div>
                    </>
                )}
            </div>

            {archiveOpen && <ViewArchiveDialog onClose={() => setArchiveOpen(false)} />}
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useVisibleSectionTasks(section.id)
    const [editingTitle, setEditingTitle] = useState(false)

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
                            className="flex-1 cursor-text pl-2 text-lg font-bold wrap-anywhere text-stone-500 transition"
                        >
                            {section.title}
                        </span>
                        <ViewArchiveBtn
                            label="Archive section"
                            onClick={() => archiveSection(section.id)}
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
                    <ViewArchiveBtn label="Archive task" onClick={() => archiveTask(task.id)} />
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
                <svg className="block shrink-0" width="9" height="7" viewBox="0 0 9 7" fill="none">
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

// Active-view per-row control. Archiving is reversible, so it's styled
// neutral (not red) and fires immediately without a confirm. Revealed on
// hover/focus, same as the old delete button.
function ViewArchiveBtn({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            aria-label={label}
            title={label}
            className="focus-visible:ring-accent shrink-0 cursor-pointer rounded-md p-1 text-stone-500 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-100 hover:text-stone-700 focus-visible:bg-stone-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <Archive className="size-4" />
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

// Archive dialog: two mutually-exclusive panes (items / lists), top-anchored,
// scrolls internally. Restore is always visible; permanent delete is revealed on
// hover/focus and gated by an inline two-step confirm (per the approved mock).
function ViewArchiveDialog({ onClose }: { onClose: () => void }) {
    const [tab, setTab] = useState<'items' | 'lists'>('items')
    const tasks = useArchivedTasks()
    const sections = useArchivedSections()

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center bg-black/30 pt-[8vh]"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="flex max-h-[80vh] w-[min(560px,92vw)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
                <div className="flex items-center border-b border-stone-200 px-5 py-4">
                    <span className="text-base font-semibold text-stone-900">Archive</span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="ml-auto grid h-7 w-7 place-items-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* compact left-aligned segmented tabs */}
                <div className="mx-5 mt-4 mb-1 inline-flex self-start overflow-hidden rounded-lg border border-stone-200">
                    {(['items', 'lists'] as const).map((t, i) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={clsx(
                                'px-4 py-1.5 text-xs transition',
                                i > 0 && 'border-l border-stone-200',
                                tab === t
                                    ? 'bg-stone-100 text-stone-900'
                                    : 'text-stone-500 hover:text-stone-700',
                            )}
                        >
                            {t === 'items' ? 'Archived items' : 'Archived lists'}
                        </button>
                    ))}
                </div>

                <div className="overflow-y-auto px-5 pt-2 pb-5">
                    {tab === 'items' ? (
                        tasks.length ? (
                            tasks.map((t) => (
                                <ViewArchiveRow
                                    key={t.id}
                                    text={t.title}
                                    kind="item"
                                    onRestore={() => restoreTask(t.id)}
                                    onDelete={() => deleteTask(t.id)}
                                />
                            ))
                        ) : (
                            <p className="py-4 text-sm text-stone-400 italic">No archived items.</p>
                        )
                    ) : sections.length ? (
                        sections.map((s) => (
                            <ViewArchiveRow
                                key={s.id}
                                text={s.title}
                                kind="list"
                                onRestore={() => restoreSection(s.id)}
                                onDelete={() => deleteSection(s.id)}
                            />
                        ))
                    ) : (
                        <p className="py-4 text-sm text-stone-400 italic">No archived lists.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

// One archived row. `confirming` swaps the trailing controls for an inline
// "Delete permanently? Yes / Cancel" prompt.
function ViewArchiveRow({
    text,
    kind,
    onRestore,
    onDelete,
}: {
    text: string
    kind: 'item' | 'list'
    onRestore: () => void
    onDelete: () => void
}) {
    const [confirming, setConfirming] = useState(false)
    const isList = kind === 'list'
    const wrap = isList
        ? 'group mb-2 flex items-center rounded-lg border border-stone-200 px-3.5 py-3'
        : 'group flex items-center border-b border-stone-100 py-2.5'

    if (confirming) {
        return (
            <div className={wrap}>
                {!isList && (
                    <span className="mr-3 h-4 w-4 shrink-0 rounded-full border-2 border-stone-300" />
                )}
                <span
                    className={clsx(
                        'flex-1 text-base text-stone-400 line-through',
                        isList && 'font-medium',
                    )}
                >
                    {text}
                </span>
                <span className="text-sm text-stone-500">Delete permanently?</span>
                <button
                    onClick={onDelete}
                    className="ml-3 cursor-pointer rounded-md px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                    Yes
                </button>
                <button
                    onClick={() => setConfirming(false)}
                    className="ml-1 cursor-pointer rounded-md px-2 py-1 text-sm text-stone-500 hover:bg-stone-100"
                >
                    Cancel
                </button>
            </div>
        )
    }

    return (
        <div className={wrap}>
            {!isList && (
                <span className="mr-3 h-4 w-4 shrink-0 rounded-full border-2 border-stone-400" />
            )}
            <span
                className={clsx(
                    'flex-1 text-base',
                    isList ? 'font-medium text-stone-700' : 'text-stone-900',
                )}
            >
                {text}
            </span>
            <button
                onClick={onRestore}
                className="ml-2 inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-indigo-600 transition hover:bg-indigo-50"
            >
                <ArchiveRestore className="size-3.5" />
                restore
            </button>
            <button
                onClick={() => setConfirming(true)}
                aria-label="Delete permanently"
                className="ml-1 shrink-0 cursor-pointer rounded-md p-1.5 text-red-700 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-red-50 focus-visible:opacity-100"
            >
                <Trash2 className="size-4" />
            </button>
        </div>
    )
}

export default ViewApp
