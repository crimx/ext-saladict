const CAMBRIDGE_ORIGIN = 'https://dictionary.cambridge.org'
const CAMBRIDGE_PARTITION_KEY_SITE = 'https://cambridge.org'
const CAMBRIDGE_URLS = ['https://dictionary.cambridge.org/*']
const CAMBRIDGE_RULE_ID = 32002
const CAMBRIDGE_CLEARANCE_COOKIE = 'cf_clearance'
const CAMBRIDGE_CLEARANCE_COOKIE_FILTERS = [
  {
    url: CAMBRIDGE_ORIGIN,
    name: CAMBRIDGE_CLEARANCE_COOKIE
  },
  {
    url: CAMBRIDGE_ORIGIN,
    name: CAMBRIDGE_CLEARANCE_COOKIE,
    partitionKey: {
      topLevelSite: CAMBRIDGE_PARTITION_KEY_SITE
    }
  }
]

type ChromeDeclarativeNetRequest = {
  updateSessionRules: (options: {
    addRules?: Array<{
      id: number
      priority: number
      action: {
        type: 'modifyHeaders'
        requestHeaders: Array<ChromeModifyHeaderInfo>
      }
      condition: {
        regexFilter: string
        resourceTypes: string[]
      }
    }>
    removeRuleIds?: number[]
  }) => Promise<void>
}

type BrowserWebRequest = typeof browser.webRequest

type ChromeModifyHeaderInfo = {
  header: string
  operation: 'append' | 'set'
  value: string
}

let ensureNetworkCompatibilityPromise: Promise<void> | null = null

export function ensureNetworkCompatibility() {
  if (!ensureNetworkCompatibilityPromise) {
    ensureNetworkCompatibilityPromise = doEnsureCambridgeNetworkCompatibility().catch(
      error => {
        ensureNetworkCompatibilityPromise = null
        throw error
      }
    )
  }

  return ensureNetworkCompatibilityPromise
}

async function doEnsureCambridgeNetworkCompatibility() {
  const dnr = getChromeDeclarativeNetRequest()
  if (dnr) {
    await installMv3HeaderRule(dnr, await getCambridgeClearanceCookie())
    return
  }

  const webRequest = getBrowserWebRequest()
  if (webRequest && webRequest.onBeforeSendHeaders) {
    installMv2HeaderListener(webRequest, await getCambridgeClearanceCookie())
    return
  }

  if (isManifestV3()) {
    throw new Error(
      'declarativeNetRequest is unavailable in the current MV3 context.'
    )
  }

  throw new Error('webRequest.onBeforeSendHeaders is unavailable.')
}

function isManifestV3() {
  const manifest = browser.runtime.getManifest && browser.runtime.getManifest()
  return !!(manifest && manifest.manifest_version === 3)
}

function installMv2HeaderListener(
  webRequest: BrowserWebRequest,
  clearanceCookie: string
) {
  const extraInfoSpec = ['blocking', 'requestHeaders']
  const onBeforeSendHeadersOptions = (webRequest as any)
    .OnBeforeSendHeadersOptions

  if (
    onBeforeSendHeadersOptions &&
    Object.prototype.hasOwnProperty.call(
      onBeforeSendHeadersOptions,
      'EXTRA_HEADERS'
    )
  ) {
    extraInfoSpec.push('extraHeaders')
  }

  webRequest.onBeforeSendHeaders.addListener(
    details => {
      if (details && details.requestHeaders) {
        setRequestHeader(details.requestHeaders, 'Referer', CAMBRIDGE_ORIGIN)
        if (clearanceCookie) {
          appendCookieHeader(details.requestHeaders, clearanceCookie)
        }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: CAMBRIDGE_URLS },
    /** WebExt type is missing Chrome support */
    extraInfoSpec as any
  )
}

async function installMv3HeaderRule(
  dnr: ChromeDeclarativeNetRequest,
  clearanceCookie: string
) {
  const requestHeaders: ChromeModifyHeaderInfo[] = [
    {
      header: 'referer',
      operation: 'set',
      value: CAMBRIDGE_ORIGIN
    }
  ]

  if (clearanceCookie) {
    requestHeaders.push({
      header: 'cookie',
      operation: 'append',
      value: clearanceCookie
    })
  }

  await dnr.updateSessionRules({
    removeRuleIds: [CAMBRIDGE_RULE_ID],
    addRules: [
      {
        id: CAMBRIDGE_RULE_ID,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders
        },
        condition: {
          regexFilter: '^https://dictionary\\.cambridge\\.org/.*',
          resourceTypes: ['xmlhttprequest', 'media']
        }
      }
    ]
  })
}

async function getCambridgeClearanceCookie() {
  const cookiesApi = getBrowserCookies()
  if (!cookiesApi || !cookiesApi.get) {
    return ''
  }

  for (const filter of CAMBRIDGE_CLEARANCE_COOKIE_FILTERS) {
    const cookie = await cookiesApi.get(filter as any)
    if (cookie && cookie.value) {
      return `${CAMBRIDGE_CLEARANCE_COOKIE}=${cookie.value}`
    }
  }

  if (cookiesApi.getAll) {
    for (const partitionKey of [
      undefined,
      {
        topLevelSite: CAMBRIDGE_PARTITION_KEY_SITE
      }
    ]) {
      const cookies = await cookiesApi.getAll({
        domain: 'dictionary.cambridge.org',
        name: CAMBRIDGE_CLEARANCE_COOKIE,
        partitionKey
      } as any)
      const clearanceCookie = cookies && cookies.find(cookie => cookie.value)
      if (clearanceCookie) {
        return `${CAMBRIDGE_CLEARANCE_COOKIE}=${clearanceCookie.value}`
      }
    }
  }

  return ''
}

function setRequestHeader(
  requestHeaders: Array<{ name: string; value?: string }>,
  name: string,
  value: string
) {
  const target = name.toLowerCase()
  for (var i = 0; i < requestHeaders.length; ++i) {
    if (requestHeaders[i].name.toLowerCase() === target) {
      requestHeaders[i].value = value
      return
    }
  }

  requestHeaders.push({ name, value })
}

function appendCookieHeader(
  requestHeaders: Array<{ name: string; value?: string }>,
  cookie: string
) {
  const cookieHeader = getRequestHeader(requestHeaders, 'Cookie')
  if (cookieHeader) {
    if (
      !new RegExp(`(?:^|;\\s*)${CAMBRIDGE_CLEARANCE_COOKIE}=`).test(
        cookieHeader.value || ''
      )
    ) {
      cookieHeader.value = cookieHeader.value
        ? `${cookieHeader.value}; ${cookie}`
        : cookie
    }
    return
  }

  requestHeaders.push({ name: 'Cookie', value: cookie })
}

function getRequestHeader(
  requestHeaders: Array<{ name: string; value?: string }>,
  name: string
) {
  const target = name.toLowerCase()
  return requestHeaders.find(header => header.name.toLowerCase() === target)
}

function getChromeDeclarativeNetRequest():
  | ChromeDeclarativeNetRequest
  | undefined {
  const chromeApi = (self as any).chrome
  return chromeApi && chromeApi.declarativeNetRequest
    ? chromeApi.declarativeNetRequest
    : undefined
}

function getBrowserWebRequest(): BrowserWebRequest | undefined {
  const browserApi = browser as
    | typeof browser
    | { webRequest?: BrowserWebRequest }
  return browserApi && browserApi.webRequest ? browserApi.webRequest : undefined
}

function getBrowserCookies(): typeof browser.cookies | undefined {
  const browserApi = browser as
    | typeof browser
    | { cookies?: typeof browser.cookies }
  return browserApi && browserApi.cookies ? browserApi.cookies : undefined
}
