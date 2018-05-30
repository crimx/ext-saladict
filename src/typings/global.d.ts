interface Window {
  // For self page messaging
  pageId?: number | string
  faviconURL?: string
  pageTitle?: string
  pageURL?: string

  __SALADICT_INTERNAL_PAGE__?: boolean
  __SALADICT_OPTIONS_PAGE__?: boolean
  __SALADICT_POPUP_PAGE__?: boolean

  // Options page
  __SALADICT_LAST_SEARCH__?: string
}
