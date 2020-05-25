import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'WebDAV',
  error: {
    download: 'Download failed. Unable to connect WebDAV Server.',
    internal: 'Unable to save settings.',
    mkcol:
      'Cannot create "Saladict" directory on server. Please create the directory manualy on server.',
    network: 'Network error. Cannot connect to server.',
    parse: 'Incorrect response XML from server.',
    unauthorized: 'Incorrect account or password.'
  }
}
