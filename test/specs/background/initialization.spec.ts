import { message, storage } from '@/_helpers/browser-api'
import { getDefaultConfig } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import { timer } from '@/_helpers/promise-more'
import '@/background/types'
import { browser } from '../../helper'

window.appConfig = getDefaultConfig()
window.activeProfile = getDefaultProfile()

window.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => ''
  })
) as any

jest.mock('@/app-config/merge-config', () => {
  const { getDefaultConfig } = require('@/app-config')
  return {
    mergeConfig: jest.fn(config =>
      Promise.resolve(config || getDefaultConfig())
    )
  }
})

jest.mock('@/app-config/merge-profile', () => {
  const { getDefaultProfile } = require('@/app-config/profiles')
  return {
    mergeProfile: jest.fn(profile =>
      Promise.resolve(profile || getDefaultProfile())
    )
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
    openUrl: jest.fn(() => Promise.resolve())
  }
})

describe('Initialization', () => {
  let initMenus: jest.Mock
  let initPdf: jest.Mock

  beforeAll(() => {
    browser.runtime.sendMessage.callsFake(() => Promise.resolve({}))
    browser.tabs.sendMessage.callsFake(() => Promise.resolve({}))
  })

  beforeEach(() => {
    browser.flush()
    jest.resetModules()

    const contextMenus = require('@/background/context-menus')
    const pdfSniffer = require('@/background/pdf-sniffer')
    initMenus = contextMenus.init
    initPdf = pdfSniffer.init

    browser.storage.sync.get.callsFake(() => Promise.resolve({}))
    browser.storage.sync.set.callsFake(() => Promise.resolve())
    browser.storage.sync.clear.callsFake(() => Promise.resolve())
    browser.storage.local.get.callsFake(() => Promise.resolve({}))
    browser.storage.local.set.callsFake(() => Promise.resolve())
    browser.storage.local.clear.callsFake(() => Promise.resolve())

    require('@/background/initialization')
  })

  it('should properly set up', async () => {
    await timer(0)
    expect(browser.runtime.onInstalled.addListener.calledOnce).toBeTruthy()
    expect(browser.runtime.onStartup.addListener.calledOnce).toBeTruthy()
    expect(browser.notifications.onClicked.addListener.calledOnce).toBeTruthy()
    expect(
      browser.notifications.onButtonClicked.addListener.calledOnce
    ).toBeTruthy()
    expect(initMenus).toHaveBeenCalledTimes(0)
    expect(initPdf).toHaveBeenCalledTimes(0)
  })

  describe('onStartup', () => {
    let checkUpdate: jest.Mock
    beforeEach(() => {
      checkUpdate = require('@/_helpers/check-update')
    })

    it('should not check update if last check was just now', async () => {
      browser.storage.local.get.onFirstCall().returns(
        Promise.resolve({
          lastCheckUpdate: Date.now()
        })
      )
      browser.runtime.onStartup.dispatch()

      await timer(0)
      expect(checkUpdate).toHaveBeenCalledTimes(0)
    })
  })
})
