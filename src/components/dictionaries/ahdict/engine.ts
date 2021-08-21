import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  HTMLString,
  getText,
  getInnerHTML,
  handleNoResult,
  handleNetWorkError,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult
} from '../helpers'

export const getSrcPage: GetSrcPageFunction = text => {
  return `https://ahdictionary.com/word/search.html?q=${text}`
}

const HOST = 'https://ahdictionary.com'

interface Idiom {
  title?: string
  eg?: string
  tips?: string
}

interface AhdictResultItem {
  /** word */
  title: string
  /** pronunciation */
  pron?: string
  /** meaning and eg */
  meaning: HTMLString[]
  /** idiom and eg */
  idioms: Idiom[]
  origin?: HTMLString
  usageNote?: string
}

export type AhdictResult = AhdictResultItem[]

type AhdictSearchResult = DictSearchResult<AhdictResult>

export const search: SearchFunction<AhdictResult> = (
  text,
  config,
  profile,
  payload
) => {
  const options = profile.dicts.all.ahdict.options

  return fetchDirtyDOM(
    'https://ahdictionary.com/word/search.html?q=' +
      encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(doc => handleDOM(doc, options))
}

function handleDOM(
  doc: Document,
  { resultnum }: { resultnum: number }
): AhdictSearchResult | Promise<AhdictSearchResult> {
  const result: AhdictResult = []

  const tables = Array.from(doc.querySelectorAll('#results>table'))

  if (tables.length <= 0) {
    return handleNoResult()
  }

  for (let i = 0; i < tables.length && result.length < resultnum; i++) {
    const $panel = tables[i]
    const resultItem: AhdictResultItem = {
      title: '',
      meaning: [],
      idioms: []
    }

    const $rtseg = $panel.querySelector('.rtseg') as HTMLElement

    if ($rtseg) {
      const $rtsega = $panel.querySelectorAll('.rtseg>a')

      if ($rtsega[1] && $rtsega[1].getAttribute('href')) {
        resultItem.pron = `${HOST}${$rtsega[1].getAttribute('href')}`
      }

      resultItem.title = getText($rtsega[0], 'font')
    }

    const $pseg = Array.from($panel.querySelectorAll('.pseg'))

    $pseg.map(item => {
      resultItem.meaning.push(
        getInnerHTML(HOST, item).replace(/<\/?(span|font)[^>]*>/g, '')
      )
    })

    const $idmseg = Array.from($panel.querySelectorAll('.idmseg'))

    if ($idmseg.length) {
      $idmseg.map(item => {
        const idiom = {} as Idiom
        idiom.title = getText(item, 'b')
        idiom.eg = getText(item, '.ds-single')
        idiom.tips = getText(item, 'span+i')

        resultItem.idioms.push(idiom)
      })
    }

    // 获取该条信息来源
    const $etyseg = $panel.querySelector('.etyseg') as HTMLElement

    if ($etyseg) {
      resultItem.origin = getInnerHTML(HOST, $etyseg).replace(
        /<\/?(span|font)[^>]*>/g,
        ''
      )
    }

    // 获取使用说明
    const $usen = $panel.querySelector('.usen') as HTMLElement

    if ($usen) {
      resultItem.usageNote = getInnerHTML(HOST, $usen).replace(
        /<\/?(span|font|i)[^>]*>/g,
        ''
      )
    }

    result.push(resultItem)
  }

  if (result.length > 0) {
    return { result }
  } else {
    return handleNoResult()
  }
}
