# Task-list query model

Status: design exploration, not implemented. This records how a derived list —
of tasks or of sections — should be represented when there are many ways to slice
and order it. The single rule driving every decision: make impossible states
unrepresentable.

The body covers what's actually needed now. Everything speculative lives in the
**Advanced** section at the very end, behind a warning. Read the body first.

## The problem

A "list" in this app is never the raw set — it's always some subset (this
section, only the incomplete tasks, only the archived ones) in some order. The
straightforward way to produce one is a chain of filters and a sort returning a
plain `Task[]` (or `Section[]`).

The plain array is the problem. Once the chain has run, the list carries no
identity. Nothing on it says what subset it represents or where it came from —
that knowledge existed only in which function was called to build it. So:

- An empty result is indistinguishable from any other empty result; you can't
  even tell which section it belonged to.
- A function handed such a list cannot describe or act on it generically (render
  the right header, run a bulk action scoped to it).

We want a list to know what it is.

## Two tempting shapes that are wrong

**A single tag** — label each list `'incomplete' | 'archived' | 'section'`. This
fails because the ways of slicing are not alternatives, they combine. "The
incomplete, non-archived tasks of section A" is three constraints at once, not a
fourth name. Tagging forces you to enumerate the product of every constraint; the
list of names explodes and never closes.

**A description paired with its result** — store `{ criteria, tasks }` so the
array travels with an account of itself. This is worse: the two halves are
independent fields, so `{ criteria: "archived only", tasks: [a task that isn't
archived] }` is a value the type permits. The array is a cache of the criteria
that can silently disagree with it — an impossible state made representable, the
exact thing we're avoiding.

## The model

Represent a list by its **criteria alone**. The array is computed from criteria
plus current state, on demand, and is never stored next to the criteria. If the
two are never paired, they can never disagree — nothing to keep in sync, nothing
to validate.

The criteria is a record of independent constraints. Each is three-valued:
require it true, require it false, or don't care.

```ts
type TaskFilter = {
    sectionId?: string // undefined = any section
    done?: boolean // undefined = either
    archived?: boolean // undefined = either
}

function selectTasks(state: AppState, f: TaskFilter): Task[] {
    let ts = state.tasks
    if (f.sectionId !== undefined) ts = ts.filter((t) => t.sectionId === f.sectionId)
    if (f.done !== undefined) ts = ts.filter((t) => t.done === f.done)
    if (f.archived !== undefined) ts = ts.filter((t) => t.archived === f.archived)
    return sortBy(ts, prop('order')) // ordering is invariant — see below
}
```

Each list a screen needs becomes a small named criteria value, all resolved by
the same function: "incomplete tasks of a section" is `{ sectionId, done: false,
archived: false }`, "everything archived" is `{ archived: true }`. The criteria is
a *noun* — a description of the wanted set. You hand the whole thing to
`selectTasks` once and a finished list comes back. A caller never walks it through
stages or reasons about operation order.

## Why no impossible state survives

Separate two meanings of "invalid criteria":

1. **Self-contradictory** — a value that could never describe any real situation.
   This is what we forbid.
2. **Coherent but unsatisfied** — a sensible description that happens to match
   nothing right now (e.g. a section id that no longer exists). Not a broken
   value; just an empty answer.

`TaskFilter` cannot express the first. Each field stands alone and holds one
value, so there is no way to write a contradiction: you can't ask for done to be
both true and false, can't name two conflicting sections, have no field that
denies another. Every combination describes some genuine set. The three-valued
fields give mutual exclusivity for free — true, false, or absent, no fourth
illegal state.

A criteria naming a deleted section is the second kind — a reference into
changing state, which no value type can promise still resolves. Let it return an
empty list. This is a different concern from the paired-description trap, where
the value itself asserted two things that couldn't both hold.

## Sections

Sections get sliced the same way (board sections, archived sections, the
move-menu targets), so the same model applies — a *parallel* filter type, not a
shared one, because the fields differ.

```ts
type SectionFilter = {
    archived?: boolean // undefined = either
    excludeId?: string // omit one section (the move-menu's "not this one")
}

function selectSections(state: AppState, f: SectionFilter): Section[] {
    let ss = state.sections
    if (f.archived !== undefined) ss = ss.filter((s) => s.archived === f.archived)
    if (f.excludeId !== undefined) ss = ss.filter((s) => s.id !== f.excludeId)
    return sortBy(ss, prop('order'))
}
```

- Board sections → `{ archived: false }`; archived pane → `{ archived: true }`;
  move targets for a section → `{ archived: false, excludeId: id }`.
- `excludeId` is a *negative* identity filter — "every section except this one."
  Still impossible-state-free: a ghost `excludeId` excludes nothing, and it can't
  contradict `archived`.
- **The board is composition, not a combined query.** "A task in an archived
  section shows nowhere" is not one cross-entity filter. The board asks
  `selectSections({ archived: false })`, then for each, `selectTasks({ sectionId,
  archived: false, ... })`. An archived section isn't iterated, so its tasks are
  never requested. Keeping the two queries orthogonal and composing them in the
  view is what preserves the independent archive flags — fusing them into one
  query is where a cascade (and impossible states) would creep back in.

## Filtering vs. ordering

Different operations, different shapes:

- **Filtering** chooses membership. It commutes — narrowing to a section then to
  the incomplete tasks gives the same set as the reverse. Order among filters is
  irrelevant, so they're an unordered bag of fields.
- **Ordering** arranges the survivors. It does not commute and never touches
  membership, so it always runs last.

Today there is exactly one ordering — each item's fractional `order` key — so
ordering does not vary. It's a fixed final `sortBy(prop('order'))` inside the
resolvers, **not** a criteria field. Modeling an invariant as data is either dead
weight or a fresh way to be wrong (a sort field whose only legal value is one
string still lets you write a different one). Don't model what can't vary. When a
second ordering actually appears, see Advanced.

Crucially, that `order` key *is the user's own arrangement* — fractional indexing
is what drag-to-reorder writes. So the default ordering is always the user's
choice, not an algorithm's. This stays true once other orderings exist: they only
ever apply when the user explicitly sets one for a view. With nothing set, the
list falls back to the user's manual order.

## Search (present)

Plain substring match over titles. Nothing special — no ranking, no filters, no
scopes — until other features justify more. It returns matching tasks *and*
sections, archived or not, because the point of search is to find a thing
wherever it lives.

```ts
function search(state: AppState, term: string): { tasks: Task[]; sections: Section[] } {
    const q = term.trim().toLowerCase()
    if (!q) return { tasks: [], sections: [] }
    const hit = (title: string) => title.toLowerCase().includes(q)
    return {
        tasks: sortBy(
            state.tasks.filter((t) => hit(t.title)),
            prop('order'),
        ),
        sections: sortBy(
            state.sections.filter((s) => hit(s.title)),
            prop('order'),
        ),
    }
}
```

Two homogeneous lists, not a merged ranked feed. An empty term yields empty
results. That's the whole feature for now.

## Worked examples (present)

Criteria-building presets, each resolved by one function and one hook:

```ts
const visibleSectionTasks = (sectionId: string, showDone: boolean): TaskFilter => ({
    sectionId,
    archived: false,
    done: showDone ? undefined : false, // hide completed unless the toggle is on
})
const sectionDoneTasks = (sectionId: string): TaskFilter => ({ sectionId, archived: false, done: true })
const archivedTasks = (): TaskFilter => ({ archived: true })

const boardSections = (): SectionFilter => ({ archived: false })
const moveTargets = (id: string): SectionFilter => ({ archived: false, excludeId: id })
const archivedSections = (): SectionFilter => ({ archived: true })

function useTasks(f: TaskFilter): Task[] {
    return useAppShallow((s) => selectTasks(s, f))
}
function useSectionsBy(f: SectionFilter): Section[] {
    return useAppShallow((s) => selectSections(s, f))
}
```

A section column, holding its own context — note the header still names its
section when the list is empty, which the bare-array version couldn't do:

```tsx
function ViewSectionColumn({ section }: { section: Section }) {
    const showDone = useShowDone()
    const tasks = useTasks(visibleSectionTasks(section.id, showDone))
    return (
        <section>
            <h2>{section.title}</h2>
            {tasks.length === 0 && <p>No tasks in {section.title}. Add one above.</p>}
            {tasks.map((t) => (
                <ViewTask key={t.id} task={t} />
            ))}
        </section>
    )
}
```

The board, composing the two resolvers rather than fusing them:

```tsx
function ViewBoard() {
    const sections = useSectionsBy(boardSections())
    return sections.map((s) => <ViewSectionColumn key={s.id} section={s} />)
}
```

## When to build any of this

Today the code returns plain `Task[]` / `Section[]` from purpose-specific
selectors, and that's fine while every caller already knows the context of the
list it asked for. Introduce `selectTasks` / `selectSections` and named criteria
only when something genuinely generic needs a list's identity, or to remove
duplicated filtering logic. Keep search a substring match until a real need pushes
past it — at which point, and not before, read on.

---

## Advanced — enter at your own risk

> None of this is built, and on the last review the over-engineering token was
> deliberately **taken back**. This section exists only so the design space isn't
> lost. Do not implement any of it speculatively. It earns its place the day a
> concrete feature needs it — date queries, multi-key sort, ranked cross-entity
> search — and not one line sooner. If you're here to "make search nicer" with no
> such feature on the table, turn around.

The governing principle if you ever do spend the token: it buys **generality**
(more real query shapes), never **looseness** (contradictions). Those are
separate purchases. Stay broad *and* sound by composing per-entity typed criteria
— never a single optional-everything bag.

### Ordering that varies

The moment a second ordering exists — manual, creation time, due date, search
relevance, or several combined — ordering earns its own type. A discriminated
union, because a direction is meaningful for some orderings and nonsense for
others:

```ts
type Dir = 'asc' | 'desc'
type SortKey =
    | { field: 'manual' } // one total order — no direction
    | { field: 'createdAt'; dir: Dir }
    | { field: 'dueDate'; dir: Dir }
    | { field: 'title'; dir: Dir }
type OrderBy = SortKey[] // first key primary, the rest break ties
```

`dir` lives only where direction has meaning, so `{ field: 'manual', dir: 'desc'
}` is unrepresentable. Multi-ordering is just array order, applied in sequence —
which is why it must be an ordered list, not a set: `[dueDate, title]` ≠ `[title,
dueDate]`.

`manual` is not just one option among equals — it is the user's own fractional
`order`, the baseline the app always uses when no view sort is chosen. The other
keys are explicit, view-time overrides: the user opts into "sort by due date" to
*look* at the list that way, and it never rewrites the stored `order`. Drop the
override and the user's manual arrangement returns untouched. So `[{ field:
'manual' }]` is the implicit default `sort` everywhere; the others are opt-in.

### Date constraints

```ts
type DateConstraint =
    | { op: 'overdue' } // relative to now — takes nothing
    | { op: 'before' | 'after'; at: string }
    | { op: 'between'; from: string; to: string }
```

Discriminated, so `at` exists only on `before`/`after`, `from`/`to` only on
`between`, and `overdue` takes nothing — `{ op: 'overdue', at: … }` won't compile.

### Unified find over per-entity criteria

```ts
type TaskCriteria = {
    done?: boolean
    archived?: boolean
    sectionId?: string
    due?: DateConstraint
    createdAt?: DateConstraint
}
type SectionCriteria = {
    archived?: boolean
    excludeId?: string
}

// term optional; include an entity by giving its criteria, omit to skip it.
type Find = {
    term?: string
    tasks?: TaskCriteria
    sections?: SectionCriteria
    sort?: OrderBy // when term is present, results are relevance-ranked and this breaks ties
}
```

Cross-entity results need a discriminated hit so a task hit can't hold a section:

```ts
type Hit = { kind: 'task'; task: Task } | { kind: 'section'; section: Section }
```

What the generalization buys, and what it still forbids:

```ts
// "where's the task I marked done?" — a done task, named, anywhere
const a: Find = { term: 'invoice', tasks: { done: true, archived: undefined } }
// "a section that was archived or not"
const b: Find = { term: 'q3 planning', sections: { archived: undefined } }
// both entities at once
const c: Find = { term: 'budget', tasks: {}, sections: {} }
// overdue still-open tasks — pure filter, no term
const d: Find = { tasks: { done: false, due: { op: 'overdue' } } }
// anything from last year
const e: Find = { tasks: { createdAt: { op: 'between', from: '2025-01-01', to: '2025-12-31' } } }

// still uncompilable — generality didn't buy looseness:
const x: Find = { sections: { done: true } } //              ✗ `done` isn't a section field
const y: OrderBy = [{ field: 'manual', dir: 'desc' }] //     ✗ manual has no direction
```

- `done` / `due` / `sectionId` live only on `TaskCriteria`, so a "done section"
  can't be asked for. A shared bag would have allowed it.
- `term` is optional, so a query is text-only, filter-only, or both — all
  coherent. Relevance ranking happens only when `term` is present; a score is
  never a free-standing field, so "relevance with no term" stays unrepresentable.
- Omitting both `tasks` and `sections` yields nothing — empty, not contradictory,
  so it's allowed rather than over-constrained.

Breadth came from composing typed pieces; soundness came from never merging them.
That's the only way the token is worth spending — and again, don't, until a
feature makes you.
