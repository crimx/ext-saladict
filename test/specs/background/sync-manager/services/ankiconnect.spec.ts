import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'
import { Service } from '@/background/sync-manager/services/ankiconnect'
import { newWord } from '@/_helpers/record-manager'

jest.mock('@/background/sync-manager/helpers')

const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

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
          case 'findModelsByName':
            return [200, { result: [{ type: 1 }], error: null }]
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

  const mockServer = (modelType = 1, inspectionError: string | null = null) => {
    const calls: any[] = []
    mockRequest(data => {
      calls.push(data)
      let result: any = null
      switch (data.action) {
        case 'version':
          result = 6
          break
        case 'deckNames':
          result = ['Saladict']
          break
        case 'modelNames':
          result = ['Saladict Word']
          break
        case 'findModelsByName':
          return [
            200,
            { result: [{ type: modelType }], error: inspectionError }
          ]
        case 'modelFieldNames':
          result = [
            'Date',
            'Text',
            'Translation',
            'Context',
            'ContextCloze',
            'Note',
            'Title',
            'Url',
            'Favicon',
            'Audio'
          ]
          break
        case 'findNotes':
          result = []
          break
        case 'addNote':
          result = 123
          break
      }
      return [200, { result, error: null }]
    })
    return calls
  }

  describe('note type validation', () => {
    it('rejects an existing standard type during setup and background uploads', async () => {
      const calls = mockServer(0)
      const service = new Service(Service.getDefaultConfig())

      await expect(service.init()).rejects.toThrow('notetype_cloze')
      await expect(
        service.add({ words: [newWord({ text: 'word' })] })
      ).rejects.toThrow('notetype_cloze')

      expect(calls.some(call => call.action === 'addNote')).toBe(false)
      expect(calls.some(call => call.action === 'createModel')).toBe(false)
    })

    it('supports servers without model inspection for setup and uploads', async () => {
      const calls = mockServer(1, 'unsupported action')
      const service = new Service(Service.getDefaultConfig())

      await expect(service.init()).resolves.toBeUndefined()
      await service.add({ words: [newWord({ text: 'word' })] })

      expect(calls.filter(call => call.action === 'addNote')).toHaveLength(1)
    })

    it('preserves API errors instead of treating them as unsupported inspection', async () => {
      const calls = mockServer(1, 'valid api key must be provided')
      const service = new Service(Service.getDefaultConfig())

      await expect(service.init()).rejects.toThrow(
        'valid api key must be provided'
      )
      await expect(
        service.add({ words: [newWord({ text: 'word' })] })
      ).rejects.toThrow('valid api key must be provided')

      expect(calls.some(call => call.action === 'addNote')).toBe(false)
    })

    it('preserves network errors during model inspection', async () => {
      mockRequest(data =>
        data.action === 'version' ? [200, { result: 6, error: null }] : [503]
      )
      const service = new Service(Service.getDefaultConfig())

      await expect(
        service.add({ words: [newWord({ text: 'word' })] })
      ).rejects.toThrow('503')
    })
  })

  describe('note type creation', () => {
    it('creates a Cloze type and updates templates using its fields', async () => {
      const calls = mockServer()
      const service = new Service(Service.getDefaultConfig())

      await service.addNoteType()

      expect(calls.map(call => call.action)).toEqual([
        'createModel',
        'modelFieldNames',
        'updateModelTemplates'
      ])
      expect(calls[0].params).toMatchObject({
        modelName: 'Saladict Word',
        isCloze: true,
        inOrderFields: expect.arrayContaining(['Date', 'ContextCloze']),
        cardTemplates: [
          expect.objectContaining({
            Front: expect.stringContaining('{{cloze:ContextCloze}}')
          })
        ]
      })
      expect(calls[2].params.model.templates['Saladict Cloze'].Front).toContain(
        '{{cloze:ContextCloze}}'
      )
    })

    it.each([
      'Model name already exists',
      "createModel() got an unexpected keyword argument 'isCloze'"
    ])('does not retry creation as a standard type after %s', async error => {
      mockRequest(() => [200, { result: null, error }])
      const service = new Service(Service.getDefaultConfig())

      await expect(service.addNoteType()).rejects.toThrow(error)

      expect(axiosMock.history.post).toHaveLength(1)
      expect(JSON.parse(axiosMock.history.post[0].data).params.isCloze).toBe(
        true
      )
    })

    it('does not retry a failed network request', async () => {
      axiosMock.onPost().networkError()
      const service = new Service(Service.getDefaultConfig())

      await expect(service.addNoteType()).rejects.toThrow('Network Error')
      expect(axiosMock.history.post).toHaveLength(1)
    })
  })

  describe('uploads', () => {
    it('uploads the notebook sequentially, skips existing notes and syncs last', async () => {
      const config = { ...Service.getDefaultConfig(), syncServer: true }
      const words = [1, 2, 3].map(date =>
        newWord({ date, text: `word${date}` })
      )
      helpers.getNotebook.mockResolvedValueOnce(words)
      const service = new Service(config)
      const calls: any[] = []
      let active = 0
      let maxActive = 0
      axiosMock.onPost().reply(async config => {
        active++
        maxActive = Math.max(maxActive, active)
        const data = JSON.parse(config.data)
        calls.push(data)
        await Promise.resolve()
        active--
        const result =
          data.action === 'version'
            ? 6
            : data.action === 'findModelsByName'
            ? [{ type: 1 }]
            : data.action === 'modelFieldNames'
            ? ['Date']
            : data.action === 'findNotes'
            ? data.params.query.endsWith(':2')
              ? [456]
              : []
            : data.action === 'addNote'
            ? 123
            : null
        return [200, { result, error: null }]
      })

      await service.add({ force: true })

      expect(maxActive).toBe(1)
      expect(calls.map(call => call.action)).toEqual([
        'version',
        'findModelsByName',
        'modelFieldNames',
        'findNotes',
        'addNote',
        'findNotes',
        'findNotes',
        'addNote',
        'sync'
      ])
      expect(
        calls
          .filter(call => call.action === 'addNote')
          .map(call => call.params.note.fields)
      ).toEqual(
        words
          .filter(word => word.date !== 2)
          .map(word =>
            expect.objectContaining({
              Date: `${word.date}`,
              ContextCloze: `{{c1::${word.text}}}`
            })
          )
      )
    })

    it('stops after a failed write without syncing or sending later notes', async () => {
      const calls = mockServer()
      const service = new Service({
        ...Service.getDefaultConfig(),
        syncServer: true
      })
      axiosMock.onPost().reply(config => {
        const data = JSON.parse(config.data)
        calls.push(data)
        if (data.action === 'version') return [200, { result: 6, error: null }]
        if (data.action === 'findModelsByName')
          return [200, { result: [{ type: 1 }], error: null }]
        if (data.action === 'modelFieldNames')
          return [200, { result: ['Date'], error: null }]
        if (data.action === 'findNotes')
          return [200, { result: [], error: null }]
        return [
          200,
          { result: null, error: 'cannot create note for unknown reason' }
        ]
      })

      await expect(
        service.add({
          words: [1, 2].map(date => newWord({ date, text: 'word' }))
        })
      ).rejects.toThrow('add')

      expect(calls.filter(call => call.action === 'findNotes')).toHaveLength(1)
      expect(calls.filter(call => call.action === 'addNote')).toHaveLength(1)
      expect(calls.some(call => call.action === 'sync')).toBe(false)
    })
  })

  it('should escape note content without DOM helpers', () => {
    const service = new Service(Service.getDefaultConfig())

    expect(service.multiline('<tag>\n"&"', true)).toBe(
      '&lt;tag&gt;<br/>&quot;&amp;&quot;'
    )
  })
})
