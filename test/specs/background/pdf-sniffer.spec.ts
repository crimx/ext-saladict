import { getDefaultConfig, AppConfigMutable, AppConfig } from '@/app-config'
import { matchPatternToRegExpStr } from '@/_helpers/matchPatternToRegExpStr'
import { init as initPdfOrigin } from '@/background/pdf-sniffer'
import { timer } from '@/_helpers/promise-more'
import * as configManagerMock from '@/_helpers/__mocks__/config-manager'
import { browser } from '../../helper'

jest.mock('@/_helpers/config-manager')

let configManager: typeof configManagerMock

function hasListenerPatch(fn) {
  // @ts-ignore
  if (this._listeners) {
    // @ts-ignore
    return this._listeners.some(x => x === fn)
  }
  return false
}

function changeConfig(newConfig: AppConfig, oldConfig: AppConfig) {
  window.appConfig = newConfig
  configManager.dispatchConfigChangedEvent(newConfig, oldConfig)
}

let initPdf: typeof initPdfOrigin

describe('PDF Sniffer', () => {
  beforeEach(() => {
    browser.flush()
    browser.runtime.getURL.callsFake(s => s)
    jest.resetModules()
    initPdf = require('@/background/pdf-sniffer').init
    configManager = require('@/_helpers/config-manager')
    // @ts-ignore
    browser.webRequest.onBeforeRequest.hasListener = hasListenerPatch
    // @ts-ignore
    browser.webRequest.onHeadersReceived.hasListener = hasListenerPatch
    window.appConfig = getDefaultConfig()
  })

  const urlPdf = 'https://test.com/c.pdf'
  const urlPdfEncoded = encodeURIComponent(urlPdf)
  const urlTxt = 'https://test.com/c.txt'
  const urlTxtEncoded = encodeURIComponent(urlTxt)

  it('should not start sniffing if sniff config is off', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = false
    initPdf(window.appConfig)
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.notCalled
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.notCalled
    ).toBeTruthy()
    expect(configManager.addConfigListener).toHaveBeenCalledTimes(1)
  })

  it('should start snifffing if sniff config is on', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    initPdf(window.appConfig)
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.calledOnce
    ).toBeTruthy()
    expect(configManager.addConfigListener).toHaveBeenCalledTimes(1)
  })

  it('should stop sniffing if sniff config is turned off', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    initPdf(window.appConfig)
    await timer(0)
    changeConfig(
      { ...window.appConfig, pdfSniff: false },
      { ...window.appConfig, pdfSniff: true }
    )
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onBeforeRequest.removeListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.removeListener.calledOnce
    ).toBeTruthy()
    expect(configManager.addConfigListener).toHaveBeenCalledTimes(1)
  })

  it('should start snifffing only once if init multiple times', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    initPdf(window.appConfig)
    initPdf(window.appConfig)
    initPdf(window.appConfig)
    initPdf(window.appConfig)
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.calledOnce
    ).toBeTruthy()
    expect(configManager.addConfigListener).toHaveBeenCalledTimes(1)
  })

  it('should start snifffing only once if being turned on multiple times', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = false
    initPdf(window.appConfig)
    await timer(0)
    changeConfig(
      { ...window.appConfig, pdfSniff: true },
      { ...window.appConfig, pdfSniff: false }
    )
    changeConfig(
      { ...window.appConfig, pdfSniff: true },
      { ...window.appConfig, pdfSniff: false }
    )
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.calledOnce
    ).toBeTruthy()
    expect(configManager.addConfigListener).toHaveBeenCalledTimes(1)
  })

  it('should intercept ftp/file pdf request and redirect to pdf.js', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    initPdf(window.appConfig)
    await timer(0)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should not intercept ftp/file pdf request if the url matches blacklist', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    ;(window.appConfig as AppConfigMutable).pdfBlacklist = [
      [matchPatternToRegExpStr(urlPdf), urlPdf]
    ]
    initPdf(window.appConfig)
    await timer(0)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toBeUndefined()
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should intercept ftp/file pdf request if the url matches whitelist', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    ;(window.appConfig as AppConfigMutable).pdfWhitelist = [
      [matchPatternToRegExpStr(urlPdf), urlPdf]
    ]
    initPdf(window.appConfig)
    await timer(0)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  it('should intercept ftp/file pdf request if the url matches both blacklist and whitelist', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    ;(window.appConfig as AppConfigMutable).pdfBlacklist = [
      [matchPatternToRegExpStr(urlPdf), urlPdf]
    ]
    ;(window.appConfig as AppConfigMutable).pdfWhitelist = [
      [matchPatternToRegExpStr(urlPdf), urlPdf]
    ]
    initPdf(window.appConfig)
    await timer(0)
    const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
    expect(handler({ url: urlPdf })).toEqual({
      redirectUrl: expect.stringMatching(urlPdfEncoded)
    })
    expect(handler({ url: urlTxt })).toEqual({
      redirectUrl: expect.stringMatching(urlTxtEncoded)
    })
  })

  describe('intercept http/https pdf request and redirect to pdf.js', () => {
    it('No PDF Content', async () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      initPdf(window.appConfig)
      await timer(0)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      expect(handler({ resposeHeaders: [], url: urlPdf })).toBeUndefined()

      const otherResponseHeaders = [{ name: 'content-type', value: 'other' }]
      expect(
        handler({ responseHeaders: otherResponseHeaders, url: urlPdf })
      ).toBeUndefined()
    })

    it('With PDF Content Type', async () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      initPdf(window.appConfig)
      await timer(0)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [
        { name: 'content-type', value: 'application/pdf' }
      ]
      expect(handler({ responseHeaders, url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('PDF url with octet-stream Content Type', async () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      initPdf(window.appConfig)
      await timer(0)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [
        { name: 'content-type', value: 'application/octet-stream' }
      ]
      expect(handler({ responseHeaders, url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toBeUndefined()
    })

    it('should not intercept if the url matches blacklist', () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfBlacklist = [
        [matchPatternToRegExpStr(urlPdf), urlPdf]
      ]
      initPdf(window.appConfig)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [
        { name: 'content-type', value: 'application/pdf' }
      ]
      expect(handler({ responseHeaders, url: urlPdf })).toBeUndefined()
      expect(handler({ responseHeaders, url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('should intercept if the url matches whitelist', async () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfWhitelist = [
        [matchPatternToRegExpStr(urlPdf), urlPdf]
      ]
      initPdf(window.appConfig)
      await timer(0)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [
        { name: 'content-type', value: 'application/pdf' }
      ]
      expect(handler({ responseHeaders, url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })

    it('should intercept if the url matches both blacklist and whitelist', async () => {
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfBlacklist = [
        [matchPatternToRegExpStr(urlPdf), urlPdf]
      ]
      ;(window.appConfig as AppConfigMutable).pdfWhitelist = [
        [matchPatternToRegExpStr(urlPdf), urlPdf]
      ]
      initPdf(window.appConfig)
      await timer(0)
      const handler = browser.webRequest.onHeadersReceived['_listeners'][0]
      const responseHeaders = [
        { name: 'content-type', value: 'application/pdf' }
      ]
      expect(handler({ responseHeaders, url: urlPdf })).toEqual({
        redirectUrl: expect.stringMatching(urlPdfEncoded)
      })
      expect(handler({ responseHeaders, url: urlTxt })).toEqual({
        redirectUrl: expect.stringMatching(urlTxtEncoded)
      })
    })
  })
})
