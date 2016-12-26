# elements/events
In the last section we saw how to create DOM nodes in choo. In this section
we'll go over how to create event handlers for DOM nodes, so we can make our
elements interactive.

## Click events
Probably one of the most basic event handlers we can create for the DOM is
binding a click handler to a `<button>` element. Using the knowledge from the
previous section we already know how to create a DOM element, like so:
```js
const html = require('choo/html')

const el = html`
  <button>click me!</button>
`
```
Try running this in the browser using [bankai][bankai] ✨

_Note: if you're not sure how to make this example run in the browser, check
out the ["your first app"][gs] guide first_

Now for the next step we're going to add an `onClick()` handler, like so:
```js
const html = require('choo/html')

const el = html`
  <button onclick=${handleClick}>click me!</button>
`

function handleClick (event) {
  console.log('button was clicked!')
}
```

We can now succesfully handle clicks on our button. Yay!

### function hoisting
You may have noticed some things going on in our code though. If you're new to
JavaScript you might be wondering how come we define a function at the bottom
of the file, and use it above it. This is a nifty little feature of JavaScript
called [function hoisting][hoisting]. It's a nice little way of putting what's
important at the top of the file, and leaving the exact details later in the
file. There's some gotchas with it though, but using it in the way we just did
is a great pattern to use.

### dom events
Another thing you might have noticed is the unused `event` argument. The
`event` argument is an instance of the DOM's [Event][event] type. Sometimes the
`event` argument is special like [KeyboardEvent][kbe] and exposes more values.
And sometimes it requires you to call functions on it like
`event.preventDefault()` to prevent it from performing native browser behavior
(such as reloading the page after a form submit). Don't worry about it for now
though, we'll get back to the `event` argument as we need to throughout the
guide.

## Anchor tags
In choo `<a href=""></a>` tags are a bit special: we handle routing in there
out of the box. So anytime you click on an anchor tag, choo will know about it
and trigger the right route on the router. Read more about it on [the anchor
tag section][anchor] of the guide.

## Other listeners
There are heaps of other event listeners available. For example we can create
hook into an `<input>` field like so:
```js
const html = require('choo/html')
html`
  <input type="text" oninput=${onInput}>
`

function onInput (event) {
  console.log('value is: ' + event.target.value)
}
```

For a complete list of events that can be set as attributes, check out
[kristoferjosph/update-events][ue].

## Wrapping up
And that's it; you should now be able to set and handle events from any DOM
element. To summarize:
- we've discussed how to create a click handler for a `<button>` element
- function hoisting in javascript exists and is very useful
- there's a native DOM `Event` type with custom functions that sometimes need
  to be called
- `<a>` tags are handled out of the box (though there's a complete guide on
  routing)

And that's it. Go out there and bind events to everything! (PS we're not
accountable for performance issues if you actually end up binding events to
__everything__ 😱).

[anchor]: ../routing/02_anchor_tags.md
[gs]: ../getting-started/your-first-app.md
[bankai]: https://github.com/yoshuawuyts/bankai
[hoisting]: http://adripofjavascript.com/blog/drips/variable-and-function-hoisting
[event]: https://developer.mozilla.org/en-US/docs/Web/API/Event
[kbe]: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
[ue]: https://github.com/kristoferjoseph/update-events/blob/master/index.js
