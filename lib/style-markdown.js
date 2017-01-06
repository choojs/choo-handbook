var html = require('choo/html')

module.exports = splitHtml

function splitHtml (str) {
  var el = html`<div></div>`
  el.innerHTML = str

  var res = []
  var pushed = false
  var tuple = [ [], [] ] // the first array holds text, second is for code

  var header = el.childNodes[0]
  if (header) {
    header.setAttribute('class', 'f2 f1-l')
    res.push([ [ header ], [] ])
  }

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
