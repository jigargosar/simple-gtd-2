import { clsx } from 'clsx'
import { generateNKeysBetween } from 'fractional-indexing'
import { v4 as uuidv4 } from 'uuid'

interface Task {
    id: string
    sectionId: string
    order: string
    title: string
    done: boolean
}

interface Section {
    id: string
    order: string
    name: string
}

function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8">
                {MOCK_SECTIONS.map((section) => (
                    <TaskSection
                        key={section.id}
                        section={section}
                        tasks={MOCK_TASKS.filter((t) => t.sectionId === section.id)}
                    />
                ))}
            </div>
        </div>
    )
}

function TaskSection({ section, tasks }: { section: Section; tasks: Task[] }) {
    return (
        <div className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase">{section.name}</h2>
            {tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
            ))}
        </div>
    )
}

function TaskItem(props: { task: Task }) {
    const { title, done } = props.task
    return (
        <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm">
            <TaskDoneMarker done={done} />
            <TaskTitle done={done} title={title} />
        </div>
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

const MOCK_SECTION_DATA: { name: string; tasks: { title: string; done: boolean }[] }[] = [
    {
        name: 'Inbox',
        tasks: [
            { title: 'Read article on deep work', done: false },
            { title: 'Reply to contractor email', done: false },
            { title: 'Buy new keyboard', done: false },
        ],
    },
    {
        name: 'Next Actions',
        tasks: [
            { title: 'Review project proposal', done: false },
            { title: 'Write unit tests for auth module', done: false },
            { title: 'Schedule team sync', done: true },
        ],
    },
    {
        name: 'Projects',
        tasks: [
            { title: 'Launch SimpleGTD v1', done: false },
            { title: 'Migrate DB to Postgres', done: false },
            { title: 'Redesign onboarding flow', done: false },
        ],
    },
    {
        name: 'Waiting For',
        tasks: [
            { title: 'Design assets from contractor', done: false },
            { title: 'Approval on budget proposal', done: false },
            { title: 'Deploy staging build', done: true },
        ],
    },
    {
        name: 'Someday / Maybe',
        tasks: [
            { title: 'Learn Rust', done: false },
            { title: 'Update API documentation', done: false },
            { title: 'Set up home lab', done: false },
        ],
    },
]

const MOCK_SECTIONS: Section[] = generateNKeysBetween(null, null, MOCK_SECTION_DATA.length).map((order, i) => ({
    id: uuidv4(),
    order,
    name: MOCK_SECTION_DATA[i].name,
}))

const MOCK_TASKS: Task[] = MOCK_SECTIONS.flatMap((section, i) => {
    const titles = MOCK_SECTION_DATA[i].tasks
    return generateNKeysBetween(null, null, titles.length).map((order, j) => ({
        id: uuidv4(),
        sectionId: section.id,
        order,
        ...titles[j],
    }))
})

export default App
