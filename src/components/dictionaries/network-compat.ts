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

type Cookie = {
  name: string
  value: string
}

export type CookieHeaderNetworkCompatibilityOptions = {
  origin: string
  cookieDomain?: string
  topLevelSite: string
  urls: string[]
  ruleId: number
  ruleRegexFilter: string
  resourceTypes?: string[]
  referer?: string
  fallbackCookieNames?: string[]
}

export function createCookieHeaderNetworkCompatibility(
  options: CookieHeaderNetworkCompatibilityOptions
) {
  let ensureNetworkCompatibilityPromise: Promise<void> | null = null
  let mv2HeaderListenerInstalled = false
  let currentCookieHeader = ''
  let mv3RuleInstalled = false
  let mv3RuleCookieHeader = ''

  return function ensureNetworkCompatibility() {
    if (!ensureNetworkCompatibilityPromise) {
      ensureNetworkCompatibilityPromise = doEnsureNetworkCompatibility()
        .then(() => {
          ensureNetworkCompatibilityPromise = null
        })
        .catch(error => {
          ensureNetworkCompatibilityPromise = null
          throw error
        })
    }

    return ensureNetworkCompatibilityPromise
  }

  async function doEnsureNetworkCompatibility() {
    const dnr = getChromeDeclarativeNetRequest()
    const cookieHeader = await getCookieHeader(options)

    if (dnr) {
      if (!mv3RuleInstalled || mv3RuleCookieHeader !== cookieHeader) {
        await installMv3HeaderRule(dnr, options, cookieHeader)
        mv3RuleInstalled = true
        mv3RuleCookieHeader = cookieHeader
      }
      return
    }

    const webRequest = getBrowserWebRequest()
    if (webRequest && webRequest.onBeforeSendHeaders) {
      currentCookieHeader = cookieHeader
      installMv2HeaderListener(webRequest, options)
      return
    }

    if (isManifestV3()) {
      throw new Error(
        'declarativeNetRequest is unavailable in the current MV3 context.'
      )
    }

    throw new Error('webRequest.onBeforeSendHeaders is unavailable.')
  }

  function installMv2HeaderListener(
    webRequest: BrowserWebRequest,
    options: CookieHeaderNetworkCompatibilityOptions
  ) {
    if (mv2HeaderListenerInstalled) {
      return
    }

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
          setRequestHeader(
            details.requestHeaders,
            'Referer',
            options.referer || options.origin
          )
          if (currentCookieHeader) {
            upsertCookieHeader(details.requestHeaders, currentCookieHeader)
          }
        }
        return { requestHeaders: details.requestHeaders }
      },
      { urls: options.urls },
      /** WebExt type is missing Chrome support */
      extraInfoSpec as any
    )

    mv2HeaderListenerInstalled = true
  }
}

async function installMv3HeaderRule(
  dnr: ChromeDeclarativeNetRequest,
  options: CookieHeaderNetworkCompatibilityOptions,
  cookieHeader: string
) {
  const requestHeaders: ChromeModifyHeaderInfo[] = [
    {
      header: 'referer',
      operation: 'set',
      value: options.referer || options.origin
    }
  ]

  if (cookieHeader) {
    requestHeaders.push({
      header: 'cookie',
      operation: 'set',
      value: cookieHeader
    })
  }

  await dnr.updateSessionRules({
    removeRuleIds: [options.ruleId],
    addRules: [
      {
        id: options.ruleId,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders
        },
        condition: {
          regexFilter: options.ruleRegexFilter,
          resourceTypes: options.resourceTypes || ['xmlhttprequest', 'media']
        }
      }
    ]
  })
}

async function getCookieHeader(
  options: CookieHeaderNetworkCompatibilityOptions
) {
  const cookiesApi = getBrowserCookies()
  if (!cookiesApi) {
    return ''
  }

  const partitionKey = {
    topLevelSite: options.topLevelSite
  }
  const unpartitionedCookies = await getCookiesForRequest(cookiesApi, options)
  const partitionedCookies = await getCookiesForRequest(
    cookiesApi,
    options,
    partitionKey
  )
  const cookies = collectCookies(unpartitionedCookies, partitionedCookies)
  if (cookies.length > 0) {
    return stringifyCookies(cookies)
  }

  return stringifyCookies(
    await getFallbackCookies(cookiesApi, options, partitionKey)
  )
}

async function getCookiesForRequest(
  cookiesApi: typeof browser.cookies,
  options: CookieHeaderNetworkCompatibilityOptions,
  partitionKey?: { topLevelSite: string }
) {
  if (!cookiesApi.getAll) {
    return []
  }

  const urlFilter: any = {
    url: options.origin
  }
  if (partitionKey) {
    urlFilter.partitionKey = partitionKey
  }

  const urlCookies = await getCookies(cookiesApi, urlFilter)
  if (urlCookies && urlCookies.length > 0) {
    return urlCookies
  }

  if (!options.cookieDomain) {
    return []
  }

  const domainFilter: any = {
    domain: options.cookieDomain
  }
  if (partitionKey) {
    domainFilter.partitionKey = partitionKey
  }

  return (await getCookies(cookiesApi, domainFilter)) || []
}

async function getFallbackCookies(
  cookiesApi: typeof browser.cookies,
  options: CookieHeaderNetworkCompatibilityOptions,
  partitionKey: { topLevelSite: string }
) {
  if (!cookiesApi.get || !options.fallbackCookieNames) {
    return []
  }

  const cookies: Cookie[] = []
  for (const name of options.fallbackCookieNames) {
    for (const key of [partitionKey, undefined]) {
      const filter: any = {
        url: options.origin,
        name
      }
      if (key) {
        filter.partitionKey = key
      }

      const cookie = await getCookie(cookiesApi, filter)
      if (cookie && cookie.value) {
        cookies.push({
          name,
          value: cookie.value
        })
        break
      }
    }
  }

  return cookies
}

async function getCookie(cookiesApi: typeof browser.cookies, filter: any) {
  try {
    return await cookiesApi.get(filter)
  } catch (error) {
    return null
  }
}

async function getCookies(cookiesApi: typeof browser.cookies, filter: any) {
  try {
    return await cookiesApi.getAll(filter)
  } catch (error) {
    return null
  }
}

function stringifyCookies(cookies: Cookie[]) {
  const cookiePairs: string[] = []
  for (const cookie of cookies) {
    if (!cookie.name || !cookie.value) {
      continue
    }
    cookiePairs.push(`${cookie.name}=${cookie.value}`)
  }
  return cookiePairs.join('; ')
}

function collectCookies(...cookieLists: Cookie[][]) {
  const result: Cookie[] = []

  for (const cookies of cookieLists) {
    for (const cookie of cookies) {
      if (cookie.name && cookie.value) {
        result.push({ name: cookie.name, value: cookie.value })
      }
    }
  }

  return result
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

function upsertCookieHeader(
  requestHeaders: Array<{ name: string; value?: string }>,
  cookies: string
) {
  const cookieHeader = getRequestHeader(requestHeaders, 'Cookie')
  const cookiePairs = cookies.split(/;\s*/).filter(Boolean)

  if (cookieHeader) {
    let value = cookieHeader.value || ''
    for (const cookie of cookiePairs) {
      if (!hasCookiePair(value, cookie)) {
        value = value ? `${value}; ${cookie}` : cookie
      }
    }
    cookieHeader.value = value
    return
  }

  requestHeaders.push({ name: 'Cookie', value: cookiePairs.join('; ') })
}

function getRequestHeader(
  requestHeaders: Array<{ name: string; value?: string }>,
  name: string
) {
  const target = name.toLowerCase()
  return requestHeaders.find(header => header.name.toLowerCase() === target)
}

function hasCookiePair(cookieHeader: string, cookie: string) {
  return new RegExp(`(?:^|;\\s*)${escapeRegExp(cookie)}(?:;|$)`).test(
    cookieHeader
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isManifestV3() {
  const manifest = browser.runtime.getManifest && browser.runtime.getManifest()
  return !!(manifest && manifest.manifest_version === 3)
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
