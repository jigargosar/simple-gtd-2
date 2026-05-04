import { clsx } from 'clsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <Header />
        <TaskList tasks={MOCK_TASKS} />
      </div>
    </div>
  )
}

function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="space-y-2">
      {tasks.map(task => (
        <TaskItem key={task.id} {...task} />
      ))}
    </ul>
  )
}

function TaskItem({ title, done }: Task) {
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
    return (
        <span className={clsx(props.done ? 'text-gray-400 line-through' : 'text-gray-700')}>
      {props.title}
    </span>
    )
}

function Header() {
  return <h1 className="text-2xl font-semibold text-gray-800 mb-6">Tasks</h1>
}

interface Task {
  id: number
  title: string
  done: boolean
}

const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Review project proposal', done: false },
  { id: 2, title: 'Schedule team sync', done: true },
  { id: 3, title: 'Write unit tests for auth module', done: false },
  { id: 4, title: 'Update API documentation', done: false },
  { id: 5, title: 'Deploy staging build', done: true },
]

export default App
