/**
 * Like Promise.all but always resolves.
 * @param {Array|Object} iterable
 * @returns {Promise} A promise with an array of all the resolved/rejected results. null for rejection.
 */
export const promiseReflect = function promiseReflect (iterable) {
  if (!Array.isArray(iterable)) {
    iterable = Array.from(iterable)
  }

  return Promise.all(iterable.map(p => Promise.resolve(p).catch(() => null)))
}

/**
 * Like Promise.all but only rejects when all are rejected/error.
 * @param {Array|Object} iterable
 * @returns {Promise} A promise with an array.
 *  If resolved, the array consists of all the resolved/rejected results. null for rejection.
 *  Otherwise the array consists of all the rejected reasons.
 */
export const promiseAny = function promiseAny (iterable) {
  if (!Array.isArray(iterable)) {
    iterable = Array.from(iterable)
  }

  var rejectCount = 0
  var reasons = []
  var promises = iterable.map((p, i) => Promise.resolve(p).catch(e => {
    rejectCount++
    reasons[i] = e
    return null
  }))

  return Promise.all(promises)
    .then((resolutions) => {
      if (rejectCount === resolutions.length) {
        return Promise.reject(reasons)
      }
      return resolutions
    })
}

/**
 * Returns the first resolved value as soon as it is resolved and fails when all are rejected/error.
 * @param {Array|Object} iterable
 * @returns {Promise} If resovled, returns a promise with the first resolved result.
 *  Otherwise returns a promise with all the rejected reasons.
 */
export const promiseFirst = function promiseFirst (iterable) {
  if (!Array.isArray(iterable)) {
    iterable = Array.from(iterable)
  }

  var rejectCount = 0
  var reasons = []
  return new Promise((resolve, reject) => iterable.forEach((p, i) => {
    Promise.resolve(p).then(resolve).catch(e => {
      reasons[i] = e
      if (++rejectCount === iterable.length) {
        reject(reasons)
      }
    })
  }))
}

/**
 * A timer that support promise.
 * @param {number} [delay=0]
 * @returns {Promise} A promise with the timeoutID
 */
export const promiseTimer = function promiseTimer (delay = 0) {
  return new Promise(resolve => {
    var id = setTimeout(() => resolve(id), Number(delay) || 0)
  })
}

/**
 * Timeout a promise.
 * @param {} a promise, thenable or anything
 * @param {number} [delay=0] Zero means no timeout
 * @returns {Promise} A promise with the resolved/rejected result or rejected with the reason 'timeout'
 */
export const promiseTimeout = function promiseTimeout (pr, delay = 0) {
  delay = Number(delay)
  return new Promise((resolve, reject) => {
    Promise.resolve(pr).then(resolve, reject)
    if (delay > 0) {
      promiseTimer(delay).then(() => { reject(new Error(`timeout ${delay}ms`)) })
    }
  })
}

export default {
  reflect: promiseReflect,
  any: promiseAny,
  first: promiseFirst,
  timer: promiseTimer,
  timeout: promiseTimeout
}
