import { browser } from '../../../../helper'

describe('Dict/Cambridge/network', () => {
  let originalWebRequest: typeof browser.webRequest

  beforeEach(() => {
    browser.flush()
    originalWebRequest = browser.webRequest
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 2
    }))
    delete (self as any).chrome
    delete (browser.webRequest as any).OnBeforeSendHeadersOptions
    jest.resetModules()
  })

  afterEach(() => {
    ;(browser as any).webRequest = originalWebRequest
    delete (self as any).chrome
  })

  it('should register MV2 header listener with extraHeaders when available', async () => {
    ;(browser.webRequest as any).OnBeforeSendHeadersOptions = {
      EXTRA_HEADERS: 'extraHeaders'
    }

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    expect(browser.webRequest.onBeforeSendHeaders.addListener.calledOnce).toBe(
      true
    )

    const [
      listener,
      filter,
      extraInfoSpec
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(filter).toEqual({ urls: ['https://dictionary.cambridge.org/*'] })
    expect(extraInfoSpec).toEqual([
      'blocking',
      'requestHeaders',
      'extraHeaders'
    ])
    expect(
      listener({
        requestHeaders: [{ name: 'Accept', value: 'text/html' }]
      })
    ).toEqual({
      requestHeaders: [
        { name: 'Accept', value: 'text/html' },
        { name: 'Referer', value: 'https://dictionary.cambridge.org' }
      ]
    })
  })

  it('should append cf_clearance cookie when available in MV2', async () => {
    browser.cookies.get.callsFake(() =>
      Promise.resolve({
        value: 'clearance-token'
      })
    )

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    const [
      listener
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(
      listener({
        requestHeaders: [{ name: 'Cookie', value: 'XSRF-TOKEN=xsrf-token' }]
      })
    ).toEqual({
      requestHeaders: [
        {
          name: 'Cookie',
          value: 'XSRF-TOKEN=xsrf-token; cf_clearance=clearance-token'
        },
        { name: 'Referer', value: 'https://dictionary.cambridge.org' }
      ]
    })
  })

  it('should read partitioned cf_clearance cookie in MV2', async () => {
    browser.cookies.get.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? {
              value: 'partitioned-clearance-token'
            }
          : null
      )
    )

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    expect(browser.cookies.get.secondCall.args[0]).toEqual({
      url: 'https://dictionary.cambridge.org',
      name: 'cf_clearance',
      partitionKey: {
        topLevelSite: 'https://cambridge.org'
      }
    })

    const [
      listener
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(
      listener({
        requestHeaders: []
      })
    ).toEqual({
      requestHeaders: [
        { name: 'Referer', value: 'https://dictionary.cambridge.org' },
        {
          name: 'Cookie',
          value: 'cf_clearance=partitioned-clearance-token'
        }
      ]
    })
  })

  it('should install MV3 header session rule once', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))

    const updateSessionRules = jest.fn(() => Promise.resolve())
    ;(self as any).chrome = {
      declarativeNetRequest: {
        updateSessionRules
      }
    }

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()
    await ensureNetworkCompatibility()

    expect(updateSessionRules).toHaveBeenCalledTimes(1)
    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [32002],
      addRules: [
        {
          id: 32002,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'referer',
                operation: 'set',
                value: 'https://dictionary.cambridge.org'
              }
            ]
          },
          condition: {
            regexFilter: '^https://dictionary\\.cambridge\\.org/.*',
            resourceTypes: ['xmlhttprequest', 'media']
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

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await expect(ensureNetworkCompatibility()).rejects.toThrow('boom')
    await expect(ensureNetworkCompatibility()).resolves.toBeUndefined()
    expect(updateSessionRules).toHaveBeenCalledTimes(2)
  })

  it('should append cf_clearance cookie when available in MV3', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))
    browser.cookies.get.callsFake(() =>
      Promise.resolve({
        value: 'clearance-token'
      })
    )

    const updateSessionRules = jest.fn(() => Promise.resolve())
    ;(self as any).chrome = {
      declarativeNetRequest: {
        updateSessionRules
      }
    }

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [32002],
      addRules: [
        expect.objectContaining({
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'referer',
                operation: 'set',
                value: 'https://dictionary.cambridge.org'
              },
              {
                header: 'cookie',
                operation: 'append',
                value: 'cf_clearance=clearance-token'
              }
            ]
          }
        })
      ]
    })
  })

  it('should read partitioned cf_clearance cookie in MV3', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))
    browser.cookies.get.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? {
              value: 'partitioned-clearance-token'
            }
          : null
      )
    )

    const updateSessionRules = jest.fn(() => Promise.resolve())
    ;(self as any).chrome = {
      declarativeNetRequest: {
        updateSessionRules
      }
    }

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    expect(browser.cookies.get.secondCall.args[0]).toEqual({
      url: 'https://dictionary.cambridge.org',
      name: 'cf_clearance',
      partitionKey: {
        topLevelSite: 'https://cambridge.org'
      }
    })
    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [32002],
      addRules: [
        expect.objectContaining({
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'referer',
                operation: 'set',
                value: 'https://dictionary.cambridge.org'
              },
              {
                header: 'cookie',
                operation: 'append',
                value: 'cf_clearance=partitioned-clearance-token'
              }
            ]
          }
        })
      ]
    })
  })
})
