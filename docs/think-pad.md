# Issues

1. **Delete timer 175ms vs `anim-out` 180ms, no `clearTimeout` (`App.tsx:78`, `index.css:36`)** — unmounts ~5ms early; two magic numbers that must stay in sync; stale timer survives unmount (safe only because `deleteTask` is id-filtered).
2. **Trash button has no focus-visible state (`App.tsx:150`)** — `opacity-0 group-hover:opacity-100` with no `group-focus-within` / `focus-visible`; Tab-focusing it produces zero visible change.
3. **`appendTask` computes `order` from a pre-`setState` snapshot (`store.ts:67`)** — speculative, not a live bug: safe only because zustand `setState` is synchronous; fragile pattern, should compute inside the `setState(s => …)` updater.
4. **Strike-line not vertically centered (`index.css:38-45`)** — `top:50%` with no `transform: translateY(-50%)`, off by ~0.75px.
5. **Unbounded entrance stagger (`App.tsx:42`, `87`)** — `i*60` / `taskIndex*30` delay → ~870ms for the 30th item; reveal drags at scale.
6. **Empty-state dead end** — delete-all leaves empty sections with no add-section UI and no reseed; product gap, not a code bug.
