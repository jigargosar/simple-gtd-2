# Dynamic Workflows — How They Work

> A detailed report on Claude Code's dynamic workflow feature: what it is, how
> it is triggered, how the orchestration engine executes, and how to author one.
> Sourced from the `Workflow` tool specification and the Claude Code changelog
> (dynamic workflows introduced in v2.1.156; keyword-trigger config added in
> v2.1.157).

---

## 1. What a dynamic workflow is

A **dynamic workflow** is a JavaScript orchestration script that Claude writes
on the fly and runs in the background. The script spawns and coordinates
**many subagents** — tens to hundreds — to take on work that is too large,
too parallel, or too in need of independent verification for a single
conversation turn to handle well.

The word *dynamic* matters: the workflow is **authored per-request**, not
selected from a fixed menu. Claude composes the control flow (loops, fan-out,
conditionals, verification passes) to fit the specific task, then hands the
script to a deterministic runtime that executes it.

Three reasons to reach for one:

1. **Comprehensiveness** — decompose a problem and cover every part in parallel.
2. **Confidence** — generate independent perspectives, then adversarially
   check them before committing to an answer.
3. **Scale** — take on work one context window cannot hold (large migrations,
   broad audits, codebase-wide sweeps).

You view and monitor runs with the `/workflows` command.

---

## 2. How a dynamic workflow is *triggered*

There are two layers to triggering.

### 2.1 The keyword trigger

The literal word **"workflow"** (or "workflows") appearing in your prompt is
the trigger. When the runtime detects it, it signals Claude that the request
should be fulfilled by authoring and running a dynamic workflow rather than by
working inline.

Controls around the keyword trigger (added v2.1.157):

1. **`/config` → "Workflow keyword trigger"** — a setting to turn the
   keyword-triggering behavior **off**, so that the word "workflow" in a prompt
   no longer auto-launches a dynamic workflow. (`/config` shows a second
   workflow-related parameter whose exact label still needs to be figured out —
   easy enough: read it off the `/config` screen.)
2. **Dismiss in-flight** — pressing **backspace immediately after** the trigger
   keyword, or pressing **alt+w**, dismisses the workflow request.

### 2.2 The opt-in gate (why the keyword exists)

Dynamic workflows can spawn dozens of agents and consume a large amount of
tokens, so the runtime requires **explicit opt-in** before launching one. The
keyword is the cheapest form of that opt-in. The full set of opt-in triggers:

1. The prompt contains the keyword "workflow" / "workflows" (keyword trigger).
2. **Ultracode** mode is on — a standing opt-in that authors a workflow for
   every substantive task by default.
3. The user asks, in their own words, for multi-agent orchestration
   ("fan out agents", "orchestrate this with subagents").
4. A skill or slash command instructs Claude to call the workflow engine.
5. The user invokes a specific named or saved workflow.

Without one of these, Claude will **not** launch a workflow — it will work
inline or briefly describe what a workflow could do and ask first.

---

## 3. Anatomy of a workflow script

Every script is plain JavaScript (not TypeScript) and must begin with a pure
`meta` literal describing the run, followed by the script body.

```js
export const meta = {
    name: 'find-flaky-tests',
    description: 'Find flaky tests and propose fixes', // shown in permission dialog
    phases: [
        { title: 'Scan', detail: 'grep test logs for retries' },
        { title: 'Fix',  detail: 'one agent per flaky test' },
    ],
}

phase('Scan')
const flaky = await agent('grep CI logs for retry markers', { schema: FLAKY_SCHEMA })

phase('Fix')
// ... orchestrate fixes ...
```

Rules for `meta`:

1. It must be a **pure literal** — no variables, function calls, spreads, or
   template interpolation.
2. Required fields: `name`, `description`. Optional: `whenToUse`, `phases`,
   per-phase `model`.
3. Phase titles in `meta.phases` are matched **exactly** to `phase()` calls in
   the body.

---

## 4. The orchestration primitives

The script body runs in an async context and has these hooks available.

### 4.1 `agent(prompt, opts?)` — spawn one subagent

- Without a `schema`, returns the agent's final text as a **string**.
- With a `schema` (JSON Schema), the agent is forced to call a
  `StructuredOutput` tool and `agent()` returns the **validated object** — no
  parsing needed; the model retries on mismatch.
- Returns `null` if the user skips the agent mid-run (filter with
  `.filter(Boolean)`).
- Key options: `label` (display name), `phase` (progress group — set this
  explicitly inside `pipeline`/`parallel` to avoid races on global `phase()`
  state), `model` (tier override — omit by default to inherit the session
  model), `isolation: 'worktree'` (own git worktree; expensive — only when
  agents mutate files in parallel), `agentType` (use a custom subagent type
  like `Explore` or `code-reviewer`).

### 4.2 `pipeline(items, stage1, stage2, ...)` — the default for multi-stage work

Runs each item through **all stages independently, with no barrier between
stages**. Item A can be in stage 3 while item B is still in stage 1. Wall-clock
equals the slowest single-item chain, not the sum of slowest-per-stage. Each
stage callback receives `(prevResult, originalItem, index)`. A stage that
throws drops that item to `null` and skips its remaining stages.

### 4.3 `parallel(thunks)` — a barrier

Runs an array of `() => Promise` thunks concurrently and **awaits all of them**
before returning. A thunk that throws resolves to `null` (the call never
rejects), so `.filter(Boolean)` before using results. Use **only** when you
genuinely need all results together.

**pipeline vs parallel** — default to `pipeline`. A barrier is justified only
when stage N needs cross-item context from *all* of stage N-1 (dedup/merge
across the full set, early-exit on zero results, or a prompt that references
"the other findings"). It is *not* justified by "I need to flatten/map/filter
first" (do that inside a pipeline stage) or "it's cleaner."

### 4.4 `phase`, `log`, `workflow`, and globals

- `phase(title)` — start a new phase; subsequent `agent()` calls group under it
  in the progress display.
- `log(message)` — emit a narrator line above the progress tree.
- `workflow(nameOrRef, args?)` — run another workflow inline as a sub-step
  (one level of nesting only; nesting inside a child throws).
- `args` — the value passed as the Workflow tool's `args` input, verbatim.
- `budget` — `{ total, spent(), remaining() }`. The turn's token target. The
  pool is **shared** across the main loop and all workflows. `total` is `null`
  when no target was set; `remaining()` is `Infinity` then. The target is a
  **hard ceiling** — once `spent()` reaches `total`, further `agent()` calls
  throw.

Standard JS built-ins are available **except** `Date.now()`, `Math.random()`,
and argless `new Date()` — these throw, because they would break resume.
There is no filesystem or Node.js API access; MCP tools are reachable via
`ToolSearch` per agent.

---

## 5. Execution model

1. **Background execution** — the `Workflow` tool returns immediately with a
   run ID; a task notification arrives when the workflow completes. Watch live
   progress with `/workflows`.
2. **Concurrency cap** — concurrent `agent()` calls are capped at
   `min(16, cpu_cores - 2)` per workflow. You can pass 100 items to
   `parallel`/`pipeline` and all complete; only ~10 run at any instant, the
   rest queue.
3. **Lifetime cap** — total agents across a workflow's life is capped at
   **1000**, a runaway-loop backstop set far above any real workflow.
4. **Persistence** — every invocation persists its script to a file under the
   session directory and returns the path. To iterate, edit that file and
   re-invoke with `{ scriptPath }` instead of resending the full script.

---

## 6. Resume

A run can be resumed after a pause, kill, or script edit:

1. Relaunch with `{ scriptPath, resumeFromRunId }`.
2. The **longest unchanged prefix** of `agent()` calls returns cached results
   instantly; the first edited/new call and everything after it runs live.
3. Same script + same args → 100% cache hit.
4. Because resume depends on determinism, `Date.now()` / `Math.random()` /
   `new Date()` are unavailable in scripts — stamp results *after* the workflow
   returns, or pass timestamps in via `args`.

---

## 7. Quality patterns

These are composable shapes, picked and combined to fit the task. Scale them to
the request: "find any bugs" → a few finders with single-vote verify;
"thoroughly audit this" → a larger finder pool, a 3-5 vote adversarial pass, and
a synthesis stage.

1. **Adversarial verify** — spawn N independent skeptics per finding, each
   prompted to *refute* it; kill the finding if a majority refute. Prevents
   plausible-but-wrong findings from surviving.
2. **Perspective-diverse verify** — when a finding can fail in more than one
   way, give each verifier a distinct lens (correctness, security, perf,
   does-it-reproduce) instead of N identical refuters.
3. **Judge panel** — generate N independent attempts from different angles,
   score with parallel judges, synthesize from the winner while grafting the
   best ideas from runners-up.
4. **Loop-until-dry** — for unknown-size discovery, keep spawning finders until
   K consecutive rounds return nothing new. Dedup against everything *seen*
   (not just confirmed), or rejected findings reappear and it never converges.
5. **Multi-modal sweep** — parallel agents each searching a different way
   (by-container, by-content, by-entity, by-time); each is blind to what the
   others surface.
6. **Completeness critic** — a final agent that asks "what's missing?"; what it
   finds becomes the next round of work.
7. **No silent caps** — if a workflow bounds coverage (top-N, sampling,
   no-retry), `log()` what was dropped, so truncation is never mistaken for
   full coverage.

### Canonical multi-stage example (pipeline + per-finding verify)

```js
const DIMENSIONS = [{ key: 'bugs', prompt: '...' }, { key: 'perf', prompt: '...' }]

const results = await pipeline(
    DIMENSIONS,
    d => agent(d.prompt, { label: `review:${d.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }),
    review => parallel(review.findings.map(f => () =>
        agent(`Adversarially verify: ${f.title}`, { label: `verify:${f.file}`, phase: 'Verify', schema: VERDICT_SCHEMA })
            .then(v => ({ ...f, verdict: v })),
    )),
)

const confirmed = results.flat().filter(Boolean).filter(f => f.verdict?.isReal)
return { confirmed }
// Dimension 'bugs' findings verify while 'perf' is still reviewing — no wasted wall-clock.
```

### Budget-scaled loop

```js
const bugs = []
while (budget.total && budget.remaining() > 50_000) {
    const result = await agent('Find bugs in this codebase.', { schema: BUGS_SCHEMA })
    bugs.push(...result.bugs)
    log(`${bugs.length} found, ${Math.round(budget.remaining() / 1000)}k remaining`)
}
```

The `budget.total &&` guard is essential: with no target set, `remaining()` is
`Infinity` and the loop would run straight to the 1000-agent cap.

---

## 8. When *not* to launch a dynamic workflow

1. No explicit opt-in (see §2.2) — work inline or ask first.
2. A single-fact lookup or a trivial mechanical edit — use a direct tool.
3. Work that fits comfortably in one context and needs no parallelism or
   independent verification.

The hybrid move is often best: **scout inline first** (list the files, scope the
diff, find the work-list), *then* call the workflow to pipeline over that list.
You don't need to know the shape before the task — only before the
orchestration step.

---

## Sources

- Claude Code `Workflow` tool specification (orchestration primitives,
  execution/concurrency/resume model, quality patterns).
- Claude Code changelog: v2.1.156 (dynamic workflows introduced); v2.1.157
  ("Workflow keyword trigger" `/config` setting; backspace/alt+w dismissal).
