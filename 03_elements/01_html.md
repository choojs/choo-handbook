# elements/html
`choo` views work with any native DOM element. Under the hood we use the
[morphdom] diffing engine that operates on native DOM elements and the
current DOM tree. This means that libraries that create DOM elements will _just
work™_, and mutations to the DOM will be picked without any problem. Compared
to other _virtual-dom_ frameworks this means we've eliminated the problem of
keeping the DOM in sync with our virtual tree representation. 🆒

The recommended way of creating DOM elements in `choo` is by using
`require('choo/html')`. This allows us to create elements we use a new ES6
feature called [tagged template literals][lit]. After some
parsing, these elements return native DOM elements:

```js
const html = require('choo/html')

const el = html`
  <main>very cool.js</main>
`
```

## yo-yo
Under the hood `choo` wraps a library called [yo-yo], which in turn wraps
a library called [bel]. In reality all `choo/html` does is:
```js
module.exports = require('yo-yo')
```
So if you're looking to go deeper into how choo's DOM element creation works,
consider diving into the source - there's some pretty cool stuff going on
there.

## Gotchas
At the moment `yo-yo` can only export a single DOM element. To export multiple
elements consider using an array. An example:
```js
const html = require('yo-yo')

// incorrect
const el = html`
  <div>hey</div>
  <div>hey</div>
`

// correct
const el = [
  html`<div>hey</div>`,
  html`<div>hey</div>`
]
`
```

## Wrapping up
And that's it. To summarize some of the things we've gone over:
- `choo` operates completely on native DOM elements
- `choo` works fine with anything that creates native DOM elements
- `choo/html` uses [yo-yo] under the hood to create elements
- `yo-yo` uses [ES6 template literals][lit] to create nodes
- `yo-yo` expects only a single DOM node to be returned

Happy hacking!

[lit]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Template_literals
[morphdom]: https://github.com/patrick-steele-idem/morphdom
[bel]: https://github.com/shama/bel
[yo-yo]: https://github.com/maxogden/yo-yo
