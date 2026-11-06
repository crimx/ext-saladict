import axios from 'axios'
import { AddConfig, AddResult, SyncService } from '../../interface'
import { getNotebook, notifyError } from '../../helpers'
import {
  RATE_LIMIT_ERROR,
  getRateLimiter,
  isRateLimitError
} from './rate-limiter'

const API_BASE_URL = 'https://open.maimemo.com/open/api/v1/memo'
const BATCH_SIZE = 1000

export interface SyncConfig {
  enable: boolean
  token: string
  advance: boolean
}

interface Vocabulary {
  id: string
  spelling: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
}

export class Service extends SyncService<SyncConfig> {
  static readonly id = 'maimemo'

  static getDefaultConfig(): SyncConfig {
    return {
      enable: false,
      token: '',
      advance: false
    }
  }

  async init() {
    await this.queryVocabulary(['apple'])
  }

  async add(config: AddConfig): Promise<AddResult> {
    let matched = 0
    let added = 0

    if (!this.config.enable) {
      return { matched, added }
    }

    let { words } = config
    if (config.force) {
      words = await getNotebook()
    }
    if (!words || words.length === 0) {
      return { matched, added }
    }

    const spellings = Array.from(
      new Set(words.map(word => word.text.toLowerCase().trim()).filter(Boolean))
    )

    for (let start = 0; start < spellings.length; start += BATCH_SIZE) {
      const batch = spellings.slice(start, start + BATCH_SIZE)

      try {
        const vocabulary = await this.queryVocabulary(batch)
        const vocabularyBySpelling = new Map(
          vocabulary.map(word => [word.spelling.toLowerCase(), word.id])
        )
        const ids: string[] = []

        for (const spelling of batch) {
          const id = vocabularyBySpelling.get(spelling.toLowerCase())
          if (id) {
            ids.push(id)
          } else {
            await notifyError(Service.id, 'word', `「${spelling}」`)
          }
        }

        matched += ids.length
        if (ids.length > 0) {
          added += await this.addWords(ids)
        }
      } catch (error) {
        if (!isRateLimitError(error)) {
          throw error
        }

        // Do not throw, otherwise the remaining batches would never be
        // retried. Report what has been done so far instead.
        return {
          matched,
          added,
          rateLimited: true,
          remaining: spellings.length - start
        }
      }
    }

    return { matched, added }
  }

  private async queryVocabulary(spellings: string[]): Promise<Vocabulary[]> {
    const response = await this.request<{ voc: Vocabulary[] }>(
      'post',
      '/vocabulary/query',
      { spellings }
    )
    if (!Array.isArray(response.voc)) {
      throw new Error('response')
    }
    return response.voc
  }

  private async addWords(ids: string[]): Promise<number> {
    const response = await this.request<{ added_count: number }>(
      'post',
      '/study/add_words',
      { words: ids.map(id => ({ id })), advance: Boolean(this.config.advance) }
    )
    if (typeof response.added_count !== 'number') {
      throw new Error('response')
    }
    return response.added_count
  }

  private async request<T>(
    method: 'post',
    path: string,
    data: unknown
  ): Promise<T> {
    const limiter = getRateLimiter()
    let response: { data: ApiResponse<T> } | undefined

    for (let attempt = 0; !response; attempt++) {
      try {
        response = await limiter.enqueue(() =>
          axios({
            method,
            url: `${API_BASE_URL}${path}`,
            data,
            headers: {
              Authorization: `Bearer ${this.config.token}`
            }
          })
        )
      } catch (error) {
        if (isRateLimitError(error)) {
          // the local budget is used up, retrying is pointless
          throw error
        }

        if (error.response?.status === 401) {
          throw new Error('illegal_token')
        }

        if (error.response?.status === 429) {
          const delay = limiter.getRetryDelay(error, attempt)
          if (delay < 0) {
            throw new Error(RATE_LIMIT_ERROR)
          }
          if (process.env.DEBUG) {
            console.log(`Maimemo rate limited, retrying in ${delay}ms`)
          }
          // hold back every queued request, not just this one
          limiter.cooldown(delay)
          continue
        }

        throw new Error('network')
      }
    }

    if (!response.data || !response.data.success) {
      throw new Error('response')
    }
    return response.data.data
  }
}
