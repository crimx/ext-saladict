export interface DictSearchResult<R> {
  /** search result */
  result: R
  /** auto play sound */
  audio?: {
    uk?: string
    us?: string
    py?: string
  }
}
