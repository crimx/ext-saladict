import search from '@/components/dictionaries/zdic/engine'
import { appConfigFactory } from '@/app-config'
import fs from 'fs'
import path from 'path'

describe('Dict/Zdic/engine', () => {
  beforeAll(() => {
    const word = fs.readFileSync(path.join(__dirname, 'response/爱.html'), 'utf8')
    const phrase = fs.readFileSync(path.join(__dirname, 'response/沙拉.html'), 'utf8')
    window.fetch = jest.fn((url: string) => Promise.resolve({
      text: () => url.indexOf('爱') !== -1 ? word : phrase
    }))
  })

  it('should parse word result correctly', () => {
    return search('爱', appConfigFactory())
      .then(({ result, audio }) => {
        expect(audio && typeof audio.py).toBe('string')
        expect(result.phsym.length).toBeGreaterThan(0)
        expect(typeof result.defs).toBe('string')
      })
  })

  it('should parse phrase result correctly', () => {
    return search('沙拉', appConfigFactory())
      .then(({ result, audio }) => {
        expect(audio && typeof audio.py).toBe('string')
        expect(result.phsym.length).toBeGreaterThan(0)
        expect(typeof result.defs).toBe('string')
      })
  })
})
