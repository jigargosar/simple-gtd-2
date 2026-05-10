import { clsx } from 'clsx'
import { useState } from 'react'
import {
    appendTask,
    deleteTask,
    type Section,
    type Task,
    toggleTask,
    useSections,
    useSectionTasks,
} from './store'

function ViewApp() {
    return (
        <div className="min-h-screen bg-gray-400">
            <ViewHeader />
            <ViewSections />
        </div>
    )
}

function ViewHeader() {
    return (
        <header className="border-b border-gray-400 bg-gray-300 px-6 py-5">
            <div className="mx-auto max-w-2xl">
                <span className="text-xl font-semibold tracking-tight text-gray-950">
                    SimpleGTD
                </span>
            </div>
        </header>
    )
}

function ViewSections() {
    const sections = useSections()

    return (
        <div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
            {sections.map((section) => (
                <ViewSection key={section.id} section={section} />
            ))}
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useSectionTasks(section.id)

    return (
        <div className="flex flex-col">
            <h2 className="pt-10 pb-3 text-xs font-semibold tracking-widest text-gray-600 uppercase">
                {section.title}
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                {tasks.length === 0 && <ViewEmptySection />}
                {tasks.map((task) => (
                    <ViewTask key={task.id} task={task} />
                ))}
                <div className="border-t border-gray-100 px-5 py-2.5">
                    <ViewAddTask sectionId={section.id} />
                </div>
            </div>
        </div>
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-500">No tasks yet.</p>
}

function ViewTask({ task: { done, id, title } }: { task: Task }) {
    return (
        <div className="group flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0">
            <ViewTaskDoneMarker done={done} onClick={() => toggleTask(id)} />
            <ViewTaskTitle done={done} title={title} />
            <ViewDeleteTaskIcon onClick={() => deleteTask(id)} />
        </div>
    )
}

function ViewTaskDoneMarker(props: { done: boolean; onClick: () => void }) {
    return (
        <button
            onClick={props.onClick}
            className={clsx(
                'h-5 w-5 shrink-0 cursor-pointer rounded-full border',
                props.done ? 'border-accent bg-accent' : 'border-gray-400',
            )}
        />
    )
}

function ViewTaskTitle(props: { done: boolean; title: string }) {
    function onPointerDown() {}
    return (
        <span
            onPointerDown={onPointerDown}
            className={clsx(props.done ? 'text-gray-500 line-through decoration-gray-400' : 'text-gray-900')}
        >
            {props.title}
        </span>
    )
}

function ViewDeleteTaskIcon(props: { onClick: () => void }) {
    return (
        <button
            onClick={props.onClick}
            className="ml-auto text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
        >
            ✕
        </button>
    )
}

function ViewAddTask({ sectionId }: { sectionId: string }) {
    const [value, setValue] = useState('')

    function submit() {
        const trimmed = value.trim()
        if (!trimmed) return
        appendTask(sectionId, trimmed)
        setValue('')
    }

    return (
        <div className="flex items-center gap-3">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Add task…"
                className="flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
                onClick={submit}
                className="text-accent text-sm font-medium"
            >
                Add
            </button>
        </div>
    )
}

export default ViewApp
