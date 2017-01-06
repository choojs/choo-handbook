var Highlight = require('highlight-syntax')
var read = require('read-directory')
var mount = require('choo/mount')
var html = require('choo/html')
var marked = require('marked')
var css = require('sheetify')
var path = require('path')
var choo = require('choo')

var walk = require('./lib/create-routes')(mainView)
var splitHtml = require('./lib/style-markdown')
var formatAside = require('./lib/style-aside')

;css('tachyons')
;css('vhs/css/vhs.css')
;css('highlight-syntax-pastel')
;css`
  .choo-pink { background-color: #ffc0cb }
  .min-100 { min-width: 100% }
`

var highlight = Highlight([ require('highlight-syntax/js') ])
var files = read.sync(path.join(__dirname, 'content'))

var layout = [
  [ 'Introduction', files['introduction'] ],
  [ 'core concepts', [
    [ 'Your first app', files['core-your-first-app'] ]
  ]],
  [ 'elements', [
    [ 'HTML', files['elements-html'] ],
    [ 'Events', files['elements-events'] ],
    [ 'Lifecycle Hooks', files['elements-lifecycle-hooks'] ],
    [ 'Memoizing', files['elements-memoizing'] ],
    [ 'Creating Widgets', files['elements-creating-widgets'] ]
  ]],
  [ 'routing', [
    [ 'Creating a Router', files['routing-creating-a-router'] ],
    [ 'Anchor Tags', files['routing-anchor-tags'] ],
    [ 'Hash Routing', files['routing-hash-routing'] ],
    [ 'Combining Routers', files['routing-combining-routers'] ]
  ]],
  [ 'guides', [
    [ 'Designing for Reusability', files['node-designing-for-reusability'] ],
    [ 'Rendering in Node', files['node-rendering-in-node'] ]
  ]]
]

var routes = walk(layout, mainView)

var app = choo()
app.router(routes)

app.model({ namespace: 'layout', state: { value: layout } })
app.model({ namespace: 'files', state: files })

mount('body', app.start())

function mainView (src) {
  return function (state) {
    return html`
      <body class="choo-pink flex justify-between-ns items-stretch">
        ${Navigation(state.layout.value)}
        ${Main(src)}
      </body>
    `
  }
}

function Navigation (layout) {
  var arr = []
  formatAside(layout, arr, '')
  return html`
    <aside class="dn db-l mw6 vh-100-l fixed ">
      <div class="mt0 ma3 mb2-ns mv4-ns ">
        ${Logo('handbook')}
      </div>
      <div class="pl3 overflow-y-scroll h-100">
        ${arr}
      </div>
    </aside>
  `
}

function Main (src) {
  var _html = marked(src, { highlight: highlight })
  return html`
    <main class="ma0-l flex-ns flex-column-ns">
      ${styleHtml(splitHtml(_html))}
    </main>
  `

  function styleHtml (elements) {
    return elements.map(function (tuple) {
      var text = tuple[0]
      var code = tuple[1][0]

      return html`
        <article>
          <div class="w-100 w-50-ns mt3 lh-copy f4 f5-ns">
            ${text}
          </div>
          <div class="mv0 ml4-l bt-l b--mid-gray measure f6 f5-l bg-dark-gray overflow-auto">
            ${code}
          </div>
        </section>
      `
    })
  }
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
    <h1 class="f3 f2-l lh-title vhs-left ${prefix}">
      <a href="https://choo.io" class="black link">
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
