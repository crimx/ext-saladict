import { appConfigFactory } from '@/app-config'
import sinon from 'sinon'

import { message, storage } from '@/_helpers/browser-api'

window.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  json: () => ''
}))

jest.mock('@/app-config/merge-config', () => {
  const { appConfigFactory } = require('@/app-config')
  return {
    mergeConfig: jest.fn(config => Promise.resolve(config || appConfigFactory()))
  }
})

jest.mock('@/background/context-menus', () => {
  return { init: jest.fn(() => Promise.resolve()) }
})

jest.mock('@/background/pdf-sniffer', () => {
  return { init: jest.fn() }
})

jest.mock('@/background/sync-manager', () => {
  return { startSyncServiceInterval: jest.fn() }
})

jest.mock('@/background/server', () => {
  return { openQSPanel: jest.fn() }
})

jest.mock('@/_helpers/check-update', () => {
  return jest.fn().mockReturnValue(Promise.resolve())
})

jest.doMock('@/_helpers/browser-api', () => {
  return {
    message,
    storage,
    openURL: jest.fn(() => Promise.resolve()),
  }
})

describe('Initialization', () => {
  let initMenus: jest.Mock
  let initPdf: jest.Mock
  let openURL: jest.Mock
  let mergeConfig: jest.Mock

  beforeEach(() => {
    browser.flush()
    jest.resetModules()

    const contextMenus = require('@/background/context-menus')
    const pdfSniffer = require('@/background/pdf-sniffer')
    const browserApi = require('@/_helpers/browser-api')
    const _mergeConfig = require('@/app-config/merge-config')
    initMenus = contextMenus.init
    initPdf = pdfSniffer.init
    openURL = browserApi.openURL
    mergeConfig = _mergeConfig.mergeConfig

    browser.storage.sync.get.callsFake(() => Promise.resolve({}))
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.clear.callsFake(() => Promise.resolve())
    browser.storage.local.get.callsFake(() => Promise.resolve({}))
    browser.storage.local.set.callsFake(() => Promise.resolve())
    browser.storage.local.clear.callsFake(() => Promise.resolve())

    require('@/background/initialization')
  })

  it('should properly set up', done => {
    setTimeout(() => {
      expect(browser.runtime.onInstalled.addListener.calledOnce).toBeTruthy()
      expect(browser.runtime.onStartup.addListener.calledOnce).toBeTruthy()
      expect(browser.notifications.onClicked.addListener.calledOnce).toBeTruthy()
      expect(browser.notifications.onButtonClicked.addListener.calledOnce).toBeTruthy()
      expect(initMenus).toHaveBeenCalledTimes(1)
      expect(initPdf).toHaveBeenCalledTimes(1)
      done()
    }, 0)
  })

  describe('onStartup', () => {
    let checkUpdate: jest.Mock
    beforeEach(() => {
      checkUpdate = require('@/_helpers/check-update')
    })

    it('should not check update if last check was just now', done => {
      browser.storage.local.get.onFirstCall().returns(Promise.resolve({
        lastCheckUpdate: Date.now()
      }))
      browser.runtime.onStartup.dispatch()
      setTimeout(() => {
        expect(checkUpdate).toHaveBeenCalledTimes(0)
        done()
      }, 0)
    })

    it('should check update when last check was 7 days ago', done => {
      browser.storage.local.get.onFirstCall().returns(Promise.resolve({
        lastCheckUpdate: 0
      }))
      checkUpdate.mockReturnValueOnce(Promise.resolve({ isAvailable: true, info: {} }))
      browser.runtime.onStartup.dispatch()
      setTimeout(() => {
        expect(checkUpdate).toHaveBeenCalledTimes(1)
        expect(browser.storage.local.set.calledWith({
          lastCheckUpdate: sinon.match.number
        })).toBeTruthy()
        expect(browser.notifications.create.calledOnce).toBeTruthy()
        done()
      }, 0)
    })
  })
})
