import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'
import { moedictSearch, GuoYuResult } from '../guoyu/engine'

export type LiangAnResult = GuoYuResult

export default function search (
  text: string,
  config: AppConfig
): Promise<DictSearchResult<LiangAnResult>> {
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
