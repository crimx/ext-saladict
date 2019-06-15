import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  getText,
  getInnerHTMLBuilder,
  handleNoResult,
  HTMLString,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://dict.youdao.com/w/eng/${text}`
}

const getInnerHTML = getInnerHTMLBuilder('http://www.youdao.com/')

export interface YoudaoResultLex {
  type: 'lex'
  title: string
  stars: number
  rank: string
  pattern: string
  prons: Array<{
    phsym: string
    url: string
  }>
  basic?: HTMLString
  collins?: HTMLString
  discrimination?: HTMLString
  sentence?: HTMLString
  translation?: HTMLString
}

export interface YoudaoResultRelated {
  type: 'related'
  list: HTMLString
}

export type YoudaoResult = YoudaoResultLex | YoudaoResultRelated

type YoudaoSearchResult = DictSearchResult<YoudaoResult>

export const search: SearchFunction<YoudaoSearchResult> = (
  text, config, profile, payload
) => {
  const options = profile.dicts.all.youdao.options
  const isChz = config.langCode === 'zh-TW'

  return fetchDirtyDOM('https://dict.youdao.com/w/' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options, isChz))
}

function checkResult (
  doc: Document,
  options: DictConfigs['youdao']['options'],
  isChz: boolean,
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options, isChz)
  } else if (options.related) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML($typo, isChz)
      }
    }
  }
  return handleNoResult()
}

function handleDOM (
  doc: Document,
  options: DictConfigs['youdao']['options'],
  isChz: boolean,
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const result: YoudaoResult = {
    type: 'lex',
    title: getText(doc, '.keyword', isChz),
    stars: 0,
    rank: getText(doc, '.rank'),
    pattern: getText(doc, '.pattern', isChz),
    prons: [],
  }

  const audio: { uk?: string, us?: string } = {}

  const $star = doc.querySelector('.star')
  if ($star) {
    result.stars = Number(($star.className.match(/\d+/) || [0])[0])
  }

  doc.querySelectorAll('.baav .pronounce').forEach($pron => {
    const phsym = $pron.textContent || ''
    const $voice = $pron.querySelector<HTMLAnchorElement>('.dictvoice')
    if ($voice && $voice.dataset.rel) {
      const url = 'https://dict.youdao.com/dictvoice?audio=' + $voice.dataset.rel

      result.prons.push({ phsym, url })

      if (phsym.includes('英')) {
        audio.uk = url
      } else if (phsym.includes('美')) {
        audio.us = url
      }
    }
  })

  if (options.basic) {
    result.basic = getInnerHTML(doc, '#phrsListTab .trans-container', isChz)
  }

  if (options.collins) {
    result.collins = getInnerHTML(doc, '#collinsResult .ol', isChz)
  }

  if (options.discrimination) {
    result.discrimination = getInnerHTML(doc, '#discriminate', isChz)
  }

  if (options.sentence) {
    result.sentence = getInnerHTML(doc, '#authority .ol', isChz)
  }

  if (options.translation) {
    result.translation = getInnerHTML(doc, '#fanyiToggle .trans-container', isChz)
  }

  if (result.title || result.translation) {
    return { result, audio }
  }
  return handleNoResult()
}
