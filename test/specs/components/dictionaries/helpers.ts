import { timer } from '@/_helpers/promise-more'

export async function retry(executor: () => Promise<any>, retryTimes = 1) {
  let times = retryTimes + 1
  while (times--) {
    try {
      return await executor()
    } catch (e) {
      await timer(1000)
    }
  }
  console.error('>>>>> timeout')
}
