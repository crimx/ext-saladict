import axios from 'axios'
import AxiosMockAdapter from 'axios-mock-adapter'
import { retry } from '../helpers'
import {
  search,
  BingResultLex,
  BingResultMachine,
  BingResultRelated
} from '@/components/dictionaries/bing/engine'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile, ProfileMutable } from '@/app-config/profiles'
import { mockRequest } from './requests.mock'

let mock: AxiosMockAdapter

describe('Dict/Bing/engine', () => {
  beforeAll(() => {
    mock = new AxiosMockAdapter(axios)
    mockRequest(mock)
  })

  afterAll(() => {
    mock.restore()
  })

  it('should parse audio urls from semantic data attributes', async () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.bing.options = {
      tense: false,
      phsym: true,
      cdef: false,
      related: false,
      sentence: 1
    }

    const searchResult = await search('love', getDefaultConfig(), profile, {
      isPDF: false
    })
    const result = searchResult.result as BingResultLex

    expect(searchResult.audio).toHaveProperty(
      'us',
      expect.stringContaining('/dict/mediamp3?blob=')
    )
    expect(searchResult.audio).toHaveProperty(
      'uk',
      expect.stringContaining('/dict/mediamp3?blob=')
    )
    expect(result.phsym).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pron: expect.stringContaining('/dict/mediamp3?blob=')
        })
      ])
    )
    expect(result.sentences).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          mp3: expect.stringContaining('/dict/mediamp3?blob=')
        })
      ])
    )
  })

  it('should parse lex result correctly', () => {
    const profile = getDefaultProfile() as ProfileMutable
    profile.dicts.all.bing.options = {
      tense: true,
      phsym: true,
      cdef: true,
      related: true,
      sentence: 4
    }
    return retry(() =>
      search('love', getDefaultConfig(), profile, { isPDF: false }).then(
        searchResult => {
          expect(searchResult.audio).toHaveProperty(
            'us',
            expect.stringContaining('mp3')
          )
          expect(searchResult.audio).toHaveProperty(
            'uk',
            expect.stringContaining('mp3')
          )

          const result = searchResult.result as BingResultLex
          expect(result.type).toBe('lex')
          expect((result.phsym as any).length).toBeGreaterThan(0)
          expect((result.cdef as any).length).toBeGreaterThan(0)
          expect((result.infs as any).length).toBeGreaterThan(0)
          expect(result.sentences).toHaveLength(4)
        }
      )
    )
  })

  it('should parse machine result correctly', () => {
    return retry(() =>
      search('machine', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as BingResultMachine
        expect(result.type).toBe('machine')
        expect(typeof result.mt).toBe('string')
        expect(result.mt.length).toBeGreaterThan(0)
      })
    )
  })

  it('should parse related result correctly', () => {
    return retry(() =>
      search('related', getDefaultConfig(), getDefaultProfile(), {
        isPDF: false
      }).then(searchResult => {
        expect(searchResult.audio).toBeUndefined()

        const result = searchResult.result as BingResultRelated
        expect(result.type).toBe('related')
        expect(result.defs.length).toBeGreaterThan(0)
      })
    )
  })
})
