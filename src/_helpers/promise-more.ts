/**
 * Like Promise.all but always resolves.
 */
export function reflect (iterable: ArrayLike<any>): Promise<any[]> {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)
  return Promise.all(arr.map(p => Promise.resolve(p).catch(() => null)))
}

/**
 * Like Promise.all but only rejects when all are failed.
 */
export function any (iterable: ArrayLike<any>): Promise<any[]> {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)

  let rejectCount = 0
  const promises: Promise<any>[] = arr.map((p, i) =>
    Promise.resolve(p)
      .catch(e => {
        rejectCount++
        return null
      })
  )

  return Promise.all(promises)
    .then(resolutions => {
      if (rejectCount === resolutions.length) {
        return Promise.reject(new Error('All rejected'))
      }
      return Promise.resolve(resolutions)
    })
}

/**
 * Returns the first resolved value as soon as it is resolved.
 * Fails when all are failed.
 */
export function first (iterable: ArrayLike<any>): Promise<any> {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)

  let rejectCount = 0
  return new Promise((resolve, reject) =>
    arr.map((p, i) => {
      Promise.resolve(p)
        .then(resolve)
        .catch(e => {
          if (++rejectCount === arr.length) {
            reject(new Error('All rejected'))
          }
        })
    })
  )
}

/**
 * Like setTimeout but returns Promise.
 */
export function timer (delay = 0): Promise<any> {
  return new Promise(resolve => {
    let id = setTimeout(() => resolve(id), Number(delay) || 0)
  })
}

/**
 * Timeouts a promise.
 * Rejects when timeout.
 */
export function timeout (pr: PromiseLike<any>, delay = 0): Promise<any> {
  return Promise.race([
    pr,
    timer(delay).then(() => Promise.reject(new Error(`timeout ${delay}ms`)))
  ])
}

export default {
  reflect,
  any,
  first,
  timer,
  timeout,
}
