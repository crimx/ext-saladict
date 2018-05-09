import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainEnglish } from '@/_helpers/lang-check'

export type GoogleResult = string

export default function search (
  text: string,
  config: AppConfig,
): Promise<DictSearchResult<GoogleResult>> {
  const chCode = config.langCode === 'zh_TW' ? 'zh-TW' : 'zh-CN'
  let sl = 'auto'
  let tl = chCode
  if (isContainChinese(text)) {
    sl = chCode
    tl = 'en'
  } else if (isContainEnglish(text)) {
    sl = 'en'
    tl = chCode
  }
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`

  return fetch(url)
    .then(r => r.text())
    .then(handleText)
}

function handleText (text: string): DictSearchResult<GoogleResult> {
  const json = JSON.parse(text.replace(/,+/g, ','))

  if (!json[0] || json[0].length <= 0) {
    return handleNoResult()
  }

  const result: string = json[0].map(item => item[0]).join(' ')

  if (result.length > 0) {
    return { result }
  }

  return handleNoResult()
}

function handleNoResult (): any {
  return Promise.reject(new Error('No result'))
}
