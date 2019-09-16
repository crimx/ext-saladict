import checkUpdate from '@/_helpers/check-update'
import _fetchMock, { FetchMock } from 'jest-fetch-mock'
import { browser } from '../../helper'

const fetchMock = _fetchMock as FetchMock

describe('Check Update', () => {
  beforeAll(() => {
    window.fetch = fetchMock
    browser.runtime.getManifest.returns({
      version: '1.1.1'
    })
  })
  beforeEach(() => {
    fetchMock.resetMocks()
  })

  it('Server Got Same Version (Not Available)', () => {
    const responseObj = { tag_name: 'v1.1.1' }
    const resolveSpy = jest.fn()
    const rejectSpy = jest.fn()
    const catchSpy = jest.fn()

    fetchMock.mockResponseOnce(JSON.stringify(responseObj))

    const p = checkUpdate()
      .then(resolveSpy, rejectSpy)
      .catch(catchSpy)
      .then(() => {
        expect(resolveSpy).toHaveBeenCalledTimes(1)
        expect(rejectSpy).toHaveBeenCalledTimes(0)
        expect(catchSpy).toHaveBeenCalledTimes(0)
        expect(resolveSpy).toBeCalledWith(
          expect.objectContaining({
            isAvailable: false
          })
        )
      })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    return p
  })
  ;[
    ['Patch', 'v1.1.2', 'v1.1.0'],
    ['Minor', 'v1.2.1', 'v1.0.1'],
    ['Major', 'v2.1.1', 'v0.1.1']
  ].forEach(([title, newerVersion, olderVersion]) => {
    describe(title, () => {
      it('New Version Available', () => {
        const responseObj = { tag_name: newerVersion }
        const resolveSpy = jest.fn()
        const rejectSpy = jest.fn()
        const catchSpy = jest.fn()

        fetchMock.mockResponseOnce(JSON.stringify(responseObj))

        const p = checkUpdate()
          .then(resolveSpy, rejectSpy)
          .catch(catchSpy)
          .then(() => {
            expect(resolveSpy).toHaveBeenCalledTimes(1)
            expect(rejectSpy).toHaveBeenCalledTimes(0)
            expect(catchSpy).toHaveBeenCalledTimes(0)
            expect(resolveSpy).toBeCalledWith({
              isAvailable: true,
              info: responseObj
            })
          })
        expect(fetchMock).toHaveBeenCalledTimes(1)
        return p
      })

      it('Server Got Older Version (Not Available)', () => {
        const responseObj = { tag_name: olderVersion }
        const resolveSpy = jest.fn()
        const rejectSpy = jest.fn()
        const catchSpy = jest.fn()

        fetchMock.mockResponseOnce(JSON.stringify(responseObj))

        const p = checkUpdate()
          .then(resolveSpy, rejectSpy)
          .catch(catchSpy)
          .then(() => {
            expect(resolveSpy).toHaveBeenCalledTimes(1)
            expect(rejectSpy).toHaveBeenCalledTimes(0)
            expect(catchSpy).toHaveBeenCalledTimes(0)
            expect(resolveSpy).toBeCalledWith(
              expect.objectContaining({
                isAvailable: false
              })
            )
          })
        expect(fetchMock).toHaveBeenCalledTimes(1)
        return p
      })
    })
  })
})
