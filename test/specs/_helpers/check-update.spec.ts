import { checkUpdate } from '@/_helpers/check-update'
import _fetchMock, { FetchMock } from 'jest-fetch-mock'
import getDefaultConfig from '@/app-config'

const fetchMock = _fetchMock as FetchMock

describe('Check Update', () => {
  beforeAll(() => {
    window.fetch = fetchMock
  })

  beforeEach(() => {
    fetchMock.resetMocks()
    window.appConfig = getDefaultConfig()
  })

  const tests = [
    ['Same', 'v1.1.1', 'v1.1.1', 0],
    ['Newer Patch', 'v1.1.2', 'v1.1.0', 1],
    ['Newer Minor', 'v1.2.1', 'v1.0.1', 2],
    ['Newer Major', 'v2.1.1', 'v0.1.1', 3],
    ['Older Patch', 'v1.1.0', 'v1.1.2', -1],
    ['Older Minor', 'v1.0.1', 'v1.2.1', -2],
    ['Older Major', 'v0.1.1', 'v2.1.1', -3]
  ] as const

  tests.forEach(([title, newerVersion, olderVersion, diff]) => {
    it(title, async () => {
      const responseObj = { version: newerVersion }
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      fetchMock.mockResponseOnce(JSON.stringify(responseObj))

      await checkUpdate(olderVersion.slice(1))
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(resolveSpy).toHaveBeenCalledTimes(1)
      expect(rejectSpy).toHaveBeenCalledTimes(0)
      expect(catchSpy).toHaveBeenCalledTimes(0)
      expect(resolveSpy).toBeCalledWith({
        diff,
        data: responseObj
      })
    })
  })
})
