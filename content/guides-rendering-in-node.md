# Rendering in Node
Sometimes it's necessary to render code inside of Node; for serving hyper fast
first requests, testing or other purposes. Applications that are capable of
being rendered in both Node and the browser are called
_[isomorphic][isomorphic]_.

Rendering in Node is slightly different than in the browser. First off, to
maintain performance all calls to `subscriptions`, `effects`, and `reducers`
are disabled. That means you need to know what the state of your application is
going to be _before_ you render it - no cheating!

Secondly, the `send()` method inside `router` and `view` has been disabled. If
you call it your program will crash. Disabling all these things means that your
program will render [`O(n)`][big-o], which is super neat. Off to [10.000
QPS][qps] we go!

To render in Node call the `.toString()` method instead of `.start()`. The
first argument is the path that should be rendered, the second is the state:
```js
var http = require('http')
var client = require('./path-to-client')

http.createServer(function (req, res) {
  var html = client.toString('/', { message: 'hello server!' })
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
})
```

In order to make our `choo` app call `app.start()` in the browser and be
`require()`-able in Node, we check if [`module.parent`][module-parent] exists:
```js
var html = require('choo/html')
var choo = require('choo')

var app = choo()
app.router([ '/', mainView ])

if (module.parent) {
  module.exports = app
} else {
  document.body.appendChild(app.start())
}

function mainView (state, prev, send) {
  return html`
    <h1>${state.message}</h1>
  `
}
```

## Rehydration
Now that your application is succesfully rendering in Node, the next step would
be to make it load a JavaScript bundle once has loaded the HTML. To do this we
will use a technique called _rehydration_.

_Rehydration_ is when you take the static, server-rendered version of your
application (static HTML, _dehydrated_ because it has no logic) and _rehydrate_
it by booting up the JS and attaching event handlers on the DOM to make it
dynamic again. It's like restoring flavor to cup noodles by adding hot water.

Because we're using something called `morphdom` under the hood, all we need is
point at an `id` at the root of the application. The syntax for this is
slightly different from what we've seen so far, because we're _updating_ a
dehydrated DOM nodes to make them dynamic, rather than a new DOM tree and
attaching it to the DOM.
```js
var mount = require('choo/mount')
var html = require('choo/html')
var choo = require('choo')

var app = choo()
app.router([ '/', mainView ])

if (module.parent) {
  module.exports = app
} else {
  mount('body', app.start())
}

function mainView (params, state, send) {
  return html`
    <h1 id="app-root">${state.message}</h1>
  `
}
```

When the JS is booted on top of the dehydrated application, it will look for
the `#app-root` id and load on top of it. You can choose any name you like for
the id, but __make sure it's the same on every possible top level DOM node__,
or else things might break.

And that's it!

## Caching
The trick to improving initial load time is to reduce latency in loading
applications. Reducing latency is often more important than reducing payload
size. In order to reduce latency content should be served from a server
physically close to person requesting the content. Content Distribution
Networks (CDNs) are networks of computers that cache content from a central
server and strategically cache it around the world - sometimes there are even
multiple caches per country.

But in order to use CDNs, the content served should be cacheable. This
means distributing the lowest common denominator of any given page throughout
the CDN.

Say we'd be building GitHub, a few great things to cache would be:
- the JS bundles
- the CSS bundles
- all the marketing site content
- every single project README.md page

Stuff you don't want to be caching on the CDN:
- user specific pages
- any type of queries

When caching the user specific pages, ideally only the static content would be
cached, leaving out any dynamic content, i.e. user-specific content. For
example, in order to not confuse people it's beneficial if the baseline for the
UI doesn't show if a user is logged in or logged out - that way once the JS
kicks in the user-specific parts of the UI (think web 2.0) can be progressively
layered on top and provide a more custom experience. Think about it this way:
the reason why a user is visiting a page is probably to look at the content
first, so make sure that's available as fast as possible.

Once CDNs are in place, the content could be sped up further by providing more
caching. At the code layer you probably want to pre-render as much content into
a buffer and save it in [bl][bl]. On the service / application layer you
probably want to use [nginx][nginx] or [varnish][varnish] to cache data at a
higher level / cache more aggressively. At the database layer you probably want
to be using [materialized views][materialize-views] so that multiple queries to
the same data don't have to be recomputed every time - caching it for at least
the time it takes to re-compute a next query.

So to summarize application performance:
- cache aggressively
- cache on every level of the application to guard against accidental meltdowns
- create content that's cacheable - having a good balance takes balance
- design UIs so that they can be progressively enhanced to add user-specific
  information after loading

[isomorphic]: https://en.wikipedia.org/wiki/Isomorphism
[bl]: https://github.com/rvagg/bl
[varnish]: https://varnish-cache.org
[nginx]: http://nginx.org/
[big-o]: https://rob-bell.net/2009/06/a-beginners-guide-to-big-o-notation/
[qps]: https://en.wikipedia.org/wiki/Queries_per_second
[morphdom]: https://github.com/patrick-steele-idem/morphdom
[morphdom-bench]: https://github.com/patrick-steele-idem/morphdom#benchmarks
[module-parent]: https://nodejs.org/dist/latest-v6.x/docs/api/modules.html#modules_module_parent
[sse-reconnect]: http://stackoverflow.com/questions/24564030/is-an-eventsource-sse-supposed-to-try-to-reconnect-indefinitely
[ws-reconnect]: http://stackoverflow.com/questions/13797262/how-to-reconnect-to-websocket-after-close-connection
[materialized-views]: https://www.postgresql.org/docs/9.3/static/rules-materializedviews.html
