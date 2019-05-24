import { timer } from '@/_helpers/promise-more'

export async function retry (executor: () => Promise<any>, retryTimes = 1) {
  let times = retryTimes + 1
  let error: any
  while (times--) {
    try {
      return await executor()
    } catch (e) {
      error = e
      await timer(1000)
    }
  }
  console.error(error)
  return Promise.reject(error)
}
