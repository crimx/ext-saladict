/**
 * Open pdf link directly
 */

import {storage} from 'src/helpers/chrome-api'

storage.sync.get('config', ({config}) => {
  if (config && config.pdfSniff) {
    startListening()
  }
})

storage.sync.listen('config', ({config: {newValue, oldValue}}) => {
  if (newValue.pdfSniff !== oldValue.pdfSniff) {
    if (newValue.pdfSniff) {
      startListening()
    } else {
      stopListening()
    }
  }
})

function startListening () {
  chrome.webRequest.onBeforeRequest.addListener(
    otherPdfListener,
    {
      urls: [
        'ftp://*/*.pdf',
        'ftp://*/*.PDF',
        'file://*/*.pdf',
        'file://*/*.PDF'
      ],
      types: [ 'main_frame', 'sub_frame' ]
    },
    ['blocking']
  )

  chrome.webRequest.onHeadersReceived.addListener(
    httpPdfListener,
    {
      urls: [
        'https://*/*.pdf',
        'https://*/*.PDF',
        'http://*/*.pdf',
        'http://*/*.PDF'
      ],
      types: [ 'main_frame', 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
  )
}

function stopListening () {
  chrome.webRequest.onBeforeRequest.removeListener(otherPdfListener)
  chrome.webRequest.onHeadersReceived.removeListener(httpPdfListener)
}

function otherPdfListener ({url}) {
  return {
    redirectUrl: chrome.runtime.getURL(`assets/pdf/web/viewer.html?file=${encodeURIComponent(url)}`)
  }
}

function httpPdfListener ({responseHeaders, url}) {
  const contentTypeHeader = responseHeaders.find(({name}) => name.toLowerCase() === 'content-type')
  if (contentTypeHeader) {
    const contentType = contentTypeHeader.value.toLowerCase()
    if (
      contentType.endsWith('pdf') ||
      (contentType === 'application/octet-stream' && url.endsWith('.pdf'))
    ) {
      return {
        redirectUrl: chrome.runtime.getURL(`assets/pdf/web/viewer.html?file=${encodeURIComponent(url)}`)
      }
    }
  }
}
