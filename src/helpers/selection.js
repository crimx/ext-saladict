/**
 * Selection Helper
 */

const INLINE_TAGS = new Set([
  // Inline text semantics
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
])

/**
* @returns {boolean}
*/
export function hasSelection () {
  return Boolean(window.getSelection().toString().trim())
}

/**
* @returns {string}
*/
export function getSelectionText () {
  return window.getSelection().toString()
    .replace(/(^\s+)|(\s+$)/gm, '\n') // allow one empty line & trim each line
    .replace(/(^\s+)|(\s+$)/g, '') // remove heading or tailing \n
}

// match head                 a.b is ok    chars that ends a sentence
const sentenceHeadTester = /((\.(?![ .]))|[^.?!。？！…\r\n])+$/
// match tail                                                    for "..."
const sentenceTailTester = /^((\.(?![ .]))|[^.?!。？！…\r\n])+(.)\3{0,2}/

/**
* @returns {string}
*/
export function getSelectionSentence () {
  const selection = window.getSelection()
  const selectedText = selection.toString()
  if (!selectedText.trim()) { return '' }

  var sentenceHead = ''
  var sentenceTail = ''

  const anchorNode = selection.anchorNode
  if (anchorNode.nodeType === Node.TEXT_NODE) {
    let leadingText = anchorNode.textContent.slice(0, selection.anchorOffset)
    for (let node = anchorNode.previousSibling; node; node = node.previousSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        leadingText = node.textContent + leadingText
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        leadingText = node.innerText + leadingText
      }
    }

    for (
      let element = anchorNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.previousElementSibling; el; el = el.previousElementSibling) {
        leadingText = el.innerText + leadingText
      }
    }

    sentenceHead = (leadingText.match(sentenceHeadTester) || [''])[0]
  }

  const focusNode = selection.focusNode
  if (selection.focusNode.nodeType === Node.TEXT_NODE) {
    let tailingText = selection.focusNode.textContent.slice(selection.focusOffset)
    for (let node = focusNode.nextSibling; node; node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        tailingText += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        tailingText += node.innerText
      }
    }

    for (
      let element = focusNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.nextElementSibling; el; el = el.nextElementSibling) {
        tailingText += el.innerText
      }
    }

    sentenceTail = (tailingText.match(sentenceTailTester) || [''])[0]
  }

  return (sentenceHead + selectedText + sentenceTail)
    .replace(/(^\s+)|(\s+$)/gm, '\n') // allow one empty line & trim each line
    .replace(/(^\s+)|(\s+$)/g, '') // remove heading or tailing \n
}

/**
 * @typedef {Object} SelectionInfo
 * @property {string} text - selection text
 * @property {string} sentence - sentence that contains the text
 * @property {string} title - page title
 * @property {string} url - page url
 * @property {string} [faviconURL] - favicon url
 * @property {string} [trans] - use-inputted translation
 * @property {string} [note] - use-inputted note
 */

/**
* @returns {SelectionInfo}
*/
export function getSelectionInfo () {
  return {
    text: getSelectionText(),
    sentence: getSelectionSentence(),
    title: window.pageTitle || document.title,
    url: window.pageURL || document.URL,
    // set by chrome-api helper
    faviconURL: window.faviconURL || ''
  }
}

export default {
  hasSelection,
  getSelectionText,
  getSelectionSentence,
  getSelectionInfo
}
