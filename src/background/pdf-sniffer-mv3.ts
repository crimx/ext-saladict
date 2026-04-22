import { AppConfig } from '@/app-config'
import { addConfigListener } from '@/_helpers/config-manager'
import {
  PendingPdfOpen,
  consumePendingPdfOpen,
  rememberPendingPdfOpen
} from './pdf-pending-store'
import {
  HTTP_URL_REGEX_FILTER,
  PDF_AUTO_VIEWER_MARKER,
  PDF_URL_REGEX_FILTER,
  PDF_VIEWER_PATH,
  getHttpPdfSniffActionByHeaders,
  getHttpPdfSniffActionByUrl,
  getOtherPdfSniffAction,
  isLocalFileUrl,
  shouldEnableAutoPdfSniff
} from './pdf-sniffer-shared'
import { getBackgroundStateSnapshot } from './state'

type ChromeDeclarativeNetRequest = {
  updateDynamicRules: (options: {
    addRules?: any[]
    removeRuleIds?: number[]
  }) => Promise<void>
  updateSessionRules: (options: {
    addRules?: any[]
    removeRuleIds?: number[]
  }) => Promise<void>
}

const MV3_PDF_DYNAMIC_RULE_IDS = [33001, 33002, 33003]
const MV3_PDF_BYPASS_RULE_ID_START = 33100
const MV3_PDF_BYPASS_RULE_ID_COUNT = 32
const MV3_PDF_RESOURCE_TYPES = ['main_frame', 'sub_frame']
const MV3_PDF_AUTO_VIEWER_URL = browser.runtime.getURL(
  `${PDF_VIEWER_PATH}?${PDF_AUTO_VIEWER_MARKER}=1`
)

let initialized = false
let nextBypassRuleId = MV3_PDF_BYPASS_RULE_ID_START
let rulesSync = Promise.resolve()
let rulesInstalled: boolean | null = null

export function initMv3(config: AppConfig) {
  if (!initialized) {
    initialized = true
    ensureObservers()
    queueMv3PdfRulesUpdate(config)
    clearBypassRules().catch(console.error)
    Promise.resolve(
      addConfigListener(({ newConfig, oldConfig }) => {
        if (
          !oldConfig ||
          shouldEnableAutoPdfSniff(newConfig) !==
            shouldEnableAutoPdfSniff(oldConfig)
        ) {
          queueMv3PdfRulesUpdate(newConfig)
        }
      })
    ).catch(console.error)
    return
  }

  queueMv3PdfRulesUpdate(config)
}

export async function consumeMv3PendingPdfOpenForViewer(
  sender: browser.runtime.MessageSender
) {
  const tabId = sender.tab && sender.tab.id
  if (typeof tabId !== 'number' || tabId < 0) {
    return null
  }

  const frameId = typeof sender.frameId === 'number' ? sender.frameId : 0
  const entry = await consumePendingPdfOpen(tabId, frameId)
  if (!entry) {
    return null
  }

  if (entry.action === 'bypass') {
    await installTemporaryBypassRule(entry, tabId)
  }

  return {
    action: entry.action,
    url: entry.url
  }
}

function getChromeDeclarativeNetRequest():
  | ChromeDeclarativeNetRequest
  | undefined {
  const chromeApi = (self as any).chrome
  return chromeApi && chromeApi.declarativeNetRequest
    ? chromeApi.declarativeNetRequest
    : undefined
}

function queueMv3PdfRulesUpdate(config: AppConfig) {
  rulesSync = rulesSync
    .then(() => syncMv3PdfRules(config))
    .catch(error => {
      console.error('Failed to update MV3 PDF rules:', error)
    })

  return rulesSync
}

async function syncMv3PdfRules(config: AppConfig) {
  const dnr = getChromeDeclarativeNetRequest()
  if (!dnr) {
    return
  }

  const shouldInstallRules = shouldEnableAutoPdfSniff(config)
  if (rulesInstalled !== null && rulesInstalled === shouldInstallRules) {
    return
  }

  rulesInstalled = shouldInstallRules

  if (!shouldInstallRules) {
    await dnr.updateDynamicRules({
      removeRuleIds: MV3_PDF_DYNAMIC_RULE_IDS
    })
    return
  }

  await dnr.updateDynamicRules({
    removeRuleIds: MV3_PDF_DYNAMIC_RULE_IDS,
    addRules: createMv3PdfRedirectRules()
  })
}

function createMv3PdfRedirectRules() {
  return [
    {
      id: MV3_PDF_DYNAMIC_RULE_IDS[0],
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: MV3_PDF_AUTO_VIEWER_URL
        }
      },
      condition: {
        regexFilter: PDF_URL_REGEX_FILTER,
        resourceTypes: MV3_PDF_RESOURCE_TYPES
      }
    },
    {
      id: MV3_PDF_DYNAMIC_RULE_IDS[1],
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: MV3_PDF_AUTO_VIEWER_URL
        }
      },
      condition: {
        regexFilter: HTTP_URL_REGEX_FILTER,
        resourceTypes: MV3_PDF_RESOURCE_TYPES,
        responseHeaders: [
          {
            header: 'content-type',
            values: ['*pdf*']
          }
        ]
      }
    },
    {
      id: MV3_PDF_DYNAMIC_RULE_IDS[2],
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: MV3_PDF_AUTO_VIEWER_URL
        }
      },
      condition: {
        regexFilter: PDF_URL_REGEX_FILTER,
        resourceTypes: MV3_PDF_RESOURCE_TYPES,
        responseHeaders: [
          {
            header: 'content-type',
            values: ['application/octet-stream']
          }
        ]
      }
    }
  ]
}

function ensureObservers() {
  if (!browser.webRequest.onBeforeRequest.hasListener(httpPdfObserverByUrl)) {
    browser.webRequest.onBeforeRequest.addListener(httpPdfObserverByUrl, {
      urls: ['https://*/*', 'http://*/*'],
      types: MV3_PDF_RESOURCE_TYPES as any
    })
  }

  if (
    !browser.webRequest.onHeadersReceived.hasListener(httpPdfObserverByHeaders)
  ) {
    browser.webRequest.onHeadersReceived.addListener(
      httpPdfObserverByHeaders,
      {
        urls: ['https://*/*', 'http://*/*'],
        types: MV3_PDF_RESOURCE_TYPES as any
      },
      ['responseHeaders']
    )
  }

  if (!browser.tabs.onUpdated.hasListener(filePdfTabObserver)) {
    browser.tabs.onUpdated.addListener(filePdfTabObserver)
  }
}

function httpPdfObserverByUrl({
  frameId = 0,
  tabId,
  url
}: {
  frameId?: number
  tabId: number
  url: string
}) {
  if (tabId < 0) {
    return
  }

  const {
    appConfig: { pdfBlacklist, pdfSniff, pdfStandalone, pdfWhitelist }
  } = getBackgroundStateSnapshot()

  const action = getHttpPdfSniffActionByUrl(url, {
    pdfBlacklist,
    pdfSniff,
    pdfStandalone,
    pdfWhitelist
  } as any)

  if (!action) {
    return
  }

  rememberPendingPdfOpen({
    action,
    createdAt: Date.now(),
    frameId,
    source: 'url',
    tabId,
    url
  }).catch(console.error)
}

function httpPdfObserverByHeaders({
  frameId = 0,
  responseHeaders,
  tabId,
  url
}: {
  frameId?: number
  responseHeaders?: Array<{ name: string; value?: string }>
  tabId: number
  url: string
}) {
  if (tabId < 0) {
    return
  }

  const {
    appConfig: { pdfBlacklist, pdfSniff, pdfStandalone, pdfWhitelist }
  } = getBackgroundStateSnapshot()

  const action = getHttpPdfSniffActionByHeaders(url, responseHeaders, {
    pdfBlacklist,
    pdfSniff,
    pdfStandalone,
    pdfWhitelist
  } as any)

  if (!action) {
    return
  }

  rememberPendingPdfOpen({
    action,
    createdAt: Date.now(),
    frameId,
    source: 'headers',
    tabId,
    url
  }).catch(console.error)
}

async function filePdfTabObserver(
  tabId: number,
  changeInfo: any,
  tab: browser.tabs.Tab
) {
  const url = changeInfo.url || tab.url
  if (!url || !isLocalFileUrl(url)) {
    return
  }

  if (!(await isFileSchemeAccessAllowed())) {
    return
  }

  const {
    appConfig: { pdfBlacklist, pdfSniff, pdfStandalone, pdfWhitelist }
  } = getBackgroundStateSnapshot()

  const action = getOtherPdfSniffAction(url, {
    pdfBlacklist,
    pdfSniff,
    pdfStandalone,
    pdfWhitelist
  } as any)

  if (action !== 'open') {
    return
  }

  const redirectUrl = browser.runtime.getURL(
    `${PDF_VIEWER_PATH}?file=${encodeURIComponent(url)}`
  )

  try {
    // Local file navigations do not share the same DNR path as http/https,
    // so MV3 falls back to a tab update after the file URL becomes visible.
    if (pdfStandalone === 'always') {
      await browser.windows.create({ type: 'popup', url: redirectUrl })
      await browser.tabs.remove(tabId)
      return
    }

    await browser.tabs.update(tabId, { url: redirectUrl })
  } catch (error) {
    console.error('Failed to redirect local PDF tab:', error)
  }
}

async function isFileSchemeAccessAllowed() {
  try {
    return await browser.extension.isAllowedFileSchemeAccess()
  } catch (error) {
    return false
  }
}

async function clearBypassRules() {
  const dnr = getChromeDeclarativeNetRequest()
  if (!dnr) {
    return
  }

  await dnr.updateSessionRules({
    removeRuleIds: Array.from(
      { length: MV3_PDF_BYPASS_RULE_ID_COUNT },
      (_, index) => MV3_PDF_BYPASS_RULE_ID_START + index
    )
  })
}

async function installTemporaryBypassRule(
  entry: PendingPdfOpen,
  tabId: number
) {
  const dnr = getChromeDeclarativeNetRequest()
  if (!dnr) {
    return
  }

  const ruleId = allocateBypassRuleId()

  await dnr.updateSessionRules({
    removeRuleIds: [ruleId],
    addRules: [
      {
        id: ruleId,
        priority: 100,
        action: {
          type: 'allow'
        },
        condition: {
          regexFilter: createExactUrlRegexFilter(entry.url),
          resourceTypes: MV3_PDF_RESOURCE_TYPES,
          tabIds: [tabId]
        }
      }
    ]
  })

  setTimeout(() => {
    const currentDnr = getChromeDeclarativeNetRequest()
    if (!currentDnr) {
      return
    }

    currentDnr
      .updateSessionRules({
        removeRuleIds: [ruleId]
      })
      .catch(console.error)
  }, 10000)
}

function allocateBypassRuleId() {
  const ruleId = nextBypassRuleId
  nextBypassRuleId += 1

  if (
    nextBypassRuleId >=
    MV3_PDF_BYPASS_RULE_ID_START + MV3_PDF_BYPASS_RULE_ID_COUNT
  ) {
    nextBypassRuleId = MV3_PDF_BYPASS_RULE_ID_START
  }

  return ruleId
}

function createExactUrlRegexFilter(url: string) {
  return `^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`
}
