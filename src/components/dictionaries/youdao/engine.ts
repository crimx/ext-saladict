import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { reflect } from '@/_helpers/promise-more'
import { getText, getInnerHTMLThunk, handleNoResult, HTMLString } from '../helpers'
import { AppConfig, DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('http://www.youdao.com/')

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

export default function search (
  text: string,
  config: AppConfig,
): Promise<YoudaoSearchResult> {
  const options = config.dicts.all.youdao.options

  return fetchDirtyDOM('http://www.youdao.com/w/' + text)
    .then(doc => checkResult(doc, options))
}

function checkResult (
  doc: Document,
  options: DictConfigs['youdao']['options'],
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options)
  } else if (options.related) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML($typo)
      }
    }
  }
  return handleNoResult()
}

function handleDOM (
  doc: Document,
  options: DictConfigs['youdao']['options'],
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const result: YoudaoResult = {
    type: 'lex',
    title: getText(doc, '.keyword'),
    stars: 0,
    rank: getText(doc, '.rank'),
    pattern: getText(doc, '.pattern'),
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
      const url = 'http://dict.youdao.com/dictvoice?audio=' + $voice.dataset.rel

      result.prons.push({ phsym, url })

      if (phsym.includes('英')) {
        audio.uk = url
      } else if (phsym.includes('美')) {
        audio.us = url
      }
    }
  })

  if (options.basic) {
    result.basic = getInnerHTML(doc, '#phrsListTab .trans-container')
  }

  if (options.collins) {
    result.collins = getInnerHTML(doc, '#collinsResult .ol')
  }

  if (options.discrimination) {
    result.discrimination = getInnerHTML(doc, '#discriminate')
  }

  if (options.sentence) {
    result.sentence = getInnerHTML(doc, '#authority .ol')
  }

  if (options.translation) {
    result.translation = getInnerHTML(doc, '#fanyiToggle .trans-container')
  }

  if (result.title || result.translation) {
    return { result, audio }
  }
  return handleNoResult()
}
