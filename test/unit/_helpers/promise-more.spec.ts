import * as pm from '@/_helpers/promise-more'

describe('Promise More', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('reflect', () => {
    it('All resolved', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.reflect([1, 2, 3])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith([1, 2, 3])
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('Partly rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.reflect([1, 2, Promise.reject(null)])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith([1, 2, null])
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('All rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.reflect([Promise.reject(null), Promise.reject(null), Promise.reject(null)])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith([null, null, null])
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
  })

  describe('any', () => {
    it('All resolved', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.any([1, 2, 3])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith([1, 2, 3])
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('Partly rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.any([1, 2, Promise.reject(null)])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith([1, 2, null])
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('All rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.any([Promise.reject(null), Promise.reject(null), Promise.reject(null)])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).not.toBeCalled()
          expect(rejectSpy).toBeCalledWith(expect.any(Error))
          expect(catchSpy).not.toBeCalled()
        })
    })
  })

  describe('first', () => {
    it('All resolved', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.first([1, 2, 3])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith(1)
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('Partly rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.first([Promise.reject(null), 2, 3])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).toBeCalledWith(2)
          expect(rejectSpy).not.toBeCalled()
          expect(catchSpy).not.toBeCalled()
        })
    })
    it('All rejected', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()
      return pm.first([Promise.reject(null), Promise.reject(null), Promise.reject(null)])
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)
        .then(() => {
          expect(resolveSpy).not.toBeCalled()
          expect(rejectSpy).toBeCalledWith(expect.any(Error))
          expect(catchSpy).not.toBeCalled()
        })
    })
  })

  it('timer', () => {
    const resolveSpy = jest.fn()
    const rejectSpy = jest.fn()
    const catchSpy = jest.fn()

    const p = pm.timer(10)
      .then(resolveSpy, rejectSpy)
      .catch(catchSpy)

    expect(setTimeout).toBeCalledWith(expect.any(Function), 10)
    jest.runAllTimers()
    return p.then(() => {
      expect(resolveSpy).toHaveBeenCalledTimes(1)
      expect(rejectSpy).not.toBeCalled()
      expect(catchSpy).not.toBeCalled()
    })
  })

  describe('timeout', () => {
    it('Finish before Timeout', () => {
      const resolveSpy = jest.fn()
      const rejectSpy = jest.fn()
      const catchSpy = jest.fn()

      const job = new Promise((resolve, reject) => {
        setTimeout(() => resolve('job'), 10)
      })

      const p = pm.timeout(job, 100)
        .then(resolveSpy, rejectSpy)
        .catch(catchSpy)

      expect(setTimeout).toBeCalledWith(expect.any(Function), 100)
      jest.runAllTimers()
      return p.then(() => {
        expect(resolveSpy).toHaveBeenCalledTimes(1)
        expect(resolveSpy).toBeCalledWith('job')
        expect(rejectSpy).not.toBeCalled()
        expect(catchSpy).not.toBeCalled()
      })
    })
  })
})
