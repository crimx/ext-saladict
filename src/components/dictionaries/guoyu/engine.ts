import {
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getChsToChz
} from '../helpers'
import { AppConfig } from '@/app-config'
import axios from 'axios'
import { Profile } from '@/app-config/profiles'

export const getSrcPage: GetSrcPageFunction = async text => {
  const transform = await getChsToChz()
  return `https://www.moedict.tw/${transform(text)}`
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
      type: string
      /** Meaning */
      f: string
      /** Homophones */
      l?: string[]
      /** Examples */
      e?: string[]
      /** Quotes */
      q?: string[]
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

export const search: SearchFunction<GuoYuResult> = (
  text,
  config,
  profile,
  payload
) => {
  return moedictSearch<GuoYuResult>(
    'a',
    text,
    config,
    profile.dicts.all.guoyu.options
  )
}

export async function moedictSearch<R extends GuoYuResult>(
  moedictID: string,
  text: string,
  config: AppConfig,
  options: Profile['dicts']['all']['guoyu']['options']
): Promise<DictSearchResult<R>> {
  const chsToChz = await getChsToChz()
  const { data } = await axios
    .get<R>(
      `https://www.moedict.tw/${moedictID}/${encodeURIComponent(
        chsToChz(text.replace(/\s+/g, ''))
      )}.json`
    )
    .catch(handleNetWorkError)

  if (!data || !data.h) {
    return handleNoResult()
  }

  if (!options.trans) {
    data.translation = undefined
  }

  const result: DictSearchResult<R> = { result: data }

  for (const h of data.h) {
    if (h['=']) {
      h[
        '='
      ] = `https://203146b5091e8f0aafda-15d41c68795720c6e932125f5ace0c70.ssl.cf1.rackcdn.com/${h['=']}.ogg`
    }
    if (!result.audio) {
      result.audio = {
        py: h['=']
      }
    }
  }

  return result
}
