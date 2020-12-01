import { locale as _locale } from './zh-CN'

export const locale: typeof _locale = {
  title: '歐陸單詞同步',
  open: '開啟',
  error: {
    login: '歐陸詞典token已過期，請點擊打開https://my.eudic.net/OpenAPI/Authorization 重新生成。',
    network: '無法訪問扇貝生字本，請檢查網路。',
    word: '無法新增到扇貝生字本，扇貝單字庫沒有收錄此單字。'
  }
}
