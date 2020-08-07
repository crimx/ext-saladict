import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'WebDAV Word Syncing',
  error: {
    dir: 'Incorrect "Saladict" directory on server.',
    download:
      'Download failed. Unable to connect WebDAV Server. If browser proxy is enabled please adjust rules to bypass WebDAV server.',
    internal: 'Unable to save settings.',
    missing: 'Missing "Saladict" directory on server.',
    mkcol:
      'Cannot create "Saladict" directory on server. Please create the directory manualy on server.',
    network: 'Network error. Cannot connect to server.',
    parse: 'Incorrect response XML from server.',
    unauthorized: 'Incorrect account or password.'
  }
}
