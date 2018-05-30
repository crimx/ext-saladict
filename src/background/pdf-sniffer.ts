/**
 * Open pdf link directly
 */

import { storage } from '@/_helpers/browser-api'
import { AppConfig } from '@/app-config'

export function init (pdfSniff: boolean) {
  if (browser.webRequest.onBeforeRequest.hasListener(otherPdfListener)) {
    return
  }

  if (pdfSniff) {
    startListening()
  }

  storage.sync.addListener('config', ({ config }) => {
    const oldValue = config.oldValue as AppConfig | undefined
    const newValue = config.newValue as AppConfig | undefined
    if (newValue && (!oldValue || newValue.pdfSniff !== oldValue.pdfSniff)) {
      if (newValue.pdfSniff) {
        startListening()
      } else {
        stopListening()
      }
    }
  })
}

function startListening () {
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
        urls: [
          'https://*/*',
          'https://*/*',
          'http://*/*',
          'http://*/*'
        ],
        types: ['main_frame', 'sub_frame']
      },
      ['blocking', 'responseHeaders']
    )
  }
}

function stopListening () {
  browser.webRequest.onBeforeRequest.removeListener(otherPdfListener)
  browser.webRequest.onHeadersReceived.removeListener(httpPdfListener)
}

function otherPdfListener ({ url }) {
  return {
    redirectUrl: browser.runtime.getURL(`static/pdf/web/viewer.html?file=${encodeURIComponent(url)}`)
  }
}

function httpPdfListener ({ responseHeaders, url }: { responseHeaders?: browser.webRequest.HttpHeaders, url: string }) {
  if (!responseHeaders) { return }
  const contentTypeHeader = responseHeaders.find(({ name }) => name.toLowerCase() === 'content-type')
  if (contentTypeHeader && contentTypeHeader.value) {
    const contentType = contentTypeHeader.value.toLowerCase()
    if (
      contentType.endsWith('pdf') ||
      (contentType === 'application/octet-stream' && url.endsWith('.pdf'))
    ) {
      return {
        redirectUrl: browser.runtime.getURL(`static/pdf/web/viewer.html?file=${encodeURIComponent(url)}`)
      }
    }
  }
}
