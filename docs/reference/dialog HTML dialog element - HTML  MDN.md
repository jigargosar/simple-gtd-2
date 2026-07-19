  <dialog> HTML dialog element - HTML | MDN           

*   [Skip to main content](#content)
*   [Skip to search](#search)

1.  [Web](/en-US/docs/Web) 
2.  [HTML](/en-US/docs/Web/HTML) 
3.  [Reference](/en-US/docs/Web/HTML/Reference) 
4.  [Elements](/en-US/docs/Web/HTML/Reference/Elements) 
5.  [<dialog>](/en-US/docs/Web/HTML/Reference/Elements/dialog) 

# `<dialog>` HTML dialog element

Baseline Widely available \*

This feature is well established and works across many devices and browser versions. It’s been available across browsers since March 2022.

\* Some parts of this feature may have varying levels of support.

*   [Learn more](/en-US/docs/Glossary/Baseline/Compatibility)
*   [See full compatibility](#browser_compatibility)

The **`<dialog>`** [HTML](/en-US/docs/Web/HTML) element represents a modal or non-modal dialog box or other interactive component, such as a dismissible alert, inspector, or subwindow.

## [Attributes](#attributes)

This element includes the [global attributes](/en-US/docs/Web/HTML/Reference/Global_attributes).

**Warning:** The `tabindex` attribute must not be used on the `<dialog>` element. See [Additional notes](#additional_notes).

[`closedby`](#closedby)

Specifies the types of user actions that can be used to close the `<dialog>` element. This attribute distinguishes three methods by which a dialog might be closed:

*   A _light dismiss user action_, in which the `<dialog>` is closed when the user clicks or taps outside it. This is equivalent to the ["light dismiss" behavior of "auto" state popovers](/en-US/docs/Web/API/Popover_API/Using#auto_state_and_light_dismiss).
*   A _platform-specific user action_, such as pressing the Esc key on desktop platforms, or a "back" or "dismiss" gesture on mobile platforms.
*   A developer-specified mechanism such as a [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) with a [`click`](/en-US/docs/Web/API/Element/click_event) handler that invokes [`HTMLDialogElement.close()`](/en-US/docs/Web/API/HTMLDialogElement/close) or a [`<form>`](/en-US/docs/Web/HTML/Reference/Elements/form) submission.

Possible values are:

[`any`](#any)

The dialog can be dismissed using any of the three methods.

[`closerequest`](#closerequest)

The dialog can be dismissed with a platform-specific user action or a developer-specified mechanism.

[`none`](#none)

The dialog can only be dismissed with a developer-specified mechanism.

If the `<dialog>` element does not have a valid `closedby` value specified, then

*   if it was opened using [`showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal "showModal()"), it behaves as if the value was `"closerequest"`
*   otherwise, it behaves as if the value was `"none"`.

[`open`](#open)

Indicates that the dialog box is active and is available for interaction. If the `open` attribute is not set, the dialog box will not be visible to the user. It is recommended to use the `.show()` or `.showModal()` method to render dialogs, rather than the `open` attribute. If a `<dialog>` is opened using the `open` attribute, it is non-modal.

**Note:** While you can toggle between the open and closed states of non-modal dialog boxes by toggling the presence of the `open` attribute, this approach is not recommended. See [`open`](/en-US/docs/Web/API/HTMLDialogElement/open "open") for more information.

## [Description](#description)

The HTML `<dialog>` element is used to create both modal and non-modal dialog boxes. Modal dialog boxes block interaction with other UI elements, making the rest of the page [inert](/en-US/docs/Web/HTML/Reference/Global_attributes/inert#:~:text=When,clicked), while non-modal dialog boxes allow interaction with the rest of the page.

### [Controlling dialogs using JavaScript](#controlling_dialogs_using_javascript)

JavaScript can be used to display and close the `<dialog>` element. You can use the [`showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal "showModal()") method to display a modal dialog and the [`show()`](/en-US/docs/Web/API/HTMLDialogElement/show "show()") method to display a non-modal dialog. The dialog box can be closed using the [`close()`](/en-US/docs/Web/API/HTMLDialogElement/close "close()") method or using the [`dialog`](/en-US/docs/Web/HTML/Reference/Elements/form#method) method when submitting a `<form>` that is nested within the `<dialog>` element. Modal dialogs can also be closed by pressing the Esc key.

Modal dialogs can be declaratively opened and closed using the [Invoker Commands API](/en-US/docs/Web/API/Invoker_Commands_API) HTML attributes [`commandfor`](/en-US/docs/Web/HTML/Reference/Elements/button#commandfor) and [`command`](/en-US/docs/Web/HTML/Reference/Elements/button#command), which can be set on [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) elements.

The `command` attribute sets the particular command that is to be sent when the `<button>` element is clicked, while `commandfor` sets the `id` of the target dialog. The commands that can be sent for dialogs are [`"show-modal"`](/en-US/docs/Web/HTML/Reference/Elements/button#show-modal), [`"close"`](/en-US/docs/Web/HTML/Reference/Elements/button#close), and [`"request-close"`](/en-US/docs/Web/HTML/Reference/Elements/button#request-close).

The HTML below demonstrates how to apply the attributes to a `<button>` element so it can be pressed to open a modal `<dialog>` with an `id` of "my-dialog".

Non-modal dialogs can be declaratively opened, closed, and toggled using the [Popover API](/en-US/docs/Web/API/Popover_API) HTML attributes [`popovertarget`](/en-US/docs/Web/HTML/Reference/Elements/button#popovertarget) and [`popovertargetaction`](/en-US/docs/Web/HTML/Reference/Elements/button#popovertargetaction), which can be defined on [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) and [`<input>`](/en-US/docs/Web/HTML/Reference/Elements/input) elements.

The `<dialog>` must be turned into a popover by adding the `popover` attribute. You can then use `popovertarget` on a button/input to indicate the target popover, and `popovertargetaction` to specify the action to occur on the popover when the button is clicked. Note that, because the dialog is a popover, it will be non-modal, so you can close it by clicking outside the dialog.

The HTML below shows how to apply the attributes to a `<button>` element so it can be pressed to show and hide a modal `<dialog>` with an `id` of "my-dialog".

The Popover API also provides properties that can be used to get and set the state in JavaScript.

### [Closing dialogs](#closing_dialogs)

It is important to provide a closing mechanism for every `<dialog>` element, and to ensure that this works on devices that might not have a physical keyboard.

There are numerous ways to close a dialog:

*   Submitting the form within the `<dialog>` element with `method="dialog"` set on the `<form>` element (see the [Using the dialog open attribute](#using_the_dialog_open_attribute) example).
*   Clicking outside the dialog area when "light dismiss" is enabled (see the [Popover API HTML attributes](#popover_api_html_attributes) example).
*   Pressing the Esc key, in dialogs where it is enabled (see the [Popover API HTML attributes](#popover_api_html_attributes) example).
*   Calling the [`HTMLDialogElement.close()`](/en-US/docs/Web/API/HTMLDialogElement/close) method (see the [modal example](#creating_a_modal_dialog)).

### [CSS Styling](#css_styling)

A `<dialog>` can be selected using its element name (like any other element), and you can also match its state using pseudo-classes such as [`:modal`](/en-US/docs/Web/CSS/Reference/Selectors/:modal) and [`:open`](/en-US/docs/Web/CSS/Reference/Selectors/:open).

The CSS [`::backdrop`](/en-US/docs/Web/CSS/Reference/Selectors/::backdrop) pseudo-element can be used to style the backdrop of a modal dialog, which is displayed behind the `<dialog>` element when the dialog is displayed using the [`HTMLDialogElement.showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal) method. This pseudo-element could be used, for example, to blur, darken, or otherwise obfuscate the inert content behind the modal dialog.

### [Additional notes](#additional_notes)

*   HTML [`<form>`](/en-US/docs/Web/HTML/Reference/Elements/form) elements can be used to close a dialog box if they have the attribute `method="dialog"` or if the button used to submit the form has [`formmethod="dialog"`](/en-US/docs/Web/HTML/Reference/Elements/input#formmethod) set. When a `<form>` within a `<dialog>` is submitted via the `dialog` method, the dialog box closes, the states of the form controls are saved but not submitted, and the [`returnValue`](/en-US/docs/Web/API/HTMLDialogElement/returnValue "returnValue") property gets set to the value of the button that was activated.
*   The [`autofocus`](/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus) attribute should be added to the element the user is expected to interact with immediately upon opening a modal dialog. If no other element involves more immediate interaction, it is recommended to add `autofocus` to the close button inside the dialog, or the dialog itself if the user is expected to click/activate it to dismiss.
*   Do not add the `tabindex` property to the `<dialog>` element as it is not interactive and does not receive focus. The dialog's contents, including the close button contained in the dialog, can receive focus and be interactive.

## [Accessibility](#accessibility)

When implementing a dialog, it is important to consider the most appropriate place to set user focus. When using [`HTMLDialogElement.showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal) to open a `<dialog>`, focus is set on the first nested focusable element. Explicitly indicating the initial focus placement by using the [`autofocus`](/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus) attribute will help ensure initial focus is set on the element deemed the best initial focus placement for any particular dialog. When in doubt, as it may not always be known where initial focus could be set within a dialog, particularly for instances where a dialog's content is dynamically rendered when invoked, the `<dialog>` element itself may provide the best initial focus placement.

Ensure a mechanism is provided to allow users to close the dialog. The most robust way to ensure that all users can close the dialog is to include an explicit button to do so, such as a confirmation, cancellation, or close button.

By default, a dialog invoked by the `showModal()` method can be dismissed by pressing the Esc key. A non-modal dialog does not dismiss via the Esc key by default, and depending on what the non-modal dialog represents, it may not be desired for this behavior. Keyboard users expect the Esc key to close modal dialogs; ensure that this behavior is implemented and maintained. If multiple modal dialogs are open, pressing the Esc key should close only the last shown dialog. When using `<dialog>`, this behavior is provided by the browser.

While dialogs can be created using other elements, the native `<dialog>` element provides usability and accessibility features that must be replicated if you use other elements for a similar purpose. If you're creating a custom dialog implementation, ensure that all expected default behaviors are supported and proper labeling recommendations are followed.

The `<dialog>` element is exposed by browsers in a manner similar to custom dialogs that use the ARIA [role="dialog"](/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role) attribute. `<dialog>` elements invoked by the `showModal()` method implicitly have [aria-modal="true"](/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal), whereas `<dialog>` elements invoked by the `show()` method or displayed using the `open` attribute or by changing the default `display` of a `<dialog>` are exposed as `[aria-modal="false"]`. When implementing modal dialogs, everything other than the `<dialog>` and its contents should be rendered inert using the [`inert`](/en-US/docs/Web/HTML/Reference/Global_attributes/inert) attribute. When using `<dialog>` along with the `HTMLDialogElement.showModal()` method, this behavior is provided by the browser.

## [Examples](#examples)

### [Invoker Command API HTML attributes](#invoker_command_api_html_attributes)

This example demonstrates how you can use open and close a modal dialog using the [`commandfor`](/en-US/docs/Web/HTML/Reference/Elements/button#commandfor) and [`command`](/en-US/docs/Web/HTML/Reference/Elements/button#command) HTML attributes of the [Invoker Commands API](/en-US/docs/Web/API/Invoker_Commands_API).

First, we declare a [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) element, setting the `command` attribute to [`"show-modal"`](/en-US/docs/Web/HTML/Reference/Elements/button#show-modal), and the `commandfor` attribute to the `id` of the dialog to open (`my-dialog`). Then we declare a `<dialog>` element that contains a "Close" `<button>`. This button sends the [`"close"`](/en-US/docs/Web/HTML/Reference/Elements/button#close) command to the (same) dialog id.

#### Result

Open the dialog by pressing the "Open dialog" button. You can close the dialog by selecting the "Close" button or pressing the Esc key.

### [Popover API HTML attributes](#popover_api_html_attributes)

This example demonstrates how you can open and close a non-modal dialog using the [`popover`](/en-US/docs/Web/HTML/Reference/Global_attributes/popover), [`popovertarget`](/en-US/docs/Web/HTML/Reference/Elements/button#popovertarget), and [`popovertargetaction`](/en-US/docs/Web/HTML/Reference/Elements/button#popovertargetaction) HTML attributes of the [Popover API](/en-US/docs/Web/API/Popover_API).

The `<dialog>` is turned into a popover by adding the `popover` attribute. Since we haven't specified a value for the attribute, the default value of `"auto"` is used. This enables "light dismiss" behavior, allowing the dialog to be closed by clicking outside the dialog or by pressing Esc. We could instead have set `popover="manual"` to disable "light dismiss" behavior, in which case the dialog would have to be closed using the "Close" button.

Note that we haven't specified the `popovertargetaction` attribute for the `<button>` that opens the dialog. It isn't needed in this case, because its default value is `toggle`, which will toggle the dialog between its open and closed states when the button is clicked.

#### Result

Open the dialog by pressing the "Open dialog" button. You can close the dialog by selecting the "Close" button or pressing the Esc key. You can also close it by selecting outside the dialog, as it is non-modal.

### [Using the dialog `open` attribute](#using_the_dialog_open_attribute)

This example demonstrates how you can set the boolean `open` attribute on a `<dialog>` element, in order to create an HTML-only non-modal dialog that is already open when the page loads.

The dialog can be closed by clicking the "OK" button because the `method` attribute in the `<form>` element is set to `"dialog"`. In this case, no JavaScript is needed to close the form.

#### Result

This dialog is initially open and non-modal because of the presence of the `open` attribute. After clicking "OK", the dialog gets dismissed, leaving the Result frame empty.

**Note:** Reload the page to reset the output.

When the dialog is dismissed, there is no method provided to reopen it. The preferred method to display non-modal dialogs is to use the [`HTMLDialogElement.show()`](/en-US/docs/Web/API/HTMLDialogElement/show) method. It is possible to toggle the display of the dialog by adding or removing the boolean `open` attribute, but this is not the recommended practice.

This example demonstrates a modal dialog with a [gradient](/en-US/docs/Web/CSS/Reference/Values/gradient) backdrop. The `.showModal()` method opens the modal dialog when the "Show the dialog" button is activated. The dialog can be closed by pressing the Esc key or via the `close()` method when the "Close" button within the dialog is activated.

When a dialog opens, the browser, by default, gives focus to the first element that can be focused within the dialog. In this example, the [`autofocus`](/en-US/docs/Web/HTML/Reference/Global_attributes/autofocus) attribute is applied to the "Close" button, giving it focus when the dialog opens, as this is the element we expect the user will interact with immediately after the dialog opens.

#### HTML

#### CSS

We can style the backdrop of the dialog by using the [`::backdrop`](/en-US/docs/Web/CSS/Reference/Selectors/::backdrop) pseudo-element.

#### JavaScript

The dialog is opened modally using the `.showModal()` method and closed using the `.close()` or `.requestClose()` methods.

#### Result

When the modal dialog is displayed, it appears above any other dialogs that might be present. Everything outside the modal dialog is inert and interactions outside the dialog are blocked. Notice that when the dialog is open, with the exception of the dialog itself, interaction with the document is not possible; the "Show the dialog" button is mostly obfuscated by the almost opaque backdrop of the dialog and is inert.

### [Handling the return value from the dialog](#handling_the_return_value_from_the_dialog)

This example demonstrates the [`returnValue`](/en-US/docs/Web/API/HTMLDialogElement/returnValue) of the `<dialog>` element and how to close a modal dialog by using a form. By default, the `returnValue` is the empty string or the value of the button that submits the form within the `<dialog>` element, if there is one.

This example opens a modal dialog when the "Show the dialog" button is activated. The dialog contains a form with a [`<select>`](/en-US/docs/Web/HTML/Reference/Elements/select) and two [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) elements, which default to `type="submit"`. An event listener updates the value of the "Confirm" button when the select option changes. If the "Confirm" button is activated to close the dialog, the current value of the button is the return value. If the dialog is closed by pressing the "Cancel" button, the `returnValue` is `cancel`.

When the dialog is closed, the return value is displayed under the "Show the dialog" button. If the dialog is closed by pressing the Esc key, the `returnValue` is not updated, and the `close` event doesn't occur, so the text in the [`<output>`](/en-US/docs/Web/HTML/Reference/Elements/output) is not updated.

#### HTML

#### JavaScript

The dialog is opened using an event listener on the "Show the dialog" button, which calls [`HTMLDialogElement.showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal) when the button is clicked.

The dialog is closed when the "Cancel" button is clicked, because the `<button>` includes the [`formmethod="dialog"`](/en-US/docs/Web/HTML/Reference/Elements/input/submit#formmethod) attribute. When a form's method is [`dialog`](#additional_notes), the state of the form is saved but not submitted, and the dialog gets closed (the attribute overrides the [`<form>`](/en-US/docs/Web/HTML/Reference/Elements/form)'s default [`GET`](/en-US/docs/Web/HTTP/Reference/Methods/GET) method). Without an `action`, submitting the form via the default [`GET`](/en-US/docs/Web/HTTP/Reference/Methods/GET) method causes a page to reload. We use JavaScript to prevent the submission and close the dialog with the [`event.preventDefault()`](/en-US/docs/Web/API/Event/preventDefault) and [`HTMLDialogElement.close()`](/en-US/docs/Web/API/HTMLDialogElement/close) methods, respectively.

#### Result

### [Closing a dialog with a required form input](#closing_a_dialog_with_a_required_form_input)

When a form inside a dialog has a required input, the user agent will only let you close the dialog once you provide a value for the required input. To close such dialog, either use the [`formnovalidate`](/en-US/docs/Web/HTML/Reference/Elements/input#formnovalidate) attribute on the close button or call the `close()` method on the dialog object when the close button is clicked.

#### JavaScript

#### Result

From the output, we see it is impossible to close the dialog using the _Normal close_ button. But the dialog can be closed if we bypass the form validation using the `formnovalidate` attribute on the _Cancel_ button. Programmatically, `dialog.close()` will also close such dialog.

### [Comparison of different closedby behaviors](#comparison_of_different_closedby_behaviors)

This example demonstrates the difference in behavior between different values of the [`closedby`](#closedby) attribute.

#### HTML

We provide three [`<button>`](/en-US/docs/Web/HTML/Reference/Elements/button) elements and three `<dialog>` elements. Each button will be programmed to open a different dialog that demonstrates the behavior of one of the three values of the `closedby` attribute — `none`, `closerequest`, and `any`. Note that each `<dialog>` element contains a `<button>` element that will be used to close it.

#### JavaScript

Here we assign different variables to reference the main control `<button>` elements, the `<dialog>` elements, and the "Close" `<button>` elements inside the dialogs. First we assign a [`click`](/en-US/docs/Web/API/Element/click_event) event listener to each control button using [`addEventListener`](/en-US/docs/Web/API/EventTarget/addEventListener), the event handler function of which opens the associated `<dialog>` element via [`showModal()`](/en-US/docs/Web/API/HTMLDialogElement/showModal). We then loop through the "Close" `<button>` references, assigning each one a `click` event handler function that closes its `<dialog>` element via [`close()`](/en-US/docs/Web/API/HTMLDialogElement/close).

#### Result

The rendered result is as follows:

Try clicking each button to open a dialog. The first one can only be closed by clicking its "Close" button. The second one can also be closed via a device-specific user action such as pressing the Esc key. The third one has full ["light-dismiss" behavior](/en-US/docs/Web/API/Popover_API/Using#auto_state_and_light_dismiss), so it can also be closed by clicking or tapping outside the dialog.

### [Animating dialogs](#animating_dialogs)

`<dialog>`s are set to [`display: none;`](/en-US/docs/Web/CSS/Reference/Properties/display) when hidden and `display: block;` when shown, as well as being removed from / added to the [top layer](/en-US/docs/Glossary/Top_layer) and the [accessibility tree](/en-US/docs/Web/Performance/Guides/How_browsers_work#building_the_accessibility_tree). Therefore, for `<dialog>` elements to be animated the [`display`](/en-US/docs/Web/CSS/Reference/Properties/display) property needs to be animatable. [Supporting browsers](/en-US/docs/Web/CSS/Reference/Properties/display#browser_compatibility) animate `display` with a variation on the [discrete animation type](/en-US/docs/Web/CSS/Guides/Animations/Animatable_properties#discrete). Specifically, the browser will flip between `none` and another value of `display` so that the animated content is shown for the entire animation duration.

So for example:

*   When animating `display` from `none` to `block` (or another visible `display` value), the value will flip to `block` at `0%` of the animation duration so it is visible throughout.
*   When animating `display` from `block` (or another visible `display` value) to `none`, the value will flip to `none` at `100%` of the animation duration so it is visible throughout.

**Note:** When animating using [CSS transitions](/en-US/docs/Web/CSS/Guides/Transitions), [`transition-behavior: allow-discrete`](/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) needs to be set to enable the above behavior. This behavior is available by default when animating with [CSS animations](/en-US/docs/Web/CSS/Guides/Animations); an equivalent step is not required.

#### Transitioning dialog elements

When animating `<dialog>`s with CSS transitions, the following features are required:

[`@starting-style`](/en-US/docs/Web/CSS/Reference/At-rules/@starting-style) at-rule

Provides a set of starting values for properties set on the `<dialog>` that you want to transition from every time it is opened. This is needed to avoid unexpected behavior. By default, CSS transitions only occur when a property changes from one value to another on a visible element; they are not triggered on elements' first style updates, or when the `display` type changes from `none` to another type.

[`display`](/en-US/docs/Web/CSS/Reference/Properties/display) property

Add `display` to the transitions list so that the `<dialog>` will remain as `display: block` (or another visible `display` value set on the dialog's open state) for the duration of the transition, ensuring the other transitions are visible.

Include `overlay` in the transitions list to ensure the removal of the `<dialog>` from the top layer is deferred until the transition completes, again ensuring the transition is visible.

[`transition-behavior`](/en-US/docs/Web/CSS/Reference/Properties/transition-behavior) property

Set `transition-behavior: allow-discrete` on the `display` and `overlay` transitions (or on the [`transition`](/en-US/docs/Web/CSS/Reference/Properties/transition) shorthand) to enable discrete transitions on these two properties that are not by default animatable.

Here is a quick example to show what this might look like.

##### HTML

The HTML contains a `<dialog>` element, plus a button to show the dialog. Additionally, the `<dialog>` element contains another button to close itself.

##### CSS

In the CSS, we include a `@starting-style` block that defines the transition starting styles for the `opacity` and `transform` properties, transition end styles on the `dialog:open` state, and default styles on the default `dialog` state to transition back to once the `<dialog>` has appeared. Note how the `<dialog>`'s `transition` list includes not only these properties, but also the `display` and `overlay` properties, each with `allow-discrete` set on them.

We also set a starting style value for the [`background-color`](/en-US/docs/Web/CSS/Reference/Properties/background-color) property on the [`::backdrop`](/en-US/docs/Web/CSS/Reference/Selectors/::backdrop) that appears behind the `<dialog>` when it opens, to provide a nice darkening animation. The `dialog:open::backdrop` selector selects only the backdrops of `<dialog>` elements when the dialog is open.

**Note:** In browsers that don't support the [`:open`](/en-US/docs/Web/CSS/Reference/Selectors/:open) pseudo-class, you can use the attribute selector `dialog[open]` to style the `<dialog>` element when it is in the open state.

##### JavaScript

The JavaScript adds event handlers to the show and close buttons causing them to show and close the `<dialog>` when they are clicked:

##### Result

The code renders as follows:

**Note:** Because `<dialog>`s change from `display: none` to `display: block` each time they are shown, the `<dialog>` transitions from its `@starting-style` styles to its `dialog:open` styles every time the entry transition occurs. When the `<dialog>` closes, it transitions from its `dialog:open` state to the default `dialog` state.

It is possible for the style transition on entry and exit to be different in such cases. See our [Demonstration of when starting styles are used](/en-US/docs/Web/CSS/Reference/At-rules/@starting-style#demonstration_of_when_starting_styles_are_used) example for a proof of this.

#### dialog keyframe animations

When animating a `<dialog>` with CSS keyframe animations, there are some differences to note from transitions:

*   You don't provide a `@starting-style`.
*   You include the `display` value in a keyframe; this will be the `display` value for the entirety of the animation, or until another non-`none` display value is encountered.
*   You don't need to explicitly enable discrete animations; there is no equivalent to `allow-discrete` inside keyframes.
*   You don't need to set `overlay` inside keyframes either; the `display` animation handles the animation of the `<dialog>` from shown to hidden.

Let's have a look at an example so you can see what this looks like.

##### HTML

First, the HTML contains a `<dialog>` element, plus a button to show the dialog. Additionally, the `<dialog>` element contains another button to close itself.

##### CSS

The CSS defines keyframes to animate between the closed and shown states of the `<dialog>`, plus the fade-in animation for the `<dialog>`'s backdrop. The `<dialog>` animations include animating `display` to make sure the actual visible animation effects remain visible for the whole duration. Note that it wasn't possible to animate the backdrop fade out — the backdrop is immediately removed from the DOM when the `<dialog>` is closed, so there is nothing to animate.

##### JavaScript

Finally, the JavaScript adds event handlers to the buttons to enable showing and closing the `<dialog>`:

##### Result

The code renders as follows:

## [Technical summary](#technical_summary)

| [Content categories](/en-US/docs/Web/HTML/Guides/Content_categories) | [Flow content](/en-US/docs/Web/HTML/Guides/Content_categories#flow_content), sectioning root |
| --- | --- |
| Permitted content | [Flow content](/en-US/docs/Web/HTML/Guides/Content_categories#flow_content) |
| Tag omission | None, both the starting and ending tag are mandatory. |
| Permitted parents | Any element that accepts [flow content](/en-US/docs/Web/HTML/Guides/Content_categories#flow_content) |
| Implicit ARIA role | [dialog](/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/dialog_role) |
| Permitted ARIA roles | [`alertdialog`](/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/alertdialog_role) |
| DOM interface | [`HTMLDialogElement`](/en-US/docs/Web/API/HTMLDialogElement) |

## [Specifications](#specifications)

| Specification |
| --- |
| [HTML  <br>\# the-dialog-element](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element) |

## [Browser compatibility](#browser_compatibility)

## [See also](#see_also)

*   [`HTMLDialogElement`](/en-US/docs/Web/API/HTMLDialogElement) interface
*   [`close`](/en-US/docs/Web/API/HTMLDialogElement/close_event "close") event of the `HTMLDialogElement` interface
*   [`cancel`](/en-US/docs/Web/API/HTMLDialogElement/cancel_event "cancel") event of the `HTMLDialogElement` interface
*   [`open`](/en-US/docs/Web/API/HTMLDialogElement/open "open") property of the `HTMLDialogElement` interface
*   [`inert`](/en-US/docs/Web/HTML/Reference/Global_attributes/inert) global attribute for HTML elements
*   [`::backdrop`](/en-US/docs/Web/CSS/Reference/Selectors/::backdrop) CSS pseudo-element
*   [Web forms](/en-US/docs/Learn_web_development/Extensions/Forms) in the Learn area

## Help improve MDN

[Learn how to contribute](/en-US/docs/MDN/Community/Getting_started)

This page was last modified on Jul 2, 2026 by [MDN contributors](/en-US/docs/Web/HTML/Reference/Elements/dialog/contributors.txt).

[View this page on GitHub](https://github.com/mdn/content/blob/main/files/en-us/web/html/reference/elements/dialog/index.md?plain=1 "Folder: en-us/web/html/reference/elements/dialog (Opens in a new tab)") • [Report a problem with this content](https://github.com/mdn/content/issues/new?template=page-report.yml&mdn-url=https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FHTML%2FReference%2FElements%2Fdialog&metadata=%3C%21--+Do+not+make+changes+below+this+line+--%3E%0A%3Cdetails%3E%0A%3Csummary%3EPage+report+details%3C%2Fsummary%3E%0A%0A*+Folder%3A+%60en-us%2Fweb%2Fhtml%2Freference%2Felements%2Fdialog%60%0A*+MDN+URL%3A+https%3A%2F%2Fdeveloper.mozilla.org%2Fen-US%2Fdocs%2FWeb%2FHTML%2FReference%2FElements%2Fdialog%0A*+GitHub+URL%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fblob%2Fmain%2Ffiles%2Fen-us%2Fweb%2Fhtml%2Freference%2Felements%2Fdialog%2Findex.md%0A*+Last+commit%3A+https%3A%2F%2Fgithub.com%2Fmdn%2Fcontent%2Fcommit%2F4280928da7b326df9e358204a23df21b4668a29b%0A*+Document+last+modified%3A+2026-07-02T10%3A48%3A16.000Z%0A%0A%3C%2Fdetails%3E "This will take you to GitHub to file a new issue.")