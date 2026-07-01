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
    archived: boolean
}

export type Section = {
    id: string
    order: string
    title: string
    archived: boolean
    collapsed: boolean
}

type AppState = {
    sections: Section[]
    tasks: Task[]
    showDone: boolean
}

const useApp = create<AppState>()(
    persist(mockState, {
        name: 'simple-gtd',
        version: 6,
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
        archived: asBool(r.archived, false),
        collapsed: asBool(r.collapsed, false),
    }
}

function normalizeTask(r: Record<string, unknown>): Task {
    return {
        id: asString(r.id, uuidv4()),
        sectionId: asString(r.sectionId, ''),
        order: asString(r.order, orderBetween(null, null)),
        title: asString(r.title, ''),
        done: asBool(r.done, false),
        archived: asBool(r.archived, false),
    }
}

// Normalizes persisted data to the current shape. Missing fields get safe defaults
// (e.g. `archived` defaults to false for data saved before the flag existed).
// `showDone` is never persisted.
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

function mapState(fn: (s: AppState) => Partial<AppState>) {
    return useApp.setState(fn)
}

function mapTasks(fn: (t: Task) => Task) {
    return mapState((s) => ({ tasks: s.tasks.map(fn) }))
}

function mapSections(fn: (sec: Section) => Section) {
    return mapState((s) => ({ sections: s.sections.map(fn) }))
}

export function toggleShowDone() {
    return mapState((s) => ({ showDone: !s.showDone }))
}

export function useShowDone() {
    return useApp((s) => s.showDone)
}

export function useSections() {
    return useAppShallow((s) => sortBy(s.sections, prop('order')).filter((sec) => !sec.archived))
}

export function useMoveTargets(sectionId: string) {
    return useAppShallow((s) =>
        sortBy(s.sections, prop('order')).filter((sec) => sec.id !== sectionId && !sec.archived),
    )
}

// Active tasks: exclude archived, then apply the show-completed rule.
// (A task whose section is archived is excluded here because the whole
// section is filtered out of the active view upstream.)
function visibleSectionTasks(s: AppState, sectionId: string) {
    const list = getSectionTasks(s.tasks, sectionId).filter((t) => !t.archived)
    return s.showDone ? list : list.filter((t) => !t.done)
}

export function useVisibleSectionTasks(sectionId: string) {
    return useAppShallow((s) => visibleSectionTasks(s, sectionId))
}

// Archive panes. An archived task always appears in the items pane, regardless
// of its section's state. Archived sections show as bare rows (no tasks).
export function useArchivedTasks() {
    return useAppShallow((s) =>
        sortBy(
            s.tasks.filter((t) => t.archived),
            prop('order'),
        ),
    )
}

export function useArchivedSections() {
    return useAppShallow((s) =>
        sortBy(
            s.sections.filter((sec) => sec.archived),
            prop('order'),
        ),
    )
}

export function appendTask(sectionId: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    mapState((s) => {
        const lastOrder = getSectionTasks(s.tasks, sectionId).at(-1)?.order ?? null
        const newTask = {
            id: uuidv4(),
            sectionId,
            order: orderBetween(lastOrder, null),
            title: trimmed,
            done: false,
            archived: false,
        }
        return { tasks: [...s.tasks, newTask] }
    })
}

// Active-view removal is now archiving (reversible). Permanent removal
// (deleteTask) is reachable only from the archive dialog.
export function archiveTask(id: string) {
    return mapTasks((t) => (t.id === id ? { ...t, archived: true } : t))
}

export function restoreTask(id: string) {
    return mapTasks((t) => (t.id === id ? { ...t, archived: false } : t))
}

export function deleteTask(id: string) {
    return mapState((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
}

export function toggleTask(id: string) {
    return mapTasks((t) => (t.id === id ? { ...t, done: !t.done } : t))
}

export function updateTaskTitle(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    mapTasks((t) => (t.id === id ? { ...t, title: trimmed } : t))
}

// Drag-and-drop drop target: moves a task to `index` within `sectionId`'s visible
// list (which may be a different section than the task's current one), recomputing
// its fractional `order` between the new neighbors.
export function reorderTask(id: string, sectionId: string, index: number) {
    return mapState((s) => {
        const list = visibleSectionTasks(s, sectionId).filter((t) => t.id !== id)
        const order = orderBetween(list[index - 1]?.order, list[index]?.order)
        return { tasks: s.tasks.map((t) => (t.id === id ? { ...t, sectionId, order } : t)) }
    })
}

// Drag-and-drop drop target: moves a section to `index` among all (unarchived)
// sections, recomputing its fractional `order` between the new neighbors.
export function reorderSection(id: string, index: number) {
    return mapState((s) => {
        const list = sortBy(s.sections, prop('order')).filter(
            (sec) => sec.id !== id && !sec.archived,
        )
        const order = orderBetween(list[index - 1]?.order, list[index]?.order)
        return { sections: s.sections.map((sec) => (sec.id === id ? { ...sec, order } : sec)) }
    })
}

export function setTaskSection(id: string, sectionId: string) {
    return mapState((s) => {
        const task = s.tasks.find((t) => t.id === id)
        if (!task || task.sectionId === sectionId) return {}
        const lastOrder = getSectionTasks(s.tasks, sectionId).at(-1)?.order ?? null
        return {
            tasks: s.tasks.map((t) =>
                t.id === id ? { ...t, sectionId, order: orderBetween(lastOrder, null) } : t,
            ),
        }
    })
}

export function appendSection(title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    mapState((s) => {
        const lastOrder = sortBy(s.sections, prop('order')).at(-1)?.order ?? null
        return {
            sections: [
                ...s.sections,
                {
                    id: uuidv4(),
                    order: orderBetween(lastOrder, null),
                    title: trimmed,
                    archived: false,
                    collapsed: false,
                },
            ],
        }
    })
}

export function toggleSectionCollapsed(id: string) {
    return mapSections((sec) => (sec.id === id ? { ...sec, collapsed: !sec.collapsed } : sec))
}

export function updateSectionTitle(id: string, title: string) {
    const trimmed = title.trim()
    if (!trimmed) return
    mapSections((sec) => (sec.id === id ? { ...sec, title: trimmed } : sec))
}

// Archiving a section does NOT touch its tasks' archived flags (independent flags).
// The section simply drops out of the active view.
export function archiveSection(id: string) {
    return mapSections((sec) => (sec.id === id ? { ...sec, archived: true } : sec))
}

export function restoreSection(id: string) {
    return mapSections((sec) => (sec.id === id ? { ...sec, archived: false } : sec))
}

// Permanent purge from the archive dialog: removes the section and all its tasks.
export function deleteSection(id: string) {
    return mapState((s) => ({
        sections: s.sections.filter((sec) => sec.id !== id),
        tasks: s.tasks.filter((t) => t.sectionId !== id),
    }))
}

function orderBetween(a: string | null | undefined, b: string | null | undefined) {
    return generateKeyBetween(a ?? null, b ?? null)
}

export function exportData() {
    const { sections, tasks } = useApp.getState()
    const blob = new Blob([JSON.stringify({ sections, tasks }, null, 2)], {
        type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simplegtd-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
}

// Reuses the `migrate` normalizers so a partial/malformed backup degrades
// gracefully instead of throwing; returns null only when the file isn't
// shaped like a backup at all (no sections/tasks arrays).
export function normalizeImport(raw: unknown): { sections: Section[]; tasks: Task[] } | null {
    if (!isRecord(raw) || !Array.isArray(raw.sections) || !Array.isArray(raw.tasks)) return null
    return {
        sections: raw.sections.filter(isRecord).map(normalizeSection),
        tasks: raw.tasks.filter(isRecord).map(normalizeTask),
    }
}

export function importData(data: { sections: Section[]; tasks: Task[] }) {
    useApp.setState(data)
}

// Mock data

type MockSectionData = { title: string; tasks: { title: string; done: boolean }[] }[]

function mockState(): AppState {
    const data = mockSectionData()
    const sections = mockSections(data)
    return {
        sections,
        tasks: mockTasks(sections, data),
        showDone: false,
    }
}

function mockSections(data: MockSectionData): Section[] {
    return generateNKeysBetween(null, null, data.length).map((order, i) => ({
        id: uuidv4(),
        order,
        title: data[i].title,
        archived: false,
        collapsed: false,
    }))
}

function mockTasks(sections: Section[], data: MockSectionData): Task[] {
    return sections.flatMap((section, i) => {
        const tasks = data[i].tasks
        return generateNKeysBetween(null, null, tasks.length).map((order, j) => ({
            id: uuidv4(),
            sectionId: section.id,
            order,
            archived: false,
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
