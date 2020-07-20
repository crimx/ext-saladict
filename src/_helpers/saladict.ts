/** Pages with the Saladict extension domain */
export const isInternalPage = () => !!window.__SALADICT_INTERNAL_PAGE__

export const isOptionsPage = () => !!window.__SALADICT_OPTIONS_PAGE__

export const isPopupPage = () => !!window.__SALADICT_POPUP_PAGE__

export const isPDFPage = () => !!window.__SALADICT_PDF_PAGE__

export const isQuickSearchPage = () => !!window.__SALADICT_QUICK_SEARCH_PAGE__

/** Dict panel is in a standalone window */
export const isStandalonePage = () => isPopupPage() || isQuickSearchPage()

/** do not record search history on these pages */
export const isNoSearchHistoryPage = () =>
  isInternalPage() && !isStandalonePage()

export const SALADICT_EXTERNAL = 'saladict-external'

export const SALADICT_PANEL = 'saladict-panel'

export const isFirefox = navigator.userAgent.includes('Firefox')
export const isOpera = navigator.userAgent.includes('OPR')

/**
 * Is element in a Saladict external element
 */
export function isInSaladictExternal(
  element: Element | EventTarget | null
): boolean {
  if (!element) {
    return false
  }

  for (let el: Element | null = element as Element; el; el = el.parentElement) {
    if (el.classList && el.classList.contains(SALADICT_EXTERNAL)) {
      return true
    }
  }

  return false
}

/**
 * Is element in Saladict Dict Panel
 */
export function isInDictPanel(element: Node | EventTarget | null): boolean {
  if (!element) {
    return false
  }

  for (let el: Element | null = element as Element; el; el = el.parentElement) {
    if (el.classList && el.classList.contains(SALADICT_PANEL)) {
      return true
    }
  }

  return false
}
