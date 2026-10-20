import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import {
  Service,
  cardText
} from '@/background/sync-manager/services/ankiconnect'

jest.mock('@/background/sync-manager/helpers')

const fields = [
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

function fixture() {
  const source = {
    id: '10',
    name: 'Saladict Word',
    kind: 'normal',
    fields: fields.map(name => ({ name, fontFamily: 'Arial', fontSize: 20 })),
    templates: [
      {
        name: 'Saladict Cloze',
        questionHtml: cardText(true, fields),
        answerHtml: cardText(false, fields),
        deck: null
      }
    ],
    css: '.card { color: blue; }',
    sortField: 'Date',
    latexHeader: 'header',
    latexFooter: 'footer',
    latexSvg: false
  }
  const note = {
    id: '100',
    noteType: { id: '10', name: source.name },
    fields: Object.fromEntries(
      fields.map(name => [
        name,
        name === 'ContextCloze'
          ? 'A {{c1::word}}.'
          : name === 'Date'
          ? '123'
          : name
      ])
    ),
    tags: ['kept'],
    cardIds: ['200']
  }
  const card = {
    id: '200',
    noteId: '100',
    deck: { id: '1', name: 'Saladict' },
    homeDeck: null,
    templateIndex: 0,
    flags: 3,
    scheduling: {
      type: 'review',
      queue: 'review',
      due: { kind: 'day', day: 7 },
      intervalDays: 9,
      repetitions: 7,
      lapses: 1,
      sm2EasePermille: 2300,
      fsrsMemory: { difficulty: 4.5, stabilityDays: 5.2 }
    }
  }
  return { source, note, card }
}

describe('Anki Cloze migration', () => {
  const mock = new AxiosMockAdapter(axios)
  let data: ReturnType<typeof fixture>
  let converted: boolean
  let calls: any[]
  let backups: string[]
  let session: string
  let failure: string
  let targetExists: boolean
  let mediaDirectory: string
  let lostScheduling: boolean
  let lostReview: boolean
  let notebookChanged: boolean
  let noteCount: number
  let editDuringBackup: boolean
  let operationState: string
  let rejectValidation: boolean
  let missingCapability: string

  beforeEach(() => {
    mock.reset()
    data = fixture()
    converted = false
    calls = []
    backups = []
    session = 'session1'
    failure = ''
    targetExists = false
    mediaDirectory = '/Anki/User/collection.media'
    lostScheduling = false
    lostReview = false
    notebookChanged = false
    noteCount = 1
    editDuringBackup = false
    operationState = 'succeeded'
    rejectValidation = false
    missingCapability = ''
    mock.onPost().reply(config => {
      const body = JSON.parse(config.data)
      calls.push({ ...body, url: config.url, headers: config.headers })
      if (body.action === 'modelFieldNames')
        return [200, { result: fields, error: null }]
      const { method, params } = body
      if (method === failure)
        return [
          200,
          {
            jsonrpc: '2.0',
            id: 1,
            error: { message: 'injected failure', data: { type: 'ioError' } }
          }
        ]
      let result: any
      switch (method) {
        case 'api.describe':
          result = {
            methods: [
              'collection.get',
              'noteTypes.get',
              'noteTypes.list',
              'noteTypes.create',
              'notes.search',
              'notes.getMany',
              'cards.getMany',
              'reviews.list',
              'notes.validateMany',
              'notes.planConversion',
              'notes.convert',
              'media.getDirectory',
              'packages.export',
              'operations.get'
            ].map(name => ({ name, available: name !== missingCapability }))
          }
          break
        case 'collection.get':
          result = { session }
          break
        case 'noteTypes.get':
          result =
            params.noteType.id === '20'
              ? {
                  ...data.source,
                  id: '20',
                  name: 'Saladict Word (Cloze)',
                  kind: 'cloze'
                }
              : data.source
          break
        case 'noteTypes.list':
          result = targetExists ? [{ name: 'Saladict Word (Cloze)' }] : []
          break
        case 'notes.search':
          result = {
            ids: Array.from({ length: converted ? 0 : noteCount }, (_, i) =>
              String(100 + i)
            ),
            nextCursor: null
          }
          break
        case 'notes.getMany':
          result = {
            items: params.ids.map(id => ({
              result: {
                ...data.note,
                id,
                cardIds:
                  data.note.cardIds.length > 1
                    ? data.note.cardIds
                    : [String(Number(id) + 100)],
                fields: notebookChanged
                  ? { ...data.note.fields, Note: 'edited' }
                  : data.note.fields,
                noteType: { id: converted ? '20' : '10' }
              }
            }))
          }
          break
        case 'cards.getMany':
          result = {
            items: params.ids.map(id => ({
              result: {
                ...data.card,
                id,
                noteId: String(Number(id) - 100),
                scheduling:
                  converted && lostScheduling
                    ? { ...data.card.scheduling, repetitions: 0 }
                    : data.card.scheduling
              }
            }))
          }
          break
        case 'reviews.list':
          result = {
            items:
              converted && lostReview
                ? []
                : params.cardIds.map(id => ({
                    id: 'review' + id,
                    cardId: id,
                    rating: 'good'
                  })),
            nextCursor: null
          }
          break
        case 'media.getDirectory':
          result = { path: mediaDirectory }
          break
        case 'packages.export':
          backups.push(params.path)
          result = { operationId: 'backup', session }
          break
        case 'operations.get':
          if (editDuringBackup) data.note.fields.Note = 'Edited during export'
          result = {
            state: operationState,
            result: { path: backups[backups.length - 1].replace(/\\/g, '/') }
          }
          break
        case 'noteTypes.create':
          result = {
            ...data.source,
            id: '20',
            name: params.name,
            kind: 'cloze'
          }
          break
        case 'notes.validateMany':
          result = {
            items: params.notes.map(() => ({
              result: { valid: !rejectValidation }
            }))
          }
          break
        case 'notes.planConversion':
          result = { token: 'native-plan' }
          break
        case 'notes.convert':
          converted = true
          result = { changedCount: params.ids.length }
          break
        default:
          throw new Error('Unexpected request: ' + method)
      }
      return [200, { jsonrpc: '2.0', id: 1, result }]
    })
  })
  afterAll(() => mock.restore())

  it('backs up before converting and verifies content, card IDs, scheduling and history', async () => {
    const service = new Service({
      ...Service.getDefaultConfig(),
      key: 'test-key'
    })
    const plan = await service.prepareClozeMigration()
    expect(
      calls.every(
        call =>
          !['noteTypes.create', 'notes.convert', 'packages.export'].includes(
            call.method
          )
      )
    ).toBe(true)
    const progress = jest.fn()
    const result = await service.migrateCloze(plan, progress)

    expect(result.noteType).toBe('Saladict Word (Cloze)')
    expect(result.backupPaths).toEqual(backups)
    expect(progress).toHaveBeenCalledWith(backups)
    expect(service.config.noteType).toBe('Saladict Word')
    const methods = calls.map(call => call.method)
    expect(methods.indexOf('operations.get')).toBeLessThan(
      methods.indexOf('noteTypes.create')
    )
    expect(methods.indexOf('notes.validateMany')).toBeLessThan(
      methods.indexOf('notes.convert')
    )
    expect(
      calls.find(call => call.method === 'packages.export').params
    ).toMatchObject({
      deck: { id: '1' },
      includeScheduling: true,
      session: 'session1'
    })
    expect(
      calls.find(call => call.method === 'noteTypes.create').params
    ).toMatchObject({
      fields: data.source.fields,
      templates: data.source.templates,
      css: data.source.css,
      sortField: 'Date',
      latexHeader: 'header',
      kind: 'cloze'
    })
    expect(calls.find(call => call.method === 'notes.convert').params).toEqual({
      ids: ['100'],
      target: { id: '20' },
      fields: fields.map(name => ({ target: name, source: name })),
      templates: [],
      planToken: 'native-plan',
      session: 'session1'
    })
    expect(
      calls
        .filter(call => call.method)
        .every(call => call.headers.Authorization === 'Bearer test-key')
    ).toBe(true)
    expect(
      calls
        .filter(
          call =>
            call.method &&
            !['api.describe', 'collection.get', 'operations.get'].includes(
              call.method
            )
        )
        .every(call => call.params.session === 'session1')
    ).toBe(true)
  })

  it('handles Windows backup paths', async () => {
    mediaDirectory = 'C:\\Anki\\User\\collection.media'
    const service = new Service(Service.getDefaultConfig())
    const result = await service.migrateCloze(
      await service.prepareClozeMigration()
    )
    expect(result.backupPaths[0]).toMatch(/^C:\/Anki\/User\/saladict-backup-/)
  })

  it.each(['packages.export', 'operations.get'])(
    'never creates a type or converts notes if %s fails',
    async method => {
      const service = new Service(Service.getDefaultConfig())
      const plan = await service.prepareClozeMigration()
      failure = method
      await expect(service.migrateCloze(plan)).rejects.toThrow()
      expect(converted).toBe(false)
      expect(calls.some(call => call.method === 'noteTypes.create')).toBe(false)
    }
  )

  it.each(['template', 'fields', 'multipleCards', 'clozeNumber', 'filtered'])(
    'rejects unsupported %s before any backup or mutation',
    async kind => {
      if (kind === 'template') data.source.templates[0].questionHtml += 'custom'
      if (kind === 'fields')
        data.source.fields.push({
          name: 'Extra',
          fontFamily: 'Arial',
          fontSize: 20
        })
      if (kind === 'multipleCards') data.note.cardIds = ['200', '201']
      if (kind === 'clozeNumber') data.note.fields.ContextCloze = '{{c2::word}}'
      if (kind === 'filtered') data.card.homeDeck = { id: '9' } as any
      const service = new Service(Service.getDefaultConfig())
      await expect(service.prepareClozeMigration()).rejects.toThrow(
        'migration_manual'
      )
      expect(backups).toHaveLength(0)
      expect(converted).toBe(false)
    }
  )

  it('does not overwrite an existing migration target', async () => {
    targetExists = true
    const service = new Service(Service.getDefaultConfig())
    await expect(service.prepareClozeMigration()).rejects.toThrow(
      'migration_target_exists'
    )
    expect(backups).toHaveLength(0)
  })

  it.each(['session', 'content'])(
    'rejects a changed %s after confirmation',
    async kind => {
      const service = new Service(Service.getDefaultConfig())
      const plan = await service.prepareClozeMigration()
      if (kind === 'session') session = 'session2'
      else notebookChanged = true
      await expect(service.migrateCloze(plan)).rejects.toThrow(
        'migration_changed'
      )
      expect(backups).toHaveLength(0)
      expect(converted).toBe(false)
    }
  )

  it.each(['scheduling', 'history'])(
    'reports lost %s and keeps backup paths without changing configuration',
    async kind => {
      const service = new Service(Service.getDefaultConfig())
      const plan = await service.prepareClozeMigration()
      lostScheduling = kind === 'scheduling'
      lostReview = kind === 'history'
      try {
        await service.migrateCloze(plan)
        throw new Error('Expected verification failure')
      } catch (error) {
        expect(error.message).toBe('migration_verify')
        expect(error.backupPaths).toEqual(backups)
      }
      expect(service.config.noteType).toBe('Saladict Word')
    }
  )

  it('reads notes and cards in bounded batches', async () => {
    noteCount = 105
    const service = new Service(Service.getDefaultConfig())
    const plan = await service.prepareClozeMigration()
    expect(plan.notes).toHaveLength(105)
    expect(
      calls
        .filter(call =>
          ['notes.getMany', 'cards.getMany'].includes(call.method)
        )
        .map(call => call.params.ids.length)
    ).toEqual([100, 5, 100, 5])
  })

  it('stops if the export operation fails before conversion', async () => {
    const service = new Service(Service.getDefaultConfig())
    const plan = await service.prepareClozeMigration()
    operationState = 'failed'
    await expect(service.migrateCloze(plan)).rejects.toThrow('migration_backup')
    expect(converted).toBe(false)
    expect(calls.some(call => call.method === 'noteTypes.create')).toBe(false)
  })

  it('detects edits made while the backup is running and retains its completed path', async () => {
    const service = new Service(Service.getDefaultConfig())
    const plan = await service.prepareClozeMigration()
    editDuringBackup = true
    try {
      await service.migrateCloze(plan)
      throw new Error('Expected changed data')
    } catch (error) {
      expect(error.message).toBe('migration_changed')
      expect(error.backupPaths).toEqual(backups)
    }
    expect(converted).toBe(false)
  })

  it('uses native content validation before converting any note', async () => {
    const service = new Service(Service.getDefaultConfig())
    const plan = await service.prepareClozeMigration()
    rejectValidation = true
    await expect(service.migrateCloze(plan)).rejects.toThrow('migration_manual')
    expect(backups).toHaveLength(1)
    expect(converted).toBe(false)
  })

  it('does not offer migration when native conversion is unavailable', async () => {
    missingCapability = 'notes.convert'
    const service = new Service(Service.getDefaultConfig())
    await expect(service.prepareClozeMigration()).rejects.toThrow(
      'migration_unsupported'
    )
    expect(backups).toHaveLength(0)
  })

  it('creates an empty Cloze type without exporting unrelated decks', async () => {
    noteCount = 0
    const service = new Service(Service.getDefaultConfig())
    const result = await service.migrateCloze(
      await service.prepareClozeMigration()
    )
    expect(result.backupPaths).toEqual([])
    expect(converted).toBe(false)
  })

  it('requires migration capabilities without swallowing authentication errors', async () => {
    mock.onPost().reply(config => {
      return [
        200,
        {
          error: {
            message: 'Unauthorized',
            data: { type: 'authenticationRequired' }
          }
        }
      ]
    })
    const service = new Service(Service.getDefaultConfig())
    await expect(service.prepareClozeMigration()).rejects.toThrow(
      'Unauthorized'
    )
    mock.onPost().reply(404)
    await expect(service.prepareClozeMigration()).rejects.toThrow(
      'migration_unsupported'
    )
  })
})
