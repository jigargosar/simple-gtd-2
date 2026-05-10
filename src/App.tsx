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
        <div className="min-h-screen bg-gray-50">
            <ViewHeader />
            <ViewSections />
        </div>
    )
}

function ViewHeader() {
    return (
        <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="mx-auto max-w-xl">
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
        <div className="mx-auto flex max-w-xl flex-col px-4 py-8">
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
            <h2 className="pt-6 pb-2 text-xs font-semibold tracking-widest text-gray-600 uppercase">
                {section.title}
            </h2>
            {tasks.length === 0 && <ViewEmptySection />}
            {tasks.map((task) => (
                <ViewTask key={task.id} task={task} />
            ))}
            <ViewAddTask sectionId={section.id} />
        </div>
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-500">No tasks yet.</p>
}

function ViewTask({ task: { done, id, title } }: { task: Task }) {
    return (
        <div className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
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
                'h-4 w-4 shrink-0 cursor-pointer rounded-full border-2',
                props.done ? 'border-accent bg-accent' : 'border-gray-500',
            )}
        />
    )
}

function ViewTaskTitle(props: { done: boolean; title: string }) {
    function onPointerDown() {}
    return (
        <span
            onPointerDown={onPointerDown}
            className={clsx(props.done ? 'text-gray-500 line-through' : 'text-gray-900')}
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
        <div className="flex items-center gap-2">
            <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Add task…"
                className="focus:border-accent flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            <button
                onClick={submit}
                className="bg-accent rounded-lg px-3 py-2 text-sm font-medium text-white"
            >
                Add
            </button>
        </div>
    )
}

export default ViewApp
