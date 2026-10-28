import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'
import { Service } from '@/background/sync-manager/services/maimemo'
import { configureRateLimiters } from '@/background/sync-manager/services/maimemo/rate-limiter'
import { newWord } from '@/_helpers/record-manager'

jest.mock('@/background/sync-manager/helpers')

const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

describe('Maimemo sync service', () => {
  const axiosMock = new AxiosMockAdapter(axios)

  beforeEach(() => {
    jest.clearAllMocks()
    axiosMock.reset()
    // Do not slow the suite down with real throttling.
    configureRateLimiters({ minInterval: 0, retryBaseDelay: 0 })
  })

  afterAll(() => {
    axiosMock.restore()
  })

  function mockApi() {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(config => {
      const { spellings } = JSON.parse(config.data)
      return [
        200,
        {
          success: true,
          errors: [],
          data: {
            voc: spellings.map((spelling: string) => ({
              id: `id-${spelling}`,
              spelling
            }))
          }
        }
      ]
    })
    axiosMock
      .onPost(/\/study\/add_words$/)
      .reply(200, { success: true, errors: [], data: { added_count: 1 } })
  }

  it('validates the authorization token', async () => {
    mockApi()
    const service = new Service({
      ...Service.getDefaultConfig(),
      token: 'token'
    })

    await expect(service.init()).resolves.toBeUndefined()
    expect(axiosMock.history.post).toHaveLength(1)
    expect(axiosMock.history.post[0].headers!.Authorization).toBe(
      'Bearer token'
    )
    expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
      spellings: ['apple']
    })
  })

  it('uploads new words without advancing review', async () => {
    mockApi()
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({
      words: [newWord({ text: 'apple' }), newWord({ text: 'pear' })]
    })

    expect(result).toEqual({ matched: 2, added: 1 })
    expect(axiosMock.history.post).toHaveLength(2)
    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }, { id: 'id-pear' }],
      advance: false
    })
  })

  it('reports zero added words when the service adds none', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(200, {
      success: true,
      errors: [],
      data: {
        voc: [
          { id: 'id-apple', spelling: 'apple' },
          { id: 'id-pear', spelling: 'pear' }
        ]
      }
    })
    axiosMock
      .onPost(/\/study\/add_words$/)
      .reply(200, { success: true, errors: [], data: { added_count: 0 } })
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    await expect(
      service.add({
        words: [newWord({ text: 'apple' }), newWord({ text: 'pear' })]
      })
    ).resolves.toEqual({ matched: 2, added: 0 })
  })

  it('advances review when the option is enabled', async () => {
    mockApi()
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token',
      advance: true
    })

    await service.add({ words: [newWord({ text: 'apple' })] })

    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }],
      advance: true
    })
  })

  it('treats a missing advance option as disabled', async () => {
    mockApi()
    const config = Service.getDefaultConfig()
    config.enable = true
    config.token = 'token'
    delete (config as Partial<typeof config>).advance
    const service = new Service(config)

    await service.add({ words: [newWord({ text: 'apple' })] })

    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }],
      advance: false
    })
  })

  it('uploads the full notebook in batches of 1,000 words', async () => {
    mockApi()
    helpers.getNotebook.mockResolvedValueOnce(
      Array.from({ length: 1001 }, (_, index) =>
        newWord({ text: `word-${index}` })
      )
    )
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({ force: true })

    expect(result).toEqual({ matched: 1001, added: 2 })
    expect(axiosMock.history.post).toHaveLength(4)
    expect(JSON.parse(axiosMock.history.post[0].data).spellings).toHaveLength(
      1000
    )
    expect(JSON.parse(axiosMock.history.post[2].data).spellings).toEqual([
      'word-1000'
    ])
  })

  it('respects the advance option when syncing the full notebook', async () => {
    mockApi()
    helpers.getNotebook.mockResolvedValueOnce([
      newWord({ text: 'apple' }),
      newWord({ text: 'pear' })
    ])
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token',
      advance: true
    })

    await service.add({ force: true })

    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }, { id: 'id-pear' }],
      advance: true
    })
  })

  it('skips words unavailable in Maimemo and uploads resolved words', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(200, {
      success: true,
      errors: [],
      data: { voc: [{ id: 'id-apple', spelling: 'apple' }] }
    })
    axiosMock
      .onPost(/\/study\/add_words$/)
      .reply(200, { success: true, errors: [], data: { added_count: 1 } })
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({
      words: [newWord({ text: 'apple' }), newWord({ text: 'missing' })]
    })
    expect(result).toEqual({ matched: 1, added: 1 })
    expect(helpers.notifyError).toHaveBeenCalledWith(
      Service.id,
      'word',
      '「missing」'
    )
    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }],
      advance: false
    })
  })

  it('reports invalid tokens', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(401)
    const service = new Service({
      ...Service.getDefaultConfig(),
      token: 'invalid'
    })

    await expect(service.init()).rejects.toThrow('illegal_token')
  })

  it('rejects unsuccessful API responses', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(200, {
      success: false,
      errors: [{ message: 'request failed' }],
      data: null
    })
    const service = new Service({
      ...Service.getDefaultConfig(),
      token: 'token'
    })

    await expect(service.init()).rejects.toThrow('response')
  })

  it('retries a rate limited query', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).replyOnce(429)
    mockApi()
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({ words: [newWord({ text: 'apple' })] })

    expect(result).toEqual({ matched: 1, added: 1 })
    expect(axiosMock.history.post).toHaveLength(3)
  })

  it('retries a rate limited upload', async () => {
    axiosMock
      .onPost(/\/study\/add_words$/)
      .replyOnce(429, { 'retry-after': '0' })
    mockApi()
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({ words: [newWord({ text: 'apple' })] })

    expect(result).toEqual({ matched: 1, added: 1 })
    expect(axiosMock.history.post).toHaveLength(3)
  })

  it('gives up after the retry budget and reports the remaining words', async () => {
    axiosMock.onPost(/\/vocabulary\/query$/).reply(429)
    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({
      words: [newWord({ text: 'apple' }), newWord({ text: 'pear' })]
    })

    expect(result).toEqual({
      matched: 0,
      added: 0,
      rateLimited: true,
      remaining: 2
    })
    // 1 initial attempt + 3 retries
    expect(axiosMock.history.post).toHaveLength(4)
  })

  it('keeps finished batches when a later batch is rate limited', async () => {
    helpers.getNotebook.mockResolvedValueOnce(
      Array.from({ length: 1001 }, (_, index) =>
        newWord({ text: `word-${index}` })
      )
    )
    axiosMock.onPost(/\/vocabulary\/query$/).replyOnce(config => {
      const { spellings } = JSON.parse(config.data)
      return [
        200,
        {
          success: true,
          errors: [],
          data: {
            voc: spellings.map((spelling: string) => ({
              id: `id-${spelling}`,
              spelling
            }))
          }
        }
      ]
    })
    axiosMock.onPost(/\/vocabulary\/query$/).reply(429)
    axiosMock
      .onPost(/\/study\/add_words$/)
      .reply(200, { success: true, errors: [], data: { added_count: 1000 } })

    const service = new Service({
      ...Service.getDefaultConfig(),
      enable: true,
      token: 'token'
    })

    const result = await service.add({ force: true })

    expect(result).toEqual({
      matched: 1000,
      added: 1000,
      rateLimited: true,
      remaining: 1
    })
  })
})
