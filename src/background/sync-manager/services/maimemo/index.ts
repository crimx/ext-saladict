import axios from 'axios'
import { AddConfig, SyncService } from '../../interface'
import { getNotebook, notifyError } from '../../helpers'

const API_BASE_URL = 'https://open.maimemo.com/open/api/v1/memo'
const BATCH_SIZE = 1000

export interface SyncConfig {
  enable: boolean
  token: string
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
      token: ''
    }
  }

  async init() {
    await this.queryVocabulary(['apple'])
  }

  async add(config: AddConfig) {
    if (!this.config.enable) {
      return
    }

    let { words } = config
    if (config.force) {
      words = await getNotebook()
    }
    if (!words || words.length === 0) {
      return
    }

    const spellings = Array.from(
      new Set(words.map(word => word.text.toLowerCase().trim()).filter(Boolean))
    )

    for (let start = 0; start < spellings.length; start += BATCH_SIZE) {
      const batch = spellings.slice(start, start + BATCH_SIZE)
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

      if (ids.length > 0) {
        await this.addWords(ids)
      }
    }
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

  private async addWords(ids: string[]) {
    const response = await this.request<{ added_count: number }>(
      'post',
      '/study/add_words',
      { words: ids.map(id => ({ id })), advance: true }
    )
    if (typeof response.added_count !== 'number') {
      throw new Error('response')
    }
  }

  private async request<T>(
    method: 'post',
    path: string,
    data: unknown
  ): Promise<T> {
    let response: { data: ApiResponse<T> }
    try {
      response = await axios({
        method,
        url: `${API_BASE_URL}${path}`,
        data,
        headers: {
          Authorization: `Bearer ${this.config.token}`
        }
      })
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('illegal_token')
      }
      if (error.response?.status === 429) {
        throw new Error('rate_limit')
      }
      throw new Error('network')
    }

    if (!response.data || !response.data.success) {
      throw new Error('response')
    }
    return response.data.data
  }
}
