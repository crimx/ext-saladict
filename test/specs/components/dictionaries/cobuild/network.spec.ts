import { browser } from '../../../../helper'

const getCookieQueryArgs = () =>
  browser.cookies.getAll.getCalls().map(call => call.args[0])

describe('Dict/COBUILD/network', () => {
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

  it('should replace duplicated collins cookie names in MV2', async () => {
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
          : [
              {
                name: 'session',
                value: 'session-token'
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
    } = require('@/components/dictionaries/cobuild/network')

    await ensureNetworkCompatibility()

    expect(getCookieQueryArgs()).toContainEqual({
      url: 'https://www.collinsdictionary.com',
      partitionKey: {
        topLevelSite: 'https://collinsdictionary.com'
      }
    })

    const [
      listener,
      filter
    ] = browser.webRequest.onBeforeSendHeaders.addListener.firstCall.args

    expect(filter).toEqual({ urls: ['https://www.collinsdictionary.com/*'] })
    expect(
      listener({
        tabId: -1,
        requestHeaders: [
          {
            name: 'Cookie',
            value: 'session=session-token; cf_clearance=stale-clearance-token'
          }
        ]
      })
    ).toEqual({
      requestHeaders: [
        {
          name: 'Cookie',
          value:
            'session=session-token; cf_clearance=partitioned-clearance-token; cf_chl_rc_ni=1'
        },
        {
          name: 'Referer',
          value: 'https://www.collinsdictionary.com/dictionary/english/'
        }
      ]
    })
  })

  it('should install collins MV3 header session rule', async () => {
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
              }
            ]
          : [
              {
                name: 'session',
                value: 'session-token'
              },
              {
                name: 'cf_clearance',
                value: 'stale-clearance-token'
              }
            ]
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
    } = require('@/components/dictionaries/cobuild/network')

    await ensureNetworkCompatibility()

    expect(updateSessionRules).toHaveBeenCalledWith({
      removeRuleIds: [32003],
      addRules: [
        {
          id: 32003,
          priority: 1,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'referer',
                operation: 'set',
                value: 'https://www.collinsdictionary.com/dictionary/english/'
              },
              {
                header: 'cookie',
                operation: 'set',
                value:
                  'session=session-token; cf_clearance=partitioned-clearance-token'
              }
            ]
          },
          condition: {
            regexFilter: '^https://www\\.collinsdictionary\\.com/.*',
            resourceTypes: ['xmlhttprequest', 'media'],
            tabIds: [-1],
            excludedInitiatorDomains: ['collinsdictionary.com']
          }
        }
      ]
    })
  })
})
