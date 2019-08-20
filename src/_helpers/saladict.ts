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
