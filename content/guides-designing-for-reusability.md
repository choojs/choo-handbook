# Designing for reusability
One of the core principles of `choo` is that the framework should be
as disposable as possible. We don't want to lock you into `choo` - in the
contrary: we want `choo` components to work with or without `choo`; as long as
there's a DOM available.

This guide is intended to show some patterns you can apply to your code in
order to make it more reusable, and outlast the cycle of frameworks.

Note that in this guide the words "module" and "package" will be used
interchangeably.

## Directory structure
In order to facilitate reusability, one must plan for it. Often the hardest
part about modularity is becoming comfortable with determining where the
boundaries are. As a rule of thumb: any piece of logic that doesn't directly
need to receive _all_ values passed in by a function in `choo` could probably
split off into its own little package. If you apply this rule aggressively
you'll no doubtedly make the mistake of overmodularizing, but in doing so
you'll most likely become more tuned as to what makes for a good package.

When building projects it can be nice to have a special directory into which
generalized logic can find its place - ready to be published as a separate
package outside the project. If you've never used a specific directory for this
before, the `lib/` dirname can be recommended.

Generally a typical `choo` project would have a directory structure somewhat
similar to this:
```txt
assets/        images and fonts, if you have any
elements/      standalone application-specific elements
lib/           generalized components, should be moved out of project later
models/        choo models
pages/         views that are directly mounted on the router
scripts/       shell scripts, to be interfaced with through `npm scripts`
client.js      main application entry; programmatic manifest file
package.json   manifest file
```
This structure is only here as a reference (we're not going to tell you how to
write your apps). But it's a model we've found to work well for `choo` apps as
it only works well for slim applications, and focuses on splitting things off.
So if you haven't decided on a structure yet, this might be a nice one to try.

## Effects
Probably the premier candidate to modularize would be effects. Effects are
generally the places where most complexity hides; calling the `choo` specific
`send(name, data, cb)` function to issue commands to the rest of the
application. Though very powerful, using `send()` all over the place will
eventually cause for mess and giant fallout. Instead there's several patterns
that might help:

### send() at the borders only
[ talk about callbacks and never passing `send()` directly ]

### Rise of the SDKs
[ talk about how SDKs can wrap APIs, making networking reusable ]

## Views
Views are passed three things: the current state of the world, the state of the
world like it was in the last frame that was rendered and a `send()` method
that can issue commands to update the state of the world. These things are the
APIs `choo` exposes to its view components (aka components that make up views).

As with all other parts of the framework, we should try and minimize the extent
of interaction between the components we create and the framework's API. An
approach that works particularly nice is to create elements using a function
which accepts an object with callbacks on it that are propagated into the
element. Whenever an action is triggered, it calls the appropriate callback
passed in.

Another important thing to keep in mind is that not all components need all
data. Often time it's worthwhile to deconstruct `state` and only pass relevant
fields into the components. This makes it easier to create testable components,
and better defines the scope of an element.

Say we have a form element. We want it to trigger two types of validation: when
input occurs we want to validate it on the client. When submit is clicked we
want it to submit the data and validate it on the server. To create a
generalized component we'd do:
```js
// ./pages/main.js
const html = require('choo/html')
const Form = require('../components/form')

module.exports = function mainView (state, prev, send) {
  const form = Form({
    values: state.myFormModel,
    onInput: (data) => send('myFormModel:validate', data),
    onSubmit: (data) => send('myFormModel:submit', data)
  })

  return html`
    <main>
      ${form}
    </main>
  `
}
```

```js
// ./components/form.js
const getFormData = require('get-form-data')
const html = require('choo/html')

module.exports = function formComponent (opts) {
  return html`
    <form onsubmit=${onSubmit}>
      <input name="woof" type="text" placeholder="type here"
        value=${opts.values.woof} oninput=${onInput}>
      <input type="submit">
    </form>
  `

  function onInput (e) {
    const data = e.value
    opts.onInput && opts.onInput(data) // allows onInput callback to be optional
  }

  function onSubmit (e) {
    const data = getFormData(e.target)
    opts.onSubmit && opts.onSubmit(data)
    e.preventDefault() // not called if above lines throw error, degrading to default form functionality
  }
}
```

Binding components to the framework should generally happen in the `pages/`
directory (or whichever equivalent you prefer). If all components are imported
exlicitly, and all actions are bound, concerns are separated pretty much as
well as they can be.

## Reducers
`reducers` are basically data formatting pipelines. Data comes in, different
data comes out. In such they are probably the most boring to test, and probably
generally not super reusable. Except perhaps for validation logic. Client-side
validation should be a completely synchronous function without an error
condition. If data is invalid, an object should be returned with the
appropriate error codes (or if it's your thing: using `throw` and
`try ... catch`).

Validation logic can probably often be bundled together with standalone view
components; separating the part that validates from the actual view, and
binding both to the larger framework using JS functions.

```js
// example needed
```

## Plugins
[ talk about why plugins are needed, tight coupling and common pitfalls ]
