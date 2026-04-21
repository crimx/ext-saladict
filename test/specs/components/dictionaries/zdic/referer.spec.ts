import { browser } from '../../../../helper'

describe('Dict/Zdic/referer', () => {
  beforeEach(() => {
    browser.flush()
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 2
    }))
    delete (self as any).chrome
    delete (browser.webRequest as any).OnBeforeSendHeadersOptions
    jest.resetModules()
  })

  afterEach(() => {
    delete (self as any).chrome
  })

  it('should register MV2 referer listener with extraHeaders when available', async () => {
    ;(browser.webRequest as any).OnBeforeSendHeadersOptions = {
      EXTRA_HEADERS: 'extraHeaders'
    }

    const { ensureZdicAudioReferer } = require(
      '@/components/dictionaries/zdic/referer'
    )

    await ensureZdicAudioReferer()

    expect(browser.webRequest.onBeforeSendHeaders.addListener.calledOnce).toBe(
      true
    )

    const [listener, filter, extraInfoSpec] =
      browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(filter).toEqual({ urls: ['https://img.zdic.net/audio/*'] })
    expect(extraInfoSpec).toEqual([
      'blocking',
      'requestHeaders',
      'extraHeaders'
    ])
    expect(
      listener({
        requestHeaders: [{ name: 'Accept', value: 'audio/mpeg' }]
      })
    ).toEqual({
      requestHeaders: [
        { name: 'Accept', value: 'audio/mpeg' },
        { name: 'Referer', value: 'https://www.zdic.net' }
      ]
    })
  })

  it('should install MV3 session rule once', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))

    const updateSessionRules = jest.fn(() => Promise.resolve())
    ;(self as any).chrome = {
      declarativeNetRequest: {
        updateSessionRules
      }
    }

    const { ensureZdicAudioReferer } = require(
      '@/components/dictionaries/zdic/referer'
    )

    await ensureZdicAudioReferer()
    await ensureZdicAudioReferer()

    expect(updateSessionRules).toHaveBeenCalledTimes(1)
    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [32001],
      addRules: [
        {
          id: 32001,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'referer',
                operation: 'set',
                value: 'https://www.zdic.net'
              }
            ]
          },
          condition: {
            regexFilter: '^https://img\\.zdic\\.net/audio/.*',
            resourceTypes: ['media']
          }
        }
      ]
    })
  })

  it('should allow retrying MV3 rule installation after a failure', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))

    const updateSessionRules = jest
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce(undefined)
    ;(self as any).chrome = {
      declarativeNetRequest: {
        updateSessionRules
      }
    }

    const { ensureZdicAudioReferer } = require(
      '@/components/dictionaries/zdic/referer'
    )

    await expect(ensureZdicAudioReferer()).rejects.toThrow('boom')
    await expect(ensureZdicAudioReferer()).resolves.toBeUndefined()
    expect(updateSessionRules).toHaveBeenCalledTimes(2)
  })
})
