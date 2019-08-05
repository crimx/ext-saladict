import axios from 'axios'
import {
  handleNoResult,
  MachineTranslateResult,
  SearchFunction,
  MachineTranslatePayload,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { isContainChinese, isContainJapanese } from '@/_helpers/lang-check'
import { storage } from '@/_helpers/browser-api'
import { fetchPlainText } from '@/_helpers/fetch-dom'

export const getSrcPage: GetSrcPageFunction = () => {
  return 'https://fanyi.caiyunapp.com/'
}

interface CaiyunStorage {
  // caiyun x-oauth token
  token: string
  // token added date, update the token after 15mins
  tokenDate: number
}

export type CaiyunResult = MachineTranslateResult<'caiyun'>

type CaiyunSearchResult = DictSearchResult<CaiyunResult>

const langcodes: ReadonlyArray<string> = ['zh', 'ja', 'en']

export const search: SearchFunction<
  CaiyunResult,
  MachineTranslatePayload
> = async (text, config, profile, payload) => {
  const options = profile.dicts.all.caiyun.options

  let sl: string =
    payload.sl ||
    (isContainJapanese(text) ? 'ja' : isContainChinese(text) ? 'zh' : 'en')

  let tl: string =
    payload.tl ||
    (options.tl === 'default'
      ? config.langCode.startsWith('zh')
        ? 'zh'
        : 'en'
      : options.tl)

  if (sl === tl) {
    if (isContainJapanese(text)) {
      sl = 'ja'
      if (tl === 'ja') {
        tl = config.langCode.startsWith('zh') ? 'zh' : 'en'
      }
    } else if (isContainChinese(text)) {
      sl = 'zh'
      if (tl === 'zh') {
        tl = 'en'
      }
    } else {
      sl = 'en'
      if (tl === 'en') {
        tl = 'zh'
      }
    }
  }

  if (payload.isPDF && !options.pdfNewline) {
    text = text.replace(/\n+/g, ' ')
  }

  return (
    axios
      .post('https://api.interpreter.caiyunai.com/v1/translator', {
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=UTF-8',
          DNT: '1',
          Origin: 'https://fanyi.caiyunapp.com',
          Referer: 'https://fanyi.caiyunapp.com/',
          'X-Authorization': await getToken()
        },
        withCredentials: false,
        responseType: 'json',
        data: JSON.stringify({
          media: 'text',
          os_type: 'web',
          request_id: 'web_fanyi',
          source: text,
          trans_type: `${sl}2${tl}`
        })
      })
      .then(({ data }) => handleJSON(data, sl, tl, text))
      // return empty result so that user can still toggle language
      .catch(
        (): CaiyunSearchResult => ({
          result: {
            id: 'caiyun',
            sl,
            tl,
            langcodes,
            searchText: { text: '' },
            trans: { text: '' }
          }
        })
      )
  )
}

function handleJSON(
  json: any,
  sl: string,
  tl: string,
  text: string
): CaiyunSearchResult | Promise<CaiyunSearchResult> {
  const trans: string | undefined = json && json.target
  if (!trans) {
    return handleNoResult()
  }

  return {
    result: {
      id: 'caiyun',
      sl,
      tl,
      langcodes,
      trans: {
        text: trans,
        audio: `http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(
          trans
        )}`
      },
      searchText: {
        text,
        audio: `http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(
          text
        )}`
      }
    },
    audio: {
      us: `http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text=${encodeURIComponent(
        trans
      )}`
    }
  }
}

async function getToken(): Promise<string> {
  let { dict_caiyun } = await storage.local.get<{ dict_caiyun: CaiyunStorage }>(
    'dict_caiyun'
  )
  if (!dict_caiyun || Date.now() - dict_caiyun.tokenDate > 15 * 60000) {
    let token = 'token:3975l6lr5pcbvidl6jl2'
    try {
      const homepage = await fetchPlainText('https://fanyi.caiyunapp.com')

      const appjsPath = (homepage.match(/\/static\/js\/app\.\w+\.js/) || [
        ''
      ])[0]
      if (appjsPath) {
        const appjs = await fetchPlainText(
          'https://fanyi.caiyunapp.com' + appjsPath
        )
        const matchRes = appjs.match(/token:\w+/)
        if (matchRes) {
          token = matchRes[0]
        }
      }
    } catch (e) {
      /* nothing */
    }
    dict_caiyun = {
      token,
      tokenDate: Date.now()
    }
    storage.local.set({ dict_caiyun })
  }

  return dict_caiyun.token
}
