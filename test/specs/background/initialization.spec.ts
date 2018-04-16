import { appConfigFactory, AppConfig } from '@/app-config'
import fetchMock from 'jest-fetch-mock'
import sinon from 'sinon'

describe('Initialization', () => {
  const bakFetch = window.fetch
  const openURL = jest.fn(() => Promise.resolve())
  const initMenus = jest.fn(() => Promise.resolve())
  const initPdf = jest.fn()
  const mergeConfig = jest.fn()
  const checkUpdate = jest.fn().mockReturnValue(Promise.resolve())

  beforeAll(() => {
    const { message, storage } = require('@/_helpers/browser-api')
    window.fetch = fetchMock as any

    browser.flush()
    jest.resetModules()
    jest.doMock('@/background/merge-config', () => {
      return {
        mergeConfig (config) {
          mergeConfig(config)
          return Promise.resolve(config || appConfigFactory())
        }
      }
    })
    jest.doMock('@/background/context-menus', () => {
      return { init: initMenus }
    })
    jest.doMock('@/background/pdf-sniffer', () => {
      return { init: initPdf }
    })
    jest.doMock('@/_helpers/check-update', () => {
      return checkUpdate
    })
    jest.doMock('@/_helpers/browser-api', () => {
      return {
        message,
        storage,
        openURL,
      }
    })

    require('@/background/initialization')
  })
  afterAll(() => {
    browser.flush()
    jest.dontMock('@/background/merge-config')
    jest.dontMock('@/background/context-menus')
    jest.dontMock('@/_helpers/browser-api')
    window.fetch = bakFetch
  })

  beforeEach(() => {
    openURL.mockReset()
    initMenus.mockReset()
    initPdf.mockReset()
    mergeConfig.mockReset()
    fetchMock.resetMocks()

    browser.storage.sync.get.flush()
    browser.storage.sync.get.callsFake(() => Promise.resolve({}))
    browser.storage.sync.set.flush()
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.clear.flush()
    browser.storage.sync.clear.callsFake(() => Promise.resolve())

    browser.storage.local.get.flush()
    browser.storage.local.get.callsFake(() => Promise.resolve({}))
    browser.storage.local.set.flush()
    browser.storage.local.set.callsFake(() => Promise.resolve())
    browser.storage.local.clear.flush()
    browser.storage.local.clear.callsFake(() => Promise.resolve())

    browser.notifications.create.flush()
  })

  it('should properly set up', () => {
    expect(browser.runtime.onInstalled.addListener.calledOnce).toBeTruthy()
    expect(browser.runtime.onStartup.addListener.calledOnce).toBeTruthy()
    expect(browser.notifications.onClicked.addListener.calledOnce).toBeTruthy()
    expect(browser.notifications.onButtonClicked.addListener.calledOnce).toBeTruthy()
  })

  describe('onInstalled', () => {
    it('should init new config on first install', done => {
      browser.runtime.onInstalled.dispatch({ reason: 'install' })
      expect(browser.storage.sync.get.calledOnce).toBeTruthy()
      setTimeout(() => {
        expect(browser.storage.local.clear.calledOnce).toBeTruthy()
        expect(browser.storage.sync.clear.calledOnce).toBeTruthy()
        expect(openURL).toHaveBeenCalledTimes(1)
        expect(mergeConfig).toHaveBeenCalledTimes(1)
        expect(mergeConfig).toHaveBeenCalledWith(undefined)
        expect(initMenus).toHaveBeenCalledTimes(1)
        expect(initPdf).toHaveBeenCalledTimes(1)
        expect(browser.storage.local.set.calledWithMatch({
          lastCheckUpdate: sinon.match.number
        })).toBeTruthy()
        done()
      }, 0)
    })
    it('should just merge config if exist', done => {
      const config = appConfigFactory()
      browser.storage.sync.get.onFirstCall().returns(Promise.resolve({ config }))
      fetchMock.mockResponseOnce(JSON.stringify({
        tag_name: 'v1.1.1',
        body: '1. one.\r\n2. two',
      }))

      browser.runtime.onInstalled.dispatch({ reason: 'update' })
      expect(browser.storage.sync.get.calledOnce).toBeTruthy()
      setTimeout(() => {
        expect(browser.storage.local.clear.notCalled).toBeTruthy()
        expect(browser.storage.sync.clear.notCalled).toBeTruthy()
        expect(openURL).toHaveBeenCalledTimes(0)
        expect(mergeConfig).toHaveBeenCalledTimes(1)
        expect(mergeConfig).toHaveBeenCalledWith(config)
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(browser.notifications.create.calledOnce).toBeTruthy()
        expect(browser.notifications.create.calledWithMatch(
          sinon.match.string,
          {
            title: sinon.match('v1.1.1'),
            message: '1. one.\n2. two',
          }
        )).toBeTruthy()
        expect(initMenus).toHaveBeenCalledTimes(1)
        expect(initPdf).toHaveBeenCalledTimes(1)
        expect(browser.storage.local.set.calledWithMatch({
          lastCheckUpdate: sinon.match.number
        })).toBeTruthy()
        done()
      }, 0)
    })
  })

  describe('onStartup', () => {
    it('should init context menus listeners', done => {
      const config = appConfigFactory()
      browser.storage.sync.get.onFirstCall().returns(Promise.resolve({
        config
      }))
      browser.storage.local.get.onFirstCall().returns(Promise.resolve({
        lastCheckUpdate: Date.now()
      }))
      browser.runtime.onStartup.dispatch()
      setTimeout(() => {
        expect(initMenus).toHaveBeenCalledTimes(1)
        expect(initPdf).toHaveBeenCalledTimes(1)
        expect(checkUpdate).toHaveBeenCalledTimes(0)
        done()
      }, 0)
    })
    it('should check update when last check was 7 days ago', done => {
      const config = appConfigFactory()
      browser.storage.sync.get.onFirstCall().returns(Promise.resolve({
        config
      }))
      browser.storage.local.get.onFirstCall().returns(Promise.resolve({
        lastCheckUpdate: 0
      }))
      checkUpdate.mockReturnValueOnce(Promise.resolve({ isAvailable: true, info: {} }))
      browser.runtime.onStartup.dispatch()
      setTimeout(() => {
        expect(initMenus).toHaveBeenCalledTimes(1)
        expect(initPdf).toHaveBeenCalledTimes(1)
        expect(checkUpdate).toHaveBeenCalledTimes(1)
        expect(browser.storage.sync.set.notCalled).toBeTruthy()
        expect(browser.storage.local.set.calledWith({
          lastCheckUpdate: sinon.match.number
        })).toBeTruthy()
        expect(browser.notifications.create.calledOnce).toBeTruthy()
        done()
      }, 0)
    })
  })
})
