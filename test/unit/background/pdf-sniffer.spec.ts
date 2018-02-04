import { appConfigFactory, AppConfig } from '../../../src/app-config'
import { init as initPdf } from '../../../src/background/pdf-sniffer'
import sinon from 'sinon'

function hasListenerPatch (fn) {
  // @ts-ignore
  if (this._listeners) {
    // @ts-ignore
    return this._listeners.some(x => x === fn)
  }
  return false
}

describe('PDF Sniffer', () => {
  afterAll(() => browser.flush())
  beforeEach(() => {
    browser.flush()
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
    initPdf(false)
    expect(browser.webRequest.onBeforeRequest.addListener.notCalled).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.notCalled).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should start snifffing if sniff config is on', () => {
    initPdf(true)
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should stop sniffing if sniff config is turned off', () => {
    initPdf(true)
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
    initPdf(true)
    initPdf(true)
    initPdf(true)
    initPdf(true)
    expect(browser.webRequest.onBeforeRequest.addListener.calledOnce).toBeTruthy()
    expect(browser.webRequest.onHeadersReceived.addListener.calledOnce).toBeTruthy()
    expect(browser.storage.onChanged.addListener.calledOnce).toBeTruthy()
  })

  it('should start snifffing only once if turn on multiple times', () => {
    initPdf(false)
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
    initPdf(true)
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
      initPdf(true)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      expect(handler({ resposeHeaders: [], url: urlPdf })).toBeUndefined()

      const otherResponseHeaders = [{ name: 'content-type', value: 'other' }]
      expect(handler({ responseHeaders: otherResponseHeaders, url: urlPdf })).toBeUndefined()
    })

    it('With PDF Content Type', () => {
      initPdf(true)
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
      initPdf(true)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [{ name: 'content-type', value: 'application/octet-stream' }]
      expect(handler({ responseHeaders , url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toBeUndefined()
    })
  })
})
