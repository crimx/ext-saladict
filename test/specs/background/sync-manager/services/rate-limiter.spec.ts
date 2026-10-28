import {
  RateLimiter,
  RATE_LIMIT_ERROR,
  isRateLimitError
} from '@/background/sync-manager/services/maimemo/rate-limiter'

/** Deterministic clock: sleeping advances time instantly. */
function createClock() {
  let time = 1000
  return {
    now: () => time,
    sleep: async (delay: number) => {
      time += delay
    },
    advance: (delay: number) => {
      time += delay
    },
    get time() {
      return time
    }
  }
}

function create429(retryAfter?: string) {
  return {
    response: {
      status: 429,
      headers: retryAfter === undefined ? {} : { 'retry-after': retryAfter }
    }
  }
}

describe('Maimemo rate limiter', () => {
  it('sends requests one at a time', async () => {
    const clock = createClock()
    const limiter = new RateLimiter({ minInterval: 0 }, clock)
    const order: string[] = []

    await Promise.all([
      limiter.enqueue(async () => {
        await Promise.resolve()
        order.push('first')
      }),
      limiter.enqueue(async () => {
        order.push('second')
      })
    ])

    expect(order).toEqual(['first', 'second'])
  })

  it('keeps the queue alive when a request rejects', async () => {
    const clock = createClock()
    const limiter = new RateLimiter({ minInterval: 0 }, clock)

    await expect(
      limiter.enqueue(() => Promise.reject(new Error('boom')))
    ).rejects.toThrow('boom')

    await expect(limiter.enqueue(() => Promise.resolve('ok'))).resolves.toBe(
      'ok'
    )
  })

  it('waits for the minimum interval between requests', async () => {
    const clock = createClock()
    const limiter = new RateLimiter({ minInterval: 500 }, clock)
    const sentAt: number[] = []

    await limiter.enqueue(async () => sentAt.push(clock.now()))
    await limiter.enqueue(async () => sentAt.push(clock.now()))

    expect(sentAt[1] - sentAt[0]).toBeGreaterThanOrEqual(500)
  })

  it('throttles the sliding window', async () => {
    const clock = createClock()
    const limiter = new RateLimiter(
      {
        windows: [{ max: 2, span: 1000 }],
        minInterval: 0,
        buffer: 0
      },
      clock
    )
    const sentAt: number[] = []

    for (let i = 0; i < 3; i++) {
      await limiter.enqueue(async () => sentAt.push(clock.now()))
    }

    expect(sentAt[0]).toBe(1000)
    expect(sentAt[1]).toBe(1000)
    // the window is full, the third request has to wait for the oldest one
    expect(sentAt[2]).toBeGreaterThanOrEqual(2000)
  })

  it('gives up when the required wait exceeds the bound', async () => {
    const clock = createClock()
    const limiter = new RateLimiter(
      {
        windows: [{ max: 1, span: 5 * 60 * 60 * 1000 }],
        minInterval: 0,
        maxWait: 1000,
        buffer: 0
      },
      clock
    )

    await limiter.enqueue(() => Promise.resolve())

    await expect(limiter.enqueue(() => Promise.resolve())).rejects.toThrow(
      RATE_LIMIT_ERROR
    )
  })

  it('computes exponential retry delays within the budget', () => {
    const limiter = new RateLimiter(
      { maxRetries: 3, retryBaseDelay: 1000, maxRetryDelay: 10000 },
      createClock()
    )

    expect(limiter.getRetryDelay(create429(), 0)).toBe(1000)
    expect(limiter.getRetryDelay(create429(), 2)).toBe(4000)
    // out of the bounded scope
    expect(limiter.getRetryDelay(create429(), 3)).toBe(-1)
  })

  it('prefers the Retry-After header and refuses to wait too long', () => {
    const limiter = new RateLimiter(
      { maxRetries: 3, retryBaseDelay: 1000, maxRetryDelay: 10000 },
      createClock()
    )

    expect(limiter.getRetryDelay(create429('5'), 0)).toBe(5000)
    expect(limiter.getRetryDelay(create429('60'), 0)).toBe(-1)
  })

  it('holds back the whole queue during a cooldown', async () => {
    const clock = createClock()
    const limiter = new RateLimiter({ minInterval: 0, buffer: 0 }, clock)
    const sentAt: number[] = []

    limiter.cooldown(3000)

    await limiter.enqueue(async () => sentAt.push(clock.now()))

    expect(sentAt[0]).toBe(4000)
  })

  it('detects rate limit errors', () => {
    expect(isRateLimitError(new Error(RATE_LIMIT_ERROR))).toBe(true)
    expect(isRateLimitError(new Error('network'))).toBe(false)
    expect(isRateLimitError('rate_limit')).toBe(false)
  })
})
