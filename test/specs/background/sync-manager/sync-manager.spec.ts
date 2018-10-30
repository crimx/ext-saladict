import { SyncConfig, Meta } from '@/background/sync-manager/services/webdav'
import * as syncManager from '@/background/sync-manager'

import { Subject } from 'rxjs/Subject'
import { timer } from '@/_helpers/promise-more'

import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'

interface ServiceMock {
  serviceID: string
  upload: jest.Mock<Promise<void>>
  dlChanged: jest.Mock<Promise<void>>
  initServer: jest.Mock<Promise<void>>
}

jest.mock('@/background/sync-manager/helpers')
jest.mock('@/background/sync-manager/services/webdav', (): ServiceMock => ({
  serviceID: 'webdav',
  upload: jest.fn(() => Promise.resolve()),
  dlChanged: jest.fn(() => Promise.resolve()),
  initServer: jest.fn(() => Promise.resolve()),
}))

const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')
const service: ServiceMock = require('@/background/sync-manager/services/webdav')

describe('Sync Manager', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('start interval without config', async () => {
    const config$ = new Subject<SyncConfig>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    syncManager.startSyncServiceInterval()
    config$.next()

    await timer(0)
    expect(service.dlChanged).toHaveBeenCalledTimes(0)
    config$.unsubscribe()
  })

  it('start interval with config', async () => {
    const config$ = new Subject<{ webdav: SyncConfig }>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    syncManager.startSyncServiceInterval()

    const config: SyncConfig = {
      url: 'https://example.com/dav/',
      user: 'user',
      passwd: 'passwd',
      duration: 500,
    }
    config$.next({ webdav: config })

    await timer(0)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)
    expect(service.dlChanged).toBeCalledWith(config, {})

    await timer(100)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)

    const meta: Meta = {
      timestamp: Date.now(),
      etag: 'etag',
    }
    helpers.getMeta.mockImplementationOnce(() => Promise.resolve(meta))
    await timer(500)
    expect(service.dlChanged).toHaveBeenCalledTimes(2)
    expect(service.dlChanged).toBeCalledWith(config, meta)

    const config2: SyncConfig = {
      url: 'https://example2.com/dav/',
      user: 'user2',
      passwd: 'passwd2',
      duration: 100,
    }
    config$.next({ webdav: config2 })

    await timer(0)
    expect(service.dlChanged).toHaveBeenCalledTimes(3)
    expect(service.dlChanged).toBeCalledWith(config, {})

    await timer(50)
    expect(service.dlChanged).toHaveBeenCalledTimes(3)

    await timer(100)
    expect(service.dlChanged).toHaveBeenCalledTimes(4)
    expect(service.dlChanged).toBeCalledWith(config, {})

    config$.unsubscribe()
  })
})
