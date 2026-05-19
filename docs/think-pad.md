I am assuming that we are using outline for focus, simple way to avoid layout shift. we need to ensure that all elements have it and also add to claude.md this needs to be applied to every appeariense/dissapreance no jarring. another candidate, count of tasks next to section.

use double click to edit

review/refactor code of edit task

spacing between checkbox and edit input is too narrow need to fix it

add task has no outline, inconsistant

plus icon is too small

need to handle sudden apperance of add button when adding task

post edit display is multiline but edit is a single line field, need to quickfix it

anim strike through: I think this works for single line, research for multiline.
```css
.strike-text {
  position: relative;
  display: inline-block;
}

.strike-text::after {
  content: '';
  position: absolute;
  top: 50%; /* Centers the line vertically on the text */
  left: 0;
  width: 100%;
  height: 2px; /* Line thickness */
  background-color: red;
  transform: scaleX(0); /* Hidden at start */
  transform-origin: left center;
  transition: transform 0.5s ease-in-out; /* Controls animation speed */
}

.strike-text:hover::after {
  transform: scaleX(1); /* Animates the line to full width */
}

```