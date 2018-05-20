import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { handleNoResult } from '../helpers'
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
  return fetchDirtyDOM('https://www.vocabulary.com/dictionary/' + text)
    .then(handleDom)
}

function handleDom (doc: Document): VocabularySearchResult | Promise<VocabularySearchResult> {
  const $short = doc.querySelector('.short')
  if (!$short) { return handleNoResult() }
  const short = $short.textContent

  const $long = doc.querySelector('.long')
  if (!$long) { return handleNoResult() }
  const long = $long.textContent

  if (short && long) {
    return { result: { long, short } }
  }

  return handleNoResult()
}
