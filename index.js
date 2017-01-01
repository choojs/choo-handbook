var Highlight = require('highlight-syntax')
var read = require('read-directory')
var mount = require('choo/mount')
var html = require('choo/html')
var marked = require('marked')
var css = require('sheetify')
var path = require('path')
var choo = require('choo')

;css('tachyons')
;css('vhs/css/vhs.css')
;css('highlight-syntax-pastel')
;css`
  .choo-pink { background-color: #ffc0cb }
`

var highlight = Highlight([ require('highlight-syntax/js') ])
var files = read.sync(path.join(__dirname, 'content'))

var layout = [
  [ 'Introduction', files.introduction ],
  [ 'core concepts', [
    [ 'Your first app', files['core_your-first-app'] ]
  ]],
  [ 'node', [
    [ 'Rendering in Node', files['node_rendering-in-node'] ]
  ]]
]

var routes = (function walk (tree) {
  if (typeof tree[0] === 'string') {
    var newRoute = ('/' + tree[0].replace(/ /g, '-').toLowerCase())
    if (newRoute === '/introduction') newRoute = '/'
    if (Array.isArray(tree[1])) {
      return [ newRoute, tree[1].map(walk) ]
    } else {
      return [ newRoute, mainView(tree[1]) ]
    }
  }
  return tree.map(walk)
})(layout)

var app = choo()
app.router(routes)

app.model({ namespace: 'layout', state: { value: layout } })
app.model({ namespace: 'files', state: files })

mount('body', app.start())

function mainView (src) {
  return function (state) {
    return html`
      <body class="choo-pink flex justify-left justify-center-m justify-between-l pa4 pa0-l">
        ${Nav(state.layout.value)}
        ${Main(src)}
      </body>
    `
  }
}

function Nav (layout) {
  var index = 1
  var nav = [ Logo('handbook') ]
  fmt(layout, nav, '')
  return html`
    <nav class="dn db-l mw6 pa4 vh-100-l fixed">
      ${nav}
    </nav>
  `

  function fmt (tree, arr, base) {
    if (typeof tree[0] === 'string') {
      var name = tree[0]
      if (Array.isArray(tree[1])) {
        arr.push(html`<h3 class="f3 bt bw2 pv3 mb0">${name}</h3>`)
        tree[1].map(function (node) {
          fmt(node, arr, base + '/' + name.replace(/ /g, '-').toLowerCase())
        })
      } else {
        var url = (base + '/' + name.replace(/ /g, '-').toLowerCase())
        if (url === '/introduction') url = '/'
        arr.push(html`
          <div>
            <a class="f5 f4-l underline black link" href=${url}>
              ${index++ + '. ' + name}
            </a>
          </div>
        `)
      }
    } else {
      tree.forEach(function (node) {
        fmt(node, arr, base)
      })
    }
  }
}

function Main (src) {
  var _html = marked(src, { highlight: highlight })
  var __html = splitHtml(_html)
  var ___html = styleHtml(__html)

  return html`
    <main class="mw-100 mw9-ns ml7-l pl4-l">
      ${___html}
    </main>
  `
}

function styleHtml (_html) {
  var res = []
  var len = _html.length
  res.push(_html[0][0])

  for (var i = 1; i < len; i++) {
    var tuple = _html[i]
    var text = tuple[0]
    var code = tuple[1][0]

    var node = html`
      <section class="flex flex-column flex-row-l justify-between-l content-around">
        <div class="mw6 mt3 lh-copy f4 f5-ns">
          ${text}
        </div>
        <div class="mv0 ml4-l bt-l b--mid-gray mw6 w-100 f6 f5-l bg-dark-gray overflow-auto">
          ${code}
        </div>
      </section>
    `
    res.push(node)
  }

  return res
}

function splitHtml (str) {
  var el = html`<div></div>`
  el.innerHTML = str

  var res = []
  var pushed = false
  var tuple = [ [], [] ] // the first array holds text, second is for code

  var header = el.childNodes[0]
  header.setAttribute('class', 'f2 f1-l')
  res.push([ [ header ], [] ])

  var len = el.childNodes.length
  for (var i = 1; i < len; i++) {
    var node = el.childNodes[i]
    pushed = false

    if (node.nodeName === 'PRE') {
      node.setAttribute('class', 'pa3 ph4-l lh-copy')
      tuple[1].push(node)
      res.push(tuple)
      pushed = true
      tuple = [ [], [] ]
    } else {
      if (node.nodeName === 'P') {
        node.setAttribute('class', 'f4 lh-copy')
        findEl(node, 'A', function (el) {
          el.setAttribute('class', 'black link underline')
        })
      } else if (node.nodeName === 'UL') {
        node.setAttribute('class', 'f4 lh-copy')
        findEl(node, 'LI', function (el) {
          el.setAttribute('class', 'mt1')
        })
      } else if (node.nodeName === 'H2') {
        node.setAttribute('class', 'f2-l f3 bt bw2')
      }
      tuple[0].push(node)
    }

    if (i === (len - 1) && !pushed) {
      tuple[1].push(html`<pre class="dn db-l"></pre>`)
      res.push(tuple)
    }
  }

  return res
}

function Logo (text) {
  var prefix = css`
    :host .c,
    :host .h,
    :host .o { letter-spacing: -0.25em }

    @media screen and (min-width: 30em) {
      :host .c { letter-spacing: -0.25em }
      :host .h { letter-spacing: -0.1em }
      :host .o { letter-spacing: 0.05em }
    }
  `
  return html`
    <h1 class="f3 f2-l lh-title mt0 mb3 mb4-ns vhs-left ${prefix}">
      <a href="http://choo.io" class="black link">
        <span class="c">C</span>
        <span class="h">H</span>
        <span class="o">O</span>
        <span>O</span>
      </a>
      <br class="dn db-ns">
      <span class="vhs-flicker vhs-delay-4 ttu">
        ${text}
      </span>
    </h1>
  `
}

function findEl (node, type, cb) {
  var childNodes = node.childNodes
  var childLen = childNodes.length
  for (var j = 0; j < childLen; j++) {
    var childEl = childNodes[j]
    if (childEl.nodeName === type) {
      cb(childEl)
    } else if (childEl.childNodes.length) {
      findEl(childEl, type, cb)
    }
  }
}
