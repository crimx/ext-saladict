import { SearchFunction } from '../helpers'
import { DictSearchResult } from '@/typings/server'
import { moedictSearch, GuoYuResult } from '../guoyu/engine'

export type LiangAnResult = GuoYuResult

export const search: SearchFunction<DictSearchResult<LiangAnResult>> = (
  text, config, payload
) => {
  return moedictSearch<LiangAnResult>('c', encodeURIComponent(text.replace(/\s+/g, '')), config)
    .then(result => {
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
