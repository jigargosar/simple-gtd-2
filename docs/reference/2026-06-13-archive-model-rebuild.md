# Archive Model Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the soft-archive model — independent `archived` flags on sections and tasks, a tabbed archive view, and a board that archives instead of deletes — per `docs/reference/archive-visibility.md`.

**Architecture:** `Section` and `Task` each gain an independent boolean `archived` flag with no cascade and no stored relationship between them. Every view is a pure derivation: the board shows non-archived sections and, within them, non-archived tasks; the archive shows archived sections (name only) and archived tasks in two separate tabs. The board's destructive "delete" becomes a non-destructive "archive"; permanent (hard) delete lives only inside the archive.

**Tech Stack:** React 19 (React Compiler — no manual memo), Zustand + persist, TypeScript, Tailwind v4, lucide-react, fractional-indexing, remeda.

**Verification note:** This project has NO test runner (per CLAUDE.md). Each task is verified with `pnpm build && pnpm lint` (tsc project-refs type-check + ESLint) plus a manual behavior check in the running dev app (http://localhost:5137). There are no automated test steps — that is intentional, not an omission.

**Commit note:** Commits use the project `cnp` convention — `git add <explicit files> && git commit -m "<msg>"` (never `git add -A` / `git add .`). Push with `--follow-tags` when you choose.

**Spec mapping:** Implements roadmap `§1 Archive model`. The permanent-delete-inside-archive piece also resolves roadmap §1's open "decide permanent delete" item; it is an intentional addition beyond the visibility-only spec.

**Animation note (2026-06-22 decision — see `adr.md`):** Keyframe animations were removed from the codebase and visual niceties are deferred to the end of v1. Implement archive/unarchive as **instant state changes — no exit animation**. The `setExiting` / `onAnimationEnd` / `e.animationName === 'task-out'` gating shown in Tasks 3–4 below is **stale** (those keyframes no longer exist in `src/index.css`, so the handler would never fire and the button would do nothing). Replace it with a direct call — e.g. `onClick={() => archiveTask(task.id)}` — dropping the `exiting` state and the `anim-*` classes. Revisit motion only in the late niceties pass.

---

### Task 1: Add the `archived` flag to the data model

**Files:**
- Modify: `src/store.ts` (types, normalizers, persist `version`, mock builders, append actions)

- [ ] **Step 1: Add `archived` to the `Task` and `Section` types**

```ts
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
}
```

- [ ] **Step 2: Default `archived` in the normalizers, and update the migrate comment**

```ts
function normalizeSection(r: Record<string, unknown>): Section {
    return {
        id: asString(r.id, uuidv4()),
        order: asString(r.order, orderBetween(null, null)),
        title: asString(r.title, ''),
        archived: asBool(r.archived, false),
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
```

Replace the comment block directly above `function migrate(` with:

```ts
// Normalizes persisted data to the current shape. Missing fields get safe
// defaults (e.g. `archived` defaults to false for d mata saved before the flag
// was reintroduced). `showDone` is never persisted.
```

- [ ] **Step 3: Bump the persist `version` 4 → 5**

This forces `migrate` to run for existing localStorage and backfill `archived: false`. In the `persist(...)` config object:

```ts
        version: 5,
```

- [ ] **Step 4: Seed `archived: false` in the mock builders**

```ts
function mockSections(data: MockSectionData): Section[] {
    return generateNKeysBetween(null, null, data.length).map((order, i) => ({
        id: uuidv4(),
        order,
        title: data[i].title,
        archived: false,
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
```

- [ ] **Step 5: Set `archived: false` on append**

In `appendTask`, the `newTask` literal:

```ts
        const newTask = {
            id: uuidv4(),
            sectionId,
            order: orderBetween(lastOrder, null),
            title: trimmed,
            done: false,
            archived: false,
        }
```

In `appendSection`, the new section literal:

```ts
            sections: [
                ...s.sections,
                {
                    id: uuidv4(),
                    order: orderBetween(lastOrder, null),
                    title: trimmed,
                    archived: false,
                },
            ],
```

- [ ] **Step 6: Verify build + lint**

Run: `pnpm build && pnpm lint`
Expected: both pass, no type errors.

- [ ] **Step 7: Manual check**

Hard-reload the app. Existing sections/tasks still load and look unchanged (every item now silently carries `archived: false`).

- [ ] **Step 8: Commit**

```bash
git add src/store.ts && git commit -m "feat(store): add archived flag to Section and Task (persist v5 migrate)"
```

---

### Task 2: Archive/unarchive actions + board/archive selectors

**Files:**
- Modify: `src/store.ts` (new actions + selectors; rename `useSections`)
- Modify: `src/App.tsx` (`ViewBoard` uses `useBoardSections`)

- [ ] **Step 1: Filter archived tasks out of the board in `useVisibleSectionTasks`**

```ts
export function useVisibleSectionTasks(sectionId: string) {
    return useAppShallow((s) => {
        const list = getSectionTasks(s.tasks, sectionId).filter((t) => !t.archived)
        return s.showDone ? list : list.filter((t) => !t.done)
    })
}
```

- [ ] **Step 2: Rename `useSections` → `useBoardSections` and filter to non-archived**

Replace the existing `useSections` function with:

```ts
export function useBoardSections() {
    return useAppShallow((s) => sortBy(s.sections.filter((sec) => !sec.archived), prop('order')))
}
```

- [ ] **Step 3: Add archive read selectors**

```ts
export function useArchivedSections() {
    return useAppShallow((s) => sortBy(s.sections.filter((sec) => sec.archived), prop('order')))
}

export function useArchivedTasks() {
    return useAppShallow((s) => sortBy(s.tasks.filter((t) => t.archived), prop('order')))
}

export function useArchivedCounts() {
    return useAppShallow((s) => ({
        sections: s.sections.filter((sec) => sec.archived).length,
        tasks: s.tasks.filter((t) => t.archived).length,
    }))
}
```

- [ ] **Step 4: Add archive/unarchive write actions**

Place next to `deleteTask` / `deleteSection`. Keep `deleteTask` and `deleteSection` as-is — they become the permanent delete used only inside the archive.

```ts
export const archiveTask = (id: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, archived: true } : t)),
    }))

export const unarchiveTask = (id: string) =>
    useApp.setState((s) => ({
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, archived: false } : t)),
    }))

export const archiveSection = (id: string) =>
    useApp.setState((s) => ({
        sections: s.sections.map((sec) => (sec.id === id ? { ...sec, archived: true } : sec)),
    }))

export const unarchiveSection = (id: string) =>
    useApp.setState((s) => ({
        sections: s.sections.map((sec) => (sec.id === id ? { ...sec, archived: false } : sec)),
    }))
```

- [ ] **Step 5: Update `src/App.tsx` to use the renamed selector**

In the import block from `./store`, change `useSections` → `useBoardSections`. In `ViewBoard`:

```tsx
function ViewBoard() {
    const sections = useBoardSections()
    return (
        <main className="mx-auto max-w-2xl px-6 pb-24">
            <ViewDoneToggle />
            <div className="flex flex-col gap-10">
                {sections.map((section, i) => (
                    <ViewSection
                        key={section.id}
                        section={section}
                        animDelay={Math.min(i, 6) * 60}
                    />
                ))}
                <ViewAddSection />
            </div>
        </main>
    )
}
```

- [ ] **Step 6: Verify build + lint**

Run: `pnpm build && pnpm lint`
Expected: pass. New selectors/actions are exported but not yet consumed (Tasks 3–4) — exported symbols are not flagged as unused.

- [ ] **Step 7: Manual check**

Board still renders all seeded sections/tasks (nothing is archived yet). No behavior change.

- [ ] **Step 8: Commit**

```bash
git add src/store.ts src/App.tsx && git commit -m "feat(store): archive/unarchive actions and board/archive selectors"
```

---

### Task 3: Archive view UI (header nav + tabbed archive)

**Files:**
- Modify: `src/App.tsx` (icon imports, `ViewApp` view state, `ViewHeader` nav, new `ViewArchive` + children)

- [ ] **Step 1: Extend the lucide-react and store imports**

```tsx
import { clsx } from 'clsx'
import { Archive, ArchiveRestore, ChevronLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useEditInput } from './hooks'
import {
    appendSection,
    appendTask,
    deleteSection,
    deleteTask,
    type Section,
    type Task,
    toggleShowDone,
    toggleTask,
    unarchiveSection,
    unarchiveTask,
    updateSectionTitle,
    updateTaskTitle,
    useArchivedCounts,
    useArchivedSections,
    useArchivedTasks,
    useBoardSections,
    useShowDone,
    useVisibleSectionTasks,
} from './store'
```

(Do NOT import `archiveSection` / `archiveTask` yet — they are first used in Task 4; importing them now is an unused-import lint error.)

- [ ] **Step 2: Lift a `view` state into `ViewApp` and switch board/archive**

```tsx
function ViewApp() {
    const [view, setView] = useState<'board' | 'archive'>('board')
    return (
        <>
            <ViewHeader view={view} onSetView={setView} />
            {view === 'board' ? <ViewBoard /> : <ViewArchive />}
        </>
    )
}
```

- [ ] **Step 3: Replace `ViewHeader` with a version that has the nav button**

```tsx
function ViewHeader({
    view,
    onSetView,
}: {
    view: 'board' | 'archive'
    onSetView: (v: 'board' | 'archive') => void
}) {
    const counts = useArchivedCounts()
    const navBtn =
        'flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none'
    return (
        <header className="anim-header px-6 pt-12 pb-8">
            <div className="mx-auto flex max-w-2xl items-center justify-between">
                <span className="text-sm font-semibold tracking-tight text-stone-900">
                    SimpleGTD
                </span>
                {view === 'board' ? (
                    <button className={navBtn} onClick={() => onSetView('archive')}>
                        <Archive className="size-4" />
                        Archive ({counts.sections + counts.tasks})
                    </button>
                ) : (
                    <button className={navBtn} onClick={() => onSetView('board')}>
                        <ChevronLeft className="size-4" />
                        Board
                    </button>
                )}
            </div>
        </header>
    )
}
```

- [ ] **Step 4: Add `ViewArchive` and the tab button**

```tsx
function ViewArchive() {
    const [tab, setTab] = useState<'sections' | 'tasks'>('sections')
    const counts = useArchivedCounts()
    return (
        <main className="mx-auto max-w-2xl px-6 pb-24">
            <div className="mb-6 flex gap-2">
                <ViewArchiveTab
                    active={tab === 'sections'}
                    label={`Sections (${counts.sections})`}
                    onClick={() => setTab('sections')}
                />
                <ViewArchiveTab
                    active={tab === 'tasks'}
                    label={`Tasks (${counts.tasks})`}
                    onClick={() => setTab('tasks')}
                />
            </div>
            {tab === 'sections' ? <ViewArchivedSections /> : <ViewArchivedTasks />}
        </main>
    )
}

function ViewArchiveTab({
    active,
    label,
    onClick,
}: {
    active: boolean
    label: string
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                'cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none',
                active ? 'bg-stone-200 text-stone-900' : 'text-stone-500 hover:bg-stone-100',
            )}
        >
            {label}
        </button>
    )
}
```

- [ ] **Step 5: Add the archived lists, restore button, and empty state**

```tsx
function ViewArchivedSections() {
    const sections = useArchivedSections()
    if (sections.length === 0) return <ViewArchiveEmpty label="No archived sections." />
    return (
        <ul className="flex flex-col gap-1">
            {sections.map((section) => (
                <li
                    key={section.id}
                    className="group flex items-center gap-3 py-2 transition hover:bg-stone-100/60"
                >
                    <span className="wrap-anywhere min-w-0 flex-1 px-2 text-lg font-bold text-stone-500">
                        {section.title}
                    </span>
                    <ViewRestoreBtn onClick={() => unarchiveSection(section.id)} />
                    <ViewDeleteBtn
                        onClick={() => {
                            if (
                                window.confirm(
                                    `Permanently delete section “${section.title}” and its tasks?`,
                                )
                            )
                                deleteSection(section.id)
                        }}
                    />
                </li>
            ))}
        </ul>
    )
}

function ViewArchivedTasks() {
    const tasks = useArchivedTasks()
    if (tasks.length === 0) return <ViewArchiveEmpty label="No archived tasks." />
    return (
        <ul className="flex flex-col">
            {tasks.map((task) => (
                <li
                    key={task.id}
                    className="group flex items-center gap-3 py-2 transition hover:bg-stone-100/60"
                >
                    <span className={clsx(titleBox, task.done ? 'text-stone-600' : 'text-stone-900')}>
                        <span className={clsx('strike', task.done && 'is-done')}>{task.title}</span>
                    </span>
                    <ViewRestoreBtn onClick={() => unarchiveTask(task.id)} />
                    <ViewDeleteBtn
                        onClick={() => {
                            if (window.confirm(`Permanently delete “${task.title}”?`))
                                deleteTask(task.id)
                        }}
                    />
                </li>
            ))}
        </ul>
    )
}

function ViewArchiveEmpty({ label }: { label: string }) {
    return <p className="py-10 text-center text-sm text-stone-500">{label}</p>
}

function ViewRestoreBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 cursor-pointer rounded-md p-1 text-stone-600 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none"
        >
            <ArchiveRestore className="size-4" />
        </button>
    )
}
```

(`titleBox` is the existing module-level const in `App.tsx`; it is in scope for these functions regardless of declaration order. `ViewDeleteBtn` is the existing red destructive button — reused here for permanent delete.)

- [ ] **Step 6: Verify build + lint**

Run: `pnpm build && pnpm lint`
Expected: pass.

- [ ] **Step 7: Manual check**

In the app, click "Archive (0)" in the header → archive view opens with `Sections` / `Tasks` tabs, both empty ("No archived sections." / "No archived tasks."). Switch tabs; click "Board" to return. Nothing is archivable yet — Task 4 wires the board action.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx && git commit -m "feat(ui): tabbed archive view with restore and permanent delete"
```

---

### Task 4: Board archives instead of deletes

**Files:**
- Modify: `src/App.tsx` (import archive actions; add `ViewArchiveBtn`; `ViewSection` + `ViewTask` swap delete → archive)

- [ ] **Step 1: Import the archive actions**

Add `archiveSection,` and `archiveTask,` to the `./store` named imports (kept alphabetical, after `appendTask`):

```tsx
    appendSection,
    appendTask,
    archiveSection,
    archiveTask,
    deleteSection,
    deleteTask,
```

- [ ] **Step 2: Add `ViewArchiveBtn` (non-destructive — accent ring, not red)**

```tsx
function ViewArchiveBtn({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="shrink-0 cursor-pointer rounded-md p-1 text-stone-500 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-stone-100 focus-visible:bg-stone-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent focus-visible:outline-none"
        >
            <Archive className="size-4" />
        </button>
    )
}
```

- [ ] **Step 3: `ViewSection` — archive instead of delete (no confirm)**

Update the comment above the return, the `onAnimationEnd` handler, and the header button. The full `ViewSection` body becomes:

```tsx
function ViewSection({ section, animDelay }: { section: Section; animDelay: number }) {
    const tasks = useVisibleSectionTasks(section.id)
    const [exiting, setExiting] = useState(false)
    const [editingTitle, setEditingTitle] = useState(false)

    // Archiving slides the section out, then archives it (it leaves the board)
    // once the animation ends. No confirm — archiving is reversible.
    return (
        <div
            className={clsx('anim-section flex flex-col gap-4 transition', exiting && 'anim-out')}
            style={{ animationDelay: `${animDelay}ms` }}
            onAnimationEnd={(e) => {
                if (e.animationName === 'task-out' && exiting) archiveSection(section.id)
            }}
        >
            <div className="group flex items-center gap-2 border-b border-stone-200 pb-2">
                {editingTitle ? (
                    <ViewSectionTitleEditor
                        title={section.title}
                        onSave={(next) => {
                            updateSectionTitle(section.id, next)
                            setEditingTitle(false)
                        }}
                        onCancel={() => setEditingTitle(false)}
                    />
                ) : (
                    <>
                        <span
                            onClick={() => setEditingTitle(true)}
                            className="wrap-anywhere flex-1 cursor-text pl-2 text-lg font-bold text-stone-500 transition"
                        >
                            {section.title}
                        </span>
                        <ViewArchiveBtn onClick={() => setExiting(true)} />
                    </>
                )}
            </div>
            <ul>
                {tasks.map((task, i) => (
                    <ViewTask key={task.id} task={task} taskIndex={i} />
                ))}
                <ViewAddTask sectionId={section.id} />
            </ul>
        </div>
    )
}
```

- [ ] **Step 4: `ViewTask` — archive instead of delete (no confirm)**

Update the comment, the `onAnimationEnd` handler, and the button. The full `ViewTask` body becomes:

```tsx
function ViewTask({ task, taskIndex }: { task: Task; taskIndex: number }) {
    const [exiting, setExiting] = useState(false)
    const [editing, setEditing] = useState(false)

    // Archiving slides the task out, then archives it once the animation ends.
    return (
        <li
            className={clsx(
                'anim-task group flex items-center gap-3 py-2 transition hover:bg-stone-100/60',
                exiting && 'anim-out',
            )}
            style={{ animationDelay: `${Math.min(taskIndex, 8) * 30}ms` }}
            onAnimationEnd={(e) => {
                if (e.animationName === 'task-out' && exiting) archiveTask(task.id)
            }}
        >
            <ViewCheckbox done={task.done} onClick={() => toggleTask(task.id)} />
            {editing ? (
                <ViewTitleEditor
                    title={task.title}
                    onSave={(next) => {
                        updateTaskTitle(task.id, next)
                        setEditing(false)
                    }}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <ViewTitle done={task.done} title={task.title} onEdit={() => setEditing(true)} />
                    <ViewArchiveBtn onClick={() => setExiting(true)} />
                </>
            )}
        </li>
    )
}
```

- [ ] **Step 5: Verify build + lint**

Run: `pnpm build && pnpm lint`
Expected: pass. `ViewDeleteBtn` is still referenced (archive view), so no unused-symbol error.

- [ ] **Step 6: Manual check (full loop)**

- Hover a board task → click the archive (box) icon → it slides out and disappears; header reads "Archive (1)".
- Open the archive → `Tasks` tab lists it (strikethrough if it was done). Click restore → it returns to the board in its original position (order preserved).
- Archive a whole section → the board hides it and its tasks; the `Sections` tab shows the section name only; restore → the section and its still-non-archived tasks reappear.
- Edge: archive a task on its own, then archive its section. Restoring the section does NOT bring that task back (it kept its own archived flag — still in the `Tasks` tab). Restoring the task brings it back only if its section is on the board.
- Permanent delete inside the archive prompts a confirm and removes the item for good.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx && git commit -m "feat(ui): board archives instead of deletes"
```

---

## Self-Review

**Spec coverage** (against `docs/reference/archive-visibility.md`):
- Independent `.archived` flags, no cascade, no stored relationship → Task 1 (flags), Task 2 (actions touch only their own entity). ✅
- Section not archived → board / archived → archive view, name only → `useBoardSections` (Task 2) + `ViewArchivedSections` renders title only (Task 3). ✅
- Task archived → archive task list → `useArchivedTasks` + `ViewArchivedTasks` (Task 3). ✅
- Task not archived shows on board only if its section is too; non-archived task in an archived section shows nowhere; restoring the section brings it back → board renders only non-archived sections, each filtering non-archived tasks (Tasks 2 + 4). ✅
- Archiving/unarchiving a section never touches task flags (and vice versa) → separate `map` over only the targeted collection (Task 2). ✅
- `done` orthogonal to archive → archive selectors ignore `done`; archive view shows done state via `strike` (Task 3). ✅
- Restore preserves order → `order` is never mutated by archive/unarchive (Task 2). ✅

**Placeholder scan:** none — every code step shows complete code.

**Type consistency:** `archived: boolean` on both types; action names `archiveTask`/`unarchiveTask`/`archiveSection`/`unarchiveSection`; selector names `useBoardSections`/`useArchivedSections`/`useArchivedTasks`/`useArchivedCounts`; component names `ViewArchive`/`ViewArchiveTab`/`ViewArchivedSections`/`ViewArchivedTasks`/`ViewArchiveEmpty`/`ViewRestoreBtn`/`ViewArchiveBtn` — all used consistently across tasks.

**Out of scope (deliberately):** fixing the `onAnimationEnd`-gated removal fragility (roadmap §6) — this plan reuses the existing exit-animation pattern unchanged, just swapping the terminal action from delete to archive.
