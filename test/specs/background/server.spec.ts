import { appConfigFactory, AppConfig } from '@/app-config'
import * as browserWrap from '@/_helpers/browser-api'
import sinon from 'sinon'

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
    jest.doMock('@/_helpers/chs-to-chz', () => {
      return { chsToChz }
    })
    jest.doMock('@/background/audio-manager', () => {
      return { play }
    })
    jest.doMock('@/_helpers/browser-api', () => {
      return browserWrap
    })
    jest.doMock('@/components/dictionaries/bing/engine.js', () => {
      return bingSearch
    })
  })

  afterAll(() => {
    browser.flush()
    jest.dontMock('@/_helpers/chs-to-chz')
    jest.dontMock('@/background/audio-manager')
    jest.dontMock('@/_helpers/browser-api')
    jest.dontMock('@/components/dictionaries/bing/engine.js')
  })

  beforeEach(() => {
    browser.flush()
    chsToChz.mockReset()
    chsToChz.mockImplementation(t => t)
    play.mockReset()
    play.mockImplementation(() => Promise.resolve())
    initServer.mockReset()
    openURL.mockReset()
    bingSearch.mockReset()
    bingSearch.mockImplementation(() => Promise.resolve())
    jest.resetModules()
    require('@/background/server')
  })

  it('should properly init', () => {
    expect(initServer).toHaveBeenCalledTimes(1)
    expect(browser.runtime.onMessage.addListener.calledOnce).toBeTruthy()
  })

  describe('Create Tab', () => {
    it('called with escape', () => {
      browser.runtime.onMessage.dispatch({
        type: 'OPEN_URL',
        url: 'https://test.com/%s%z',
        escape: true,
        text: 'test',
      })
      expect(chsToChz).toHaveBeenCalledTimes(1)
      expect(chsToChz).toHaveBeenCalledWith('test')
      expect(openURL).toHaveBeenCalledTimes(1)
      expect(openURL).toHaveBeenCalledWith('https://test.com/testtest')
    })

    it('called without escape', () => {
      browser.runtime.onMessage.dispatch({
        type: 'OPEN_URL',
        url: 'https://test.com/',
        text: 'test',
      })
      expect(chsToChz).toHaveBeenCalledTimes(0)
      expect(openURL).toHaveBeenCalledTimes(1)
      expect(openURL).toHaveBeenCalledWith('https://test.com/')
    })
  })

  it('Audio Play', () => {
    browser.runtime.onMessage.dispatch({
      type: 'AUDIO_PLAY',
      src: 'https://test.com/a.mp3',
    })
    expect(play).toHaveBeenCalledTimes(1)
    expect(play).toHaveBeenCalledWith('https://test.com/a.mp3')
  })

  describe('Fetch Dict Result', () => {
    it('should reject when missing dict id', done => {
      const resolveStub = jest.fn()
      const rejectStub = jest.fn()
      browser.runtime.onMessage['_listeners'].forEach(f =>
        f({
          type: 'FETCH_DICT_RESULT',
          text: 'test',
        })
        .then(resolveStub, rejectStub)
      )
      setTimeout(() => {
        expect(bingSearch).toHaveBeenCalledTimes(0)
        expect(resolveStub).toHaveBeenCalledTimes(0)
        expect(rejectStub).toHaveBeenCalledTimes(1)
        done()
      }, 0)
    })

    it('should search text', () => {
      browser.runtime.onMessage.dispatch({
        type: 'FETCH_DICT_RESULT',
        dict: 'bing',
        text: 'test',
      })
      expect(bingSearch).toHaveBeenCalledTimes(1)
      expect(bingSearch).toHaveBeenCalledWith('test')
    })
  })

  it('Preload Selection', done => {
    const resolveStub = jest.fn()
    const rejectStub = jest.fn()
    const queryStub = jest.fn(() => Promise.resolve([{ id: 100 }]))
    browser.tabs.query.callsFake(queryStub)
    browser.tabs.sendMessage.callsFake(() => 'test')
    browser.runtime.onMessage.dispatch({ type: 'PRELOAD_SELECTION' })
    browser.runtime.onMessage['_listeners'].forEach(f =>
      f({ type: 'PRELOAD_SELECTION' })
      .then(resolveStub, rejectStub)
    )
    setTimeout(() => {
      expect(resolveStub).toHaveBeenCalledTimes(1)
      expect(resolveStub).toHaveBeenCalledWith('test')
      expect(rejectStub).toHaveBeenCalledTimes(0)
      expect(browser.tabs.sendMessage.calledWith(100, { type: '__PRELOAD_SELECTION__' })).toBeTruthy()
      done()
    }, 0)
  })
})
