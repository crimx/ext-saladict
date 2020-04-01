import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  getText,
  getInnerHTML,
  handleNoResult,
  HTMLString,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getChsToChz
} from '../helpers'
import { DictConfigs } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://dict.youdao.com/w/eng/${text}`
}

const HOST = 'http://www.youdao.com'

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

export const search: SearchFunction<YoudaoResult> = async (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.youdao.options
  const transform = await getChsToChz(config.langCode)

  return fetchDirtyDOM(
    'https://dict.youdao.com/w/' + encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options, transform))
}

function checkResult(
  doc: Document,
  options: DictConfigs['youdao']['options'],
  transform: null | ((text: string) => string)
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options, transform)
  } else if (options.related) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML(HOST, $typo, { transform })
      }
    }
  }
  return handleNoResult()
}

function handleDOM(
  doc: Document,
  options: DictConfigs['youdao']['options'],
  transform: null | ((text: string) => string)
): YoudaoSearchResult | Promise<YoudaoSearchResult> {
  const result: YoudaoResult = {
    type: 'lex',
    title: getText(doc, '.keyword', transform),
    stars: 0,
    rank: getText(doc, '.rank'),
    pattern: getText(doc, '.pattern', transform),
    prons: []
  }

  const audio: { uk?: string; us?: string } = {}

  const $star = doc.querySelector('.star')
  if ($star) {
    result.stars = Number(($star.className.match(/\d+/) || [0])[0])
  }

  doc.querySelectorAll('.baav .pronounce').forEach($pron => {
    const phsym = $pron.textContent || ''
    const $voice = $pron.querySelector<HTMLAnchorElement>('.dictvoice')
    if ($voice && $voice.dataset.rel) {
      const url =
        'https://dict.youdao.com/dictvoice?audio=' + $voice.dataset.rel

      result.prons.push({ phsym, url })

      if (phsym.includes('英')) {
        audio.uk = url
      } else if (phsym.includes('美')) {
        audio.us = url
      }
    }
  })

  if (options.basic) {
    result.basic = getInnerHTML(HOST, doc, {
      selector: '#phrsListTab .trans-container',
      transform
    })
  }

  if (options.collins) {
    result.collins = getInnerHTML(HOST, doc, {
      selector: '#collinsResult .ol',
      transform
    })
  }

  if (options.discrimination) {
    result.discrimination = getInnerHTML(HOST, doc, {
      selector: '#discriminate',
      transform
    })
  }

  if (options.sentence) {
    result.sentence = getInnerHTML(HOST, doc, {
      selector: '#authority .ol',
      transform
    })
  }

  if (options.translation) {
    result.translation = getInnerHTML(HOST, doc, {
      selector: '#fanyiToggle .trans-container',
      transform
    })
  }

  if (result.title || result.translation) {
    return { result, audio }
  }
  return handleNoResult()
}
