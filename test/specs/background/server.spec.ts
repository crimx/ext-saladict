import { getDefaultConfig } from '@/app-config'
import getDefaultProfile from '@/app-config/profiles'
import { browser } from '../../helper'

const mockOpenUrl = jest.fn((...any: any[]) => Promise.resolve())
const mockCanUseOffscreenDocument = jest.fn()
const mockSearchDictInOffscreen = jest.fn()
const mockGetDictSrcPageInOffscreen = jest.fn()
const mockInitBackgroundState = jest.fn((...any: any[]) =>
  Promise.resolve({
    appConfig: getDefaultConfig(),
    activeProfile: getDefaultProfile(),
    profileIDList: []
  })
)

jest.mock('@/_helpers/browser-api', () => ({
  message: {
    addListener: jest.fn(),
    send: jest.fn()
  },
  openUrl: (...args: any[]) => mockOpenUrl(...args)
}))

jest.mock('@/background/state', () => ({
  initBackgroundState: (...args: any[]) => mockInitBackgroundState(...args)
}))

jest.mock('@/background/offscreen-document', () => ({
  canUseOffscreenDocument: (...args: any[]) =>
    mockCanUseOffscreenDocument(...args)
}))

jest.mock('@/background/offscreen-dict-bridge', () => ({
  searchDictInOffscreen: (...args: any[]) => mockSearchDictInOffscreen(...args),
  callDictEngineMethodInOffscreen: jest.fn(),
  getDictSrcPageInOffscreen: (...args: any[]) =>
    mockGetDictSrcPageInOffscreen(...args)
}))

jest.mock('@/background/windows-manager', () => ({
  QsPanelManager: class {
    hasCreated() {
      return Promise.resolve(false)
    }

    create() {
      return Promise.resolve()
    }

    focus() {
      return Promise.resolve()
    }

    destroy() {
      return Promise.resolve()
    }

    toggleSidebar() {
      return Promise.resolve()
    }
  }
}))

jest.mock('@/background/database', () => ({
  isInNotebook: jest.fn(),
  saveWord: jest.fn(),
  deleteWords: jest.fn(),
  getWordsByText: jest.fn(),
  getWords: jest.fn()
}))

describe('BackgroundServer.openSrcPage', () => {
  beforeEach(() => {
    browser.flush()
    jest.resetModules()
    jest.clearAllMocks()
  })

  it('uses offscreen bridge to resolve dictionary source pages in MV3', async () => {
    mockCanUseOffscreenDocument.mockReturnValue(true)
    mockGetDictSrcPageInOffscreen.mockResolvedValue(
      'https://example.com/offscreen'
    )

    const { BackgroundServer } = require('@/background/server')

    await BackgroundServer.getInstance().openSrcPage({
      id: 'bing',
      text: 'salad',
      active: false
    })

    expect(mockGetDictSrcPageInOffscreen).toHaveBeenCalledWith(
      {
        id: 'bing',
        text: 'salad',
        active: false
      },
      expect.anything(),
      expect.anything()
    )
    expect(mockOpenUrl).toHaveBeenCalledWith({
      url: 'https://example.com/offscreen',
      active: false
    })
  })

  it('falls back to the background dict engine when offscreen is unavailable', async () => {
    mockCanUseOffscreenDocument.mockReturnValue(false)

    const { BackgroundServer } = require('@/background/server')
    const getDictEngine = jest
      .spyOn(BackgroundServer, 'getDictEngine')
      .mockResolvedValue({
        search: jest.fn(),
        getSrcPage: jest.fn(() =>
          Promise.resolve('https://example.com/fallback')
        )
      })

    await BackgroundServer.getInstance().openSrcPage({
      id: 'bing',
      text: 'salad',
      active: true
    })

    expect(mockGetDictSrcPageInOffscreen).not.toHaveBeenCalled()
    expect(getDictEngine).toHaveBeenCalledWith('bing')
    expect(mockOpenUrl).toHaveBeenCalledWith({
      url: 'https://example.com/fallback',
      active: true
    })
  })

  it('routes zdic searches through offscreen in MV3', async () => {
    mockCanUseOffscreenDocument.mockReturnValue(true)
    mockSearchDictInOffscreen.mockResolvedValue({
      result: [{ title: '基本解释', content: '沙拉' }]
    })

    const { BackgroundServer } = require('@/background/server')
    const getDictEngine = jest
      .spyOn(BackgroundServer, 'getDictEngine')
      .mockResolvedValue({
        search: jest.fn(() =>
          Promise.resolve({
            result: [{ title: '基本解释', content: '沙拉' }]
          })
        ),
        getSrcPage: jest.fn()
      })

    const result = await BackgroundServer.getInstance().fetchDictResult({
      id: 'zdic',
      text: '沙拉',
      payload: { isPDF: false }
    })

    expect(mockSearchDictInOffscreen).toHaveBeenCalledWith(
      {
        id: 'zdic',
        text: '沙拉',
        payload: { isPDF: false }
      },
      expect.anything(),
      expect.anything()
    )
    expect(getDictEngine).not.toHaveBeenCalled()
    expect(result).toEqual({
      id: 'zdic',
      result: [{ title: '基本解释', content: '沙拉' }]
    })
  })
})
