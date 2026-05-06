import { clsx } from 'clsx'
import { useState } from 'react'
import {
    appendTask,
    deleteTask,
    moveSection,
    moveTask,
    type Section,
    type Task,
    toggleTask,
    useSections,
    useSectionTasks,
} from './store'
import { Sortable, SortableBeacon, SortableSource } from './sortable'

// ---------- App root ----------

function ViewApp() {
    return (
        <Sortable>
            <div className="min-h-screen bg-gray-50">
                <ViewHeader />
                <ViewSections />
            </div>
        </Sortable>
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

function ViewSections() {
    const sections = useSections()

    return (
        <div className="mx-auto flex max-w-xl flex-col px-4 py-8">
            <SectionBeacon
                beforeOrder={null}
                afterOrder={sections[0]?.order ?? null}
            />
            {sections.map((section, i) => (
                <div key={section.id} className="flex flex-col">
                    <ViewSection section={section} />
                    <SectionBeacon
                        beforeOrder={section.order}
                        afterOrder={sections[i + 1]?.order ?? null}
                    />
                </div>
            ))}
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useSectionTasks(section.id)

    return (
        <SortableSource tag="section" id={section.id}>
            <div className="flex flex-col">
                <h2 className="pt-6 pb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                    {section.title}
                </h2>
                {tasks.length === 0 && <ViewEmptySection />}
                <TaskBeacon
                    sectionId={section.id}
                    beforeOrder={null}
                    afterOrder={tasks[0]?.order ?? null}
                />
                {tasks.map((task, i) => (
                    <div key={task.id} className="flex flex-col">
                        <ViewTask task={task} />
                        <TaskBeacon
                            sectionId={section.id}
                            beforeOrder={task.order}
                            afterOrder={tasks[i + 1]?.order ?? null}
                        />
                    </div>
                ))}
                <ViewAddTask sectionId={section.id} />
            </div>
        </SortableSource>
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-300">No tasks yet.</p>
}

// ---------- Tasks ----------

function ViewTask({ task: { done, id, title } }: { task: Task }) {
    return (
        <SortableSource tag="task" id={id}>
            <div className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
                <ViewTaskDoneMarker done={done} onClick={() => toggleTask(id)} />
                <ViewTaskTitle done={done} title={title} />
                <ViewDeleteTaskIcon onClick={() => deleteTask(id)} />
            </div>
        </SortableSource>
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

function SectionBeacon({
    beforeOrder,
    afterOrder,
}: {
    beforeOrder: string | null
    afterOrder: string | null
}) {
    return (
        <SortableBeacon
            tag="section"
            onDrop={(src) => moveSection({ id: src.id, beforeOrder, afterOrder })}
            className="flex h-2 items-center opacity-15 transition-opacity duration-150 data-[active]:opacity-100"
        >
            <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <div className="h-0.5 flex-1 rounded-full bg-amber-400" />
            <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
        </SortableBeacon>
    )
}

function TaskBeacon({
    sectionId,
    beforeOrder,
    afterOrder,
}: {
    sectionId: string
    beforeOrder: string | null
    afterOrder: string | null
}) {
    return (
        <SortableBeacon
            tag="task"
            onDrop={(src) =>
                moveTask({ id: src.id, sectionId, beforeOrder, afterOrder })
            }
            className="flex h-2 items-center opacity-15 transition-opacity duration-150 data-[active]:opacity-100"
        >
            <div className="bg-accent h-2 w-2 shrink-0 rounded-full" />
            <div className="bg-accent h-0.5 flex-1 rounded-full" />
            <div className="bg-accent h-2 w-2 shrink-0 rounded-full" />
        </SortableBeacon>
    )
}

export default ViewApp
