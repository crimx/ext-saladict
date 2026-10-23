import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import * as helpersMock from '@/background/sync-manager/__mocks__/helpers'
import { Service } from '@/background/sync-manager/services/maimemo'
import { newWord } from '@/_helpers/record-manager'

jest.mock('@/background/sync-manager/helpers')

const helpers: typeof helpersMock = require('@/background/sync-manager/helpers')

describe('Maimemo sync service', () => {
  const axiosMock = new AxiosMockAdapter(axios)

  beforeEach(() => {
    jest.clearAllMocks()
    axiosMock.reset()
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
    expect(axiosMock.history.post[0].headers!.Authorization).toBe('token')
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

    await service.add({
      words: [newWord({ text: 'apple' }), newWord({ text: 'pear' })]
    })

    expect(axiosMock.history.post).toHaveLength(2)
    expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
      words: [{ id: 'id-apple' }, { id: 'id-pear' }],
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

    await service.add({ force: true })

    expect(axiosMock.history.post).toHaveLength(4)
    expect(JSON.parse(axiosMock.history.post[0].data).spellings).toHaveLength(
      1000
    )
    expect(JSON.parse(axiosMock.history.post[2].data).spellings).toEqual([
      'word-1000'
    ])
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

    await service.add({
      words: [newWord({ text: 'apple' }), newWord({ text: 'missing' })]
    })

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
})
