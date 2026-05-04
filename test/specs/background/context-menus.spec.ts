import { getDefaultConfig, AppConfig, AppConfigMutable } from '@/app-config'
import sinon from 'sinon'
import { concat, fromEventPattern, of } from 'rxjs'
import { map } from 'rxjs/operators'
import '@/background/types'
import { timer } from '@/_helpers/promise-more'
import * as configManagerMock from '@/_helpers/__mocks__/config-manager'
import { openUrl as openUrlMock } from '@/_helpers/__mocks__/browser-api'
import { browser } from '../../helper'

window.appConfig = getDefaultConfig()

jest.mock('@/_helpers/config-manager')
jest.mock('@/_helpers/browser-api')
jest.mock('@/_helpers/analytics', () => ({
  reportEvent: jest.fn(),
  setupRequestGAListener: jest.fn()
}))
jest.mock('@/background/server', () => ({
  BackgroundServer: {
    getInstance: jest.fn(() => ({
      searchPageSelection: jest.fn()
    }))
  }
}))
jest.mock('@/background/static-locales', () => ({
  getStaticLocale: jest.fn((lang: string, ns: string) => {
    const normalizedLang = ['en', 'zh-CN', 'zh-TW'].includes(lang) ? lang : 'en'
    const localeModule = require(`@/_locales/${normalizedLang}/${ns}`)
    return localeModule.locale || localeModule
  })
}))
jest.mock('@/background/state', () => ({
  hasBackgroundState: jest.fn(() => true),
  getBackgroundStateSnapshot: jest.fn(() => ({
    appConfig: (globalThis as any).appConfig
  })),
  initBackgroundState: jest.fn(() =>
    Promise.resolve({
      appConfig: (globalThis as any).appConfig
    })
  ),
  replaceBackgroundState: jest.fn(state => state)
}))

let configManager: typeof configManagerMock
let openUrl: typeof openUrlMock

function specialConfig() {
  const config = getDefaultConfig() as AppConfigMutable
  config.contextMenus.selected = ['youdao', 'dictcn']
  return config
}

function setupBrowser() {
  browser.i18n.getUILanguage.returns('en')
  browser.runtime.getManifest.callsFake(() => ({ manifest_version: 2 }))
  browser.runtime.getURL.callsFake(s => s)
}

function mockConfigStream(config: AppConfig) {
  configManager.createConfigStream.mockImplementation(() =>
    concat<AppConfig>(
      of(config),
      fromEventPattern<any>(handler =>
        configManager.addConfigListener(handler)
      ).pipe(map(args => (Array.isArray(args) ? args[0] : args).newConfig))
    )
  )
}

async function waitFor(assertion: () => void) {
  let error: any
  for (let i = 0; i < 10; i++) {
    try {
      assertion()
      return
    } catch (err) {
      error = err
      await timer(0)
    }
  }
  throw error
}

async function initContextMenus() {
  const { ContextMenus } = require('@/background/context-menus')
  await ContextMenus.init()
  await waitFor(() => {
    expect(browser.contextMenus.removeAll.called).toBeTruthy()
  })
  return ContextMenus
}

describe('Context Menus', () => {
  beforeAll(async () => {
    // Order matters. Do not change.
    browser.flush()
    setupBrowser()
    browser.contextMenus.removeAll.callsFake(() => Promise.resolve())
    browser.contextMenus.create.callsFake((_, cb) => cb())
    jest.resetModules()
    const { ContextMenus } = require('@/background/context-menus')
    await ContextMenus.init()
    configManager = require('@/_helpers/config-manager')
    openUrl = require('@/_helpers/browser-api').openUrl
  })
  afterAll(() => browser.flush())

  describe('Context Menus Click', () => {
    beforeEach(() => {
      openUrl.mockClear()
      browser.tabs.query.flush()
      browser.runtime.getURL.callsFake(s => s)
      browser.tabs.query
        .onFirstCall()
        .returns(Promise.resolve([{ url: 'test-url' }]))
        .onSecondCall()
        .returns(Promise.resolve([]))
    })

    it('init', () => {
      expect(browser.contextMenus.onClicked.addListener.calledOnce).toBeTruthy()
    })

    it('google_page_translate', async () => {
      browser.tabs.executeScript.flush()
      browser.tabs.executeScript.callsFake(() => Promise.resolve())
      browser.contextMenus.onClicked.dispatch({
        menuItemId: 'google_page_translate'
      })
      expect(browser.tabs.executeScript.calledOnce).toBeTruthy()
    })
    it('youdao_page_translate', () => {
      browser.tabs.executeScript.flush()
      browser.tabs.executeScript.callsFake(() => Promise.resolve())
      browser.contextMenus.onClicked.dispatch({
        menuItemId: 'youdao_page_translate'
      })
      expect(
        browser.tabs.executeScript.calledWith({ file: sinon.match('youdao') })
      ).toBeTruthy()
    })
    it('view_as_pdf', async () => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'view_as_pdf' })
      await timer(0)
      expect(openUrl).toHaveBeenCalledTimes(1)
    })
    it('search_history', async () => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'search_history' })
      await timer(0)
      expect(openUrl).toHaveBeenCalledTimes(1)
      expect(openUrl).toBeCalledWith(expect.stringContaining('history'))
    })
    it('notebook', async () => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'notebook' })
      await timer(0)
      expect(openUrl).toHaveBeenCalledTimes(1)
      expect(openUrl).toBeCalledWith(expect.stringContaining('notebook'))
    })
    it('default', async () => {
      browser.tabs.query.onFirstCall().returns(Promise.resolve([]))
      browser.contextMenus.onClicked.dispatch({ menuItemId: 'bing_dict' })
      await timer(0)
      expect(openUrl).toHaveBeenCalledTimes(1)
      expect(openUrl).toBeCalledWith(expect.stringContaining('bing'))
    })
  })

  describe('initListener', () => {
    let config: AppConfig

    beforeEach(() => {
      // Order matters. Do not change.
      browser.flush()
      setupBrowser()
      config = specialConfig()
      window.appConfig = config
      browser.contextMenus.removeAll.callsFake(() => Promise.resolve())
      browser.contextMenus.create.callsFake((_, cb) => cb())
      jest.resetModules()
      configManager = require('@/_helpers/config-manager')
      mockConfigStream(config)
    })

    it('should set menus on init', async () => {
      await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'youdao' },
          sinon.match.func
        )
      ).toBeTruthy()
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'dictcn' },
          sinon.match.func
        )
      ).toBeTruthy()
    })

    it('should not init setup when called multiple times', async () => {
      const ContextMenus = await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

      const [instance2, instance3] = await Promise.all([
        ContextMenus.init(),
        ContextMenus.init()
      ])

      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      expect(instance2).toBe(instance3)
    })

    it("should do nothing when contex menus config didn't change", async () => {
      const newConfig = specialConfig()
      newConfig.active = !newConfig.active

      await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      configManager.dispatchConfigChangedEvent(newConfig, config)
      await timer(0)
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
    })

    it('should set menus at first time change', async () => {
      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      configManager.dispatchConfigChangedEvent(newConfig)
      await waitFor(() => {
        expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
      })
    })

    it('should set menus when contex menus config changed', async () => {
      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
      configManager.dispatchConfigChangedEvent(newConfig, config)
      await waitFor(() => {
        expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
      })
    })

    it('should set menus for each queued config change', async () => {
      await initContextMenus()
      expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

      const newConfig1 = specialConfig()
      newConfig1.contextMenus.selected = ['bing_dict']

      const newConfig2 = specialConfig()
      newConfig2.contextMenus.selected = ['iciba']

      const newConfig3 = specialConfig()
      newConfig3.contextMenus.selected = ['oxford']

      const newConfig4 = specialConfig()
      newConfig4.contextMenus.selected = ['youdao']

      configManager.dispatchConfigChangedEvent(newConfig1, config)
      configManager.dispatchConfigChangedEvent(newConfig2, newConfig1)
      configManager.dispatchConfigChangedEvent(newConfig3, newConfig2)
      configManager.dispatchConfigChangedEvent(newConfig4, newConfig3)

      await waitFor(() => {
        expect(browser.contextMenus.removeAll.callCount).toBe(5)
      })
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'bing_dict' },
          sinon.match.func
        )
      ).toBeTruthy()
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'iciba' },
          sinon.match.func
        )
      ).toBeTruthy()
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'oxford' },
          sinon.match.func
        )
      ).toBeTruthy()
      expect(
        browser.contextMenus.create.calledWithMatch(
          { id: 'youdao' },
          sinon.match.func
        )
      ).toBeTruthy()
    })
  })
})
