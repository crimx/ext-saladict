import { fetchDirtyDOM } from '@/_helpers/fetch-dom'
import { HTMLString, getText, getInnerHTMLThunk, handleNoResult } from '../helpers'
import { AppConfig, DictConfigs } from '@/app-config'
import { DictSearchResult } from '@/typings/server'

const getInnerHTML = getInnerHTMLThunk('https://www.ldoceonline.com/')

export interface LongmanResultEntry {
  title: {
    HWD: string
    HYPHENATION: string
    HOMNUM: string
  }
  senses: HTMLString[]
  prons: Array<{
    lang: string
    pron: string
  }>
  topic?: {
    title: string
    href: string
  }
  phsym?: string
  level: number
  freq?: Array<{
    title: string
    rank: string
  }>
  pos?: string
  collocations?: HTMLString
  grammar?: HTMLString
  thesaurus?: HTMLString
  examples?: HTMLString[]
}

export interface LongmanResultLex {
  type: 'lex'
  bussinessFirst: boolean
  contemporary: LongmanResultEntry[]
  bussiness: LongmanResultEntry[]
  wordfams?: HTMLString
}

export interface LongmanResultRelated {
  type: 'related'
  list: HTMLString
}

export type LongmanResult = LongmanResultLex | LongmanResultRelated

type LongmanSearchResult = DictSearchResult<LongmanResult>
type LongmanSearchResultLex = DictSearchResult<LongmanResultLex>
type LongmanSearchResultRelated = DictSearchResult<LongmanResultRelated>

export default function search (
  text: string,
  config: AppConfig,
): Promise<LongmanSearchResult> {
  const options = config.dicts.all.longman.options
  return fetchDirtyDOM('http://www.ldoceonline.com/dictionary/' + text.toLocaleLowerCase().replace(/[^A-Za-z0-9]+/g, '-'))
    .then(doc => handleDOM(doc, options))
}

function handleDOM (
  doc: Document,
  options: DictConfigs['longman']['options'],
): LongmanSearchResult | Promise<LongmanSearchResult> {
  if (doc.querySelector('.dictentry')) {
    return handleDOMLex(doc, options)
  } else if (options.related) {
    return handleDOMRelated(doc)
  }
  return handleNoResult()
}

function handleDOMLex (
  doc: Document,
  options: DictConfigs['longman']['options'],
): LongmanSearchResultLex | Promise<LongmanSearchResultLex> {
  const result: LongmanResultLex = {
    type: 'lex',
    bussinessFirst: options.bussinessFirst,
    contemporary: [],
    bussiness: [],
  }

  const audio: { uk?: string, us?: string } = {}

  if (options.wordfams) {
    result.wordfams = getInnerHTML(doc, '.wordfams')
  }

  const $dictentries = doc.querySelectorAll('.dictentry')
  let currentDict: 'contemporary' | 'bussiness' | '' = ''
  for (let i = 0; i < $dictentries.length; i++) {
    const $entry = $dictentries[i]
    const $intro = $entry.querySelector('.dictionary_intro')
    if ($intro) {
      const dict = $intro.textContent || ''
      if (dict.includes('Contemporary')) {
        currentDict = 'contemporary'
      } else if (dict.includes('Business')) {
        currentDict = 'bussiness'
      } else {
        currentDict = ''
      }
    }

    if (!currentDict) { continue }

    const entry: LongmanResultEntry = {
      title: {
        HWD: '',
        HYPHENATION: '',
        HOMNUM: '',
      },
      prons: [],
      senses: [],
      level: 0,
    }

    const $topic = $entry.querySelector<HTMLAnchorElement>('a.topic')
    if ($topic) {
      entry.topic = {
        title: $topic.textContent || '',
        href: ($topic.getAttribute('href') || '').replace(/^\//, 'https://www.ldoceonline.com/'),
      }
    }

    const $head = $entry.querySelector('.Head')
    if (!$head) { continue }

    entry.title.HWD = getText($head, '.HWD')
    entry.title.HYPHENATION = getText($head, '.HYPHENATION')
    entry.title.HOMNUM = getText($head, '.HOMNUM')

    entry.phsym = getText($head, '.PronCodes')

    const level = getText($head, '.LEVEL')
    entry.level = (level.match(/●/g) || []).length

    entry.freq = Array.from($head.querySelectorAll<HTMLSpanElement>('.FREQ'))
      .map($el => ({
        title: $el.title,
        rank: $el.textContent || ''
      }))

    entry.pos = getText($head, '.POS')

    $head.querySelectorAll<HTMLSpanElement>('.speaker').forEach($pron => {
      let lang = 'us'
      const title = $pron.title
      if (title.includes('British')) {
        lang = 'uk'
      }
      const pron = $pron.getAttribute('data-src-mp3') || ''

      audio[lang] = pron
      entry.prons.push({ lang, pron })
    })

    entry.senses = Array.from($entry.querySelectorAll('.Sense'))
      .map($sen => getInnerHTML($sen))

    if (options.collocations) {
      entry.collocations = getInnerHTML($entry, '.ColloBox')
    }

    if (options.grammar) {
      entry.grammar = getInnerHTML($entry, '.GramBox')
    }

    if (options.thesaurus) {
      entry.thesaurus = getInnerHTML($entry, '.ThesBox')
    }

    if (options.examples) {
      entry.examples = Array.from($entry.querySelectorAll('.exaGroup'))
        .map($exa => getInnerHTML($exa))
    }

    result[currentDict].push(entry)
  }

  if (result.contemporary.length <= 0 && result.bussiness.length <= 0) {
    return handleNoResult()
  }

  return { result, audio }
}

function handleDOMRelated (
  doc: Document,
): LongmanSearchResultRelated | Promise<LongmanSearchResultRelated> {
  const $didyoumean = doc.querySelector('.didyoumean')
  if ($didyoumean) {
    return {
      result: {
        type: 'related',
        list: getInnerHTML($didyoumean)
      }
    }
  }
  return handleNoResult()
}
