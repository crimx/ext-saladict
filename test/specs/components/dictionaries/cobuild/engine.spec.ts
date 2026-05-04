import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/cobuild/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/COBUILD/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    return retry(() =>
      search('love', getDefaultConfig(), profile, { isPDF: false }).then(
        searchResult => {
          expect(searchResult.result).toBeTruthy()
        }
      )
    )
  })
})
