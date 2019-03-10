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
  return `https://www.shanbay.com/bdc/mobile/preview/word?word=${text}`
}

const getInnerHTML = getInnerHTMLBuilder('http://www.shanbay.com/')

const getSanitizedHTML = (text) => { // 通过装 string 转换到 dom 的方式进行 sanitize 太绕了，后续考虑优化
  return getInnerHTML((new DOMParser().parseFromString(
    text,
    'text/html',
  )).body)
}

export interface ShanbayResultLex {
  type: 'lex'
  title: string
  pattern: string
  prons: Array<{
    phsym: string
    url: string
  }>
  basic?: HTMLString
  wordId?: string | null
  sentences: Array<{
    annotation: string,
    translation: string,
  }>,
  translation?: HTMLString
  id: 'shanbay'
}

export type ShanbayResult = ShanbayResultLex

type ShanbaySearchResult = DictSearchResult<ShanbayResult>

export const search: SearchFunction<ShanbaySearchResult> = (
  text, config, profile,
) => {
  const options = profile.dicts.all.shanbay.options
  return fetchDirtyDOM('https://www.shanbay.com/bdc/mobile/preview/word?word=' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options))
}

function checkResult (
  doc: Document,
  options: DictConfigs['shanbay']['options'],
): ShanbaySearchResult | Promise<ShanbaySearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options)
  }
  return handleNoResult()
}

function loadSentences (id: string) {
  return fetch(`https://www.shanbay.com/api/v1/bdc/example/?vocabulary_id=${id}&type=sys`)
  .then(r => r.ok ? r.json() : Promise.reject(r))
  .then(({ data } = {}) => {
    if (Array.isArray(data)) {
      return data.map((sentence: {
        annotation: string,
        translation: string,
      }) => {
        return {
          annotation: getSanitizedHTML(sentence.annotation),
          translation: getSanitizedHTML(sentence.translation),
        }
      })
    }
    return []
  })
}

async function handleDOM (
  doc: Document,
  options: DictConfigs['shanbay']['options'],
): Promise<ShanbaySearchResult> {
  const word = doc.querySelector('.word-spell')
  const result: ShanbayResult = {
    id: 'shanbay',
    type: 'lex',
    title: getText(doc, '.word-spell'),
    pattern: getText(doc, '.pattern'),
    prons: [],
  }

  const audio: { uk: string, us: string } = {
    uk: 'http://media.shanbay.com/audio/uk/' + result.title + '.mp3',
    us: 'http://media.shanbay.com/audio/us/' + result.title + '.mp3',
  }

  result.prons.push({
    phsym: getText(doc, '.word-announace'),
    url: audio.us,
  })

  if (options.basic) {
    result.basic = getInnerHTML(doc, '.definition-cn')
  }

  result.wordId = word && word.getAttribute('data-id')
  if (options.sentence && result.wordId) {
    result.sentences = await loadSentences(result.wordId)
  }

  if (result.title) {
    return { result, audio }
  }
  return handleNoResult()
}
