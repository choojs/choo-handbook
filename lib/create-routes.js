module.exports = createWalk

function createWalk (view) {
  return function walk (tree) {
    if (typeof tree[0] === 'string') {
      if (Array.isArray(tree[1])) {
        var newRoute = ('#' + tree[0].replace(/ /g, '-').toLowerCase())
        return [ newRoute, tree[1].map(walk) ]
      } else {
        var routeNode = ('/' + tree[0].replace(/ /g, '-').toLowerCase())
        if (routeNode === '/introduction') routeNode = '/'
        return [ routeNode, view(tree[1]) ]
      }
    }
    return tree.map(walk)
  }
}
