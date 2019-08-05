import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  getText,
  getInnerHTML,
  handleNoResult,
  HTMLString,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'
import { DictConfigs } from '@/app-config'
import axios from 'axios'
import DOMPurify from 'dompurify'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://www.shanbay.com/bdc/mobile/preview/word?word=${text}`
}

const HOST = 'http://www.shanbay.com'

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
    annotation: string
    translation: string
  }>
  translation?: HTMLString
  id: 'shanbay'
}

export type ShanbayResult = ShanbayResultLex

type ShanbaySearchResult = DictSearchResult<ShanbayResult>

export const search: SearchFunction<ShanbayResult> = (
  text,
  config,
  profile
) => {
  const options = profile.dicts.all.shanbay.options
  return fetchDirtyDOM(
    'https://www.shanbay.com/bdc/mobile/preview/word?word=' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => checkResult(doc, options))
}

function checkResult(
  doc: Document,
  options: DictConfigs['shanbay']['options']
): ShanbaySearchResult | Promise<ShanbaySearchResult> {
  const $typo = doc.querySelector('.error-typo')
  if (!$typo) {
    return handleDOM(doc, options)
  }
  return handleNoResult()
}

function loadSentences(id: string) {
  return axios
    .get(
      `https://www.shanbay.com/api/v1/bdc/example/?vocabulary_id=${id}&type=sys`
    )
    .then(({ data: { data } }) => {
      if (Array.isArray(data)) {
        return data.map(
          (sentence: { annotation: string; translation: string }) => {
            return {
              annotation: DOMPurify.sanitize(sentence.annotation),
              translation: DOMPurify.sanitize(sentence.translation)
            }
          }
        )
      }
      return []
    })
}

async function handleDOM(
  doc: Document,
  options: DictConfigs['shanbay']['options']
): Promise<ShanbaySearchResult> {
  const word = doc.querySelector('.word-spell')
  const result: ShanbayResult = {
    id: 'shanbay',
    type: 'lex',
    title: getText(doc, '.word-spell'),
    pattern: getText(doc, '.pattern'),
    prons: [],
    sentences: []
  }

  const audio: { uk: string; us: string } = {
    uk: 'http://media.shanbay.com/audio/uk/' + result.title + '.mp3',
    us: 'http://media.shanbay.com/audio/us/' + result.title + '.mp3'
  }

  result.prons.push({
    phsym: getText(doc, '.word-announace'),
    url: audio.us
  })

  if (options.basic) {
    result.basic = getInnerHTML(HOST, doc, '.definition-cn')
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
