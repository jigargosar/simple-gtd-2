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
import { useSortable } from './useSortable'

// ---------- App root ----------

function ViewApp() {
    const sections = useSections()
    // useNearestBeaconTracker()

    return (
        <div className="min-h-screen bg-gray-50">
            <ViewHeader />
            <ViewSections sections={sections} />
        </div>
    )
}

function ViewHeader() {
    return (
        <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="mx-auto max-w-xl">
                <span className="text-lg font-semibold tracking-tight text-gray-800">
                    SimpleGTD
                </span>
            </div>
        </header>
    )
}

// ---------- Sections ----------

function ViewSections({ sections }: { sections: Section[] }) {
    const containerRef = useRef<HTMLDivElement>(null)
    useSortable({
        containerRef,
        onDragStart: (info) => {
            console.log('[ViewSections] drag start', info)
            return {
                onMove: (e) => console.log('[ViewSections] move', info.tag, e.clientX, e.clientY),
                onDrop: (e) => console.log('[ViewSections] drop', info.tag, e.clientX, e.clientY),
                onCancel: () => console.log('[ViewSections] cancel', info.tag),
            }
        },
    })

    return (
        <div ref={containerRef} className="mx-auto flex max-w-xl flex-col px-4 py-8">
            <SectionBeacon />
            {sections.map((section) => (
                <div key={section.id} className="flex flex-col">
                    <ViewSection section={section} />
                    <SectionBeacon />
                </div>
            ))}
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useSectionTasks(section.id)

    return (
        <div className="flex flex-col" data-drag-source data-drag-tag="section" data-drag-id={section.id}>
            <h2 className="pt-6 pb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                {section.title}
            </h2>
            {tasks.length === 0 && <ViewEmptySection />}
            <TaskBeacon />
            {tasks.map((task) => (
                <div key={task.id} className="flex flex-col">
                    <ViewTask task={task} />
                    <TaskBeacon />
                </div>
            ))}
            <ViewAddTask sectionId={section.id} />
        </div>
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-300">No tasks yet.</p>
}

// ---------- Tasks ----------

function ViewTask({ task: { done, id, title } }: { task: Task }) {
    return (
        <div
            className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm"
            data-drag-source
            data-drag-tag="task"
            data-drag-id={id}
        >
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
                props.done ? 'border-accent bg-accent' : 'border-gray-300',
            )}
        />
    )
}

function ViewTaskTitle(props: { done: boolean; title: string }) {
    return (
        <span className={clsx(props.done ? 'text-gray-400 line-through' : 'text-gray-700')}>
            {props.title}
        </span>
    )
}

function ViewDeleteTaskIcon(props: { onClick: () => void }) {
    return (
        <button
            onClick={props.onClick}
            className="ml-auto text-gray-200 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
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
                className="focus:border-accent flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-300"
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

// ---------- Beacons ----------

type BeaconKind = { kind: 'section' | 'task' }

function Beacon({ kind }: BeaconKind) {
    const color = kind === 'section' ? 'bg-amber-400' : 'bg-accent'
    return (
        <div
            data-sortable-kind={kind}
            className="flex h-2 items-center opacity-15 transition-opacity duration-150 data-[active=true]:opacity-100"
        >
            <div className={clsx('h-2 w-2 shrink-0 rounded-full', color)} />
            <div className={clsx('h-0.5 flex-1 rounded-full', color)} />
            <div className={clsx('h-2 w-2 shrink-0 rounded-full', color)} />
        </div>
    )
}

function SectionBeacon() {
    return <Beacon kind="section" />
}

function TaskBeacon() {
    return <Beacon kind="task" />
}

export default ViewApp
