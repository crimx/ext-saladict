import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'WebDAV 單字同步',
  error: {
    download: '下載失敗。無法訪問 WebDAV 伺服器。',
    internal: '無法儲存。',
    mkcol: '無法在伺服器建立“Saladict”目錄。請手動在伺服器上建立。',
    network: '連線伺服器失敗。',
    parse: '伺服器返回 XML 格式不正確。',
    unauthorized: '帳戶或密碼不正確。'
  }
}
