import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
// import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'
// import { NotebookFile } from '@/background/sync-manager/interface'
import {
  Service
  // SyncConfig
} from '@/background/sync-manager/services/ankiconnect'
// import { Word, newWord } from '@/_helpers/record-manager'

jest.mock('@/background/sync-manager/helpers')

// const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

describe('Sync service Anki Connect', () => {
  const axiosMock = new AxiosMockAdapter(axios)

  const mockRequest = (handler: (data: any) => any[]) =>
    axiosMock.onPost().reply(config => {
      try {
        return handler(JSON.parse(config.data))
      } catch (e) {}
      return [404]
    })

  afterAll(() => {
    axiosMock.restore()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    axiosMock.reset()
    axiosMock.onAny().reply(404)
  })

  describe('init', () => {
    it('should warn if Anki Connect is not running.', async () => {
      const config = Service.getDefaultConfig()

      const service = new Service(config)
      service.addWord = jest.fn(async () => null)

      let error: Error | undefined
      try {
        await service.init()
      } catch (e) {
        error = e
      }

      expect(service.addWord).toHaveBeenCalledTimes(0)
      expect(error?.message).toBe('server')
    })

    it('should warn if deck does not exist in Anki.', async () => {
      const config = Service.getDefaultConfig()

      mockRequest(data => {
        switch (data.action) {
          case 'version':
            return [200, { result: 6, error: null }]
          case 'deckNames':
            return [200, { result: [], error: null }]
          default:
            return [404]
        }
      })

      const service = new Service(config)
      service.addWord = jest.fn(async () => null)

      let error: Error | undefined
      try {
        await service.init()
      } catch (e) {
        error = e
      }

      expect(service.addWord).toHaveBeenCalledTimes(0)
      expect(error?.message).toBe('deck')
    })

    it('should warn if note type does not exist in Anki.', async () => {
      const config = Service.getDefaultConfig()

      mockRequest(data => {
        switch (data.action) {
          case 'version':
            return [200, { result: 6, error: null }]
          case 'deckNames':
            return [200, { result: [config.deckName], error: null }]
          case 'modelNames':
            return [200, { result: [], error: null }]
          default:
            return [404]
        }
      })

      const service = new Service(config)
      service.addWord = jest.fn(async () => null)

      let error: Error | undefined
      try {
        await service.init()
      } catch (e) {
        error = e
      }

      expect(service.addWord).toHaveBeenCalledTimes(0)
      expect(error?.message).toBe('notetype')
    })

    it('should init successfully', async () => {
      const config = Service.getDefaultConfig()

      mockRequest(data => {
        switch (data.action) {
          case 'version':
            return [200, { result: 6, error: null }]
          case 'deckNames':
            return [200, { result: [config.deckName], error: null }]
          case 'modelNames':
            return [200, { result: [config.noteType], error: null }]
          default:
            return [404]
        }
      })

      const service = new Service(config)
      service.addWord = jest.fn(async () => null)

      let error: Error | undefined
      try {
        await service.init()
      } catch (e) {
        error = e
      }

      expect(service.addWord).toHaveBeenCalledTimes(0)
      expect(error).toBeUndefined()
    })
  })
})
