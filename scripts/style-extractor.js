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
 * Get relevant styles if the selector contains the keywords..
 * @param {string[]} attrs - i.e. [".head", "red"]
 * @param {string} from - css path
 * @param {string} to - css path
 */
function getStylesByAttrs (attrs, from, to) {
  attrs = new Set(attrs.map(n => n.toLowerCase().replace(/[^a-z-_]/g, '')))
  let result = ''

  fs.readFile(from, (err, source) => {
    const root = postcss.parse(source, { from, to })
    root.walkRules(rule => {
      const selectors = rule.selector.toLowerCase().split(/[^a-z-_]+/)
      if (selectors.some(s => s && attrs.has(s))) {
        result += rule.toString() + '\n\n'
        rule.remove()
      }
    })
    fs.writeFile(to, result, () => true)
  })
}
