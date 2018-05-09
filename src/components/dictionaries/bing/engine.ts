import fetchDOM from '../../../_helpers/fetch-dom'
import { AppConfig, DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const DICT_LINK = 'https://cn.bing.com/dict/clientsearch?mkt=zh-CN&setLang=zh&form=BDVEHC&ClientVer=BDDTV3.5.1.4320&q='

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

export default function search (
  text: string,
  config: AppConfig
): Promise<DictSearchResult<BingResult>> {
  const bingConfig = config.dicts.all.bing

  return fetchDOM(DICT_LINK + text)
    .then(doc => {
      if (doc.querySelector('.client_def_hd_hd')) {
        return handleLexResult(doc, bingConfig.options)
      }

      if (doc.querySelector('.client_trans_head')) {
        return handleMachineResult(doc)
      }

      if (bingConfig.options.related) {
        if (doc.querySelector('.client_do_you_mean_title_bar')) {
          return handleRelatedResult(doc, bingConfig)
        }
      }

      return handleNoResult()
    })
}

function handleLexResult (
  doc: Document,
  options: BingConfig['options'],
): DictSearchResult<BingResultLex> {
  let searchResult: DictSearchResult<BingResultLex> = {
    result: {
      type: 'lex',
      title: getText(doc, '.client_def_hd_hd')
    }
  }

  // pronunciation
  if (options.phsym) {
    let $prons = Array.from(doc.querySelectorAll('.client_def_hd_pn_list'))
    if ($prons.length > 0) {
      searchResult.result.phsym = $prons.map(el => {
        let pron = ''
        let $audio = el.querySelector('.client_aud_o')
        if ($audio) {
          pron = (($audio.getAttribute('onclick') || '').match(/https.*\.mp3/) || [''])[0]
        }
        return {
          lang: getText(el, '.client_def_hd_pn'),
          pron
        }
      })

      searchResult.audio = searchResult.result.phsym.reduce((audio, { lang, pron }) => {
        const lcLang = lang.toLowerCase()
        if (lcLang.indexOf('us') !== -1) {
          audio['us'] = pron
        } else if (lcLang.indexOf('uk') !== -1) {
          audio['uk'] = pron
        }
        return audio
      }, {})
    }
  }

  // definitions
  if (options.cdef) {
    let $container = doc.querySelector('.client_def_container')
    if ($container) {
      let $defs = Array.from($container.querySelectorAll('.client_def_bar'))
      if ($defs.length > 0) {
        searchResult.result.cdef = $defs.map(el => ({
          'pos': getText(el, '.client_def_title_bar'),
          'def': getText(el, '.client_def_list')
        }))
      }
    }
  }

  // tense
  if (options.tense) {
    let $infs = Array.from(doc.querySelectorAll('.client_word_change_word'))
    if ($infs.length > 0) {
      searchResult.result.infs = $infs.map(el => (el.textContent || '').trim())
    }
  }

  if (options.sentence > 0) {
    let $sens = Array.from(doc.querySelectorAll('.client_sentence_list'))
    if ($sens.length > 0) {
      searchResult.result.sentences = $sens
        .map(el => {
          let mp3 = ''
          let $audio = el.querySelector('.client_aud_o')
          if ($audio) {
            mp3 = (($audio.getAttribute('onclick') || '').match(/https.*\.mp3/) || [''])[0]
          }
          return {
            en: getText(el, '.client_sen_en'),
            chs: getText(el, '.client_sen_cn'),
            source: getText(el, '.client_sentence_list_link'),
            mp3
          }
        })
        .slice(0, options.sentence)
    }
  }

  if (Object.keys(searchResult.result).length > 2) {
    return searchResult
  }
  return handleNoResult()
}

function handleMachineResult (
  doc: Document,
): DictSearchResult<BingResultMachine> {
  return {
    result: {
      type: 'machine',
      mt: getText(doc, '.client_sen_cn')
    }
  }
}

function handleRelatedResult (
  doc: Document,
  config: BingConfig,
): DictSearchResult<BingResultRelated> {
  const searchResult: DictSearchResult<BingResultRelated> = {
    result: {
      type: 'related',
      title: getText(doc, '.client_do_you_mean_title_bar'),
      defs: []
    }
  }

  doc.querySelectorAll('.client_do_you_mean_area').forEach($area => {
    const $defsList = $area.querySelectorAll('.client_do_you_mean_list')
    if ($defsList.length > 0) {
      searchResult.result.defs.push({
        title: getText($area, '.client_do_you_mean_title'),
        meanings: Array.from($defsList).map($list => {
          const word = getText($list, '.client_do_you_mean_list_word')
          return {
            href: config.page.replace('%s', word),
            word,
            def: getText($list, '.client_do_you_mean_list_def')
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

function handleNoResult (): any {
  return Promise.reject(new Error('No result'))
}

function getText (el: ParentNode, childSelector: string): string {
  let child = el.querySelector(childSelector)
  if (child) {
    return (child.textContent || '').trim()
  }
  return ''
}
