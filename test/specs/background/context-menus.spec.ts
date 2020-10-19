import { getDefaultConfig, AppConfig, AppConfigMutable } from '@/app-config'
import sinon from 'sinon'
import { take } from 'rxjs/operators'
import '@/background/types'
import { timer } from '@/_helpers/promise-more'
import * as configManagerMock from '@/_helpers/__mocks__/config-manager'
import { openUrl as openUrlMock } from '@/_helpers/__mocks__/browser-api'
import { browser } from '../../helper'

window.appConfig = getDefaultConfig()

jest.mock('@/_helpers/config-manager')
jest.mock('@/_helpers/browser-api')

let configManager: typeof configManagerMock
let openUrl: typeof openUrlMock

function specialConfig() {
  const config = getDefaultConfig() as AppConfigMutable
  config.contextMenus.selected = ['youdao', 'dictcn']
  return config
}

describe.skip('Context Menus', () => {
  beforeAll(() => {
    // Order matters. Do not change.
    browser.flush()
    browser.i18n.getUILanguage.returns('en')
    jest.resetModules()
    require('@/background/context-menus')
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
      browser.i18n.getUILanguage.returns('en')
      config = specialConfig()
      browser.contextMenus.removeAll.callsFake(() => Promise.resolve())
      browser.contextMenus.create.callsFake((_, cb) => cb())
      jest.resetModules()
      configManager = require('@/_helpers/config-manager')
    })

    it('should set menus on init', done => {
      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
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
        done()
      })
    })

    it('should not init setup when called multiple times', done => {
      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()

        const setMenus2$$ = init(config.contextMenus)
        const setMenus3$$ = init(config.contextMenus)

        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        expect(setMenus2$$).toBe(setMenus3$$)

        done()
      })
    })

    it("should do nothing when contex menus config didn't change", done => {
      const newConfig = specialConfig()
      newConfig.active = !newConfig.active

      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        configManager.dispatchConfigChangedEvent(newConfig, config)
        setTimeout(() => {
          expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
          done()
        }, 0)
      })
    })

    it('should set menus at first time change', done => {
      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        configManager.dispatchConfigChangedEvent(newConfig)
        setTimeout(() => {
          expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
          done()
        }, 0)
      })
    })

    it('should set menus when contex menus config changed', done => {
      const newConfig = specialConfig()
      newConfig.contextMenus.selected.pop()

      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
        expect(browser.contextMenus.removeAll.calledOnce).toBeTruthy()
        configManager.dispatchConfigChangedEvent(newConfig, config)
        setTimeout(() => {
          expect(browser.contextMenus.removeAll.calledTwice).toBeTruthy()
          done()
        }, 0)
      })
    })

    it('should only set twice if source emits values during the first setting', done => {
      const { init } = require('@/background/context-menus')
      take(1)(init(config.contextMenus)).subscribe(() => {
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

        setTimeout(() => {
          expect(browser.contextMenus.removeAll.calledThrice).toBeTruthy()
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
          ).toBeFalsy()
          expect(
            browser.contextMenus.create.calledWithMatch(
              { id: 'oxford' },
              sinon.match.func
            )
          ).toBeFalsy()
          expect(
            browser.contextMenus.create.calledWithMatch(
              { id: 'youdao' },
              sinon.match.func
            )
          ).toBeTruthy()
          done()
        }, 0)
      })
    })
  })
})
