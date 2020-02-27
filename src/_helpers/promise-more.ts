/* eslint-disable prettier/prettier */

/**
 * Like Promise.all but always resolves.
 */
export function reflect<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null, T6 | null, T7 | null, T8 | null, T9 | null, T10 | null]>
export function reflect<T1, T2, T3, T4, T5, T6, T7, T8, T9>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null, T6 | null, T7 | null, T8 | null, T9 | null]>
export function reflect<T1, T2, T3, T4, T5, T6, T7, T8>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null, T6 | null, T7 | null, T8 | null]>
export function reflect<T1, T2, T3, T4, T5, T6, T7>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null, T6 | null, T7 | null]>
export function reflect<T1, T2, T3, T4, T5, T6>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null, T6 | null]>
export function reflect<T1, T2, T3, T4, T5>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null, T5 | null]>
export function reflect<T1, T2, T3, T4>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): Promise<[T1 | null, T2 | null, T3 | null, T4 | null]>
export function reflect<T1, T2, T3>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[T1 | null, T2 | null, T3 | null]>
export function reflect<T1, T2>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[T1 | null, T2 | null]>
export function reflect<T>(iterable: ArrayLike<T | PromiseLike<T>>): Promise<(T | null)[]>
export function reflect(iterable: ArrayLike<any>) {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)
  return Promise.all(arr.map(p => Promise.resolve(p).catch(() => null)))
}

/**
 * Like Promise.all but only rejects when all are failed.
 */
export function any<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>
export function any<T1, T2, T3, T4, T5, T6, T7, T8, T9>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>
export function any<T1, T2, T3, T4, T5, T6, T7, T8>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Promise<[T1, T2, T3, T4, T5, T6, T7, T8]>
export function any<T1, T2, T3, T4, T5, T6, T7>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Promise<[T1, T2, T3, T4, T5, T6, T7]>
export function any<T1, T2, T3, T4, T5, T6>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Promise<[T1, T2, T3, T4, T5, T6]>
export function any<T1, T2, T3, T4, T5>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): Promise<[T1, T2, T3, T4, T5]>
export function any<T1, T2, T3, T4>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): Promise<[T1, T2, T3, T4]>
export function any<T1, T2, T3>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<[T1, T2, T3]>
export function any<T1, T2>(iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<[T1, T2]>
export function any<T>(iterable: ArrayLike<T | PromiseLike<T>>): Promise<T[]>
export function any(iterable: ArrayLike<any>) {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)

  let rejectCount = 0
  const promises: Promise<any>[] = arr.map((p, i) =>
    Promise.resolve(p).catch(e => {
      rejectCount++
      return null
    })
  )

  return Promise.all(promises).then(resolutions => {
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
export function first<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>, T10 | PromiseLike<T10>]): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10>
export function first<T1, T2, T3, T4, T5, T6, T7, T8, T9> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>, T9 | PromiseLike<T9>]): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>
export function first<T1, T2, T3, T4, T5, T6, T7, T8> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>, T8 | PromiseLike<T8>]): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7 | T8>
export function first<T1, T2, T3, T4, T5, T6, T7> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>, T7 | PromiseLike<T7>]): Promise<T1 | T2 | T3 | T4 | T5 | T6 | T7>
export function first<T1, T2, T3, T4, T5, T6> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>, T6 | PromiseLike<T6>]): Promise<T1 | T2 | T3 | T4 | T5 | T6>
export function first<T1, T2, T3, T4, T5> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>, T5 | PromiseLike<T5>]): Promise<T1 | T2 | T3 | T4 | T5>
export function first<T1, T2, T3, T4> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>, T4 | PromiseLike<T4>]): Promise<T1 | T2 | T3 | T4>
export function first<T1, T2, T3> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>, T3 | PromiseLike<T3>]): Promise<T1 | T2 | T3>
export function first<T1, T2> (iterable: [T1 | PromiseLike<T1>, T2 | PromiseLike<T2>]): Promise<T1 | T2>
export function first<T> (iterable: ArrayLike<T | PromiseLike<T>>): Promise<T>
export function first (iterable: ArrayLike<any>) {
  const arr = Array.isArray(iterable) ? iterable : Array.from(iterable)

  let rejectCount = 0
  return new Promise((resolve, reject) =>
    arr.forEach(p => {
      Promise.resolve(p)
        .then(resolve)
        .catch(() => {
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
export function timer(delay?: number): Promise<void>
export function timer<T = any>(delay: number, payload?: T): Promise<T>
export function timer(...args) {
  return new Promise<any>(resolve => {
    setTimeout(
      () => (args.length > 0 ? resolve(args[1]) : resolve()),
      Number(args[0]) || 0
    )
  })
}

/**
 * Timeouts a promise.
 * Rejects when timeout.
 */
export function timeout<T>(pr: PromiseLike<T>, delay = 0): Promise<T> {
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
  timeout
}
