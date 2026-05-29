# Archive visibility model

Modeled on Trello, where lists and cards archive independently.

Two entities — section and task — each with its own independent `.archived`
flag. There is no cascade and no stored relationship between the two flags. Every
view is a pure derivation of state.

## Rules

Section — its own `.archived`:

- not archived → on the board
- archived → archive view, name only (no task content)

Task — its own `.archived`:

- archived → archive view, task list
- not archived → on the board only if its section is also on the board; if the
  section is archived, the task shows nowhere

## Notes

- A task renders inside its section, so a non-archived task in an archived section
  appears in no view. This is not a special state — it is just what the derivation
  evaluates to. Restoring the section brings it back.
- Archiving/unarchiving a section never touches task flags, and vice versa.
- `done` is a separate, orthogonal axis (the "show completed" toggle); it is not
  part of the archive model.
