import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: 'WebDAV 單字同步',
  error: {
    dir: '伺服器上“Saladict”目錄格式不正確，請檢查。',
    download:
      '下載失敗。無法訪問 WebDAV 伺服器。如啟用了瀏覽器代理請調整規則，不要代理 WebDAV 伺服器。',
    internal: '無法儲存。',
    missing: '伺服器上缺少“Saladict”目錄。',
    mkcol: '無法在伺服器建立“Saladict”目錄。請手動在伺服器上建立。',
    network: '連線伺服器失敗。',
    parse: '伺服器返回 XML 格式不正確。',
    unauthorized: '帳戶或密碼不正確。'
  }
}
