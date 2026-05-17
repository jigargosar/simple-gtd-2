import { observable } from '@legendapp/state'
import { syncObservable } from '@legendapp/state/sync'
import { ObservablePersistLocalStorage } from '@legendapp/state/persist-plugins/local-storage'
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

type Point = { x: number; y: number }

type Sortable = 'NotSorting' | { tag: 'PointerDown'; pt: Point } | { tag: 'Dragging' }

type Data = {
    sections: Section[]
    tasks: Task[]
}

// Persisted state
export const data$ = observable<Data>(mockData())

syncObservable(data$, {
    persist: {
        name: 'simple-gtd-v2',
        plugin: ObservablePersistLocalStorage,
    },
})

// Ephemeral UI state (not persisted)
export const ui$ = observable<{ sortable: Sortable }>({ sortable: 'NotSorting' })

// Derivations

export const sortedSections$ = observable<Section[]>(() =>
    sortBy(data$.sections.get(), prop('order')),
)

export function sectionTasks(tasks: Task[], sectionId: string): Task[] {
    return pipe(
        tasks,
        filter((t) => t.sectionId === sectionId),
        sortBy(prop('order')),
    )
}

export function sectionPendingCount(tasks: Task[], sectionId: string): number {
    return sectionTasks(tasks, sectionId).filter((t) => !t.done).length
}

// Actions

export const appendTask = (sectionId: string, title: string) => {
    const lastOrder = sectionTasks(data$.tasks.get(), sectionId).at(-1)?.order ?? null
    data$.tasks.push({
        id: uuidv4(),
        sectionId,
        order: orderBetween(lastOrder, null),
        title,
        done: false,
    })
}

export const deleteTask = (id: string) => {
    data$.tasks.set((tasks) => tasks.filter((t) => t.id !== id))
}

export const toggleTask = (id: string) => {
    data$.tasks.set((tasks) =>
        tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
}

function orderBetween(a: string | null | undefined, b: string | null | undefined) {
    return generateKeyBetween(a ?? null, b ?? null)
}

// Mock data

type MockSectionData = { title: string; tasks: { title: string; done: boolean }[] }[]

function mockData(): Data {
    const data = mockSectionData()
    const sections = mockSections(data)
    return { sections, tasks: mockTasks(sections, data) }
}

function mockSections(data: MockSectionData): Section[] {
    return generateNKeysBetween(null, null, data.length).map((order, i) => ({
        id: uuidv4(),
        order,
        title: data[i].title,
    }))
}

function mockTasks(sections: Section[], data: MockSectionData): Task[] {
    return sections.flatMap((section, i) => {
        const tasks = data[i].tasks
        return generateNKeysBetween(null, null, tasks.length).map((order, j) => ({
            id: uuidv4(),
            sectionId: section.id,
            order,
            ...tasks[j],
        }))
    })
}

function mockSectionData(): MockSectionData {
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
