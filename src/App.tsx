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
import {
    Ghost,
    SortableProvider,
    useDraggable,
    useDroppable,
    type DropEvent,
} from './sortable'

type SectionGap = { kind: 'section-gap'; beforeOrder: string | null; afterOrder: string | null }
type TaskGap = {
    kind: 'task-gap'
    sectionId: string
    beforeOrder: string | null
    afterOrder: string | null
}
type DroppableData = SectionGap | TaskGap

function assertNever(value: never): never {
    throw new Error(`unreachable: ${JSON.stringify(value)}`)
}

function handleDrop(e: DropEvent) {
    const data = e.droppable.data as DroppableData
    switch (data.kind) {
        case 'section-gap':
            moveSection({
                id: e.draggable.id,
                beforeOrder: data.beforeOrder,
                afterOrder: data.afterOrder,
            })
            return
        case 'task-gap':
            moveTask({
                id: e.draggable.id,
                sectionId: data.sectionId,
                beforeOrder: data.beforeOrder,
                afterOrder: data.afterOrder,
            })
            return
        default:
            return assertNever(data)
    }
}

function ViewApp() {
    return (
        <SortableProvider onDrop={handleDrop}>
            <div className="min-h-screen bg-gray-50">
                <ViewHeader />
                <ViewSections />
            </div>
            <DragGhost />
        </SortableProvider>
    )
}

function DragGhost() {
    return <Ghost><DragGhostBody /></Ghost>
}

function DragGhostBody() {
    // Ghost only renders while dragging; the consumer can pick any presentation.
    // For now: a simple translucent placeholder that mirrors the source's width.
    return <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-lg" />
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

function ViewSections() {
    const sections = useSections()

    return (
        <div className="mx-auto flex max-w-xl flex-col px-4 py-8">
            <SectionGapBeacon
                beforeOrder={null}
                afterOrder={sections[0]?.order ?? null}
            />
            {sections.map((section, i) => (
                <div key={section.id} className="flex flex-col">
                    <ViewSection section={section} />
                    <SectionGapBeacon
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
    const { isDragging, rootProps } = useDraggable({
        id: section.id,
        tag: 'section',
        data: null,
    })

    return (
        <div
            {...rootProps}
            style={
                isDragging
                    ? { outline: '2px dashed dodgerblue', outlineOffset: '-2px' }
                    : undefined
            }
        >
            <div style={isDragging ? { visibility: 'hidden' } : undefined}>
                <h2 className="pt-6 pb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">
                    {section.title}
                </h2>
                {tasks.length === 0 && <ViewEmptySection />}
                <TaskGapBeacon
                    sectionId={section.id}
                    beforeOrder={null}
                    afterOrder={tasks[0]?.order ?? null}
                />
                {tasks.map((task, i) => (
                    <div key={task.id} className="flex flex-col">
                        <ViewTask task={task} />
                        <TaskGapBeacon
                            sectionId={section.id}
                            beforeOrder={task.order}
                            afterOrder={tasks[i + 1]?.order ?? null}
                        />
                    </div>
                ))}
                <ViewAddTask sectionId={section.id} />
            </div>
        </div>
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-300">No tasks yet.</p>
}

function ViewTask({ task: { done, id, title } }: { task: Task }) {
    const { isDragging, rootProps } = useDraggable({ id, tag: 'task', data: null })

    return (
        <div
            {...rootProps}
            style={
                isDragging
                    ? { outline: '2px dashed dodgerblue', outlineOffset: '-2px', borderRadius: '0.5rem' }
                    : undefined
            }
        >
            <div
                className="group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm"
                style={isDragging ? { visibility: 'hidden' } : undefined}
            >
                <ViewTaskDoneMarker done={done} onClick={() => toggleTask(id)} />
                <ViewTaskTitle done={done} title={title} />
                <ViewDeleteTaskIcon onClick={() => deleteTask(id)} />
            </div>
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

function SectionGapBeacon({
    beforeOrder,
    afterOrder,
}: {
    beforeOrder: string | null
    afterOrder: string | null
}) {
    const data: SectionGap = { kind: 'section-gap', beforeOrder, afterOrder }
    const { rootProps } = useDroppable({ tag: 'section', data })
    return (
        <div
            {...rootProps}
            className="flex h-2 items-center opacity-15 transition-opacity duration-150 data-[active]:opacity-100"
        >
            <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <div className="h-0.5 flex-1 rounded-full bg-amber-400" />
            <div className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
        </div>
    )
}

function TaskGapBeacon({
    sectionId,
    beforeOrder,
    afterOrder,
}: {
    sectionId: string
    beforeOrder: string | null
    afterOrder: string | null
}) {
    const data: TaskGap = { kind: 'task-gap', sectionId, beforeOrder, afterOrder }
    const { rootProps } = useDroppable({ tag: 'task', data })
    return (
        <div
            {...rootProps}
            className="flex h-2 items-center opacity-15 transition-opacity duration-150 data-[active]:opacity-100"
        >
            <div className="bg-accent h-2 w-2 shrink-0 rounded-full" />
            <div className="bg-accent h-0.5 flex-1 rounded-full" />
            <div className="bg-accent h-2 w-2 shrink-0 rounded-full" />
        </div>
    )
}

export default ViewApp
