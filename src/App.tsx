import { clsx } from 'clsx'
import { generateNKeysBetween } from 'fractional-indexing'
import { v4 as uuidv4 } from 'uuid'

interface Task {
    id: string
    order: string
    title: string
    done: boolean
}

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <TaskList tasks={MOCK_TASKS} />
        </div>
    )
}

function TaskList({ tasks }: { tasks: Task[] }) {
    return (
        <div className="mx-auto max-w-xl space-y-2 px-4 py-8">
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
            ))}
        </div>
    )
}

function TaskItem(props: { task: Task }) {
    const { title, done } = props.task
    return (
        <li className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <TaskDoneMarker done={done} />
            <TaskTitle done={done} title={title} />
        </li>
    )
}

function TaskDoneMarker(props: { done: boolean }) {
    return (
        <span
            className={clsx(
                'h-4 w-4 shrink-0 rounded-full border-2',
                props.done ? 'border-green-500 bg-green-500' : 'border-gray-300',
            )}
        />
    )
}

function TaskTitle(props: { done: boolean; title: string }) {
    return <span className={clsx(props.done ? 'text-gray-400 line-through' : 'text-gray-700')}>{props.title}</span>
}

function Header() {
    return (
        <header className="border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="mx-auto max-w-xl">
                <span className="text-lg font-semibold tracking-tight text-gray-800">SimpleGTD</span>
            </div>
        </header>
    )
}

const MOCK_TASK_TITLES: { title: string; done: boolean }[] = [
    { title: 'Review project proposal', done: false },
    { title: 'Schedule team sync', done: true },
    { title: 'Write unit tests for auth module', done: false },
    { title: 'Update API documentation', done: false },
    { title: 'Deploy staging build', done: true },
]

const MOCK_TASKS: Task[] = generateNKeysBetween(null, null, MOCK_TASK_TITLES.length).map((order, i) => ({
    id: uuidv4(),
    order,
    ...MOCK_TASK_TITLES[i],
}))

export default App
