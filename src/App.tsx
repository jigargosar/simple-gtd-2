const MOCK_TASKS = [
  { id: 1, title: 'Review project proposal', done: false },
  { id: 2, title: 'Schedule team sync', done: true },
  { id: 3, title: 'Write unit tests for auth module', done: false },
  { id: 4, title: 'Update API documentation', done: false },
  { id: 5, title: 'Deploy staging build', done: true },
]

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Tasks</h1>
        <ul className="space-y-2">
          {MOCK_TASKS.map(task => (
            <li
              key={task.id}
              className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100"
            >
              <span
                className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  task.done ? 'bg-green-500 border-green-500' : 'border-gray-300'
                }`}
              />
              <span className={task.done ? 'line-through text-gray-400' : 'text-gray-700'}>
                {task.title}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
