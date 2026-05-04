import { clsx } from 'clsx'
import { useSections, useSectionTasks, toggleTask, type Task, type Section } from './store'

function ViewApp() {
    const sections = useSections()

    return (
        <div className="min-h-screen bg-gray-50">
            <ViewHeader />
            <ViewSections sections={sections} />
        </div>
    )
}

function ViewSections({ sections }: { sections: Section[] }) {
    return (
        <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8">
            {sections.map((section) => (
                <ViewSection key={section.id} section={section} />
            ))}
        </div>
    )
}

function ViewSection({ section }: { section: Section }) {
    const tasks = useSectionTasks(section.id)

    return (
        <div className="flex flex-col gap-2">
            <h2 className="py-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">{section.title}</h2>
            {tasks.map((task) => (
                <ViewTask key={task.id} task={task} />
            ))}
        </div>
    )
}

function ViewTask(props: { task: Task }) {
    const { id, title, done } = props.task
    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <ViewTaskDoneMarker done={done} onClick={() => toggleTask(id)} />
            <ViewTaskTitle done={done} title={title} />
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
    return <span className={clsx(props.done ? 'text-gray-400 line-through' : 'text-gray-700')}>{props.title}</span>
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

export default ViewApp
