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
const http = require('http')
const client = require('./client')  // path to client entry point
http.createServer(function (req, res) {
  const html = client.toString('/', { message: 'hello server!' })
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
})
```

In order to make our `choo` app call `app.start()` in the browser and be
`require()`-able in Node, we check if [`module.parent`][module-parent] exists:
```js
const choo = require('choo')
const app = choo()

app.router((route) => [
  route('/', (params, state, send) => choo.view`
    <h1>${state.message}</h1>
  `)
])

if (module.parent) module.exports = app
else document.body.appendChild(app.start())
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
const choo = require('choo')
const app = choo()

app.router((route) => [
  route('/', (params, state, send) => choo.view`
    <h1 id="app-root">${state.message}</h1>
  `)
])

if (module.parent) module.exports = app
else app.start('#app-root'))
```

When the JS is booted on top of the dehydrated application, it will look for
the `#app-root` id and load on top of it. You can choose any name you like for
the id, but __make sure it's the same on every possible top level DOM node__,
or else things might break. Furthermore to ensure things go smoothly, try and
keep the initial state identical on both the server and the client.

And that's it! If you want to go down the route of mad performance, consider
make all first request static and caching them using something like [bl][bl],
[nginx][nginx], [varnish][varnish] or a global CDN.

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
