import { browser } from '../../../../helper'

const getCookieQueryArgs = () =>
  browser.cookies.getAll.getCalls().map(call => call.args[0])

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
        initiator: 'chrome-extension://test-extension',
        tabId: -1,
        requestHeaders: [{ name: 'Accept', value: 'text/html' }]
      })
    ).toEqual({
      requestHeaders: [
        { name: 'Accept', value: 'text/html' },
        { name: 'Referer', value: 'https://dictionary.cambridge.org' }
      ]
    })
  })

  it('should ignore requests initiated by the dictionary website in MV2', async () => {
    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    const [
      listener
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args
    const chromeHeaders = [{ name: 'Accept', value: 'text/html' }]
    const firefoxHeaders = [{ name: 'Cookie', value: 'cf_clearance=website' }]

    expect(
      listener({
        initiator: 'https://dictionary.cambridge.org',
        tabId: 1,
        requestHeaders: chromeHeaders
      })
    ).toEqual({ requestHeaders: chromeHeaders })
    expect(
      listener({
        originUrl: 'https://dictionary.cambridge.org/verify',
        tabId: -1,
        requestHeaders: firefoxHeaders
      })
    ).toEqual({ requestHeaders: firefoxHeaders })
    expect(chromeHeaders).toEqual([{ name: 'Accept', value: 'text/html' }])
    expect(firefoxHeaders).toEqual([
      { name: 'Cookie', value: 'cf_clearance=website' }
    ])
  })

  it('should append cf_clearance cookie when available in MV2', async () => {
    browser.cookies.getAll.callsFake(() => Promise.resolve([]))
    browser.cookies.get.callsFake(() =>
      Promise.resolve({
        name: 'cf_clearance',
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
        tabId: -1,
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

  it('should read partitioned cookies in MV2', async () => {
    browser.cookies.getAll.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? [
              {
                name: 'cf_clearance',
                value: 'partitioned-clearance-token'
              },
              {
                name: 'cf_chl_rc_ni',
                value: '1'
              }
            ]
          : []
      )
    )

    const {
      ensureNetworkCompatibility
    } = require('@/components/dictionaries/cambridge/network')

    await ensureNetworkCompatibility()

    expect(getCookieQueryArgs()).toContainEqual({
      url: 'https://dictionary.cambridge.org',
      partitionKey: {
        topLevelSite: 'https://cambridge.org'
      }
    })

    const [
      listener
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(
      listener({
        tabId: -1,
        requestHeaders: []
      })
    ).toEqual({
      requestHeaders: [
        { name: 'Referer', value: 'https://dictionary.cambridge.org' },
        {
          name: 'Cookie',
          value: 'cf_clearance=partitioned-clearance-token; cf_chl_rc_ni=1'
        }
      ]
    })
  })

  it('should append partitioned cookies in MV2', async () => {
    browser.cookies.getAll.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? [
              {
                name: 'cf_clearance',
                value: 'fresh-clearance-token'
              },
              {
                name: 'cf_chl_rc_ni',
                value: '1'
              }
            ]
          : [
              {
                name: 'XSRF-TOKEN',
                value: 'xsrf-token'
              },
              {
                name: 'cf_clearance',
                value: 'stale-clearance-token'
              }
            ]
      )
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
        tabId: -1,
        requestHeaders: [
          {
            name: 'Cookie',
            value: 'XSRF-TOKEN=xsrf-token; cf_clearance=stale-clearance-token'
          }
        ]
      })
    ).toEqual({
      requestHeaders: [
        {
          name: 'Cookie',
          value:
            'XSRF-TOKEN=xsrf-token; cf_clearance=stale-clearance-token; cf_clearance=fresh-clearance-token; cf_chl_rc_ni=1'
        },
        { name: 'Referer', value: 'https://dictionary.cambridge.org' }
      ]
    })
  })

  it('should install MV3 header session rule once for unchanged cookies', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))
    browser.cookies.getAll.callsFake(() => Promise.resolve([]))

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
            resourceTypes: ['xmlhttprequest', 'media'],
            tabIds: [-1],
            excludedInitiatorDomains: ['cambridge.org']
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

  it('should refresh MV3 header session rule when partitioned cookies change', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))
    let token = 'clearance-token'
    browser.cookies.getAll.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? [
              {
                name: 'cf_clearance',
                value: token
              }
            ]
          : []
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
    token = 'next-clearance-token'
    await ensureNetworkCompatibility()

    expect(updateSessionRules).toHaveBeenCalledTimes(2)
    expect(updateSessionRules).toHaveBeenLastCalledWith({
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
                value: 'cf_clearance=next-clearance-token'
              }
            ]
          }
        })
      ]
    })
  })

  it('should read partitioned cookies in MV3', async () => {
    browser.runtime.getManifest.callsFake(() => ({
      manifest_version: 3
    }))
    browser.cookies.getAll.callsFake(options =>
      Promise.resolve(
        options.partitionKey
          ? [
              {
                name: 'cf_clearance',
                value: 'partitioned-clearance-token'
              },
              {
                name: 'cf_chl_rc_ni',
                value: '1'
              }
            ]
          : []
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

    expect(getCookieQueryArgs()).toContainEqual({
      url: 'https://dictionary.cambridge.org',
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
                value:
                  'cf_clearance=partitioned-clearance-token; cf_chl_rc_ni=1'
              }
            ]
          }
        })
      ]
    })
  })
})
