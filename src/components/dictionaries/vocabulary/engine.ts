import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { getText, handleNoResult, handleNetWorkError } from '../helpers'
import { AppConfig } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

export interface VocabularyResult {
  short: string
  long: string
}

type VocabularySearchResult = DictSearchResult<VocabularyResult>

export default function search (
  text: string,
  config: AppConfig,
): Promise<VocabularySearchResult> {
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
