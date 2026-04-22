;(function() {
  var AUTO_MARKER = 'saladict-pdf'
  var MAX_ATTEMPTS = 20

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

  async function fetchPendingPdfOpen() {
    return browser.runtime.sendMessage({
      type: 'GET_PDF_SNIFF_PENDING'
    })
  }

  async function openStandaloneIfNeeded(url) {
    return browser.runtime.sendMessage({
      type: 'OPEN_PDF_VIEWER_STANDALONE_IF_NEEDED',
      payload: {
        url: url
      }
    })
  }

  async function bootstrapAutoPdfOpen() {
    var currentUrl = new URL(window.location.href)
    if (currentUrl.searchParams.get(AUTO_MARKER) !== '1') {
      return
    }

    if (
      !window.PDFViewerApplication ||
      !window.PDFViewerApplication.initializedPromise
    ) {
      return
    }

    await window.PDFViewerApplication.initializedPromise

    for (var attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      var pending = null

      try {
        pending = await fetchPendingPdfOpen()
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
        if (await openStandaloneIfNeeded(pending.url)) {
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
      await window.PDFViewerApplication.open(pending.url)
      return
    }

    console.warn('Failed to resolve pending PDF sniff request for viewer.')
  }

  bootstrapAutoPdfOpen().catch(console.error)
})()
