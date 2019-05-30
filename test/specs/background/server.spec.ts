import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import * as browserWrap from '@/_helpers/browser-api'
import { MsgType } from '@/typings/message'
import { timer } from '@/_helpers/promise-more'
import '@/background/types'

window.appConfig = getDefaultConfig()
window.activeProfile = getDefaultProfile()

jest.mock('@/background/database')

describe('Server', () => {
  const chsToChz = jest.fn()
  const play = jest.fn()
  const initServer = jest.fn()
  const openURL = jest.fn()
  const bingSearch = jest.fn()
  browserWrap.message.self.initServer = initServer
  // @ts-ignore
  browserWrap.openURL = openURL

  beforeAll(() => {
    jest.doMock('@/background/sync-manager', () => {})

    jest.doMock('@/_helpers/chs-to-chz', () => {
      return { chsToChz }
    })
    jest.doMock('@/background/audio-manager', () => {
      return { play }
    })
    jest.doMock('@/_helpers/browser-api', () => {
      return browserWrap
    })
    jest.doMock('@/components/dictionaries/bing/engine', () => {
      return {
        search: bingSearch
      }
    })
    jest.doMock('@/app-config', () => {
      return {
        getDefaultConfig: () => window.appConfig
      }
    })
    jest.doMock('@/app-config/profiles', () => {
      return {
        getDefaultProfile: () => window.activeProfile
      }
    })
    jest.doMock('@/_helpers/config-manager', () => {
      return {
        createConfigStream: () => ({
          subscribe: () => {/* noop */}
        })
      }
    })
    jest.doMock('@/_helpers/profile-manager', () => {
      return {
        createActiveProfileStream: () => ({
          subscribe: () => {/* noop */}
        })
      }
    })
  })

  afterAll(() => {
    browser.flush()
    jest.dontMock('@/_helpers/chs-to-chz')
    jest.dontMock('@/background/audio-manager')
    jest.dontMock('@/_helpers/browser-api')
    jest.dontMock('@/components/dictionaries/bing/engine')
  })

  beforeEach(() => {
    browser.flush()
    browser.runtime.sendMessage.callsFake(() => Promise.resolve({}))
    chsToChz.mockReset()
    chsToChz.mockImplementation(t => t)
    play.mockReset()
    play.mockImplementation(() => Promise.resolve())
    initServer.mockReset()
    openURL.mockReset()
    bingSearch.mockReset()
    bingSearch.mockImplementation(() => Promise.resolve({ result: '' }))
    jest.resetModules()
    require('@/background/server')
  })

  it('should properly init', () => {
    expect(initServer).toHaveBeenCalledTimes(1)
    expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
  })

  it('Open url', () => {
    browser.runtime.onMessage.dispatch({
      type: MsgType.OpenURL,
      url: 'https://test.com/',
      text: 'test',
    })
    expect(chsToChz).toHaveBeenCalledTimes(0)
    expect(openURL).toHaveBeenCalledTimes(1)
    expect(openURL).toHaveBeenCalledWith('https://test.com/', undefined)
  })

  describe('Fetch Dict Result', () => {
    it('should reject when missing dict id', async () => {
      const resolveStub = jest.fn()
      const rejectStub = jest.fn()
      browser.runtime.onMessage['_listeners'].forEach(f =>
        f({
          type: MsgType.FetchDictResult,
          text: 'test',
        })
        .then(resolveStub, rejectStub)
      )
      await timer(0)
      expect(bingSearch).toHaveBeenCalledTimes(0)
      expect(resolveStub).toHaveBeenCalledTimes(0)
      expect(rejectStub).toHaveBeenCalledTimes(1)
    })

    it('should search text', () => {
      browser.runtime.onMessage.dispatch({
        type: MsgType.FetchDictResult,
        id: 'bing',
        text: 'test',
        payload: { field: 'any' },
      })
      expect(bingSearch).toHaveBeenCalledTimes(1)
      expect(bingSearch).toHaveBeenCalledWith(
        'test',
        window.appConfig,
        window.activeProfile,
        { field: 'any' }
      )
    })
  })
})
