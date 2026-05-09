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
    moveTask,
    moveSection,
} from './store'
import { DragProvider, useDraggable, useBeacon } from './dnd'

// ─── DragItem union ───────────────────────────────────────────────────────────

type DragItem =
    | { tag: 'task'; id: string; sectionId: string }
    | { tag: 'section'; id: string }

// ─── App ─────────────────────────────────────────────────────────────────────

function ViewApp() {
    return (
        <DragProvider<DragItem>
            renderGhost={(src) => (
                <div className="rounded border border-accent bg-white px-3 py-2 text-sm shadow-lg opacity-80">
                    {src.tag === 'task' ? '📋 task' : '📁 section'}
                </div>
            )}
        >
            <div className="min-h-screen bg-gray-50">
                <ViewHeader />
                <ViewSections />
            </div>
        </DragProvider>
    )
}

function ViewHeader() {
    return (
        <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="mx-auto max-w-xl">
                <span className="text-lg font-semibold tracking-tight text-gray-800">SimpleGTD</span>
            </div>
        </header>
    )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function ViewSections() {
    const sections = useSections()

    return (
        <div className="mx-auto flex max-w-xl flex-col px-4 py-8">
            {sections.map((section, i) => (
                <ViewSection
                    key={section.id}
                    section={section}
                    prevSectionId={sections[i - 1]?.id ?? null}
                />
            ))}
            <SectionBeacon afterSectionId={sections.at(-1)?.id ?? null} />
        </div>
    )
}

function SectionBeacon({ afterSectionId }: { afterSectionId: string | null }) {
    const { ref, beaconId, isActive } = useBeacon<DragItem>({
        accepts: ['section'],
        onDrop: (src) => {
            if (src.tag !== 'section') return
            moveSection(src.id, afterSectionId)
        },
    })

    return (
        <div
            ref={ref}
            data-beacon-id={beaconId}
            data-beacon-accepts="section"
            className={clsx('h-2 rounded transition-colors', isActive ? 'bg-accent' : 'bg-transparent')}
        />
    )
}

function ViewSection({
    section,
    prevSectionId,
}: {
    section: Section
    prevSectionId: string | null
}) {
    const tasks = useSectionTasks(section.id)
    const { ref, onPointerDown, isDragSrc } = useDraggable<DragItem>({
        tag: 'section',
        id: section.id,
    })

    return (
        <>
            <SectionBeacon afterSectionId={prevSectionId} />
            <div ref={ref} className={clsx('flex flex-col', isDragSrc && 'opacity-30 pointer-events-none')}>
                <h2
                    onPointerDown={onPointerDown}
                    className="cursor-grab pt-6 pb-2 text-xs font-semibold tracking-widest text-gray-400 uppercase select-none"
                >
                    {section.title}
                </h2>
                {tasks.length === 0 && <ViewEmptySection />}
                <TaskBeacon beforeTaskId={tasks[0]?.id ?? null} sectionId={section.id} />
                {tasks.map((task, i) => (
                    <ViewTask
                        key={task.id}
                        task={task}
                        nextTaskId={tasks[i + 1]?.id ?? null}
                    />
                ))}
                <ViewAddTask sectionId={section.id} />
            </div>
        </>
    )
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TaskBeacon({ beforeTaskId, sectionId }: { beforeTaskId: string | null; sectionId: string }) {
    const { ref, beaconId, isActive } = useBeacon<DragItem>({
        accepts: ['task'],
        onDrop: (src) => {
            if (src.tag !== 'task') return
            moveTask(src.id, sectionId, beforeTaskId)
        },
    })

    return (
        <div
            ref={ref}
            data-beacon-id={beaconId}
            data-beacon-accepts="task"
            className={clsx('h-2 rounded transition-colors', isActive ? 'bg-accent' : 'bg-transparent')}
        />
    )
}

function ViewEmptySection() {
    return <p className="py-1 text-sm text-gray-300">No tasks yet.</p>
}

function ViewTask({ task, nextTaskId }: { task: Task; nextTaskId: string | null }) {
    const { ref, onPointerDown, isDragSrc } = useDraggable<DragItem>({
        tag: 'task',
        id: task.id,
        sectionId: task.sectionId,
    })

    return (
        <>
            <div
                ref={ref}
                className={clsx(
                    'group flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm',
                    isDragSrc && 'opacity-30 pointer-events-none',
                )}
            >
                <ViewTaskDoneMarker done={task.done} onClick={() => toggleTask(task.id)} />
                <ViewTaskTitle done={task.done} title={task.title} onPointerDown={onPointerDown} />
                <ViewDeleteTaskIcon onClick={() => deleteTask(task.id)} />
            </div>
            <TaskBeacon beforeTaskId={nextTaskId} sectionId={task.sectionId} />
        </>
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

function ViewTaskTitle(props: { done: boolean; title: string; onPointerDown: (e: React.PointerEvent) => void }) {
    return (
        <span
            onPointerDown={props.onPointerDown}
            className={clsx(
                'flex-1 cursor-grab select-none',
                props.done ? 'text-gray-400 line-through' : 'text-gray-700',
            )}
        >
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

export default ViewApp
