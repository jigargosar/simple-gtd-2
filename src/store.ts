import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'
import { generateKeyBetween, generateNKeysBetween } from 'fractional-indexing'
import { filter, pipe, sortBy, prop } from 'remeda'
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

const useApp = create<AppState>()(
    persist(mockState, {
        name: 'simple-gtd',
        version: 1,
        partialize: (s) => ({ sections: s.sections, tasks: s.tasks }),
        // migrate: (persisted, fromVersion) => {
        //     if (fromVersion === 0) return mockState()
        //     return persisted as AppState
        // },
    }),
)

function getSectionTasks(tasks: Task[], sectionId: string) {
    return pipe(
        tasks,
        filter((t) => t.sectionId === sectionId),
        sortBy(prop('order')),
    )
}

export function useSections() {
    return useApp(useShallow((s) => sortBy(s.sections, prop('order'))))
}

export function useSectionTasks(sectionId: string) {
    return useApp(useShallow((s) => getSectionTasks(s.tasks, sectionId)))
}

export const appendTask = (sectionId: string, title: string) => {
    const lastOrder = getSectionTasks(useApp.getState().tasks, sectionId).at(-1)?.order ?? null
    const newTask = { id: uuidv4(), sectionId, order: keyBetween(lastOrder, null), title, done: false }
    useApp.setState((s) => ({
        tasks: [...s.tasks, newTask],
    }))
}

export const deleteTask = (id: string) =>
    useApp.setState((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))

export const toggleTask = (id: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))

export const reorderTask = (id: string, newOrder: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, order: newOrder } : t)),
    }))

export const reorderSection = (id: string, newOrder: string) =>
    useApp.setState((s) => ({
        sections: s.sections.map((sec) => (sec.id === id ? { ...sec, order: newOrder } : sec)),
    }))

export function keyBetween(a: string | null | undefined, b: string | null | undefined) {
    return generateKeyBetween(a ?? null, b ?? null)
}

// Mock data

function mockState(): AppState {
    const sections = mockSections()
    return { sections, tasks: mockTasks(sections) }
}

function mockSections(): Section[] {
    return generateNKeysBetween(null, null, mockSectionData().length).map((order, i) => ({
        id: uuidv4(),
        order,
        title: mockSectionData()[i].title,
    }))
}

function mockTasks(sections: Section[]): Task[] {
    return sections.flatMap((section, i) => {
        const tasks = mockSectionData()[i].tasks
        return generateNKeysBetween(null, null, tasks.length).map((order, j) => ({
            id: uuidv4(),
            sectionId: section.id,
            order,
            ...tasks[j],
        }))
    })
}

function mockSectionData(): { title: string; tasks: { title: string; done: boolean }[] }[] {
    return [
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
}
