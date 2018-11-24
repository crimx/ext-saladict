import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  getText,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
} from '../helpers'
import { DictSearchResult } from '@/typings/server'

export const getSrcPage: GetSrcPageFunction = (text) => {
  return `https://www.vocabulary.com/dictionary/${text}`
}

export interface VocabularyResult {
  short: string
  long: string
}

type VocabularySearchResult = DictSearchResult<VocabularyResult>

export const search: SearchFunction<VocabularySearchResult> = (
  text, config, payload
) => {
  return fetchDirtyDOM('https://www.vocabulary.com/dictionary/' + encodeURIComponent(text.replace(/\s+/g, ' ')))
    .catch(handleNetWorkError)
    .then(handleDOM)
}

function handleDOM (doc: Document): VocabularySearchResult | Promise<VocabularySearchResult> {
  const short = getText(doc, '.short')
  if (!short) { return handleNoResult() }

  const long = getText(doc, '.long')
  if (!long) { return handleNoResult() }

  return { result: { long, short } }
}
