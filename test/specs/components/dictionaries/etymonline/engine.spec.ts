import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/etymonline/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Etymonline/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
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
})
