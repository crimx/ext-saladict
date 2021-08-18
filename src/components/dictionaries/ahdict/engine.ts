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
  title: string
  eg: string
  tips?: string
}

interface AhdictResultItem {
  /** keyword */
  title: string
  /** keyword No */
  sup?: string
  /** meaning and eg */
  meaning?: HTMLString[]
  /** pronunciation */
  pron?: {
    title: string
    src: string
  }
  /** idiom and eg */
  idioms?: Idiom[]
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

function handleDOM(doc: Document, opt) {
  const result: AhdictResult = []

  const tables = Array.from(doc.querySelectorAll('#results>table'))

  if (tables.length <= 0) {
    return handleNoResult()
  }

  // console.log(tables, "==");

  for (let i = 0; i < tables.length; i++) {
    const $panel = tables[i]
    const resultItem: AhdictResultItem = {
      title: '',
      pron: { title: '', src: '' }
    }

    const titleFigure = getText($panel.querySelector('.rtseg font'), 'font')

    const $words = $panel.querySelector('.rtseg')

    if ($words && resultItem.pron) {
      const title = getInnerHTML(HOST, $words)
        .replace(/<a(.*)[^>]?(.*)<\/a>/g, '')
        .replace(/<div(.*)[^>]*(.*)<\/div>/g, '')
      // .replace(/<\/?(font)[^>]*>/g, '')

      resultItem.pron.title = title
      // 获取音频
      const voice = $panel.querySelectorAll('.rtseg>a')

      if (voice[1] && voice[1].getAttribute('href')) {
        // resultItem.pron.src = `${HOST}${voice[1].getAttribute('href')}`
        resultItem.pron.src = voice[1].getAttribute('href') || ''
      }
    }

    // 获取title和sup
    resultItem.title = titleFigure.split(' ')[0]
    resultItem.sup = titleFigure.split(' ')[1]

    // 获取词条词性和例句
    resultItem.meaning = []
    const $pseg = Array.from($panel.querySelectorAll('.pseg'))

    $pseg.map(item => {
      resultItem.meaning &&
        resultItem.meaning.push(
          getInnerHTML(HOST, item).replace(/<\/?(span|font)[^>]*>/g, '')
        )
    })

    // 获取俗语相关
    resultItem.idioms = []
    const $idioms = Array.from($panel.querySelectorAll('.idmseg'))

    if ($idioms.length) {
      $idioms.map(item => {
        const idiom = {} as Idiom
        idiom.title = getText(item, 'b')
        idiom.eg = getText(item, '.ds-single')
        idiom.tips = getText(item, 'span+i')

        resultItem.idioms && resultItem.idioms.push(idiom)
      })
    }

    // resultItem.cdef = titleFigure;

    const $defs = Array.from($panel.querySelectorAll('.pseg'))

    // 获取该条信息来源
    const $etyseg = $panel.querySelector('.etyseg')

    if ($etyseg) {
      resultItem.origin = getInnerHTML(HOST, $etyseg).replace(
        /<\/?(span|font)[^>]*>/g,
        ''
      )
    }

    const $usenote = $panel.querySelector('.usen')

    if ($usenote) {
      // 获取使用笔记来源
      resultItem.usageNote = getInnerHTML(HOST, $usenote).replace(
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
