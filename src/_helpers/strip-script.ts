/**
 * Allow tags: see beblow
 * Allow attributes: class, id, src/href starts with https/http
 * @param {Node} node - DOM Node
 * @param {Set} [allowTags]
 * @returns {Node} Node without javascript and style
 */

export const ALLOW_TAGS = new Set([
  // Main root
  // 'html',

  // Document metadata
  // 'link', 'meta', 'style',

  // Sectioning root
  // 'body',

  // Content sectioning
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'address', 'article', 'aside', 'footer', 'header', 'hgroup', 'nav', 'sectio',

  // Text content
  'blockquote', 'dd', 'div', 'dl', 'dt', 'figcaption', 'figure',
  'hr', 'li', 'main', 'ol', 'p', 'pre', 'ul',

  // Inline text semantics
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',

  // Image and multimedia
  'img', // 'area', 'audio', 'map', 'track', 'video',

  // Embedded content
  // 'embed', 'object', 'param', 'source',

  // Scripting
  // 'canvas', 'noscript', 'script',

  // Demarcating edits
  'del', 'ins',

  // Table content
  'caption', 'col', 'colgroup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'

  // Forms
  // 'button', 'datalist', 'fieldset', 'form', 'input', 'label', 'legend', 'meter',
  // 'optgroup', 'option', 'output', 'progress', 'select', 'textarea',

  // Interactive elements
  // 'details', 'dialog', 'menu', 'menuitem', 'summary',

  // Web Components
  // 'content', 'element', 'shadow', 'slot', 'template',

  // Obsolete and deprecated elements
  // 'acronym', 'applet', 'basefont', 'big', 'blink', 'center', 'command',
  // 'content', 'dir', 'element', 'font', 'frame', 'frameset', 'image',
  // 'isindex', 'keygen', 'listing', 'marquee', 'multicol', 'noembed',
  // 'plaintext', 'shadow', 'spacer', 'strike', 'tt', 'xmp'
])

export default function stripScript (node, allowTags = ALLOW_TAGS) {
  if (!node) { return null }
  if (node.nodeType === Node.TEXT_NODE) { return node.cloneNode() }
  if (node.nodeType !== Node.ELEMENT_NODE) { return null }

  const tagName = node.tagName.toLowerCase()

  if (!allowTags.has(tagName)) { return null }

  const newNode = document.createElement(tagName)
  if (tagName === 'img') {
    if (/^(https?:)?\/\//.test(node.src)) {
      newNode.setAttribute('src', node.scr)
    } else {
      return null
    }
  } else if (tagName === 'a') {
    if (/^(https?:)?\/\//.test(node.href)) {
      newNode.setAttribute('href', node.href)
      newNode.setAttribute('target', '_blank')
    } else {
      return null
    }
  }

  if (node.className) { newNode.className = node.className }
  if (node.id) { newNode.id = node.id }

  node.childNodes.forEach(childNode => {
    const newChildNode = stripScript(childNode, allowTags)
    if (newChildNode != null) {
      newNode.appendChild(newChildNode)
    }
  })

  return newNode
}
