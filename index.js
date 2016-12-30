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
;css`
  .choo-pink { background-color: #ffc0cb }
`

var highlight = Highlight([ require('highlight-syntax/js') ])

var app = choo()
app.router([ '/', mainView ])

mount('body', app.start())

function mainView () {
  return html`
    <body class="choo-pink flex justify-left justify-center-m justify-between-l pa4 pa0-l">
      ${Nav()}
      ${Main()}
    </body>
  `
}

function Nav () {
  return html`
    <nav class="dn db-l mw6 underline pa4">
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
    <main class="mw-100 mw9-ns">
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
        <div class="mv0 pt3 ml4-l bt-l b--mid-gray ph4 mw6 w-100 f6 f5-l bg-dark-gray overflow-auto self-stretch">
          ${code}
        </div>
      </section>
    `
    res.push(node)
  }

  return html`
    <div>${res}</div>
  `
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
      tuple[1].push(node)
      res.push(tuple)
      pushed = true
      tuple = [ [], [] ]
    } else {
      if (node.nodeName === 'H2') {
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
