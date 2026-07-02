import { PointerActivationConstraints, PointerSensor } from '@dnd-kit/dom'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { clsx } from 'clsx'
import {
    Archive,
    ArchiveRestore,
    ChevronDown,
    ChevronRight,
    Download,
    FolderInput,
    GripVertical,
    MoreHorizontal,
    Plus,
    RotateCcw,
    Trash2,
    Upload,
    X,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useEditInput } from './hooks'
import {
    appendSection,
    appendTask,
    archiveSection,
    archiveTask,
    deleteSection,
    deleteTask,
    exportData,
    loadRaw,
    parseData,
    type ParsedData,
    reorderSection,
    reorderTask,
    resetToDefaults,
    restoreSection,
    restoreTask,
    type Section,
    type Task,
    setTaskSection,
    toggleSectionCollapsed,
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

// Tasks drag anywhere on the row (the grip icon is a visual affordance, not the
// activation target). Mouse/trackpad: press and move
// (a hold gesture is awkward on tap-to-click trackpads); a still click stays a
// click, so click-to-edit survives. Touch: long-press, because press-and-move
// must keep scrolling; pointer wander past the tolerance aborts the hold.
// preventActivation exempts presses on real controls so holding a button or
// selecting text in an editor never starts a drag.
const taskRowSensors = [
    PointerSensor.configure({
        activationConstraints: (event) =>
            event.pointerType === 'touch'
                ? [new PointerActivationConstraints.Delay({ value: 250, tolerance: 10 })]
                : [new PointerActivationConstraints.Distance({ value: 8 })],
        preventActivation: (event) =>
            event.target instanceof Element && event.target.closest('button, input') !== null,
    }),
]

function ViewApp() {
    return (
        <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 sm:px-6 sm:pt-10">
            <div className="rounded-2xl border border-stone-200 bg-white px-5 py-8 shadow-sm sm:px-8">
                <ViewHeader />
                <ViewBoard />
            </div>
            {import.meta.env.DEV && <ViewDevOverlay />}
        </div>
    )
}

// Dev-only floating overlay, guarded by import.meta.env.DEV at the mount site so
// production builds dead-code-eliminate it. To remove: delete this component and
// its one-line mount in ViewApp.
function ViewDevOverlay() {
    return (
        <div className="fixed right-4 bottom-4 z-40">
            <button
                onClick={resetToDefaults}
                title="Reset all data to the default lists"
                className="flex cursor-pointer items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 shadow-lg transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
                <RotateCcw className="size-4" />
                Reset
            </button>
        </div>
    )
}

function ViewHeader() {
    return (
        <header className="flex items-center justify-between pb-8">
            <span className="text-xl font-bold tracking-tight text-stone-900">
                SimpleGTD<span className="text-accent">.</span>
            </span>
            <ViewMenu />
        </header>
    )
}

function ViewBoard() {
    const sections = useSections()
    // @dnd-kit/react's optimistic-sort plugin mutates the DOM directly while dragging
    // across droppable groups (moving a task into another section's <ul>). Left alone,
    // React loses track of that node on the next reconciliation and throws on
    // removeChild. We let the plugin drive the full drag visually, then on drop put the
    // dragged element back under its pre-drag parent (undoing the plugin's raw DOM move)
    // before applying our own state update — handing reconciliation back to React
    // cleanly. flushSync forces that swap to be synchronous so there's no flash.
    // (github.com/clauderic/dnd-kit#1747)
    const dragSourceParent = useRef<Element | null>(null)
    return (
        <DragDropProvider
            onDragStart={(event) => {
                dragSourceParent.current = event.operation.source?.element?.parentElement ?? null
            }}
            onDragEnd={(event) => {
                const sourceElement = event.operation.source?.element
                const prevParent = dragSourceParent.current
                dragSourceParent.current = null
                if (sourceElement && prevParent && sourceElement.parentElement !== prevParent) {
                    prevParent.appendChild(sourceElement)
                }
                if (event.canceled) return
                const { source } = event.operation
                if (!isSortable(source)) return
                flushSync(() => {
                    if (source.type === 'section') {
                        reorderSection(String(source.id), source.index)
                    } else {
                        reorderTask(String(source.id), String(source.group), source.index)
                    }
                })
            }}
        >
            <main className="flex flex-col gap-10">
                {sections.map((section, index) => (
                    <ViewSection key={section.id} section={section} index={index} />
                ))}
                <ViewAddSection />
            </main>
        </DragDropProvider>
    )
}

// Top-right menu: holds the show-completed toggle and the Archive entry.
// Keeps the active view's top area to a single control and gives archive a home.
function ViewMenu() {
    const showDone = useShowDone()
    const [open, setOpen] = useState(false)
    const [archiveOpen, setArchiveOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importState, setImportState] = useState<ParsedData | null>(null)

    return (
        <div>
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
                            <div className="my-1 h-px bg-stone-100" />
                            <button
                                onClick={() => {
                                    exportData()
                                    setOpen(false)
                                }}
                                className="focus-visible:ring-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Download className="size-4 text-stone-500" />
                                Export data
                            </button>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="focus-visible:ring-accent flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                <Upload className="size-4 text-stone-500" />
                                Import data…
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/json"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    e.target.value = ''
                                    if (!file) return
                                    file.text().then((text) => {
                                        setImportState(parseData(text))
                                        setOpen(false)
                                    })
                                }}
                            />
                        </div>
                    </>
                )}
            </div>

            {archiveOpen && <ViewArchiveDialog onClose={() => setArchiveOpen(false)} />}
            {importState && (
                <ViewImportDialog state={importState} onClose={() => setImportState(null)} />
            )}
        </div>
    )
}

// Import replaces all current data, so it always confirms first — same bar as the
// archive dialog's permanent-delete confirm. `result` starts as the parsed state and
// flips to an error in place if `loadRaw` rejects it on Replace (defense in depth:
// commit re-validates from `rawString` rather than trusting this preview parse).
function ViewImportDialog({ state, onClose }: { state: ParsedData; onClose: () => void }) {
    const [result, setResult] = useState(state)

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="flex max-h-[80vh] min-h-[30vh] w-[min(480px,92vw)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
                <div className="flex items-center border-b border-stone-200 px-5 py-4">
                    <span className="text-base font-semibold text-stone-900">Import data</span>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="ml-auto grid h-7 w-7 place-items-center rounded-md text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {result.tag === 'error' ? (
                    <>
                        <p className="flex-1 px-5 pt-4 text-sm text-stone-700">{result.message}</p>
                        <div className="flex justify-end px-5 py-4">
                            <button
                                onClick={onClose}
                                className="focus-visible:ring-accent cursor-pointer rounded-md px-3 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                OK
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="px-5 pt-4 pb-1 text-sm text-stone-700">
                            Replace all current data with {result.preview.summary.sections} lists,{' '}
                            {result.preview.summary.tasks} tasks?
                        </p>
                        <pre className="mx-5 mt-2 flex-1 overflow-y-auto rounded-lg bg-stone-50 p-3 font-mono text-xs whitespace-pre-wrap wrap-anywhere text-stone-600">
                            {result.preview.tree}
                        </pre>
                        <div className="flex justify-end gap-2 px-5 py-4">
                            <button
                                onClick={onClose}
                                className="focus-visible:ring-accent cursor-pointer rounded-md px-3 py-1.5 text-sm text-stone-500 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    const error = loadRaw(result.rawString)
                                    if (error) setResult({ tag: 'error', message: error })
                                    else onClose()
                                }}
                                className="cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                            >
                                Replace
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function ViewSection({ section, index }: { section: Section; index: number }) {
    const tasks = useVisibleSectionTasks(section.id)
    const [editingTitle, setEditingTitle] = useState(false)
    const { ref, handleRef, isDragging } = useSortable({
        id: section.id,
        index,
        group: 'sections',
        type: 'section',
        accept: 'section',
    })

    return (
        <div
            ref={ref}
            className={clsx('flex flex-col gap-4 transition', isDragging && 'opacity-50')}
        >
            <div className="group flex items-center gap-3 border-b border-stone-200 pb-2">
                {editingTitle ? (
                    <>
                        {/* Spacers stand in for the drag handle and chevron so the
                            editor input opens exactly where the title text sits. */}
                        <span className="h-6 w-6 shrink-0" />
                        <span className="h-6 w-6 shrink-0" />
                        <ViewSectionTitleEditor
                            title={section.title}
                            onSave={(next) => {
                                updateSectionTitle(section.id, next)
                                setEditingTitle(false)
                            }}
                            onCancel={() => setEditingTitle(false)}
                        />
                    </>
                ) : (
                    <>
                        <button
                            ref={handleRef}
                            aria-label="Drag to reorder"
                            className="focus-visible:ring-accent shrink-0 cursor-grab touch-none rounded-md p-1 text-stone-400 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-100 hover:text-stone-600 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        >
                            <GripVertical className="size-4" />
                        </button>
                        <ViewCollapseBtn
                            collapsed={section.collapsed}
                            onClick={() => toggleSectionCollapsed(section.id)}
                        />
                        <span
                            onClick={() => setEditingTitle(true)}
                            className="flex-1 cursor-text px-2 text-lg font-bold wrap-anywhere text-stone-800 transition"
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
            {!section.collapsed && (
                <ul>
                    {tasks.map((task, index) => (
                        <ViewTask key={task.id} task={task} index={index} />
                    ))}
                    <ViewAddTask sectionId={section.id} />
                </ul>
            )}
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
            className="focus-visible:ring-accent caret-accent min-w-0 flex-1 rounded-md border-none bg-transparent px-2 text-lg font-bold text-stone-800 transition outline-none placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
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
            {/* Spacer holds the drag-handle column so the + and input line up with
                section headers. */}
            <span className="h-6 w-6 shrink-0" />
            <span className="group-focus-within:text-accent grid h-6 w-6 shrink-0 place-items-center text-stone-500 transition select-none">
                <Plus className="size-5" />
            </span>
            <input
                {...editProps}
                placeholder="New section…"
                className="focus-visible:ring-accent caret-accent min-w-0 flex-1 rounded-md border-none bg-transparent pl-2 text-lg font-bold text-stone-800 transition outline-none placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
        </div>
    )
}

function ViewTask({ task, index }: { task: Task; index: number }) {
    const [editing, setEditing] = useState(false)
    const { ref, isDragging } = useSortable({
        id: task.id,
        index,
        group: task.sectionId,
        type: 'task',
        accept: 'task',
        sensors: taskRowSensors,
    })

    return (
        <li
            ref={ref}
            className={clsx(
                'group flex items-start gap-3 rounded-lg py-2 transition hover:bg-stone-100',
                isDragging && 'opacity-50',
            )}
        >
            {/* Always-visible grab affordance. Decorative span, not a button — the
                whole row drags (preventActivation would swallow a button press),
                this just marks where to grab; touch-none makes touch long-press
                reliable here. */}
            <span className="grid h-6 w-6 shrink-0 cursor-grab touch-none place-items-center text-stone-400">
                <GripVertical className="size-4" />
            </span>
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
            className="group/check focus-visible:ring-accent grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-full transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <span
                className={clsx(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 transition',
                    done
                        ? 'border-accent bg-accent'
                        : 'group-hover/check:border-accent border-stone-500 bg-transparent',
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
            </span>
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

// Section disclosure toggle. Sits left of the title; folding persists on the
// section (survives reload). Its own button so the title-span click still edits.
function ViewCollapseBtn({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
    const Icon = collapsed ? ChevronRight : ChevronDown
    return (
        <button
            onClick={onClick}
            aria-label={collapsed ? 'Expand section' : 'Collapse section'}
            className="focus-visible:ring-accent grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded-md text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <Icon className="size-5" />
        </button>
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
        <li className="group flex items-center gap-3 rounded-lg py-2 transition focus-within:bg-stone-100">
            {/* Spacer holds the drag-handle column so the ghost checkbox and input
                line up with real task rows. */}
            <span className="h-6 w-6 shrink-0" />
            {/* Decorative ghost checkbox: previews the row an entry will become.
                Dotted at rest, solid while the input has focus. */}
            <span className="grid h-6 w-6 shrink-0 place-items-center">
                <span className="h-5 w-5 rounded-full border-2 border-dotted border-stone-400 transition group-focus-within:border-solid group-focus-within:border-stone-500" />
            </span>
            <input
                {...editProps}
                className={clsx(
                    titleBox,
                    'caret-accent focus-visible:ring-accent border-none bg-transparent text-stone-900 transition outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="flex max-h-[80vh] min-h-[30vh] w-[min(560px,92vw)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl">
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
