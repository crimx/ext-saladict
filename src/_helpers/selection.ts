/**
 * Selection Helper
 */

const INLINE_TAGS = new Set([
  // Inline text semantics
  'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i',
  'kbd', 'mark', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'small',
  'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr'
])

export function hasSelection (win = window): boolean {
  return Boolean(getSelectionText(win))
}

export function getSelectionText (win = window): string {
  const selection = win.getSelection().toString().trim()
  if (selection) {
    return selection
  }

  // Firefox fix
  const activeElement = win.document.activeElement
  if (activeElement) {
    if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
      const el = activeElement as HTMLInputElement | HTMLTextAreaElement
      return el.value.slice(el.selectionStart || 0, el.selectionEnd || 0)
    }
  }

  return ''
}

/** Returns the sentence containing the selection text */
export function getSelectionSentence (win = window): string {
  const selection = win.getSelection()
  const selectedText = selection.toString()
  if (!selectedText.trim()) { return '' }

  return cleanText(
    extractSentenceHead(selection.anchorNode, selection.anchorOffset) +
    selectedText +
    extractSentenceTail(selection.focusNode, selection.focusOffset)
  )
}

export type SelectionInfo = Readonly<SelectionInfoMutable>

export interface SelectionInfoMutable {
  /** selection text */
  text: string
  /** the sentence where the text string is located */
  context: string
  /** page title */
  title: string
  /** page url */
  url: string
  /** favicon url */
  favicon: string
  /** translation */
  trans: string
  /** custom note */
  note: string
}

export function getDefaultSelectionInfo (extra: Partial<SelectionInfo> = {}): SelectionInfo {
  return {
    text: '',
    context: '',
    title: '',
    url: '',
    favicon: '',
    trans: '',
    note: '',
    ...extra,
  }
}

export function isSameSelection (a: SelectionInfo, b: SelectionInfo) {
  return a && b && a.text === b.text && a.context === b.context
}

export function getSelectionInfo (config: Partial<SelectionInfo> = {}): SelectionInfo {
  return {
    text: config.text != null ? config.text : getSelectionText(),
    context: config.context != null ? config.context : getSelectionSentence(),
    title: config.title != null
      ? config.title
      : window.pageTitle || document.title || '',
    url: config.url != null
      ? config.url
      : window.pageURL || document.URL || '',
    // set by chrome-api helper
    favicon: config.favicon != null
      ? config.favicon
      : window.faviconURL || '',
    trans: config.trans || '',
    note: config.note || '',
  }
}

function cleanText (text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function extractSentenceHead (anchorNode: Node, anchorOffset: number): string {
  if (anchorNode.nodeType === Node.TEXT_NODE) {
    let leadingText = anchorNode.textContent || ''
    if (leadingText) {
      leadingText = leadingText.slice(0, anchorOffset)
    }

    // prev siblings
    for (let node = anchorNode.previousSibling; node; node = node.previousSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        leadingText = (node.textContent || '') + leadingText
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        leadingText = (node as HTMLElement).innerText + leadingText
      }
    }

    // parent prev siblings
    for (
      let element = anchorNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.previousElementSibling; el; el = el.previousElementSibling) {
        leadingText = (el as HTMLElement).innerText + leadingText
      }
    }

    const puncTester = /[.?!。？！…]/
    /** meaningful char after dot "." */
    const charTester = /[\s.?!。？！…]/

    for (let i = leadingText.length - 1; i >= 0; i--) {
      const c = leadingText[i]
      if (puncTester.test(c)) {
        if (c === '.' && charTester.test(c)) {
          // a.b is allowed
          continue
        }
        return leadingText.slice(i + 1)
      }
    }

    return leadingText
  }

  return ''
}

function extractSentenceTail (focusNode: Node, focusOffset: number): string {
  if (focusNode.nodeType === Node.TEXT_NODE) {
    let tailingText = focusNode.textContent || ''
    if (tailingText) {
      tailingText = tailingText.slice(focusOffset)
    }

    // next siblings
    for (let node = focusNode.nextSibling; node; node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE) {
        tailingText += node.textContent
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        tailingText += (node as HTMLElement).innerText
      }
    }

    // parent next siblings
    for (
      let element = focusNode.parentElement;
      element && INLINE_TAGS.has(element.tagName.toLowerCase()) && element !== document.body;
      element = element.parentElement
    ) {
      for (let el = element.nextElementSibling; el; el = el.nextElementSibling) {
        tailingText += (el as HTMLElement).innerText
      }
    }

    // match tail                                                       for "..."
    const sentenceTailTester = /^((\.(?![\s.?!。？！…]))|[^.?!。？！…])*([.?!。？！…]){0,3}/
    return (tailingText.match(sentenceTailTester) || [''])[0]
  }

  return ''
}
