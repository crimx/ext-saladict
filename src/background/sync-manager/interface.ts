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

export interface SyncServiceConfigBase {
  enable: boolean
}

export abstract class SyncService<
  Config extends SyncServiceConfigBase = any,
  Meta = any
> {
  static readonly id: string

  /**
   * Service config that is saved with browser sync storage.
   * It is updated automatically.
   */
  config: Config
  /** service data that is saved with the database */
  meta?: Meta

  static getDefaultConfig() {
    return {}
  }

  static getDefaultMeta() {
    return {}
  }

  constructor(config: Config) {
    this.config = config
  }

  /** Called when user updates config. Check env, save config etc */
  abstract init(): Promise<void>
  /** add words */
  abstract add(config: AddConfig): Promise<void>
  /** delete words */
  async delete(config: DeleteConfig): Promise<void> {}
  /** Clean up side-effects */
  async destroy() {}
  /** Download code */
  async download(config: DownloadConfig): Promise<void> {}
  /** Called on browser start */
  startInterval() {}
}

type SyncServiceAbstractClass = typeof SyncService
export interface SyncServiceConstructor extends SyncServiceAbstractClass {}
