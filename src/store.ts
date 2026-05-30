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

type Point = { x: number; y: number }

type Sortable = 'NotSorting' | { tag: 'PointerDown'; pt: Point } | { tag: 'Dragging' }

type AppState = {
    sections: Section[]
    tasks: Task[]
    sortable: Sortable
    showDone: boolean
}

const useApp = create<AppState>()(
    persist(mockState, {
        name: 'simple-gtd',
        version: 4,
        // Only the data is persisted; `showDone` is transient and starts false.
        partialize: ({ sections, tasks }) => ({ sections, tasks }),
        migrate,
    }),
)

function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === 'object' && v !== null
}

function asString(v: unknown, fallback: string): string {
    return typeof v === 'string' ? v : fallback
}

function asBool(v: unknown, fallback: boolean): boolean {
    return typeof v === 'boolean' ? v : fallback
}

function normalizeSection(r: Record<string, unknown>): Section {
    return {
        id: asString(r.id, uuidv4()),
        order: asString(r.order, orderBetween(null, null)),
        title: asString(r.title, ''),
    }
}

function normalizeTask(r: Record<string, unknown>): Task {
    return {
        id: asString(r.id, uuidv4()),
        sectionId: asString(r.sectionId, ''),
        order: asString(r.order, orderBetween(null, null)),
        title: asString(r.title, ''),
        done: asBool(r.done, false),
    }
}

// Normalizes persisted data to the current shape, dropping removed fields (e.g. the
// old `archived` flag from the deleted archive feature). `showDone` is never persisted.
function migrate(persisted: unknown): AppState {
    const base = mockState()
    if (!isRecord(persisted)) return base
    return {
        ...base,
        sections: Array.isArray(persisted.sections)
            ? persisted.sections.filter(isRecord).map(normalizeSection)
            : base.sections,
        tasks: Array.isArray(persisted.tasks)
            ? persisted.tasks.filter(isRecord).map(normalizeTask)
            : base.tasks,
    }
}

function getSectionTasks(tasks: Task[], sectionId: string) {
    return pipe(
        tasks,
        filter((t) => t.sectionId === sectionId),
        sortBy(prop('order')),
    )
}

function useAppShallow<T>(selector: (s: AppState) => T) {
    return useApp(useShallow(selector))
}

export const toggleShowDone = () => useApp.setState((s) => ({ showDone: !s.showDone }))

export function useShowDone() {
    return useApp((s) => s.showDone)
}

export function useSections() {
    return useAppShallow((s) => sortBy(s.sections, prop('order')))
}

export function useVisibleSectionTasks(sectionId: string) {
    return useAppShallow((s) => {
        const list = getSectionTasks(s.tasks, sectionId)
        return s.showDone ? list : list.filter((t) => !t.done)
    })
}

export const appendTask = (sectionId: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    useApp.setState((s) => {
        const lastOrder = getSectionTasks(s.tasks, sectionId).at(-1)?.order ?? null
        const newTask = {
            id: uuidv4(),
            sectionId,
            order: orderBetween(lastOrder, null),
            title: trimmed,
            done: false,
        }
        return { tasks: [...s.tasks, newTask] }
    })
}

export const deleteTask = (id: string) =>
    useApp.setState((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))

export const toggleTask = (id: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))

export const updateTaskTitle = (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, title: trimmed } : t)),
    }))
}

export const appendSection = (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    useApp.setState((s) => {
        const lastOrder = sortBy(s.sections, prop('order')).at(-1)?.order ?? null
        return {
            sections: [
                ...s.sections,
                {
                    id: uuidv4(),
                    order: orderBetween(lastOrder, null),
                    title: trimmed,
                },
            ],
        }
    })
}

export const updateSectionTitle = (id: string, title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return
    useApp.setState((s) => ({
        sections: s.sections.map((sec) => (sec.id === id ? { ...sec, title: trimmed } : sec)),
    }))
}

export const deleteSection = (id: string) =>
    useApp.setState((s) => ({
        sections: s.sections.filter((sec) => sec.id !== id),
        tasks: s.tasks.filter((t) => t.sectionId !== id),
    }))

function orderBetween(a: string | null | undefined, b: string | null | undefined) {
    return generateKeyBetween(a ?? null, b ?? null)
}

// Mock data

type MockSectionData = { title: string; tasks: { title: string; done: boolean }[] }[]

function mockState(): AppState {
    const data = mockSectionData()
    const sections = mockSections(data)
    return {
        sections,
        tasks: mockTasks(sections, data),
        sortable: 'NotSorting',
        showDone: false,
    }
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
