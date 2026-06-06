const nodeCrypto = require('crypto')

Object.defineProperty(globalThis, 'crypto', {
  value: nodeCrypto.webcrypto,
  configurable: true
})

import {
  commonMachineLanguages,
  createLanguageHelper,
  normalizeMachineLanguage,
  percentEncodeRFC3986,
  sha256Hex,
  hmacHex,
  hmacBase64,
  credentialRequiredResult,
  emptyMachineResult
} from '@/components/dictionaries/machine-custom'

describe('Dict/MachineCustom', () => {
  it('includes common machine translator languages', () => {
    expect(commonMachineLanguages).toEqual([
      'zh-CN',
      'zh-TW',
      'en',
      'ja',
      'ko',
      'fr',
      'de',
      'es',
      'ru'
    ])
  })

  it('detects local languages from text', () => {
    const helper = createLanguageHelper(commonMachineLanguages)

    expect(helper.detect('hello world')).toBe('en')
    expect(helper.detect('中文')).toBe('zh-CN')
    expect(helper.detect('かな')).toBe('ja')
    expect(helper.detect('한국어')).toBe('ko')
    expect(helper.detect('français')).toBe('fr')
    expect(helper.detect('español')).toBe('es')
    expect(helper.detect('größer')).toBe('de')
  })

  it('normalizes machine language aliases', () => {
    expect(normalizeMachineLanguage('zh')).toBe('zh-CN')
    expect(normalizeMachineLanguage('zh-cn')).toBe('zh-CN')
    expect(normalizeMachineLanguage('zh-tw')).toBe('zh-TW')
    expect(normalizeMachineLanguage('zh-hant')).toBe('zh-TW')
    expect(normalizeMachineLanguage('jp')).toBe('ja')
    expect(normalizeMachineLanguage('kr')).toBe('ko')
    expect(normalizeMachineLanguage('en')).toBe('en')
  })

  it('percent encodes using RFC 3986 escaping', () => {
    expect(percentEncodeRFC3986("a b!*'()~")).toBe(
      'a%20b%21%2A%27%28%29~'
    )
  })

  it('hashes text with SHA-256 hex', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('signs text with HMAC hex', async () => {
    expect(
      await hmacHex('SHA-256', 'key', 'The quick brown fox jumps over the lazy dog')
    ).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8')
  })

  it('signs text with HMAC base64', async () => {
    expect(
      await hmacBase64(
        'SHA-1',
        'key',
        'The quick brown fox jumps over the lazy dog'
      )
    ).toBe('3nybhbi3iqa8ino29wqQcBydtNk=')
  })

  it('builds credential required machine result', () => {
    const result = credentialRequiredResult('alibaba', commonMachineLanguages)

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.id).toBe('alibaba')
    expect(result.result.searchText.paragraphs).toEqual([''])
  })

  it('builds empty machine result', () => {
    const result = emptyMachineResult(
      'volc',
      'en',
      'zh-CN',
      commonMachineLanguages
    )

    expect(result.result.id).toBe('volc')
    expect(result.result.sl).toBe('en')
    expect(result.result.tl).toBe('zh-CN')
    expect(result.result.trans.paragraphs).toEqual([''])
  })
})
