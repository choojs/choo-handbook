var Highlight = require('highlight-syntax')
var mount = require('choo/mount')
var html = require('choo/html')
var marked = require('marked')
var css = require('sheetify')
var path = require('path')
var choo = require('choo')
var fs = require('fs')

;css('tachyons')
;css('highlight-syntax-pastel')
var bodyStyles = css`:host { background-color: #ffc0cb }`

var highlight = Highlight([ require('highlight-syntax/js') ])

var app = choo()
app.router([ '/', mainView ])

mount('body', app.start())

function mainView () {
  return html`
    <body class="${bodyStyles} flex flex-row">
      ${Nav()}
      ${Main()}
    </body>
  `
}

function Nav () {
  return html`
    <nav class="dn db-ns 100vh mw6 underline pa4">
      <div>1. Rendering in Node</div>
    </nav>
  `
}

function Main () {
  var src = fs.readFileSync(path.join(__dirname, 'content/rendering-in-node.md'), 'utf8')
  var _html = marked(src, { highlight: highlight })
  var __html = splitHtml(_html)
  var ___html = styleHtml(__html)

  return html`
    <main class="mw8 cf">
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
      <section class="flex flex-column flex-row-ns justify-between-ns content-stretch">
        <div class="mw6">
          ${text}
        </div>
        <div class="bg-dark-gray overflow-auto mv0 ml4-ns ph4 mw6 w-100 f6 f5-l bg-dark-gray self-stretch">
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

  var len = el.childNodes.length
  res.push([ [ el.childNodes[0] ], [] ])
  for (var i = 1; i < len; i++) {
    var node = el.childNodes[i]
    pushed = false

    if (node.nodeName === 'PRE') {
      tuple[1].push(node)
      res.push(tuple)
      pushed = true
      tuple = [ [], [] ]
    } else {
      tuple[0].push(node)
    }

    if (i === (len - 1) && !pushed) {
      tuple[1].push(html`<pre class="dn db-ns"></pre>`)
      res.push(tuple)
    }
  }

  return res
}
