import { SyncConfig, Meta } from '@/background/sync-manager/services/webdav'
import { DlResponse } from '@/background/sync-manager/helpers'
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

// absolute time
const atTimeBuilder = (lastTime = 0) => async absTime => {
  await timer(absTime - lastTime)
  lastTime = absTime
}

describe('Sync Manager', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('start interval without config', async () => {
    const config$ = new Subject<SyncConfig>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    const subscription = syncManager.startSyncServiceInterval()
    config$.next()

    await timer(0)
    expect(service.dlChanged).toHaveBeenCalledTimes(0)
    expect(helpers.setMeta).toHaveBeenCalledTimes(0)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(0)

    subscription.unsubscribe()
  })

  it('start interval with config', async () => {
    const config$ = new Subject<{ [index: string]: SyncConfig }>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    const subscription = syncManager.startSyncServiceInterval()

    const config: SyncConfig = {
      url: 'https://example.com/dav/',
      user: 'user',
      passwd: 'passwd',
      duration: 100,
    }
    config$.next({ [service.serviceID]: config })

    let atTime = atTimeBuilder()

    await atTime(0)
    expect(service.dlChanged).toHaveBeenCalledTimes(0)
    expect(helpers.setMeta).toHaveBeenCalledTimes(0)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(0)

    await atTime(50)
    expect(service.dlChanged).toHaveBeenCalledTimes(0)

    await atTime(120)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)
    expect(service.dlChanged).lastCalledWith(config, {}, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(0)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(0)

    await atTime(160)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)

    const meta: Meta = {
      timestamp: Date.now(),
      etag: 'etag',
    }
    helpers.getMeta.mockImplementationOnce(() => Promise.resolve(meta))

    await atTime(220)
    expect(service.dlChanged).toHaveBeenCalledTimes(2)
    expect(service.dlChanged).lastCalledWith(config, meta, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(0)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(0)

    const config2: SyncConfig = {
      url: 'https://example2.com/dav/',
      user: 'user2',
      passwd: 'passwd2',
      duration: 200,
    }
    config$.next({ [service.serviceID]: config2 })

    atTime = atTimeBuilder()

    await atTime(10)
    expect(service.dlChanged).toHaveBeenCalledTimes(2)

    await atTime(220)
    expect(service.dlChanged).toHaveBeenCalledTimes(3)
    expect(service.dlChanged).lastCalledWith(config2, {}, undefined)

    await atTime(270)
    expect(service.dlChanged).toHaveBeenCalledTimes(3)

    await atTime(420)
    expect(service.dlChanged).toHaveBeenCalledTimes(4)
    expect(service.dlChanged).lastCalledWith(config2, {}, undefined)

    subscription.unsubscribe()
  })

  it('start interval with config and receive same file', async () => {
    const config$ = new Subject<{ [index: string]: SyncConfig }>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    const subscription = syncManager.startSyncServiceInterval()

    const meta: Required<Meta> = {
      etag: 'etag',
      timestamp: Date.now(),
    }

    const dlResponse: DlResponse = {
      etag: meta.etag,
      json: {
        timestamp: meta.timestamp,
        words: []
      },
    }
    service.dlChanged.mockImplementationOnce(() => Promise.resolve(dlResponse))

    const config: SyncConfig = {
      url: 'https://example.com/dav/',
      user: 'user',
      passwd: 'passwd',
      duration: 100,
    }
    config$.next({ [service.serviceID]: config })

    let atTime = atTimeBuilder()

    await atTime(120)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)
    expect(service.dlChanged).lastCalledWith(config, {}, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(1)
    expect(helpers.setMeta).lastCalledWith(service.serviceID, meta)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(1)
    expect(helpers.setNotebook).lastCalledWith([])

    helpers.getMeta.mockImplementationOnce(() => Promise.resolve(meta))

    await atTime(220)
    expect(service.dlChanged).toHaveBeenCalledTimes(2)
    expect(service.dlChanged).lastCalledWith(config, meta, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(1)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(1)

    subscription.unsubscribe()
  })

  it('start interval with config and receive different files', async () => {
    const config$ = new Subject<{ [index: string]: SyncConfig }>()
    helpers.createSyncConfigStream.mockImplementationOnce(() => config$)
    const subscription = syncManager.startSyncServiceInterval()

    const meta: Required<Meta> = {
      etag: 'etag',
      timestamp: Date.now(),
    }

    const dlResponse: DlResponse = {
      etag: meta.etag,
      json: {
        timestamp: meta.timestamp,
        words: []
      },
    }

    helpers.getMeta.mockImplementationOnce(() => Promise.resolve())
    service.dlChanged.mockImplementationOnce(() => Promise.resolve(dlResponse))

    const config: SyncConfig = {
      url: 'https://example.com/dav/',
      user: 'user',
      passwd: 'passwd',
      duration: 100,
    }
    config$.next({ [service.serviceID]: config })

    let atTime = atTimeBuilder()

    await atTime(120)
    expect(service.dlChanged).toHaveBeenCalledTimes(1)
    expect(service.dlChanged).lastCalledWith(config, {}, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(1)
    expect(helpers.setMeta).lastCalledWith(service.serviceID, meta)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(1)
    expect(helpers.setNotebook).lastCalledWith(dlResponse.json.words)

    const meta2: Required<Meta> = {
      etag: 'etag2',
      timestamp: Date.now() + 200,
    }

    const dlResponse2: DlResponse = {
      etag: meta2.etag,
      json: {
        timestamp: meta2.timestamp,
        words: [{
          date: Date.now(),
          text: 'text',
          context: 'context',
          title: 'title',
          url: 'url',
          favicon: 'favicon',
          trans: 'trans',
          note: 'note',
        }]
      },
    }
    helpers.getMeta.mockImplementationOnce(() => Promise.resolve(meta2))
    service.dlChanged.mockImplementationOnce(() => Promise.resolve(dlResponse2))

    await atTime(220)
    expect(service.dlChanged).toHaveBeenCalledTimes(2)
    expect(service.dlChanged).lastCalledWith(config, meta2, undefined)
    expect(helpers.setMeta).toHaveBeenCalledTimes(2)
    expect(helpers.setMeta).lastCalledWith(service.serviceID, meta2)
    expect(helpers.setNotebook).toHaveBeenCalledTimes(2)
    expect(helpers.setNotebook).lastCalledWith(dlResponse2.json.words)

    subscription.unsubscribe()
  })
})
