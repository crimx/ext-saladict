const nodeCrypto = require('crypto')
const { TextEncoder } = require('util')

Object.defineProperty(globalThis, 'crypto', {
  value: nodeCrypto.webcrypto,
  configurable: true
})
Object.defineProperty(globalThis, 'TextEncoder', {
  value: TextEncoder,
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
  credentialErrorResult,
  emptyMachineResult,
  getAlibabaCredentialError,
  getCredentialErrorFromHttpStatus,
  getNiuTransCredentialError,
  getTencentCredentialError,
  getVolcCredentialError
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

  it('supports auto source language and detects local languages from text', () => {
    const helper = createLanguageHelper(commonMachineLanguages)

    expect(helper.getSupportLanguages()).toEqual([
      'auto',
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
    expect(result.result.credentialError).toBe('missing')
    expect(result.result.id).toBe('alibaba')
    expect(result.result.searchText.paragraphs).toEqual([''])
  })

  it('builds credential error machine result', () => {
    const result = credentialErrorResult('deepl', 'invalid', commonMachineLanguages)

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('invalid')
    expect(result.result.id).toBe('deepl')
  })

  it('maps HTTP status codes to credential errors', () => {
    expect(getCredentialErrorFromHttpStatus(401)).toBe('invalid')
    expect(getCredentialErrorFromHttpStatus(403)).toBe('invalid')
    expect(getCredentialErrorFromHttpStatus(456)).toBe('quota')
    expect(getCredentialErrorFromHttpStatus(500)).toBeUndefined()
  })

  it('detects provider credential errors from response bodies', () => {
    expect(
      getAlibabaCredentialError({
        Code: 'InvalidAccessKeyId.NotFound',
        Message: 'specified access key is not found'
      })
    ).toBe('invalid')
    expect(
      getVolcCredentialError({
        ResponseMetadata: {
          Error: {
            Code: 'AuthFailure.SignatureFailure',
            Message: 'signature mismatch'
          }
        }
      })
    ).toBe('invalid')
    expect(getNiuTransCredentialError({ error_msg: 'apikey is invalid' })).toBe(
      'invalid'
    )
    expect(
      getTencentCredentialError({
        isAxiosError: true,
        response: {
          data: {
            Response: {
              Error: {
                Code: 'AuthFailure.InvalidSecretId',
                Message: 'invalid secret id'
              }
            }
          }
        }
      })
    ).toBe('invalid')
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
