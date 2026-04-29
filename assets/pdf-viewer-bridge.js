;(function() {
  var AUTO_MARKER = 'saladict-pdf'
  var MAX_ATTEMPTS = 20
  var VIEWER_APP_MAX_ATTEMPTS = 80

  function sleep(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, ms)
    })
  }

  function buildViewerUrl(url) {
    var viewerUrl = new URL(window.location.href)
    viewerUrl.searchParams.delete(AUTO_MARKER)
    viewerUrl.searchParams.set('file', url)
    return viewerUrl.toString()
  }

  async function waitForPDFViewerApplication() {
    for (var attempt = 0; attempt < VIEWER_APP_MAX_ATTEMPTS; attempt++) {
      if (
        window.PDFViewerApplication &&
        window.PDFViewerApplication.initializedPromise
      ) {
        return window.PDFViewerApplication
      }

      await sleep(50)
    }

    return null
  }

  async function getViewerTabContext() {
    var context = {}

    try {
      if (browser.tabs && browser.tabs.getCurrent) {
        var tab = await browser.tabs.getCurrent()
        if (tab && typeof tab.id === 'number') {
          context.tabId = tab.id
        }
      }
    } catch (error) {
      /* fall back to the message sender metadata */
    }

    return context
  }

  async function fetchPendingPdfOpen(context) {
    return browser.runtime.sendMessage({
      type: 'GET_PDF_SNIFF_PENDING',
      payload: context
    })
  }

  async function openStandaloneIfNeeded(url, context) {
    return browser.runtime.sendMessage({
      type: 'OPEN_PDF_VIEWER_STANDALONE_IF_NEEDED',
      payload: Object.assign({ url: url }, context)
    })
  }

  async function bootstrapAutoPdfOpen() {
    var currentUrl = new URL(window.location.href)
    if (currentUrl.searchParams.get(AUTO_MARKER) !== '1') {
      return
    }

    var pdfViewerApplication = await waitForPDFViewerApplication()
    if (!pdfViewerApplication) {
      return
    }

    await pdfViewerApplication.initializedPromise
    var viewerTabContext = await getViewerTabContext()

    for (var attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      var pending = null

      try {
        pending = await fetchPendingPdfOpen(viewerTabContext)
      } catch (error) {
        pending = null
      }

      if (!pending) {
        await sleep((attempt + 1) * 50)
        continue
      }

      if (pending.action === 'bypass') {
        window.location.replace(pending.url)
        return
      }

      try {
        var openedStandalone = await openStandaloneIfNeeded(
          pending.url,
          viewerTabContext
        )
        if (openedStandalone) {
          return
        }
      } catch (error) {
        /* keep opening in the current viewer tab */
      }

      window.history.replaceState(
        window.history.state,
        '',
        buildViewerUrl(pending.url)
      )
      await pdfViewerApplication.open({ url: pending.url })
      return
    }

    console.warn('Failed to resolve pending PDF sniff request for viewer.')
  }

  bootstrapAutoPdfOpen().catch(console.error)
})()
