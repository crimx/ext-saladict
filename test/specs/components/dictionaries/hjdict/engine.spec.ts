import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import {
  search,
  HjdictResultLex
} from '@/components/dictionaries/hjdict/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Hjdict/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse english lex result correctly', () => {
    return retry(() =>
      search('love', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        const result = searchResult.result as HjdictResultLex

        expect(result.type).toBe('lex')
        expect(result.langCode).toBe('w')
        expect(result.header).toBeFalsy()
        expect(result.entries).toHaveLength(1)
        expect(result.entries[0]).toContain('word-details-pane-active')
        expect(result.entries[0]).toContain('word-info')
        expect(result.entries[0]).toContain('word-details-item detail')
      })
    )
  })

  it('should parse multi-pane lex result correctly', () => {
    return retry(() =>
      search('爱', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false,
        langCode: 'jp/jc'
      }).then(searchResult => {
        const result = searchResult.result as HjdictResultLex

        expect(result.type).toBe('lex')
        expect(result.langCode).toBe('jp/jc')
        expect(result.header).toContain('word-details-tab')
        expect(result.entries).toHaveLength(2)
        expect(result.entries[0]).toContain('word-details-pane-active')
        expect(result.entries[1]).not.toContain('word-details-pane-active')
      })
    )
  })
})
