import { clsx } from 'clsx'
import { useState } from 'react'
import {
    appendTask,
    deleteTask,
    type Section,
    type Task,
    toggleTask,
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
            <h2 className="mb-3 text-xs font-semibold tracking-wider text-stone-600 uppercase">
                {section.title}
                {pending > 0 && (
                    <span className="ml-2 font-normal tabular-nums text-stone-500">
                        · {pending}
                    </span>
                )}
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
            <ViewTitle done={task.done} title={task.title} />
            <ViewDeleteBtn onClick={() => setRemoving(true)} />
        </li>
    )
}

function ViewCheckbox({ done, onClick }: { done: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            aria-label={done ? 'Mark not done' : 'Mark done'}
            className={clsx(
                'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 p-0 transition',
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

function ViewTitle({ done, title }: { done: boolean; title: string }) {
    return (
        <span
            className={clsx(
                'block min-w-0 flex-1 text-base transition',
                done ? 'text-stone-500 line-through' : 'text-stone-900',
            )}
        >
            {title}
        </span>
    )
}

function ViewDeleteBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-red-700 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none group-focus-within:opacity-100"
        >
            Trash
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
            <span className="flex h-5 w-5 shrink-0 items-center justify-center text-base leading-none text-stone-500 transition select-none group-focus-within:text-accent">
                +
            </span>
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') submit()
                }}
                placeholder="Add a task…"
                className="min-w-0 flex-1 border-none bg-transparent text-base text-stone-900 caret-accent outline-none placeholder:text-stone-500"
            />
            {value.trim() && (
                <button
                    onClick={submit}
                    className="shrink-0 cursor-pointer rounded-full bg-accent px-3 py-1 text-xs font-medium text-white transition hover:opacity-85"
                >
                    Add
                </button>
            )}
        </li>
    )
}

export default ViewApp
