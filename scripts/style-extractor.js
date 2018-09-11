const postcss  = require('postcss')
const fs = require('fs')
const path = require('path')

/**
 * Get all ids and class names under a root node.
 * Use in console.
 * @param {HTMLElement} root
 */
function getIdsAndClassNames (root) {
  const result = new Set()
  _fn(root)
  return Array.from(result).join('\n')

  function _fn (node) {
    if  (!node) { return }
    if (node.className) {
      node.className.split(/\s+/).filter(Boolean).reduce((r, n) => r.add('.' + n), result)
    }
    if (node.id) {
      result.add('#' + node.id)
    }
    Array.from(node.children).forEach(_fn)
  }
}

/**
 * Get relevant styles based on ids and class names.
 * @param {string[]} idsAndClassNames
 * @param {string} from - css path
 * @param {string} to - css path
 */
function getStylesByIdsAndClassNames (idsAndClassNames, from, to) {
  idsAndClassNames = Array.from(new Set(idsAndClassNames)).map(n => n.toLowerCase() + ',')
  let result = ''

  fs.readFile(from, (err, source) => {
    const root = postcss.parse(source, { from, to })
    root.walkRules(rule => {
      const selector = rule.selector.replace(/\s+/g, ',').replace(/,+/, ',').toLowerCase() + ','
      if (idsAndClassNames.some(n => selector.indexOf(n) !== -1)) {
        result += rule.toString() + '\n\n'
        rule.remove()
      }
    })
    fs.writeFile(to, result, () => true)
  })
}
