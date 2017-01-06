var html = require('choo/html')

var index = 0

module.exports = fmt

function fmt (tree, arr, base) {
  if (typeof tree[0] !== 'string') {
    return tree.forEach(function (node) {
      fmt(node, arr, base)
    })
  }

  var name = tree[0]
  if (Array.isArray(tree[1])) {
    arr.push(html`
      <h3 class="f3 bt bw2 pt2 mt4 mb0">
        ${name}
      </h3>
    `)
    return tree[1].map(function (node) {
      var url = (base === '')
        ? ('#' + name.replace(/ /g, '-').toLowerCase())
        : (base + '/' + name.replace(/ /g, '-').toLowerCase())
      fmt(node, arr, url)
    })
  }

  var url = (base + '/' + name.replace(/ /g, '-').toLowerCase())
  if (url === '/introduction') url = '/'

  arr.push(html`
    <a class="db f5 f4-l underline black link lh-copy" href=${url}>
      ${index++ + '. ' + name}
    </a>
  `)
}
