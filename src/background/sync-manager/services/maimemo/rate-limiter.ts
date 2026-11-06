import { timer } from '@/_helpers/promise-more'

export interface RateLimitWindow {
  /** Max number of requests allowed inside the window */
  readonly max: number
  /** Window length in milliseconds */
  readonly span: number
}

export interface RateLimiterOptions {
  /** Sliding windows enforced by the remote service */
  readonly windows: ReadonlyArray<RateLimitWindow>
  /** Minimum interval between two consecutive requests */
  readonly minInterval: number
  /** Give up instead of waiting when the required delay exceeds this value */
  readonly maxWait: number
  /** Max number of retries after a 429 response */
  readonly maxRetries: number
  /** Base delay of the exponential backoff used when no Retry-After header */
  readonly retryBaseDelay: number
  /** Give up retrying when the remote asks to wait longer than this value */
  readonly maxRetryDelay: number
  /** Extra delay added to throttled requests to avoid boundary races */
  readonly buffer: number
}

export interface RateLimiterClock {
  now(): number
  sleep(delay: number): Promise<void>
}

/** Error message shared with the sync service */
export const RATE_LIMIT_ERROR = 'rate_limit'

/**
 * Maimemo Open API rate limits:
 * 20 requests per 10 seconds, 40 per minute and 2,000 per 5 hours.
 *
 * @see https://open.maimemo.com/#/document
 */
export const DEFAULT_RATE_LIMITER_OPTIONS: RateLimiterOptions = {
  windows: [
    { max: 20, span: 10 * 1000 },
    { max: 40, span: 60 * 1000 },
    { max: 2000, span: 5 * 60 * 60 * 1000 }
  ],
  minInterval: 250,
  maxWait: 60 * 1000,
  maxRetries: 3,
  retryBaseDelay: 2 * 1000,
  maxRetryDelay: 60 * 1000,
  buffer: 50
}

const defaultClock: RateLimiterClock = {
  now: () => Date.now(),
  sleep: delay => timer(delay)
}

/**
 * Serial queue plus sliding-window throttling and bounded 429 backing off.
 *
 * Requests are sent one at a time in FIFO order so that every caller
 * (automatic syncing, full syncing, token checking) shares the same budget.
 */
export class RateLimiter {
  readonly options: RateLimiterOptions

  private readonly clock: RateLimiterClock
  /** Send timestamps inside the longest window, ascending */
  private timestamps: number[] = []
  /** No request is allowed to start before this timestamp */
  private cooldownUntil = 0
  /** Tail of the serial queue */
  private queue: Promise<unknown> = Promise.resolve()
  private readonly maxSpan: number

  constructor(
    options: Partial<RateLimiterOptions> = {},
    clock: Partial<RateLimiterClock> = {}
  ) {
    this.options = { ...DEFAULT_RATE_LIMITER_OPTIONS, ...options }
    this.clock = { ...defaultClock, ...clock }
    this.maxSpan = this.options.windows.reduce(
      (span, window) => Math.max(span, window.span),
      0
    )
  }

  /** Forget recorded requests. Mainly used by tests. */
  reset(): void {
    this.timestamps = []
    this.cooldownUntil = 0
  }

  /** Queue up a request. Rejections do not break the queue. */
  enqueue<T>(request: () => Promise<T>): Promise<T> {
    const result = this.queue.then(
      () => this.send(request),
      () => this.send(request)
    )
    // keep the chain alive whatever the outcome is
    this.queue = result.then(
      () => undefined,
      () => undefined
    )
    return result
  }

  /** Hold the whole queue back, e.g. after a 429 response. */
  cooldown(delay: number): void {
    if (!(delay > 0)) return
    this.cooldownUntil = Math.max(this.cooldownUntil, this.clock.now() + delay)
  }

  /**
   * Delay before retrying a 429 response.
   *
   * @returns a non-negative delay in milliseconds,
   * or -1 when retrying is out of the bounded scope.
   */
  getRetryDelay(error: unknown, attempt: number): number {
    if (attempt >= this.options.maxRetries) {
      return -1
    }

    const retryAfter = getRetryAfterHeader(error)
    const delay =
      retryAfter !== undefined
        ? retryAfter
        : this.options.retryBaseDelay * Math.pow(2, attempt)

    // the remote asks us to stay quiet for too long to be worth waiting
    return delay > this.options.maxRetryDelay ? -1 : delay
  }

  /** Milliseconds to wait before the next request is allowed to start. */
  getDelay(now = this.clock.now()): number {
    this.prune(now)

    let delay = this.cooldownUntil - now

    const lastSentAt = this.timestamps[this.timestamps.length - 1]
    if (lastSentAt !== undefined) {
      delay = Math.max(delay, lastSentAt + this.options.minInterval - now)
    }

    for (const { max, span } of this.options.windows) {
      const recent = this.timestamps.filter(time => time > now - span)
      if (recent.length >= max) {
        // wait until enough of the oldest requests have left the window
        delay = Math.max(delay, recent[recent.length - max] + span - now)
      }
    }

    return delay > 0 ? delay : 0
  }

  private async send<T>(request: () => Promise<T>): Promise<T> {
    await this.waitForSlot()
    this.timestamps.push(this.clock.now())
    return request()
  }

  private async waitForSlot(): Promise<void> {
    // looping is cheap, timers are not guaranteed to be exact
    for (let i = 0; i < 5; i++) {
      const delay = this.getDelay()
      if (delay <= 0) {
        return
      }
      if (delay > this.options.maxWait) {
        // e.g. the 5-hour budget has been used up,
        // waiting that long is pointless for an interactive sync.
        throw new Error(RATE_LIMIT_ERROR)
      }
      // a small extra delay keeps us away from the window boundary
      await this.clock.sleep(delay + this.options.buffer)
    }
  }

  private prune(now: number): void {
    if (this.maxSpan <= 0) {
      return
    }
    const expireBefore = now - this.maxSpan
    let index = 0
    while (
      index < this.timestamps.length &&
      this.timestamps[index] <= expireBefore
    ) {
      index += 1
    }
    if (index > 0) {
      this.timestamps = this.timestamps.slice(index)
    }
  }
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof Error && error.message === RATE_LIMIT_ERROR
}

let sharedOptions: Partial<RateLimiterOptions> = {}
let sharedLimiter: RateLimiter | undefined

/**
 * Requests from the background page and from the options page share the
 * same limiter as long as they live in the same context. Each context keeps
 * its own in-memory window, which is why a safety minimum interval is used.
 */
export function getRateLimiter(): RateLimiter {
  if (!sharedLimiter) {
    sharedLimiter = new RateLimiter(sharedOptions)
  }
  return sharedLimiter
}

/** Overrides the shared limiter. Mainly used by tests. */
export function configureRateLimiters(
  options: Partial<RateLimiterOptions> = {}
): RateLimiter {
  sharedOptions = options
  sharedLimiter = new RateLimiter(options)
  return sharedLimiter
}

function getRetryAfterHeader(error: any): number | undefined {
  const headers = error && error.response && error.response.headers
  if (!headers) {
    return undefined
  }

  const value = headers['retry-after'] ?? headers['Retry-After']
  if (value === undefined || value === null || value === '') {
    return undefined
  }

  const seconds = Number(value)
  if (Number.isFinite(seconds)) {
    return Math.max(seconds * 1000, 0)
  }

  const timestamp = Date.parse(String(value))
  if (Number.isFinite(timestamp)) {
    return Math.max(timestamp - Date.now(), 0)
  }

  return undefined
}
