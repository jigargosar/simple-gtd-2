import { create } from 'zustand'
import { generateNKeysBetween } from 'fractional-indexing'
import { v4 as uuidv4 } from 'uuid'

export type Task = {
    id: string
    sectionId: string
    order: string
    title: string
    done: boolean
}

export type Section = {
    id: string
    order: string
    title: string
}

type AppState = {
    sections: Section[]
    tasks: Task[]
}

const useApp = create<AppState>(() => ({
    sections: MOCK_SECTIONS,
    tasks: MOCK_TASKS,
}))

export default useApp

export const toggleTask = (id: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))

// Mock data

const MOCK_SECTION_DATA: { title: string; tasks: { title: string; done: boolean }[] }[] = [
    {
        title: 'Inbox',
        tasks: [
            { title: 'Read article on deep work', done: false },
            { title: 'Reply to contractor email', done: false },
            { title: 'Buy new keyboard', done: false },
        ],
    },
    {
        title: 'Next Actions',
        tasks: [
            { title: 'Review project proposal', done: false },
            { title: 'Write unit tests for auth module', done: false },
            { title: 'Schedule team sync', done: true },
        ],
    },
    {
        title: 'Projects',
        tasks: [
            { title: 'Launch SimpleGTD v1', done: false },
            { title: 'Migrate DB to Postgres', done: false },
            { title: 'Redesign onboarding flow', done: false },
        ],
    },
    {
        title: 'Waiting For',
        tasks: [
            { title: 'Design assets from contractor', done: false },
            { title: 'Approval on budget proposal', done: false },
            { title: 'Deploy staging build', done: true },
        ],
    },
    {
        title: 'Someday / Maybe',
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
    title: MOCK_SECTION_DATA[i].title,
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
