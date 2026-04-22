/**
 * Open pdf link directly
 */

import { AppConfig } from '@/app-config'
import { addConfigListener } from '@/_helpers/config-manager'
import { openUrl } from '@/_helpers/browser-api'
import {
  PDF_VIEWER_PATH,
  getHttpPdfSniffActionByHeaders,
  getOtherPdfSniffAction,
  shouldEnableAutoPdfSniff
} from './pdf-sniffer-shared'
import { consumeMv3PendingPdfOpenForViewer, initMv3 } from './pdf-sniffer-mv3'
import {
  getBackgroundStateSnapshot,
  hasBackgroundState,
  initBackgroundState
} from './state'

export function init(config: AppConfig) {
  const manifest = browser.runtime.getManifest && browser.runtime.getManifest()
  if (manifest && manifest.manifest_version === 3) {
    initMv3(config)
    return
  }

  if (browser.webRequest.onBeforeRequest.hasListener(otherPdfListener)) {
    return
  }

  if (shouldEnableAutoPdfSniff(config)) {
    startListening()
  }

  addConfigListener(({ newConfig, oldConfig }) => {
    if (newConfig) {
      if (
        !oldConfig ||
        shouldEnableAutoPdfSniff(newConfig) !==
          shouldEnableAutoPdfSniff(oldConfig)
      ) {
        if (shouldEnableAutoPdfSniff(newConfig)) {
          startListening()
        } else {
          stopListening()
        }
      }
    }
  })
}

/**
 * @param url provide a url
 * @param force load the current tab anyway
 */
export async function openPDF(url?: string, force?: boolean) {
  const {
    appConfig: { pdfStandalone }
  } = await initBackgroundState()
  let pdfURL = browser.runtime.getURL(PDF_VIEWER_PATH)

  if (url) {
    pdfURL += '?file=' + encodeURIComponent(url)
  } else {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0 && tabs[0].url) {
      const curURL = tabs[0].url
      if (curURL.startsWith(pdfURL)) {
        if (pdfStandalone) {
          if (tabs[0].id != null) {
            await browser.tabs.remove(tabs[0].id)
          }
          pdfURL = curURL
        } else {
          return // ignore pdf viewer url
        }
      } else if (force || curURL.endsWith('pdf')) {
        pdfURL += '?file=' + encodeURIComponent(curURL)
      }
    }
  }

  return pdfStandalone
    ? openPDFStandalone(pdfURL)
    : openUrl({ url: pdfURL, unique: false })
}

export function extractPDFUrl(fullurl?: string): string | void {
  if (!fullurl) {
    return
  }
  const searchURL = new URL(fullurl)
  return decodeURIComponent(searchURL.searchParams.get('file') || '')
}

export function consumePendingPdfOpenForViewer(
  sender: browser.runtime.MessageSender
) {
  const manifest = browser.runtime.getManifest && browser.runtime.getManifest()
  if (!manifest || manifest.manifest_version !== 3) {
    return Promise.resolve(null)
  }

  return consumeMv3PendingPdfOpenForViewer(sender)
}

export async function openPdfViewerStandaloneIfNeeded(
  url: string,
  sender: browser.runtime.MessageSender
) {
  const {
    appConfig: { pdfStandalone }
  } = hasBackgroundState()
    ? getBackgroundStateSnapshot()
    : await initBackgroundState()

  if (pdfStandalone !== 'always') {
    return false
  }

  const viewerUrl = browser.runtime.getURL(
    `${PDF_VIEWER_PATH}?file=${encodeURIComponent(url)}`
  )

  await openPDFStandalone(viewerUrl)

  const tabId = sender.tab && sender.tab.id
  if (typeof tabId === 'number' && tabId >= 0) {
    await browser.tabs.remove(tabId)
  }

  return true
}

function startListening() {
  if (!browser.webRequest.onBeforeRequest.hasListener(otherPdfListener)) {
    browser.webRequest.onBeforeRequest.addListener(
      otherPdfListener,
      {
        urls: [
          'ftp://*/*.pdf',
          'ftp://*/*.PDF',
          'file://*/*.pdf',
          'file://*/*.PDF'
        ],
        types: ['main_frame', 'sub_frame']
      },
      ['blocking']
    )
  }

  if (!browser.webRequest.onHeadersReceived.hasListener(httpPdfListener)) {
    browser.webRequest.onHeadersReceived.addListener(
      httpPdfListener,
      {
        urls: ['https://*/*', 'https://*/*', 'http://*/*', 'http://*/*'],
        types: ['main_frame', 'sub_frame']
      },
      ['blocking', 'responseHeaders']
    )
  }
}

function stopListening() {
  browser.webRequest.onBeforeRequest.removeListener(otherPdfListener)
  browser.webRequest.onHeadersReceived.removeListener(httpPdfListener)
}

function otherPdfListener({
  tabId,
  url
}: Parameters<
  Parameters<typeof browser.webRequest.onBeforeRequest.removeListener>[0]
>[0]) {
  const {
    appConfig: { pdfBlacklist, pdfWhitelist, pdfStandalone }
  } = getBackgroundStateSnapshot()
  const action = getOtherPdfSniffAction(url, {
    pdfBlacklist,
    pdfSniff: true,
    pdfStandalone,
    pdfWhitelist
  } as AppConfig)
  if (action !== 'open') {
    return
  }

  const redirectUrl = browser.runtime.getURL(
    `${PDF_VIEWER_PATH}?file=${encodeURIComponent(url)}`
  )

  if (tabId !== -1 && pdfStandalone === 'always') {
    browser.tabs.remove(tabId)
    openPDFStandalone(redirectUrl)
    return { cancel: true }
  }

  return { redirectUrl }
}

function httpPdfListener({
  tabId,
  responseHeaders,
  url
}: Parameters<
  Parameters<typeof browser.webRequest.onHeadersReceived.removeListener>[0]
>[0]) {
  const {
    appConfig: { pdfBlacklist, pdfWhitelist, pdfStandalone }
  } = getBackgroundStateSnapshot()
  const action = getHttpPdfSniffActionByHeaders(url, responseHeaders, {
    pdfBlacklist,
    pdfSniff: true,
    pdfStandalone,
    pdfWhitelist
  } as AppConfig)
  if (action !== 'open') {
    return
  }

  const redirectUrl = browser.runtime.getURL(
    `${PDF_VIEWER_PATH}?file=${encodeURIComponent(url)}`
  )

  if (tabId !== -1 && pdfStandalone === 'always') {
    browser.tabs.remove(tabId)
    openPDFStandalone(redirectUrl)
    return { cancel: true }
  }

  return { redirectUrl }
}

function openPDFStandalone(url: string) {
  return browser.windows.create({ type: 'popup', url })
}
