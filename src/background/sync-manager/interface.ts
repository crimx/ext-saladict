import { Word } from '@/_helpers/record-manager'

export interface NotebookFile {
  timestamp: number
  words: Word[]
}

export interface DlResponse {
  json: NotebookFile
  etag: string
}

export interface AddConfig {
  readonly words?: ReadonlyArray<Readonly<Word>>
  /** Do not sync before upload */
  readonly force?: boolean
}

export interface DeleteConfig {
  readonly dates?: ReadonlyArray<number>
  /** Do not sync before upload */
  readonly force?: boolean
}

export interface DownloadConfig<Config = any> {
  /** Test connectivity. Do not update anything. */
  readonly testConfig?: Readonly<Config>
  /** ignore server 304 cache */
  readonly noCache?: boolean
}

export abstract class SyncService<Config = any, Meta = any> {
  static readonly id: string
  static readonly title: {
    readonly en: string
    readonly 'zh-CN': string
    readonly 'zh-TW': string
  }

  /** service config that is saved with browser sync storage */
  abstract config: Config
  /** service data that is saved with the database */
  meta?: Meta

  static getDefaultConfig() {
    return {}
  }

  static getDefaultMeta() {
    return {}
  }

  abstract init(config: Readonly<Config>): Promise<void>
  abstract add(config: AddConfig): Promise<void>
  async delete(config: DeleteConfig): Promise<void> {
    /* nothing */
  }

  async download(config: DownloadConfig): Promise<void> {
    /* nothing */
  }

  startInterval() {
    /* nothing */
  }
}
