import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { getSrcPage, search } from '@/components/dictionaries/etymonline/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Etymonline/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
  })

  beforeEach(() => {
    mock.reset()
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  function getProfile() {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.etymonline.options = {
      chart: true,
      resultnum: 4
    }
    return profile
  }

  async function expectSearchResult(word: string) {
    const searchResult = await search(word, getDefaultConfig(), getProfile(), {
      isPDF: false
    })

    expect(searchResult.audio).toBeUndefined()

    const result = searchResult.result
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(typeof result[0].title).toBe('string')
    expect(result[0].title).toContain('love')
    expect(typeof result[0].href).toBe('string')
    expect(result[0].href).toMatch(/^https:\/\/www\.etymonline\.com\/word\//)
    expect(typeof result[0].def).toBe('string')
    expect(result[0].def).toContain('Middle English')
  }

  it('should parse search result pages correctly', () => {
    return retry(() => expectSearchResult('love'))
  })

  it('should parse entry pages correctly', () => {
    return retry(() => expectSearchResult('love-word'))
  })

  it('should encode source page queries and use HTTPS', async () => {
    expect(
      await getSrcPage('a  word&more', getDefaultConfig(), getProfile())
    ).toBe('https://www.etymonline.com/search?q=a%20word%26more')
  })

  it('should send credentials for entry and fallback requests', async () => {
    await expectSearchResult('love')

    expect(mock.history.get.map(({ url }) => url)).toEqual([
      'https://www.etymonline.com/word/love',
      'https://www.etymonline.com/search?q=love'
    ])
    expect(
      mock.history.get.every(({ withCredentials }) => withCredentials)
    ).toBe(true)
  })

  it('should still return search results when only the entry page is forbidden', async () => {
    mock.resetHandlers()
    mock.onGet('https://www.etymonline.com/word/love').reply(403)
    mock
      .onGet('https://www.etymonline.com/search?q=love')
      .reply(200, require('!raw-loader!./response/love.html').default)

    await expectSearchResult('love')
  })

  it.each([
    [403, 403, 'word/verify%20me%26'],
    [404, 403, 'search?q=verify%20me%26'],
    [403, 500, 'word/verify%20me%26']
  ])(
    'should request verification after entry status %s and search status %s',
    async (entryStatus, searchStatus, path) => {
      mock.resetHandlers()
      mock.onGet(/\/word\//).reply(entryStatus)
      mock.onGet(/\/search\?/).reply(searchStatus)

      await expect(
        search('verify  me&', getDefaultConfig(), getProfile(), {
          isPDF: false
        })
      ).rejects.toMatchObject({
        message: 'MANUAL_VERIFICATION',
        manualVerification: {
          text: 'verify  me&',
          url: `https://www.etymonline.com/${path}`
        }
      })
    }
  )

  it('should preserve network errors when neither request is forbidden', async () => {
    mock.resetHandlers()
    mock.onGet().networkError()

    await expect(
      search('love', getDefaultConfig(), getProfile(), { isPDF: false })
    ).rejects.toThrow('NETWORK_ERROR')
  })

  it('should preserve no-result errors for empty pages', async () => {
    mock.resetHandlers()
    mock.onGet().reply(200, '<html><body>No results</body></html>')

    await expect(
      search('unknown', getDefaultConfig(), getProfile(), { isPDF: false })
    ).rejects.toThrow('NO_RESULT')
  })
})
