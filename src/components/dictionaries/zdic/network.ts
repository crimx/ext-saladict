const ZDIC_AUDIO_REFERER = 'https://www.zdic.net'
const ZDIC_AUDIO_URLS = ['https://img.zdic.net/audio/*']
const ZDIC_AUDIO_RULE_ID = 32001

type ChromeDeclarativeNetRequest = {
  updateSessionRules: (options: {
    addRules?: Array<{
      id: number
      priority: number
      action: {
        type: 'modifyHeaders'
        requestHeaders: Array<{
          header: string
          operation: 'set'
          value: string
        }>
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

let ensureRefererPromise: Promise<void> | null = null

export function ensureNetworkCompatibility() {
  if (!ensureRefererPromise) {
    ensureRefererPromise = doEnsureZdicAudioReferer().catch(error => {
      ensureRefererPromise = null
      throw error
    })
  }

  return ensureRefererPromise
}

async function doEnsureZdicAudioReferer() {
  const dnr = getChromeDeclarativeNetRequest()
  if (dnr) {
    await installMv3RefererRule(dnr)
    return
  }

  const webRequest = getBrowserWebRequest()
  if (webRequest && webRequest.onBeforeSendHeaders) {
    installMv2RefererListener(webRequest)
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

function installMv2RefererListener(webRequest: BrowserWebRequest) {
  const extraInfoSpec = ['blocking', 'requestHeaders']
  const onBeforeSendHeadersOptions = (webRequest as any)
    .OnBeforeSendHeadersOptions
  // https://developer.chrome.com/extensions/webRequest#life_cycle_footnote
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
        for (var i = 0; i < details.requestHeaders.length; ++i) {
          if (details.requestHeaders[i].name === 'Referer') {
            details.requestHeaders[i].value = ZDIC_AUDIO_REFERER
            break
          }
        }
        if (i === details.requestHeaders.length) {
          details.requestHeaders.push({
            name: 'Referer',
            value: ZDIC_AUDIO_REFERER
          })
        }
      }
      return { requestHeaders: details.requestHeaders }
    },
    { urls: ZDIC_AUDIO_URLS },
    /** WebExt type is missing Chrome support */
    extraInfoSpec as any
  )
}

async function installMv3RefererRule(dnr: ChromeDeclarativeNetRequest) {
  await dnr.updateSessionRules({
    removeRuleIds: [ZDIC_AUDIO_RULE_ID],
    addRules: [
      {
        id: ZDIC_AUDIO_RULE_ID,
        priority: 1,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [
            {
              header: 'referer',
              operation: 'set',
              value: ZDIC_AUDIO_REFERER
            }
          ]
        },
        condition: {
          regexFilter: '^https://img\\.zdic\\.net/audio/.*',
          resourceTypes: ['media']
        }
      }
    ]
  })
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
