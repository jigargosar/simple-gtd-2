# UI Report

Pass 1: default display only — the board at rest, as it renders on first load.
Interactions, menus, and dialogs are deliberately out of scope; they get their own
pass once the fundamentals below are settled. Lenses: frontend-baseline (floors)
and frontend-design (identity, hierarchy, intent). ARIA / semantic HTML /
reduced-motion excluded per project convention.

## Verdict

1. The resting page is calm, uncluttered, and the task text itself is excellent
   (near-black on white, AAA with margin) — the core reading surface is right.
2. Three fundamentals fail before any interaction happens: section headings are
   the dimmest text on the page (inverted hierarchy), checkbox targets are below
   the WCAG 2.2 minimum, and the page shifts sideways when the scrollbar toggles.
3. Nothing at rest is broken enough to invalidate the layout direction — fix the
   items in "Fundamentals to fix" and the deeper passes are worth running.

## Measured contrast (static, at rest)

4. Task title, stone-900 on white: 16.8:1 — AAA. The strongest element, correctly
   spent on the content that matters.
5. Section heading, stone-500 on white, 18px bold: 4.8:1 — passes AA-large,
   fails AAA (7:1). APCA roughly Lc 65: acceptable for body, thin for a heading.
6. Placeholder "Add to list…", stone-600 on white: 7.6:1 — AAA. Fine.
7. Placeholder "New section…", stone-500 on white: 4.8:1 — AA only, and it sits
   at the same size/weight as real headings (see hierarchy, item 13).
8. Checkbox ring / chevron / ⋯ button, stone-500 on white: 4.8:1 — clears the
   3:1 non-text floor with margin. Fine.
9. Section divider, stone-200 on white: 1.24:1 — decorative hairline, perceptible
   but only just; it is also the only structural device separating sections, so
   the whitespace is doing almost all the work (workable, but fragile).
10. Dev Reset button, red-700 on white: 6.5:1 — AA. Contrast fine; placement
    problem noted in item 20.

## Fundamentals to fix

11. Inverted color hierarchy: headings (stone-500, 4.8:1) are lighter than the
    tasks under them (stone-900, 16.8:1). Size (18 vs 16 px) and weight (700 vs
    400) both say "heading"; color says "de-emphasized". Floor rule: each cue
    must carry the level on its own — color actively contradicts here. The 2px
    size step is also too small to carry structure if weight were removed.
    Fix direction: headings at stone-700 (10.3:1) keep the muted feel while
    reading as parents, or keep stone-500 and widen the size gap meaningfully.
12. Checkbox hit target is 20×20 px (h-5 w-5 button, no padding): below the
    24×24 WCAG 2.2 AA minimum, far from the 44×44 goal — and it is the single
    most-used control in the app. The visual circle can stay 20px; the button
    needs padding to reach at least 24, ideally ~40 with the row height.
13. "New section…" ghost row renders at the exact size, weight, and color of a
    real section heading (18px bold stone-500). At rest, the bottom of the board
    shows what looks like a fifth heading with a plus sign — a phantom section.
    Placeholders should sit a clear level below real content.
14. Scrollbar layout shift: no scrollbar-gutter: stable on the scroll root. The
    centered max-w-2xl column moves horizontally whenever content height crosses
    the viewport (add tasks, collapse a section, open Show completed). On a calm
    app, sideways lurching is the opposite of the brand.
15. Zero at-rest affordances on rows: drag, move-to, and archive are opacity-0
    until hover, and titles are click-to-edit with no visible cue (cursor change
    only). The default display communicates none of the app's verbs beyond
    checking off. Desktop users must discover by mousing around; on touch these
    controls effectively do not exist. Even one persistent, quiet cue (visible
    handle on the row, or a chevron-style overflow) would fix discoverability
    without noise.

## Design critique (identity and intent)

16. The page at rest is 100% grayscale. The accent token (blue-700) exists but
    is spent only on focus rings and carets — a first-time viewer never sees it.
    Calm is the stated goal, but calm and characterless are different things:
    right now the only chromatic element on screen is the red dev button.
17. No signature: Inter at three sizes, stone palette, hairline dividers — this
    is the untuned Tailwind default look. Nothing on the resting screen would
    identify SimpleGTD against any other starter todo app. One deliberate move
    (a characterful display face for section headings, a distinctive check
    animation already exists but is invisible at rest, a considered accent) would
    carry the identity.
18. Brand hierarchy is inverted too: "SimpleGTD" is 14px — the smallest text on
    the page, smaller than every task. The wordmark then floats above ~110px of
    empty vertical space before the first heading, with the ⋯ menu button
    orphaned in that gap, aligned to neither the header row nor the Inbox
    heading. The top of the page reads as three unrelated strata.
19. Type scale is compressed: 14 / 16 / 18 px across brand, body, and headings.
    A resting screen with real structure wants a wider scale (or heavier
    weight/case contrast) so the eye can navigate without reading.
20. The dev Reset pill is the highest-contrast colored element on screen and
    sits in the bottom-right hot corner, so it reads as the page's primary
    action. Dev-only and already excluded from prod builds, so acceptable — but
    worth dimming (e.g. neutral until hover) so day-to-day dev work isn't
    anchored by a red button.
21. Vocabulary splits at rest: task rows say "Add to list…" while the section
    ghost says "New section…" — the same container is a "list" in one line and
    a "section" in the next. Pick one word (the archive dialog already says
    "lists") and use it everywhere.

## Code-level notes (from the same pass)

22. Margins are used throughout (mb-6, mt-1, my-1, ml-auto…) where the baseline
    calls for padding/gap except centering. Works today, but it is the classic
    source of collapsing/asymmetric spacing as the layout grows.
23. CLAUDE.md still states "Drag-and-drop is unimplemented" while @dnd-kit is
    wired into the board — stale contract doc.

## Queued for later passes

24. Pass 2, interaction states: hover/focus/active contrast deltas, the
    edge-to-edge hover band on rows and menu items (fusion floor), hidden-control
    reveal behavior, focus-ring coverage gaps (dialog close, archive rows, tabs).
25. Pass 3, overlays: menus and dialogs — scroll lock, Escape handling,
    background reachability, scrollbar-gutter inside panes.
26. Pass 4, touch/small viewport: hover-only affordances, Reset pill overlap,
    target sizes at mobile density.
