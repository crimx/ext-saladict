import { handleNoResult, MachineTranslateResult, handleNetWorkError } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'
import { isContainChinese, isContainJapanese, isContainKorean } from '@/_helpers/lang-check'

export type SogouResult = MachineTranslateResult

type SogouSearchResult = DictSearchResult<SogouResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<SogouSearchResult> {
  const options = config.dicts.all.sogou.options

  const sl = 'auto'
  const tl = options.tl === 'default'
    ? config.langCode === 'en'
      ? 'en'
      : !isContainChinese(text) || isContainJapanese(text) || isContainKorean(text)
        ? config.langCode === 'zh-TW' ? 'zh-CHT' : 'zh-CHS'
        : 'en'
    : options.tl

  return fetch('https://fanyi.sogou.com/reventondc/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Requested-With': 'XMLHttpRequest',
    },
    body: `from=${sl}&to=${tl}&text=${encodeURIComponent(text)}&uuid=${getUUID()}&client=pc&fr=browser_pc&useDetect=on&useDetectResult=on&needQc=1&oxford=on&isReturnSugg=on`
  })
  .then(r => r.json())
  .catch(handleNetWorkError)
  .then(handleJSON)
}

function handleJSON (json: any): SogouSearchResult | Promise<SogouSearchResult> {
  const tr = json.translate as undefined | {
    errorCode: string // "0"
    from: string
    to: string
    text: string
    dit: string
  }
  if (!tr || tr.errorCode !== '0') {
    return handleNoResult()
  }

  return {
    result: {
      trans: {
        text: tr.dit,
        audio: tr.to === 'zh-CHT'
          ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.dit)}&spokenDialect=zh-CHT&from=translateweb`
          : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.dit)}&speed=1&lang=${tr.to}&from=translateweb`
      },
      searchText: {
        text: tr.text,
        audio: tr.from === 'zh-CHT'
        ? `https://fanyi.sogou.com/reventondc/microsoftGetSpeakFile?text=${encodeURIComponent(tr.text)}&spokenDialect=zh-CHT&from=translateweb`
        : `https://fanyi.sogou.com/reventondc/synthesis?text=${encodeURIComponent(tr.text)}&speed=1&lang=${tr.from}&from=translateweb`
      }
    }
  }
}

function getUUID () {
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    const digit = (16 * Math.random()) | 0
    uuid += (i === 12 ? 4 : i === 16 ? (3 & digit) | 8 : digit).toString(16)
  }
  return uuid
}
