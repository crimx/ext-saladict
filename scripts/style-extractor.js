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
  return Array.from(result).map(x => `'${x}',`).join('\n')

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
 * @param {string[]} attrs - i.e. ["head", "red"]
 * @param {string} from - css path
 * @param {string} to - css path
 */
function getStylesByAttrs (attrs, from, to) {
  let result = ''

  const lattrs = attrs.map(name => name.toLocaleLowerCase())

  fs.readFile(from, (err, source) => {
    const root = postcss.parse(source, { from, to })
    root.walkRules(rule => {
      const selector = rule.selector.toLowerCase()
      if (lattrs.some(attr => selector.includes(attr))) {
        result += rule.toString() + '\n\n'
        rule.remove()
      }
    })
    root.walkAtRules(rule => {
      result += rule.toString() + '\n\n'
    })
    fs.writeFile(to, result, () => true)
  })
}
