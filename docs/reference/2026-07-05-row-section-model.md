# Row/section model finalized

Unified 1:2:4 icon sizing/spacing tokens (28×28 hit-box on every row
control), ring flush on hit-area edge, no icon or checkbox hover-color
anywhere. Row-level hover/focus bottom border tried, then hidden (see
Backlog: "Row hover/focus highlight" — no row hover indication currently,
plus a found gap-hover-dropout issue between rows).

Section header unified to the task row's exact structural classes (padding,
rounded corners, border placeholder, transition, items-center).
Between-section and header-to-tasks gaps reduced (40px→24px, 16px→8px).
Transition durations bumped 150ms→300ms so state changes read as a fade.

Formal `/frontend-baseline` skill run still outstanding — floors were
hand-checked in conversation instead; see Backlog if that's wanted as a
separate QA pass.
