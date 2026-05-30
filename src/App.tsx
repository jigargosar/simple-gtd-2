import { clsx } from 'clsx'
import { ArchiveRestore, Pencil, Plus, Trash2 } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useEditInput } from './hooks'
import {
    appendSection,
    appendTask,
    archiveSection,
    archiveTask,
    deleteSectionForever,
    deleteTaskForever,
    restoreSection,
    restoreTask,
    type Section,
    setVm,
    type Task,
    toggleShowDone,
    toggleTask,
    updateSectionTitle,
    updateTaskTitle,
    useArchivedSections,
    useArchivedTasks,
    useSections,
    useSectionPendingCount,
    useVisibleSectionTasks,
    useVm,
} from './store'

function assertNever(value: never): never {
    throw new Error(`unreachable: ${String(value)}`)
}

function ViewApp() {
    return (
        <>
            <ViewHeader />
            <ViewBody />
        </>
    )
}

function ViewHeader() {
    return (
        <header className="anim-header px-6 pt-12 pb-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
                <span className="text-sm font-semibold tracking-tight text-stone-900">
                    SimpleGTD
                </span>
                <ViewTabs />
            </div>
        </header>
    )
}

function ViewTabs() {
    const vm = useVm()
    return (
        <nav className="flex items-center gap-1">
            <ViewTab
                label="Board"
                active={vm.tag === 'board'}
                onClick={() => setVm({ tag: 'board', showDone: false })}
            />
            <ViewTab
                label="Archived tasks"
                active={vm.tag === 'archivedTasks'}
                onClick={() => setVm({ tag: 'archivedTasks' })}
            />
            <ViewTab
                label="Archived sections"
                active={vm.tag === 'archivedSections'}
                onClick={() => setVm({ tag: 'archivedSections' })}
            />
        </nav>
    )
}

function ViewTab({
    label,
    active,
    onClick,
}: {
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'focus-visible:ring-accent cursor-pointer rounded-md px-2.5 py-1 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                active
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700',
            )}
        >
            {label}
        </button>
    )
}

function ViewMain({ children }: { children: ReactNode }) {
    return <main className="mx-auto max-w-2xl px-6 pb-24">{children}</main>
}

function ViewBody() {
    const vm = useVm()
    switch (vm.tag) {
        case 'board':
            return <ViewBoard />
        case 'archivedTasks':
            return <ViewArchivedTasks />
        case 'archivedSections':
            return <ViewArchivedSections />
        default:
            return assertNever(vm)
    }
}

function ViewBoard() {
    const sections = useSections()
    return (
        <ViewMain>
            <ViewDoneToggle />
            <div className="flex flex-col gap-10">
                {sections.map((section, i) => (
                    <ViewSection
                        key={section.id}
                        section={section}
                        animDelay={Math.min(i, 6) * 60}
                    />
                ))}
                <ViewAddSection />
            </div>
        </ViewMain>
    )
}

// Constant label, state encoded by the checkbox — no state-vs-action ambiguity, and
// the width never changes (so no layout shift). Lives in the board, not the header.
function ViewDoneToggle() {
    const vm = useVm()
    const on = vm.tag === 'board' && vm.showDone
    return (
        <div className="mb-6 flex justify-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-stone-600 select-none">
                <input
                    type="checkbox"
                    checked={on}
                    onChange={toggleShowDone}
                    className="accent-accent h-4 w-4 cursor-pointer"
                />
                Show completed
            </label>
        </div>
    )
}

function ViewSection({ section, animDelay }: { section: Section; animDelay: number }) {
    const tasks = useVisibleSectionTasks(section.id)
    const pending = useSectionPendingCount(section.id)
    const [exiting, setExiting] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)

    // The board shows only live sections; archiving slides the section out, then
    // archives it (which moves it to the Archived sections view).
    return (
        <div
            className={clsx('anim-section flex flex-col gap-4 transition', exiting && 'anim-out')}
            style={{ animationDelay: `${animDelay}ms` }}
            onAnimationEnd={(e) => {
                if (e.animationName === 'task-out' && exiting) archiveSection(section.id)
            }}
        >
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
                        <div className="flex flex-1 items-baseline gap-2">
                            <span
                                onClick={() => setEditingTitle(true)}
                                className="wrap-anywhere cursor-text pl-2 text-lg font-bold text-stone-500 transition"
                            >
                                {section.title}
                            </span>
                            <span className="text-sm font-medium text-stone-600 tabular-nums">
                                ·{' '}
                                <span key={pending} className="anim-count-pulse">
                                    {pending}
                                </span>
                            </span>
                        </div>
                        <ViewEditBtn onClick={() => setEditingTitle(true)} />
                        <ViewDeleteBtn onClick={() => setExiting(true)} />
                    </>
                )}
            </div>
            <ul>
                {tasks.map((task, i) => (
                    <ViewTask key={task.id} task={task} taskIndex={i} />
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

function ViewTask({ task, taskIndex }: { task: Task; taskIndex: number }) {
    const [exiting, setExiting] = useState(false)
    const [editing, setEditing] = useState(false)

    // The board shows only live tasks; archiving slides the task out, then archives
    // it (which moves it to the Archived tasks view).
    return (
        <li
            className={clsx(
                'anim-task group flex items-center gap-3 py-2 transition hover:bg-stone-100/60',
                exiting && 'anim-out',
            )}
            style={{ animationDelay: `${Math.min(taskIndex, 8) * 30}ms` }}
            // Known issue, won't fix: the exit removal depends on the animation firing.
            onAnimationEnd={(e) => {
                if (e.animationName === 'task-out' && exiting) archiveTask(task.id)
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
                    <ViewDeleteBtn onClick={() => setExiting(true)} />
                </>
            )}
        </li>
    )
}

// --- Archive views (scaffolding) -------------------------------------------------

function ViewArchivedTasks() {
    const tasks = useArchivedTasks()
    return (
        <ViewMain>
            {tasks.length === 0 ? (
                <ViewArchiveEmpty label="No archived tasks." />
            ) : (
                <ul>
                    {tasks.map((task, i) => (
                        <li
                            key={task.id}
                            className="anim-task group flex items-center gap-3 border-b border-stone-200 py-2 opacity-70"
                            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                        >
                            <span className="wrap-anywhere flex-1 px-2 text-base text-stone-600">
                                <span className={clsx('strike', task.done && 'is-done')}>
                                    {task.title}
                                </span>
                            </span>
                            <ViewRestoreBtn onClick={() => restoreTask(task.id)} />
                            <ViewDeleteBtn onClick={() => deleteTaskForever(task.id)} />
                        </li>
                    ))}
                </ul>
            )}
        </ViewMain>
    )
}

function ViewArchivedSections() {
    const sections = useArchivedSections()
    return (
        <ViewMain>
            {sections.length === 0 ? (
                <ViewArchiveEmpty label="No archived sections." />
            ) : (
                <ul>
                    {sections.map((section, i) => (
                        <li
                            key={section.id}
                            className="anim-section group flex items-center gap-3 border-b border-stone-200 py-2 opacity-70"
                            style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}
                        >
                            <span className="wrap-anywhere flex-1 px-2 text-lg font-bold text-stone-500">
                                {section.title}
                            </span>
                            <ViewRestoreBtn onClick={() => restoreSection(section.id)} />
                            <ViewDeleteBtn onClick={() => deleteSectionForever(section.id)} />
                        </li>
                    ))}
                </ul>
            )}
        </ViewMain>
    )
}

function ViewArchiveEmpty({ label }: { label: string }) {
    return <p className="py-8 text-center text-sm text-stone-500">{label}</p>
}

// --- Shared task/section bits ----------------------------------------------------

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
                    className="dot-pop block shrink-0"
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

function ViewRestoreBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            title="Restore"
            className="focus-visible:ring-accent shrink-0 cursor-pointer rounded-md p-1 text-stone-600 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-200 focus-visible:bg-stone-200 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
            <ArchiveRestore className="size-4" />
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
