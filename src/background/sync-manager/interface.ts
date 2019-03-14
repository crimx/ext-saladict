import { Word } from '@/_helpers/record-manager'

export const enum UploadOp {
  Add,
  Delete,
}

export interface NotebookFile {
  timestamp: number
  words: Word[]
}

export interface DlResponse {
  json: NotebookFile
  etag: string
}

export interface UploadConfig {
  readonly word?: Readonly<Word>
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
    readonly 'en': string,
    readonly 'zh-CN': string,
    readonly 'zh-TW': string
  }
  abstract config: Config
  abstract meta?: Meta

  static getDefaultConfig () {
    return {}
  }
  static getDefaultMeta () {
    return {}
  }
  abstract init (config: Readonly<Config>): Promise<void>
  abstract upload (config: UploadConfig): Promise<void>
  abstract download (config: DownloadConfig): Promise<void>
  startInterval () {/* nothing */}
}
