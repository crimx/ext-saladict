import { handleNoResult, handleNetWorkError, SearchFunction, GetSrcPageFunction } from '../helpers'
import chsToChz from '@/_helpers/chs-to-chz'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://www.moedict.tw/${chsToChz(text)}`
}

/** @see https://github.com/audreyt/moedict-webkit#4-國語-a */
export interface GuoYuResult {
  n: number
  /** Title */
  t: string
  r: string
  c: number
  h?: Array<{
    /** Definitions */
    d: Array<{
      /** Title */
      type: string,
      /** Meaning */
      f: string
      /** Homophones */
      l?: string[],
      /** Examples */
      e?: string[],
      /** Quotes */
      q?: string[],
    }>
    /** Pinyin */
    p: string
    /** Audio ID */
    '='?: string
  }>
  translation?: {
    francais?: string[]
    Deutsch?: string[]
    English?: string[]
  }
}

export const search: SearchFunction<DictSearchResult<GuoYuResult>> = (
  text, config, profile, payload
) => {
  return moedictSearch<GuoYuResult>('a', encodeURIComponent(text.replace(/\s+/g, '')), config)
}

export function moedictSearch<R extends GuoYuResult> (
  moedictID: string,
  text: string,
  config: AppConfig
): Promise<DictSearchResult<R>> {
  return fetch(`https://www.moedict.tw/${moedictID}/${chsToChz(text)}.json`)
    .then<R>(res => res.json())
    .catch(handleNetWorkError)
    .then<DictSearchResult<R>>(data => {
      if (!data || !data.h) { return handleNoResult() }

      const result: DictSearchResult<R> = { result: data }

      data.h.forEach(h => {
        if (h['=']) {
          h['='] = `https://203146b5091e8f0aafda-15d41c68795720c6e932125f5ace0c70.ssl.cf1.rackcdn.com/${h['=']}.ogg`
        }
        if (!result.audio) {
          result.audio = {
            py: h['=']
          }
        }
      })

      return result
    })
}
