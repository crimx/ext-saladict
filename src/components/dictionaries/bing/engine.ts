import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import {
  handleNoResult,
  handleNetWorkError,
  getText,
  getInnerHTML,
  getFullLink,
  SearchFunction,
  GetSrcPageFunction,
  DictSearchResult,
  getChsToChz
} from '../helpers'
import { DictConfigs } from '@/app-config'

export const getSrcPage: GetSrcPageFunction = text =>
  'https://cn.bing.com/dict/search?q=' +
  encodeURIComponent(text.replace(/\s+/g, ' '))

const HOST = 'https://cn.bing.com'

const DICT_LINK =
  'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q='

const AUDIO_DATA_ATTRS = [
  'data-pronunciation',
  'data-mp3link',
  'audiomd5'
] as const

/** Lexical result */
export interface BingResultLex {
  type: 'lex'
  title: string
  /** phonetic symbols */
  phsym?: Array<{
    /** Phonetic Alphabet, UK|US|PY */
    lang: string
    /** pronunciation */
    pron: string
  }>
  /** common definitions */
  cdef?: Array<{
    /** part of speech */
    pos: string
    /** definition */
    def: string
  }>
  /** infinitive */
  infs?: string[]
  sentences?: Array<{
    en?: string
    chs?: string
    source?: string
    mp3?: string
  }>
}

/** Alternate machine translation result */
export interface BingResultMachine {
  type: 'machine'
  /** machine translation */
  mt: string
}

/** Alternate result */
export interface BingResultRelated {
  type: 'related'
  title: string
  defs: Array<{
    title: string
    meanings: Array<{
      href: string
      word: string
      def: string
    }>
  }>
}

export type BingResult = BingResultLex | BingResultMachine | BingResultRelated

type BingConfig = DictConfigs['bing']

type BingSearchResultLex = DictSearchResult<BingResultLex>
type BingSearchResultMachine = DictSearchResult<BingResultMachine>
type BingSearchResultRelated = DictSearchResult<BingResultRelated>

export const search: SearchFunction<BingResult> = (
  text,
  config,
  profile,
  payload
) => {
  const bingConfig = profile.dicts.all.bing

  return fetchDirtyDOM(
    DICT_LINK + encodeURIComponent(text.replace(/\s+/g, ' '))
  )
    .catch(handleNetWorkError)
    .then(async doc => {
      const transform = await getChsToChz(config.langCode)

      if (doc.querySelector('.client_def_hd_hd')) {
        return handleLexResult(doc, bingConfig.options, transform)
      }

      if (doc.querySelector('.client_trans_head')) {
        return handleMachineResult(doc, transform)
      }

      if (bingConfig.options.related) {
        if (doc.querySelector('.client_do_you_mean_title_bar')) {
          return handleRelatedResult(doc, bingConfig, transform)
        }
      }

      return handleNoResult<DictSearchResult<BingResult>>()
    })
}

function getAudioFromOnclick(el: Element): string {
  const onclick = el.getAttribute('onclick') || ''
  const match = onclick.match(
    /((?:https?:)?\/\/[^'")\s]+\.mp3(?:\?[^'")\s]*)?|\/[^'")\s]+\.mp3(?:\?[^'")\s]*)?)/
  )

  if (!match) {
    return ''
  }

  return new URL(match[1], HOST).href
}

function getBingAudioURL(parent: ParentNode | null): string {
  if (!parent) {
    return ''
  }

  const candidates: Element[] = []
  if (parent instanceof Element) {
    candidates.push(parent)
  }
  candidates.push(
    ...Array.from(
      parent.querySelectorAll(
        '[data-pronunciation], [data-mp3link], [audiomd5], [onclick]'
      )
    )
  )

  for (const el of candidates) {
    for (const attr of AUDIO_DATA_ATTRS) {
      if (el.hasAttribute(attr)) {
        return getFullLink(HOST, el, attr)
      }
    }

    const audio = getAudioFromOnclick(el)
    if (audio) {
      return audio
    }
  }

  return ''
}

function replaceWithText($target: Element, text: string): void {
  $target.replaceWith($target.ownerDocument.createTextNode(text))
}

function replaceWithHighlightedText($target: Element, text: string): void {
  const $span = $target.ownerDocument.createElement('span')
  $span.className = 'dictBing-SentenceItem_HL'
  $span.textContent = text
  $target.replaceWith($span)
}

function handleLexResult(
  doc: Document,
  options: BingConfig['options'],
  transform: null | ((text: string) => string)
): BingSearchResultLex | Promise<BingSearchResultLex> {
  const searchResult: DictSearchResult<BingResultLex> = {
    result: {
      type: 'lex',
      title: getText(doc, '.client_def_hd_hd', transform)
    }
  }

  // pronunciation
  if (options.phsym) {
    const $prons = Array.from(doc.querySelectorAll('.client_def_hd_pn_list'))
    if ($prons.length > 0) {
      searchResult.result.phsym = $prons.map(el => {
        return {
          lang: getText(el, '.client_def_hd_pn'),
          pron: getBingAudioURL(el)
        }
      })

      searchResult.audio = searchResult.result.phsym.reduce(
        (audio, { lang, pron }) => {
          if (/us|美/i.test(lang)) {
            audio['us'] = pron
          } else if (/uk|英/i.test(lang)) {
            audio['uk'] = pron
          }
          return audio
        },
        {}
      )
    }
  }

  // definitions
  if (options.cdef) {
    const $container = doc.querySelector('.client_def_container')
    if ($container) {
      const $defs = Array.from($container.querySelectorAll('.client_def_bar'))
      if ($defs.length > 0) {
        searchResult.result.cdef = $defs.map(el => ({
          pos: getText(el, '.client_def_title_bar', transform),
          def: getText(el, '.client_def_list', transform)
        }))
      }
    }
  }

  // tense
  if (options.tense) {
    const $infs = Array.from(doc.querySelectorAll('.client_word_change_word'))
    if ($infs.length > 0) {
      searchResult.result.infs = $infs.map(el => (el.textContent || '').trim())
    }
  }

  if (options.sentence > 0) {
    const $sens = doc.querySelectorAll('.client_sentence_list')
    const sentences: typeof searchResult.result.sentences = []
    for (
      let i = 0;
      i < $sens.length && sentences.length < options.sentence;
      i++
    ) {
      const el = $sens[i]
      el.querySelectorAll('.client_sen_en_word').forEach($word => {
        replaceWithText($word, getText($word))
      })
      el.querySelectorAll('.client_sen_cn_word').forEach($word => {
        replaceWithText($word, getText($word, transform))
      })
      el.querySelectorAll('.client_sentence_search').forEach($word => {
        replaceWithHighlightedText($word, getText($word))
      })
      sentences.push({
        en: getInnerHTML(HOST, el, '.client_sen_en'),
        chs: getInnerHTML(HOST, el, {
          selector: '.client_sen_cn',
          transform
        }),
        source: getText(el, '.client_sentence_list_link'),
        mp3: getBingAudioURL(el)
      })
    }
    searchResult.result.sentences = sentences
  }

  if (Object.keys(searchResult.result).length > 2) {
    return searchResult
  }
  return handleNoResult()
}

function handleMachineResult(
  doc: Document,
  transform: null | ((text: string) => string)
): BingSearchResultMachine | Promise<BingSearchResultMachine> {
  const mt = getText(doc, '.client_sen_cn', transform)

  if (mt) {
    return {
      result: {
        type: 'machine',
        mt
      }
    }
  }

  return handleNoResult()
}

function handleRelatedResult(
  doc: Document,
  config: BingConfig,
  transform: null | ((text: string) => string)
): BingSearchResultRelated | Promise<BingSearchResultRelated> {
  const searchResult: DictSearchResult<BingResultRelated> = {
    result: {
      type: 'related',
      title: getText(doc, '.client_do_you_mean_title_bar', transform),
      defs: []
    }
  }

  doc.querySelectorAll('.client_do_you_mean_area').forEach($area => {
    const $defsList = $area.querySelectorAll('.client_do_you_mean_list')
    if ($defsList.length > 0) {
      searchResult.result.defs.push({
        title: getText($area, '.client_do_you_mean_title', transform),
        meanings: Array.from($defsList).map($list => {
          const word = getText(
            $list,
            '.client_do_you_mean_list_word',
            transform
          )
          return {
            href: `https://cn.bing.com/dict/search?q=${word}`,
            word,
            def: getText($list, '.client_do_you_mean_list_def', transform)
          }
        })
      })
    }
  })

  if (searchResult.result.defs.length > 0) {
    return searchResult
  }
  return handleNoResult()
}
