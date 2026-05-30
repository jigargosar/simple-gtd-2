# Format Compliance Experiment

How to make Claude actually follow a response format, and why it sometimes
does and sometimes doesn't. Captured from one session that "broke through"
plus one prior session used as a comparison. n is tiny — everything below
the Techniques section is provisional.

---

## Techniques (good ones first)

### Top priority — these three are what I want to reuse

1. **Header instruction (verbatim prompt first).**
   > when show response let first section be my verbatim prompt that lead you to generate this response.
   - The active ingredient is the selection clause **"that lead you to generate this response"** — it makes Claude run an *attribution* step (which prompt caused this response?), not a copy step. It correctly skips meta-commands like "try again" and quotes the prompt that actually generated the content.
   - Observed to work in two separate sessions from the instruction alone — no file print, no correction loop needed.

2. **`try again` (terse correction, no explanation).**
   - Forces Claude to self-audit its last response against the rules and find the violation itself, instead of being handed the fix. Used ~4 times here on a single named artifact.

3. **`@C:\Users\jigar\.claude\output-styles\easy-flow.md` (inline path reference).**
   - The `@`-path makes the harness auto-read the file and inject its **full verbatim content** into context before Claude replies — independent of whether Claude prints it. Guarantees the exact rules are present.

### Other techniques tried this session

4. **Print the file inline.** Re-emits the rules as Claude's own recent output (self-authored + recent), on top of whatever delivered them.
5. **Name the response ("r1").** Gives a stable referent so corrections accumulate on one target across turns.
6. **Iterate on one artifact.** Apply rules → "try again" → repeat, instead of moving on.
7. **De-vague backreferences.** "what above?" and "replace 'hasn't changed' with the actual goal inline" force Claude to expand its own vague pointers into concrete text.
8. **Restate to sync.** "restate so we can be on same page" before proceeding.
9. **Facts vs ❓ speculation.** Was already in the output style; enforced explicitly here.
10. **Counter-bias / reverse search.** "do reverse search to keep confirmation bias in check" — and actively testing prior speculations to refute them, not just confirm.

---

## Question

Does Claude infer the desired format from **re-presenting the header
instruction**, or does it need the **printed `easy-flow.md` + the `try again`
loop**?

## Hypotheses

- **H1 (user):** Re-presenting the header instruction alone drives the style.
  Print and try-again are not necessary.
- **H2 (alt):** Strict mechanical compliance needs the rules printed into
  context plus the correction loop.

## Facts observed

- **F1** — `@…easy-flow.md` caused the harness to auto-read the file (a Read
  ran without Claude invoking it). n=1.
- **F2** — The SessionStart hook injects text identical to `easy-flow.md`'s
  rules every session. So the rules are present even with no `@` and no print.
- **F3** — A different session reproduced the **header** from the instruction
  alone.
- **F4** — That session had **no** easy-flow print and **no** try-again loop
  before it.
- **F5** — Its thinking ran the same attribution step ("which prompt led to
  that response?"). Header behavior corroborated, n=2.
- **F6** — That session also produced the **★ recommendation** convention.
- **F7** — It was **concise**, short lines, one question per line.
- **F8** — General style (header, ★, concision, one-Q/line) appeared in both
  sessions.
- **F9** — But its **numbering restarted** per section (1–6, then 1–4 again)
  instead of staying serial-unique across the whole response.

## The split found

- **Transfers from the instruction alone:** header, ★ recommendation,
  concision, one-question-per-line. (F3–F8, n=2)
- **The only rule that differed:** strict serial-unique numbering. Followed in
  the format-focused session, violated in the real-work session. (F9)

## Confounds

- **Attention.** The session that complied tightly was *about* formatting; the
  one that didn't was doing real work (animation fixes). Tighter numbering may
  be driven by attention, not by the print/loop. Not yet separable.
- **Escaped periods (`1\.`) are unobservable from a rendered paste** — Markdown
  strips the backslash. Only judge this from raw/source text.
- **Hook always on.** With the SessionStart hook injecting the rules every
  session, `@path` vs a vague reference are equivalent *for presence*. They
  would only diverge with the hook off — untested.

## Signals to watch (ranked)

1. ★ **Serial-unique numbering** — in a multi-section response, do numbers
   keep climbing or restart at 1 each section? (The one rule that differed.)
2. **Header attribution** — does the quoted first block match the prompt that
   *caused* the content, skipping bare "try again"?
3. **★ recommendation** — does ★ appear when there are options?
4. **Escaped periods** — check **raw view only**, else skip.

## Per-session log

Fill one row per observed session.

| Date       | Task type        | Printed easy-flow? | `try again` count | Header correct? | Numbering restart? | ★ present? |
|------------|------------------|--------------------|-------------------|-----------------|--------------------|------------|
| 2026-05-30 | format (meta)    | yes                | 4                 | yes             | no                 | yes        |
| (prior)    | real work (anim) | no                 | ~1                | yes             | yes                | yes        |

## Status / next

- Header + general style: **supported** (n=2).
- Strict numbering cause: **confounded** by attention; needs a controlled run.
- Clean test: same task type in both arms, vary only print + try-again. Log the
  table above across more sessions before concluding.
