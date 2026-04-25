import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import { search } from '@/components/dictionaries/wikipedia/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Wikipedia/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse result correctly', () => {
    return retry(() =>
      search('数字', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(({ result }) => {
        expect(result.title).toBe('數字')
        expect(result.content).toContain('mw-parser-output')
        expect(result.content).toContain('數字')
        expect(result.content).not.toContain('<style')
        expect(result.content).not.toContain(' style=')
        expect(result.langList).toEqual([
          {
            title: '英语 - Numerical digit',
            url: 'https://en.wikipedia.org/wiki/Numerical_digit'
          }
        ])
      })
    )
  })
})
