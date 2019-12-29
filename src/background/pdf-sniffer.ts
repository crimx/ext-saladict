/**
 * Open pdf link directly
 */

import { AppConfig } from '@/app-config'
import { addConfigListener } from '@/_helpers/config-manager'
import { openURL } from '@/_helpers/browser-api'

let blacklist: AppConfig['pdfBlacklist'] = []
let whitelist: AppConfig['pdfWhitelist'] = []

export function init(config: AppConfig) {
  if (browser.webRequest.onBeforeRequest.hasListener(otherPdfListener)) {
    return
  }

  blacklist = config.pdfBlacklist
  whitelist = config.pdfWhitelist

  if (config.pdfSniff) {
    startListening()
  }

  addConfigListener(({ newConfig, oldConfig }) => {
    if (newConfig) {
      blacklist = newConfig.pdfBlacklist
      whitelist = newConfig.pdfWhitelist

      if (!oldConfig || newConfig.pdfSniff !== oldConfig.pdfSniff) {
        if (newConfig.pdfSniff) {
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
  const pdfURL = browser.runtime.getURL('assets/pdf/web/viewer.html')
  if (url) {
    // open link as pdf
    return openURL(pdfURL + '?file=' + encodeURIComponent(url))
  }
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  if (tabs.length > 0 && tabs[0].url) {
    if (/pdf$/i.test(tabs[0].url as string) || force) {
      return openURL(
        pdfURL + '?file=' + encodeURIComponent(tabs[0].url as string)
      )
    }
  }
  return openURL(pdfURL)
}

export function extractPDFUrl(fullurl?: string): string | void {
  if (!fullurl) {
    return
  }
  const searchURL = new URL(fullurl)
  return decodeURIComponent(searchURL.searchParams.get('file') || '')
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

function otherPdfListener({ url }) {
  if (
    blacklist.some(([r]) => new RegExp(r).test(url)) &&
    whitelist.every(([r]) => !new RegExp(r).test(url))
  ) {
    return
  }

  return {
    redirectUrl: browser.runtime.getURL(
      `assets/pdf/web/viewer.html?file=${encodeURIComponent(url)}`
    )
  }
}

function httpPdfListener({
  responseHeaders,
  url
}: {
  responseHeaders?: browser.webRequest.HttpHeaders
  url: string
}) {
  if (!responseHeaders) {
    return
  }
  if (
    blacklist.some(([r]) => new RegExp(r).test(url)) &&
    whitelist.every(([r]) => !new RegExp(r).test(url))
  ) {
    return
  }

  const contentTypeHeader = responseHeaders.find(
    ({ name }) => name.toLowerCase() === 'content-type'
  )
  if (contentTypeHeader && contentTypeHeader.value) {
    const contentType = contentTypeHeader.value.toLowerCase()
    if (
      contentType.endsWith('pdf') ||
      (contentType === 'application/octet-stream' && url.endsWith('.pdf'))
    ) {
      return {
        redirectUrl: browser.runtime.getURL(
          `assets/pdf/web/viewer.html?file=${encodeURIComponent(url)}`
        )
      }
    }
  }
}
