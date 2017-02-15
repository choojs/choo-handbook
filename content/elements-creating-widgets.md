# elements/creating widgets

Sometimes you'll need to use 3rd party libraries to embed a map, a chart,
a tweet, or some other widget. These libraries typically expect you to
"initialize" them, passing them a DOM element, and they'll add whatever HTML
they need to render.

To avoid these "widgets" being re-initialized every time the state is updated
(which triggers your views to be re-rendered), you can wrap your widget
initialization using
[cache-element](https://github.com/yoshuawuyts/cache-element). This allows you
to initialize it once and receive any state changes as an "update" event, which
you can use to update your widget rather than re-initialize it.

## example

We'll wrap [leaflet](http://leafletjs.com) with cache-element's `widget`
function. The key point is that there's a `render` method that's called once,
and returns an element - like a typical component - and there's an `onupdate`
handler that's called on subsequent "renders." We'll use the `onupdate` handler
to change the location of the map rather than re-initializing the map.

```javascript
const html = require('choo/html')
const widget = require('cache-element/widget')
const L = require('leaflet')

module.exports = () => {
  let map

  return widget({
    render: (coords) => {
      return html`
        <div>
          <div
            style="height: 500px"
            onload=${(el) => initMap(el, coords)}
            onunload=${removeMap}></div>
        </div>
      `
    },
    onupdate: (el, coords) => {
      if (map) map.setView(coords)
    }
  })

  function initMap (el, coords) {
    const defaultZoom = 12
    map = L.map(el).setView(coords, defaultZoom)

    L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }).addTo(map)
  }

  function removeMap (el) {
    if (map) {
      map.remove()
      map = null
    }
  }
}
```

Note that we put the actual initialization inside the `onload` lifecycle hook since leaflet requires its container be mounted on the DOM before it's initialized.

## usage

We can use the wrapped "map" module we created from a view just like we would a
normal component, except we first need to instantiate it. Our module returns a
function which returns the map element. That means another set of `()`s, which
we'll call `mapInstance` for readability purposes.

```javascript
const choo = require('choo')
const html = require('choo/html')

const Map = require('./map')

const app = choo()
const mapInstance = Map()

app.model({
  state: {
    coords: [39.9526, -75.1652]
  }
})

const View = (state, prev, send) => {
  return html`
    <main>
      ${mapInstance(state.coords)}
    </main>
  `
}

app.router([
  ['/', View]
])

const tree = app.start()
document.body.appendChild(tree)
```

This renders the map, but that doesn't show us much because we're not changing
the state. Below is a more complicated example that allows you to pan the map
to another city, as well as update a separate part of the state without affecting
(or re-initializing) the map.

```javascript
const choo = require('choo')
const html = require('choo/html')

const Map = require('./map')

const app = choo()
const mapInstance = Map()

app.model({
  state: {
    title: 'Hello, world',
    coords: [39.9526, -75.1652]
  },
  reducers: {
    setCoords: (state, data) => {
      return { coords: data }
    },
    updateTitle: (state, data) => {
      return { title: data }
    }
  }
})

const View = (state, prev, send) => {
  return html`
    <main>
      <h1>${state.title}</h1>
      <div><input value=${state.title} oninput=${updateTitle}/></div>
      <button onclick=${toPhiladelphia}>Philadelphia</button>
      <button onclick=${toSeattle}>Seattle</button>
      ${mapInstance(state.coords)}
    </main>
  `
  function updateTitle (evt) {
    send('updateTitle', evt.target.value)
  }
  function toPhiladelphia () {
    send('setCoords', [39.9526, -75.1652])
  }
  function toSeattle () {
    send('setCoords', [47.6062, -122.3321])
  }
}

app.router([
  ['/', View]
])

const tree = app.start()
document.body.appendChild(tree)
```

[See this example live](http://choo-leaflet-demo.surge.sh)
