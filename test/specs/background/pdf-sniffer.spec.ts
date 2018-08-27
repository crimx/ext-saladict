import { appConfigFactory, AppConfigMutable } from '@/app-config'
import { matchPatternToRegExpStr } from '@/_helpers/matchPatternToRegExpStr'
import { init as initPdfOrigin } from '@/background/pdf-sniffer'

function hasListenerPatch (fn) {
  // @ts-ignore
  if (this._listeners) {
    // @ts-ignore
    return this._listeners.some(x => x === fn)
  }
  return false
}

let initPdf: typeof initPdfOrigin

describe('PDF Sniffer', () => {
  afterAll(() => browser.flush())
  beforeEach(() => {
    browser.flush()
    jest.resetModules()
    initPdf = require('@/background/pdf-sniffer').init
    browser.runtime.getURL.callsFake(s => s)
    // @ts-ignore
    browser.webRequest.onBeforeRequest.hasListener = hasListenerPatch
    // @ts-ignore
    browser.webRequest.onHeadersReceived.hasListener = hasListenerPatch
  })

  const urlPdf = 'https://test.com/c.pdf'
  const urlPdfEncoded = encodeURIComponent(urlPdf)
  const urlTxt = 'https://test.com/c.txt'
  const urlTxtEncoded = encodeURIComponent(urlTxt)

  it('should not start sniffing if sniff config is off', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = false
    initPdf(config)
    expect(browser.webRequest.onBeforeRequest.addListener.notCalled).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.notCalled).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should start snifffing if sniff config is on', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    initPdf(config)
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should stop sniffing if sniff config is turned off', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    initPdf(config)
    browser.storage.onChanged.dispatch({
      config: {
        newValue: { pdfSniff: false },
        oldValue: { pdfSniff: true },
      },
    }, 'sync')
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onBeforeRequest.removeListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.removeListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should start snifffing only once if init multiple times', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    initPdf(config)
    initPdf(config)
    initPdf(config)
    initPdf(config)
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should start snifffing only once if being turned on multiple times', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = false
    initPdf(config)
    browser.storage.onChanged.dispatch({
      config: {
        newValue: { pdfSniff: true },
        oldValue: { pdfSniff: false },
      }
    }, 'sync')
    browser.storage.onChanged.dispatch({
      config: {
        newValue: { pdfSniff: true },
        oldValue: { pdfSniff: false },
      }
    }, 'sync')
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should intercept ftp/file pdf request and redirect to pdf.js', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    initPdf(config)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should not intercept ftp/file pdf request if the url matches blacklist', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    config.pdfBlacklist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
    initPdf(config)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toBeUndefined()
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should intercept ftp/file pdf request if the url matches whitelist', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    config.pdfWhitelist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
    initPdf(config)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should intercept ftp/file pdf request if the url matches both blacklist and whitelist', () => {
    const config = appConfigFactory() as AppConfigMutable
    config.pdfSniff = true
    config.pdfBlacklist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
    config.pdfWhitelist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
    initPdf(config)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  describe('intercept http/https pdf request and redirect to pdf.js', () => {
    it('No PDF Content', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      expect(handler({ resposeHeaders: [], url: urlPdf })).toBeUndefined()

      const otherResponseHeaders = [{ name: 'content-type', value: 'other' }]
      expect(handler({ responseHeaders: otherResponseHeaders, url: urlPdf })).toBeUndefined()
    })

    it('With PDF Content Type', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/pdf' }]
      expect(handler({ responseHeaders , url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders , url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('PDF url with octet-stream Content Type', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/octet-stream' }]
      expect(handler({ responseHeaders , url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toBeUndefined()
    })

    it('should not intercept if the url matches blacklist', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      config.pdfBlacklist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/pdf' }]
      expect(handler({ responseHeaders , url: urlPdf })).toBeUndefined()
      expect(handler({ responseHeaders , url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('should intercept if the url matches whitelist', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      config.pdfWhitelist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/pdf' }]
      expect(handler({ responseHeaders , url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders , url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('should intercept if the url matches both blacklist and whitelist', () => {
      const config = appConfigFactory() as AppConfigMutable
      config.pdfSniff = true
      config.pdfBlacklist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
      config.pdfWhitelist = [[matchPatternToRegExpStr(urlPdf), urlPdf]]
      initPdf(config)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/pdf' }]
      expect(handler({ responseHeaders , url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders , url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })
  })
})
