import { getDefaultConfig, AppConfigMutable, AppConfig } from '@/app-config'
import getDefaultProfile, { getDefaultProfileID } from '@/app-config/profiles'
import { matchPatternToRegExpStr } from '@/_helpers/matchPatternToRegExpStr'
import { init as initPdfOrigin } from '@/background/pdf-sniffer'
import { timer } from '@/_helpers/promise-more'
import * as configManagerMock from '@/_helpers/__mocks__/config-manager'
import { browser } from '../../helper'

jest.mock('@/_helpers/config-manager')

let configManager: typeof configManagerMock
let getBackgroundStateSnapshot: typeof import('@/background/state').getBackgroundStateSnapshot

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
  replaceBackgroundState({
    ...getBackgroundStateSnapshot(),
    appConfig: newConfig
  })
  configManager.dispatchConfigChangedEvent(newConfig, oldConfig)
}

let initPdf: typeof initPdfOrigin
let replaceBackgroundState: typeof import('@/background/state').replaceBackgroundState
let consumePendingPdfOpenForViewer: typeof import('@/background/pdf-sniffer').consumePendingPdfOpenForViewer
let openPdfViewerStandaloneIfNeeded: typeof import('@/background/pdf-sniffer').openPdfViewerStandaloneIfNeeded

describe('PDF Sniffer', () => {
  beforeEach(() => {
    browser.flush()
    browser.runtime.getURL.callsFake(s => s)
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 2
    }))
    browser.windows.create.callsFake(() => Promise.resolve())
    browser.tabs.remove.callsFake(() => Promise.resolve())
    browser.tabs.update.callsFake(() => Promise.resolve())
    browser.extension.isAllowedFileSchemeAccess.callsFake(() =>
      Promise.resolve(false)
    )
    const localStorageState: Record<string, any> = {}
    browser.storage.local.get.callsFake(keys => {
      if (keys == null) {
        return Promise.resolve({ ...localStorageState })
      }

      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: localStorageState[keys] })
      }

      return Promise.resolve(
        keys.reduce(
          (result, key) => ({
            ...result,
            [key]: localStorageState[key]
          }),
          {}
        )
      )
    })
    browser.storage.local.set.callsFake(items => {
      Object.assign(localStorageState, items)
      return Promise.resolve()
    })
    browser.storage.local.remove.callsFake(keys => {
      const keyList = Array.isArray(keys) ? keys : [keys]
      keyList.forEach(key => {
        delete localStorageState[key]
      })
      return Promise.resolve()
    })
    delete (self as any).chrome
    jest.resetModules()
    initPdf = require('@/background/pdf-sniffer').init
    consumePendingPdfOpenForViewer = require('@/background/pdf-sniffer')
      .consumePendingPdfOpenForViewer
    openPdfViewerStandaloneIfNeeded = require('@/background/pdf-sniffer')
      .openPdfViewerStandaloneIfNeeded
    configManager = require('@/_helpers/config-manager')
    getBackgroundStateSnapshot = require('@/background/state')
      .getBackgroundStateSnapshot
    replaceBackgroundState = require('@/background/state')

    replaceBackgroundState = require('@/background/state')
      .replaceBackgroundState
    // @ts-ignore
    browser.webRequest.onBeforeRequest.hasListener = hasListenerPatch
    // @ts-ignore
    browser.webRequest.onHeadersReceived.hasListener = hasListenerPatch
    // @ts-ignore
    browser.tabs.onUpdated.hasListener = hasListenerPatch
    window.appConfig = getDefaultConfig()
    const defaultProfileID = getDefaultProfileID()
    replaceBackgroundState({
      appConfig: window.appConfig,
      activeProfile: getDefaultProfile(defaultProfileID.id),
      profileIDList: [defaultProfileID]
    })
  })

  const urlPdf = 'https://test.com/c.pdf'
  const urlPdfEncoded = encodeURIComponent(urlPdf)
  const urlTxt = 'https://test.com/c.txt'

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

  it('should not start sniffing if standalone mode is manual', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    ;(window.appConfig as AppConfigMutable).pdfStandalone = 'manual'
    initPdf(window.appConfig)
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.addListener.notCalled
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.addListener.notCalled
    ).toBeTruthy()
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

  it('should stop sniffing if standalone mode is changed to manual', async () => {
    ;(window.appConfig as AppConfigMutable).pdfSniff = true
    initPdf(window.appConfig)
    await timer(0)
    changeConfig(
      { ...window.appConfig, pdfStandalone: 'manual' },
      { ...window.appConfig, pdfStandalone: '' }
    )
    await timer(0)
    expect(
      browser.webRequest.onBeforeRequest.removeListener.calledOnce
    ).toBeTruthy()
    expect(
      browser.webRequest.onHeadersReceived.removeListener.calledOnce
    ).toBeTruthy()
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
    expect(handler({ url: urlTxt })).toBeUndefined()
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
    expect(handler({ url: urlTxt })).toBeUndefined()
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
    expect(handler({ url: urlTxt })).toBeUndefined()
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
    expect(handler({ url: urlTxt })).toBeUndefined()
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
        redirectUrl: expect.stringMatching(encodeURIComponent(urlTxt))
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
        redirectUrl: expect.stringMatching(encodeURIComponent(urlTxt))
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
        redirectUrl: expect.stringMatching(encodeURIComponent(urlTxt))
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
        redirectUrl: expect.stringMatching(encodeURIComponent(urlTxt))
      })
    })
  })

  describe('Manifest V3', () => {
    function mockMv3Dnr() {
      const updateDynamicRules = jest.fn(() => Promise.resolve())
      const updateSessionRules = jest.fn(() => Promise.resolve())

      browser.runtime.getManifest.callsFake(() => ({
        manifest_version: 3
      }))
      ;(self as any).chrome = {
        declarativeNetRequest: {
          updateDynamicRules,
          updateSessionRules
        }
      }

      return {
        updateDynamicRules,
        updateSessionRules
      }
    }

    it('should install mv3 redirect rules and observers when sniff config is on', async () => {
      const { updateDynamicRules, updateSessionRules } = mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      expect(updateDynamicRules).toHaveBeenCalledTimes(1)
      expect(updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [33001, 33002, 33003],
        addRules: expect.arrayContaining([
          expect.objectContaining({
            id: 33001,
            action: {
              type: 'redirect',
              redirect: {
                url: expect.stringContaining('saladict-pdf=1')
              }
            }
          }),
          expect.objectContaining({
            id: 33002
          }),
          expect.objectContaining({
            id: 33003
          })
        ])
      })
      expect(updateSessionRules).toHaveBeenCalledWith({
        removeRuleIds: expect.arrayContaining([33100, 33131])
      })
      expect(
        browser.webRequest.onBeforeRequest.addListener.calledOnce
      ).toBeTruthy()
      expect(
        browser.webRequest.onHeadersReceived.addListener.calledOnce
      ).toBeTruthy()
      expect(browser.tabs.onUpdated.addListener.calledOnce).toBeTruthy()
    })

    it('should not install mv3 redirect rules when standalone mode is manual', async () => {
      const { updateDynamicRules } = mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfStandalone = 'manual'

      initPdf(window.appConfig)
      await timer(0)

      expect(updateDynamicRules).toHaveBeenCalledWith({
        removeRuleIds: [33001, 33002, 33003]
      })
    })

    it('should remove mv3 redirect rules when sniff config is turned off', async () => {
      const { updateDynamicRules } = mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      changeConfig(
        { ...window.appConfig, pdfSniff: false },
        { ...window.appConfig, pdfSniff: true }
      )
      await timer(0)

      expect(updateDynamicRules).toHaveBeenNthCalledWith(2, {
        removeRuleIds: [33001, 33002, 33003]
      })
    })

    it('should remove mv3 redirect rules when standalone mode is changed to manual', async () => {
      const { updateDynamicRules } = mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      changeConfig(
        { ...window.appConfig, pdfStandalone: 'manual' },
        { ...window.appConfig, pdfStandalone: '' }
      )
      await timer(0)

      expect(updateDynamicRules).toHaveBeenNthCalledWith(2, {
        removeRuleIds: [33001, 33002, 33003]
      })
    })

    it('should remember mv3 pending pdf open for viewer', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
      handler({ frameId: 0, tabId: 7, url: urlPdf })
      await timer(0)

      await expect(
        consumePendingPdfOpenForViewer({
          frameId: 0,
          tab: { id: 7 }
        } as any)
      ).resolves.toEqual({
        action: 'open',
        url: urlPdf
      })
    })

    it('should resolve mv3 pending pdf open from viewer tab payload', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
      handler({ frameId: 0, tabId: 7, url: urlPdf })
      await timer(0)

      await expect(
        consumePendingPdfOpenForViewer({} as any, {
          tabId: 7
        })
      ).resolves.toEqual({
        action: 'open',
        url: urlPdf
      })
    })

    it('should install a temporary bypass rule for blacklisted mv3 requests', async () => {
      const { updateSessionRules } = mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfBlacklist = [
        [matchPatternToRegExpStr(urlPdf), urlPdf]
      ]

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
      handler({ frameId: 0, tabId: 7, url: urlPdf })
      await timer(0)

      await expect(
        consumePendingPdfOpenForViewer({
          frameId: 0,
          tab: { id: 7 }
        } as any)
      ).resolves.toEqual({
        action: 'bypass',
        url: urlPdf
      })

      expect(updateSessionRules).toHaveBeenLastCalledWith({
        removeRuleIds: [33100],
        addRules: [
          expect.objectContaining({
            action: {
              type: 'allow'
            },
            condition: expect.objectContaining({
              tabIds: [7]
            }),
            id: 33100
          })
        ]
      })
    })

    it('should redirect local file pdf in current tab when file access is allowed', async () => {
      mockMv3Dnr()
      browser.extension.isAllowedFileSchemeAccess.callsFake(() =>
        Promise.resolve(true)
      )
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.tabs.onUpdated['_listeners'][0]
      await handler(
        7,
        { url: 'file:///Users/test/sample.pdf' },
        { id: 7, url: 'file:///Users/test/sample.pdf' }
      )

      expect(browser.tabs.update.calledOnce).toBeTruthy()
      expect(browser.tabs.update.firstCall.args).toEqual([
        7,
        {
          url: expect.stringMatching(
            encodeURIComponent('file:///Users/test/sample.pdf')
          )
        }
      ])
    })

    it('should redirect local file pdf to popup when standalone is always and file access is allowed', async () => {
      mockMv3Dnr()
      browser.extension.isAllowedFileSchemeAccess.callsFake(() =>
        Promise.resolve(true)
      )
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfStandalone = 'always'

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.tabs.onUpdated['_listeners'][0]
      await handler(
        7,
        { url: 'file:///Users/test/sample.pdf' },
        { id: 7, url: 'file:///Users/test/sample.pdf' }
      )

      expect(browser.windows.create.calledOnce).toBeTruthy()
      expect(browser.windows.create.firstCall.args[0]).toEqual({
        type: 'popup',
        url: expect.stringMatching(
          encodeURIComponent('file:///Users/test/sample.pdf')
        )
      })
      expect(browser.tabs.remove.calledWith(7)).toBeTruthy()
    })

    it('should ignore local file pdf when file access is not allowed', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.tabs.onUpdated['_listeners'][0]
      await handler(
        7,
        { url: 'file:///Users/test/sample.pdf' },
        { id: 7, url: 'file:///Users/test/sample.pdf' }
      )

      expect(browser.tabs.update.notCalled).toBeTruthy()
    })

    it('should ignore mv3 pending pdf open when standalone mode is manual', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfStandalone = 'manual'

      initPdf(window.appConfig)
      await timer(0)

      const handler = browser.webRequest.onBeforeRequest['_listeners'][0]
      handler({ frameId: 0, tabId: 7, url: urlPdf })
      await timer(0)

      await expect(
        consumePendingPdfOpenForViewer({
          frameId: 0,
          tab: { id: 7 }
        } as any)
      ).resolves.toBeNull()
    })

    it('should promote mv3 auto-opened viewer into popup when standalone is always', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfStandalone = 'always'

      await expect(
        openPdfViewerStandaloneIfNeeded(urlPdf, {
          tab: { id: 7 }
        } as any)
      ).resolves.toBe(true)

      expect(browser.windows.create.calledOnce).toBeTruthy()
      expect(browser.windows.create.firstCall.args[0]).toEqual({
        type: 'popup',
        url: expect.stringMatching(urlPdfEncoded)
      })
      expect(browser.tabs.remove.calledWith(7)).toBeTruthy()
    })

    it('should close mv3 auto-opened viewer from viewer tab payload', async () => {
      mockMv3Dnr()
      ;(window.appConfig as AppConfigMutable).pdfSniff = true
      ;(window.appConfig as AppConfigMutable).pdfStandalone = 'always'

      await expect(
        openPdfViewerStandaloneIfNeeded(urlPdf, {} as any, {
          tabId: 7
        })
      ).resolves.toBe(true)

      expect(browser.windows.create.calledOnce).toBeTruthy()
      expect(browser.tabs.remove.calledWith(7)).toBeTruthy()
    })
  })
})
