import {
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import chsToChz from '@/_helpers/chs-to-chz'
import { moedictSearch, GuoYuResult } from '../guoyu/engine'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.moedict.tw/~${chsToChz(text)}`
}

export type LiangAnResult = GuoYuResult

export const search: SearchFunction<LiangAnResult> = (
  text,
  config,
  profile,
  payload
) => {
  return moedictSearch<LiangAnResult>(
    'c',
    encodeURIComponent(text.replace(/\s+/g, '')),
    config
  ).then(result => {
    if (result.result.h) {
      result.result.h.forEach(h => {
        if (h.p) {
          h.p = h.p.replace('<br>陸⃝', ' [大陆]: ')
        }
      })
    }
    return result
  })
}
