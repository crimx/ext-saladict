import AxiosMockAdapter from 'axios-mock-adapter'
import axios from 'axios'
import { getDefaultConfig } from '@/app-config'
import { getDefaultProfile } from '@/app-config/profiles'
import { search } from '@/components/dictionaries/tencent/engine'

describe('Dict/Tencent/engine', () => {
  it('requires credentials before calling Tencent', async () => {
    const config = getDefaultConfig()
    const profile = getDefaultProfile()

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('missing')
    expect(result.result.id).toBe('tencent')
  })

  it('requires non-empty credentials before calling Tencent', async () => {
    const mock = new AxiosMockAdapter(axios)
    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.tencent.secretId = '   '
    ;(config as any).dictAuth.tencent.secretKey = 'secret'

    const result = await search('hello', config, profile, { isPDF: false })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('missing')
    expect(mock.history.post).toHaveLength(0)

    mock.restore()
  })

  it('reports Tencent credential errors from cloud API responses', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://tmt.tencentcloudapi.com').reply(403, {
      Response: {
        Error: {
          Code: 'AuthFailure.InvalidSecretId',
          Message: 'invalid secret id'
        }
      }
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.tencent.secretId = 'bad'
    ;(config as any).dictAuth.tencent.secretKey = 'bad'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('invalid')

    mock.restore()
  })

  it('reports Tencent credential errors from successful HTTP responses', async () => {
    const mock = new AxiosMockAdapter(axios)
    mock.onPost('https://tmt.tencentcloudapi.com').reply(200, {
      Response: {
        Error: {
          Code: 'AuthFailure.InvalidSecretId',
          Message: 'invalid secret id'
        },
        RequestId: 'request-id'
      }
    })

    const config = getDefaultConfig()
    const profile = getDefaultProfile()
    ;(config as any).dictAuth.tencent.secretId = 'bad'
    ;(config as any).dictAuth.tencent.secretKey = 'bad'

    const result = await search('hello', config, profile, {
      isPDF: false,
      sl: 'en',
      tl: 'zh-CN'
    })

    expect(result.result.requireCredential).toBe(true)
    expect(result.result.credentialError).toBe('invalid')

    mock.restore()
  })
})
